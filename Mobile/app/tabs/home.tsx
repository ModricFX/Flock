import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
    Button,
    Platform,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
    Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import DateTimePickerComponent from '../../components/DateTimePicker';

import { authService } from '../services/authservice';
import { router } from 'expo-router';
import { EventService } from '../services/EventService';
import { apiService } from '../services/ApiService';

import styles from '../styles/HomePageStyles';
import friendStyles from '../styles/FriendsPageStyles';


const isIOS = Platform.OS === 'ios';
console.log("Running for platform: ", isIOS ? "iOS" : "Android");

import { User } from '../models/User';

import { Participant } from '../models/Participant';

/** A single day record with date, times, etc. */
/**
 * "EventData" used for both create and edit flows.
 * We store an array of dayTimes, each item = SingleDay
 */
import { EventData } from '../models/EventData';

import { SingleDay } from '../models/SingleDay';
import { Vote } from '../models/Vote';

import { date } from 'yup';
import { FriendService } from '../services/FriendService';

const api = apiService.getApi();

const friendService = new FriendService(api);
const eventService = new EventService(api);

/* Returns 'voting' if now < endVoting, 'finished' if voting has ended but the event hasn't occurred yet,
   and 'done' if the picked date is in the past. */
function getEventStatus(e: EventData): 'voting' | 'upcoming' | 'completed' | 'in progress' {
    const now = Date.now();

    if (e.end_voting_date && e.end_voting_date instanceof Date && e.end_voting_date.getTime() > now) {
        return 'voting';
    }

    if (e.chosen_date_start) {
        const eventStart = e.chosen_date_start.getTime();
        const eventEnd = eventStart + 3 * 60 * 60 * 1000; // TODO: get eventEnd from winning day!

        if (now >= eventStart && now <= eventEnd) {
            return 'in progress';
        }

        if (now > eventEnd) {
            return 'completed';
        }
    }

    return 'upcoming';
}

function formatDate(date: Date | string) {
    const parsedDate = new Date(date);
    return parsedDate.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23', // use 24-hour format
    });
}

/** Returns string like "Monday, 15.01.2024" */
function formatDay(date: Date) {
    const weekdayNames = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday'
    ];
    const dayName = weekdayNames[date.getDay()]; // 0=Sunday
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dayName}, ${dd}.${mm}.${yyyy}`;
}

function getDateFrom(date_start: Date) {
    return new Date(date_start.getFullYear(), date_start.getMonth(), date_start.getDate());
}

function getHoursFrom(dateTime: Date) {
    const date = new Date(dateTime);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}


export default function HomeScreen() {
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [friends, setFriends] = useState<User[]>();
    const [events, setEvents] = useState<EventData[]>([]);

    // iOS keyboard offset
    const keyboardOffset = Platform.OS === 'ios' ? 'padding' : undefined;

    function deleteEvent(event: EventData, currentUserId: number) {
        Alert.alert('Delete Event', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const id_event = typeof event.id_event === 'string' ? parseInt(event.id_event, 10) : event.id_event;

                        if (isNaN(id_event)) {
                            alert('Invalid event ID. Please try again.');
                            return;
                        }

                        const response = await eventService.deleteEvent(id_event, currentUserId);

                        if (response.success) {
                            alert('Event deleted successfully');
                            closeView(); // Close the modal if it's open
                            // Fetch the updated events list from the server
                            await fetchData();
                        } else {
                            console.error('Error deleting event:', response.error);
                            alert('Failed to delete event. Please try again.');
                        }
                    } catch (error) {
                        let errorMessage = 'An unexpected error occurred';
                        if (error instanceof Error) {
                            errorMessage = error.message;
                        }
                        console.error('Error deleting event:', error);
                        alert(errorMessage);
                    }
                }
            }
        ]);
    }

    const fetchData = async () => {
        try {
            await fetchUserData();
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserData = async () => {
        try {
            const user = await authService.getUserData();
            if (user.success && user.data) {
                setCurrentUser(user.data);

                if (user.data?.id_user) {
                    const relationships = await friendService.getFriends(user.data.id_user, 'accepted');
                    const friends: User[] = [];

                    for (const rel of relationships) {
                        const id = rel.id_user === user.data.id_user ? rel.use_id_user : rel.id_user;
                        const friend = await friendService.getFriendData(id);

                        if (friend) {
                            friends.push({
                                id_user: friend.id_user,
                                username: friend.username,
                                email: friend.email,
                                pfp_url: friend.pfp_url || '',
                            });
                        }
                    }

                    setFriends(friends);

                    const eventResponse = await eventService.getMyEvents(user.data.id_user);

                    if (eventResponse.success && eventResponse.data) {
                        const events = transformEvents(eventResponse.data, user.data.id_user);
                        setEvents(events);
                    } else {
                        console.error('Error fetching events:', eventResponse.error);
                    }
                }
            } else {
                router.replace('/auth/login');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            router.replace('/auth/login');
        }
    };

    useEffect(() => {
        fetchUserData();

        // Start the data fetching process
        fetchData();
    }, []);


    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
    useEffect(() => {
        if (!selectedEvent) return;

        // If we already have availability for this event, don't overwrite
        // Or if you want to detect event ID changes:
        // if (availability.__eventId === selectedEvent.id) return;

        if (selectedEvent.date_options) {
            const mergedAvailability: { [key: string]: any } = {};

            selectedEvent.date_options.forEach((date_option) => {
                const dayKey = getDateFrom(date_option.date_start).toISOString()+'.'+getHoursFrom(date_option.date_start)+'.'+getHoursFrom(date_option.date_end);

                // If we already have availability for dayKey, preserve it
                if (availability[dayKey]) {
                    mergedAvailability[dayKey] = {
                        ...availability[dayKey],
                    };
                } else {
                    // Otherwise, initialize
                    const startTime = new Date(date_option.date_start);
                    startTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

                    const endTime = new Date(date_option.date_end);
                    endTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

                    mergedAvailability[dayKey] = {
                        startTime,
                        endTime,
                        selectedTimes: [],
                        // isAvailable is left undefined initially
                        id_date_option: date_option.id_date_option
                    };
                }
            });

            setAvailability(mergedAvailability);
        }
    }, [selectedEvent]);


    const [participationStatus, setParticipationStatus] = useState<string | null>(null);

    /* =============== CREATE EVENT =============== */
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [createStep, setCreateStep] = useState(1);

    // Step1
    const [createTitle, setCreateTitle] = useState('');
    const [createDesc, setCreateDesc] = useState('');
    const [createLoc, setCreateLoc] = useState('');

    // Step2
    const [createDays, setCreateDays] = useState<SingleDay[]>([]);

    // AddDay Modal
    const [addDayModalVisible, setAddDayModalVisible] = useState(false);
    const [tempDayIndex, setTempDayIndex] = useState<number | null>(null);
    const [tempDate, setTempDate] = useState(new Date());
    const [tempStart, setTempStart] = useState('08:00'); // Default start time in 24-hour format
    const [tempEnd, setTempEnd] = useState('22:00'); // Default end time in 24-hour format

    // Additional modals for date/time picking
    const [pickDateModalVisible, setPickDateModalVisible] = useState(false);
    const [pickStartModalVisible, setPickStartModalVisible] = useState(false);
    const [pickEndModalVisible, setPickEndModalVisible] = useState(false);

    // Step3
    const [invitees, setInvitees] = useState<Participant[]>([]);
    const [typedInvite, setTypedInvite] = useState('');

    // Step4
    const [endVotingDate, setEndVotingDate] = useState<Date>(() => {
        const oneWeekLater = new Date();
        oneWeekLater.setDate(oneWeekLater.getDate() + 7);
        return oneWeekLater;
    });

    const [votingPickerVisible, setVotingPickerVisible] = useState(false);

    // =============== EDIT EVENT ===============
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editStep, setEditStep] = useState(1);

    const [editEventId, setEditEventId] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editLoc, setEditLoc] = useState('');
    const [editDays, setEditDays] = useState<SingleDay[]>([]);
    const [editInvitees, setEditInvitees] = useState<Participant[]>([]);
    const [editTypedInvite, setEditTypedInvite] = useState('');
    const [editEndVoting, setEditEndVoting] = useState<Date>(new Date());
    const [editChosenDateStart, setEditChosenDateStart] = useState<Date>();
    const [editChosenDateEnd, setEditChosenDateEnd] = useState<Date>();

    const [editEvent, setEditEvent] = useState<EventData | null>(null);

    const [addDayModalVisibleEdit, setAddDayModalVisibleEdit] = useState(false);
    const [tempDayIndexEdit, setTempDayIndexEdit] = useState<number | null>(null);
    const [tempDateEdit, setTempDateEdit] = useState(new Date());
    const [tempStartEdit, setTempStartEdit] = useState('08:00');
    const [tempEndEdit, setTempEndEdit] = useState('22:00');

    // Additional modals for date/time picking (edit)
    const [pickDateModalEditVisible, setPickDateModalEditVisible] = useState(false);
    const [pickStartModalEditVisible, setPickStartModalEditVisible] = useState(false);
    const [pickEndModalEditVisible, setPickEndModalEditVisible] = useState(false);

    const [votingPickerEditVisible, setVotingPickerEditVisible] = useState(false);

    // =============== VIEW / VOTE ===============
    const [showVotingPicker, setShowVotingPicker] = useState(false);

    const [showParticipantsModal, setShowParticipantsModal] = useState(false);

    /* ------------------------------------------
       Create Flow
    ------------------------------------------*/
    /** Convert a date to UTC format if it's not already in that format. */
    function makeDateUTC(date: Date) {
        return new Date(date.toString()[date.toString().length - 1] === 'Z' ? date : date + 'Z');
    }

    function transformEvents(events: EventData[], currentUserId: string) {
        events.forEach(ev => {
            ev.date_created = makeDateUTC(ev.date_created);
            ev.date_updated = makeDateUTC(ev.date_updated);
            ev.end_voting_date = makeDateUTC(ev.end_voting_date);

            if (ev.chosen_date_end) {
                ev.chosen_date_end = makeDateUTC(ev.chosen_date_end);
                if (ev.chosen_date_end.getUTCFullYear() < 2000)
                    ev.chosen_date_end = undefined;
            }
            if (ev.chosen_date_start) {
                ev.chosen_date_start = makeDateUTC(ev.chosen_date_start);
                if (ev.chosen_date_start.getUTCFullYear() < 2000)
                    ev.chosen_date_start = undefined;
            }

            ev.date_options = ev.date_options.map(dateOption => {
                return {
                    id_date_option: dateOption.id_date_option || 0,
                    id_event: dateOption.id_event || 0,
                    date_start: makeDateUTC(dateOption.date_start),
                    date_end: makeDateUTC(dateOption.date_end)
                }
            });

            if (ev.invitations) {
                ev.invitations.forEach(inv => {
                    let invitedFriend = inv.user;
                    let status: "pending" | "accepted" | "declined" =
                        ev.votes?.some(vote => vote.id_user === invitedFriend?.id_user) ? "accepted" : "pending";

                    ev.participants = ev.participants || []; // Ensure participants array is initialized
                    ev.participants.push({
                        id: invitedFriend?.id_user || '',
                        email: invitedFriend?.email || '',
                        username: invitedFriend?.username || '',
                        pfp_url: invitedFriend?.pfp_url || '',
                        status: status
                    });

                    //console.log(ev.votes);

                    if (invitedFriend.id_user == currentUserId) {
                        ev.votes?.forEach((vote) => {
                            if (vote.id_user == currentUserId) {
                                let date_option = ev.date_options.find(dt => dt.id_date_option?.toString() == vote.id_date_option);

                                if (date_option) {
                                    const mergedAvailability: { [key: string]: any } = currentDbavailability;

                                    const dayKey = getDateFrom(date_option.date_start).toISOString()+'.'+getHoursFrom(date_option.date_start)+'.'+getHoursFrom(date_option.date_end);

                                    if (availability[dayKey]) {
                                        //console.log(availability[dayKey]);
                                        mergedAvailability[dayKey] = {
                                            ...availability[dayKey],
                                        };
                                    } else {
                                        const startTime = new Date(date_option.date_start);
                                        startTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

                                        const endTime = new Date(date_option.date_end);
                                        endTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

                                        //console.log(vote.status);

                                        mergedAvailability[dayKey] = {
                                            startTime,
                                            endTime,
                                            selectedTimes: [],
                                            isAvailable: vote.status == "accepted",
                                            id_date_option: date_option.id_date_option
                                        };
                                    }

                                    setAvailability(mergedAvailability);
                                    setCurrentDbavailability(mergedAvailability);
                                }
                            }
                        });
                    }
                });
            }
        });

        return events;
    }

    function startCreateEvent() {
        setCreateStep(1); // Reset the creation step to 1
        setCreateTitle(''); // Clear the event title
        setCreateDesc(''); // Clear the event description
        setCreateLoc(''); // Clear the event location
        setCreateDays([]); // Clear the days array
        setInvitees([]); // Reset the list of invitees
        setTypedInvite(''); // Clear the typed invite input
        setEndVotingDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Set end voting date to 7 days from now
        setCreateModalVisible(true); // Open the modal for event creation
    }

    function closeCreateEvent() {
        setCreateModalVisible(false);
    }

    function handleNextStepCreate() {
        if (createStep < 4) {
            setCreateStep(prev => prev + 1);
        } else {
            finalizeCreateEvent();
        }
    }

    function handlePrevStepCreate() {
        if (createStep === 1) {
            closeCreateEvent();
        } else {
            setCreateStep(prev => prev - 1);
        }
    }

    function getStatusIcon(status: string): "schedule" | "play-arrow" | "done" | "autorenew" {
        switch (status) {
            case "upcoming":
                return "schedule";
            case "voting":
                return "play-arrow";
            case "completed":
                return "done";
            case "in progress":
                return "autorenew"; // Represents "in progress" (can be changed to another icon if preferred)
            default:
                return "schedule"; // Default to "schedule" for unrecognized statuses
        }
    }

    function getStatusStyle(status: string) {
        switch (status) {
            case 'upcoming':
                return styles.statusUpcoming;
            case 'voting':
                return styles.statusVoting;
            case 'completed':
                return styles.statusCompleted;
            case 'in progress':
                return styles.statusInProgress;
            default:
                return styles.statusUpcoming; // Default to finished if unrecognized
        }
    }

    async function finalizeCreateEvent() {
        if (!createTitle.trim()) {
            Alert.alert('Missing Title', 'Provide a title.');
            return;
        }
        // Check if `EndVoting` is in the future
        const currentTime = new Date();
        const endVotingTime = new Date(endVotingDate);

        if (endVotingTime <= currentTime) {
            Alert.alert('Invalid End Voting Time', 'The end voting time must be in the future.');
            return;
        }
        // Add current user to invitees
        const updatedInvitees = [...invitees];
        if (currentUser?.id_user) {
            const isCurrentUserAlreadyAdded = updatedInvitees.some(
                (invite) => invite.id === currentUser.id_user
            );
            if (!isCurrentUserAlreadyAdded) {
                updatedInvitees.push({
                    id: currentUser.id_user,
                    username: currentUser.username,
                    email: currentUser.email,
                    pfp_url: currentUser.pfp_url || '',
                    status: 'pending',
                });
            }
        }

        const newEvt = {
            name: createTitle,
            description: createDesc,
            location: createLoc,
            end_voting_date: endVotingDate.toISOString(),
            id_user: currentUser?.id_user || 'unknown',
            date_options: createDays.map(day => {
                return {
                    date_start: new Date(day.date_start).toISOString(),
                    date_end: new Date(day.date_end).toISOString()
                }
            }),
            tag_ids: [],
            participant_ids: updatedInvitees
                .filter(inv => inv.id)
                .map(inv => inv.id),
        }
        //console.log(newEvt);

        let response = await eventService.createEvent(newEvt)

        if (response.success && response.data) {
            let events = transformEvents([response.data], currentUser?.id_user ? currentUser.id_user : '');
            setEvents(prev => [...prev, events[0]]);
        }
        else {
            console.log(response.error);
        }

        closeCreateEvent();
    }

    /* Step2 -> dayTimes => addDayModalCreate */
    function openAddDayModalCreate(index?: number) {
        if (typeof index === 'number') {
            // Editing an existing day
            const existing = createDays[index];
            setTempDayIndex(index);
            setTempDate(getDateFrom(existing.date_start));
            setTempStart(getHoursFrom(existing.date_start));
            setTempEnd(getHoursFrom(existing.date_end));
        } else {
            // Adding a new day
            setTempDayIndex(null);
            setTempDate(new Date());
            setTempStart('08:00');
            setTempEnd('10:00');
        }

        // Show the Add Day modal and hide the Create Event modal
        setAddDayModalVisible(true);
        if (isIOS) setCreateModalVisible(false);
    }

    function closeAddDayModalCreate() {
        setAddDayModalVisible(false);
        if (isIOS) setCreateModalVisible(true);
    }

    const handleAvailabilityResponse = (dayKey: string, isAvailable: boolean) => {
        // 1) Update the local "availability" state
        setAvailability((prevAvailability) => {
            const updated = { ...prevAvailability };

            if (!updated[dayKey]) {
                updated[dayKey] = {
                    startTime: new Date(),
                    endTime: new Date(),
                    selectedTimes: [],
                    isAvailable,
                    id_date_option: ''
                };
            } else {
                updated[dayKey] = {
                    ...updated[dayKey],
                    isAvailable,
                };
            }

            return updated;
        });

        // 2) Update the selected event’s participants
        setSelectedEvent((prevEvent) => {
            if (!prevEvent) return null;

            // Restrict newStatus to match the type `"accepted" | "declined" | "pending"`
            const newStatus: "accepted" | "declined" | "pending" = isAvailable ? "accepted" : "declined";

            // Update participants while ensuring type correctness
            const updatedParticipants = prevEvent.participants?.map((p) => {
                if (p.email === currentUser?.email) {
                    return {
                        ...p,
                        status: newStatus, // This now matches the expected type
                    };
                }
                return p;
            });

            return {
                ...prevEvent,
                participants: updatedParticipants, // Now fully typed
            };
        });

        // 3) (Optional) Update the global events array to reflect changes on the homepage
        setEvents((prevEvents) =>
            prevEvents.map((evt) => {
                if (evt.id_event === selectedEvent?.id_event) {
                    return {
                        ...evt,
                        participants: evt.participants?.map((p) =>
                            p.email === currentUser?.email
                                ? { ...p, status: isAvailable ? "accepted" : "declined" }
                                : p
                        ),
                    };
                }
                return evt;
            })
        );
    };

    // Convert time strings to comparable numbers (e.g., "10:00" -> 1000)
    const convertTimeToNumber = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 100 + minutes;
    };

    function handleSaveDayCreate() {
        // Check if end time is smaller than start time
        const startTimeNumber = convertTimeToNumber(tempStart);
        const endTimeNumber = convertTimeToNumber(tempEnd);

        if (endTimeNumber < startTimeNumber) {
            Alert.alert("End time cannot be earlier than start time. Please correct the time.");
            return;
        }

        const dateStart = new Date(`${tempDate.toISOString().split('T')[0]}T${tempStart}:00`);
        const dateEnd = new Date(`${tempDate.toISOString().split('T')[0]}T${tempEnd}:00`);

        if (tempDayIndex === null) {  // new
            setCreateDays(prev => [...prev, { date_start: dateStart, date_end: dateEnd }]);
        } else {  // edit
            const copy = [...createDays];
            copy[tempDayIndex] = { date_start: dateStart, date_end: dateEnd };
            setCreateDays(copy);
        }
        closeAddDayModalCreate();
    }

    function removeDayCreate(i: number) {
        Alert.alert('Remove Day', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () => {
                    setCreateDays(prev => prev.filter((_, idx) => idx !== i));
                }
            }
        ]);
    }

    /* Step2: picking date/time => each is a separate modal */
    function onPickDateChange(sel?: Date) {
        if (sel) {
            sel.setHours(sel.getHours() + 1);
            setTempDate(sel);
        }
    }
    function openPickDate() {
        if (isIOS) setAddDayModalVisible(false);
        setPickDateModalVisible(true);
    }
    function openPickDateEdit() {
        if (isIOS) setAddDayModalVisibleEdit(false);
        setPickDateModalEditVisible(true);
    }
    function closePickDate() {
        setPickDateModalVisible(false);
        if (isIOS) setAddDayModalVisible(true);
    }
    function savePickDate() {
        setPickDateModalVisible(false);
        if (isIOS) setAddDayModalVisible(true);
    }
    function openPickStartTime() {
        if (isIOS) setAddDayModalVisible(false);
        setPickStartModalVisible(true);
    }
    function openPickEndTime() {
        if (isIOS) setAddDayModalVisible(false);
        setPickEndModalVisible(true);
    }
    function openPickStartTimeEdit() {
        if (isIOS) setAddDayModalVisibleEdit(false);
        setPickStartModalEditVisible(true);
    }
    function openPickEndTimeEdit() {
        if (isIOS) setAddDayModalVisibleEdit(false);
        setPickEndModalEditVisible(true);
    }

    /* Step3 create -> invites */
    function addFriendInvite(friend: User) {
        if (!invitees.find(i => i.email === friend.email)) {
            setInvitees([...invitees, { id: friend.id_user, username: friend.username, email: friend.email, pfp_url: friend.pfp_url, status: 'pending' }]);
        }
    }

    function addTypedInvite() {
        if (!typedInvite.trim()) return;
        if (!invitees.find(i => i.email === typedInvite)) {
            // TODO?
        }
        setTypedInvite('');
    }
    // Function to remove an invitee
    function removeInvite(email: string) {
        setInvitees(prev => prev.filter(i => i.email !== email));
    }

    /* Step4 create -> Voting */
    function onVotingDateChange(sel?: Date) {
        if (sel) setEndVotingDate(sel);
    }
    function openVotingDatePickerCreate() {
        setVotingPickerVisible(true);
        if (isIOS) setCreateModalVisible(false);
    }
    function cancelVotingDate() {
        setVotingPickerVisible(false);
        if (isIOS) setCreateModalVisible(true);
    }
    function saveVotingDate() {
        setVotingPickerVisible(false);
        if (isIOS) setCreateModalVisible(true);
    }

    // Function to handle date changes from the picker
    const handleVotingDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowVotingPicker(false);
        if (selectedDate) {
            setEndVotingDate(selectedDate);
        }
    };

    const [isEventModalVisible, setIsEventModalVisible] = useState<boolean>(false);

    const [isVotingModalVisible, setIsVotingModalVisible] = useState(false);
    const [availability, setAvailability] = useState<{
        [key: string]: {
            startTime: Date;
            endTime: Date;
            selectedTimes: Date[];
            isAvailable?: boolean;
            id_date_option: string;
        };
    }>({});

    const [currentDbavailability, setCurrentDbavailability] = useState<{
        [key: string]: {
            startTime: Date;
            endTime: Date;
            selectedTimes: Date[];
            isAvailable?: boolean;
            id_date_option: string;
        };
    }>({});

    /* -----------------------------------------------
       EDIT EVENT
    -----------------------------------------------*/
    function openEdit(e: EventData) {
        setEditEvent(e);
        setEditStep(1);
        setEditTitle(e.name || '');
        setEditDesc(e.description || '');
        setEditLoc(e.location || '');
        setEditDays(e.date_options ? [...e.date_options] : []); // Spread to prevent direct reference issues
        setEditInvitees(e.participants ? [...e.participants] : []); // Ensure participants is not null
        setEditEndVoting(e.end_voting_date || new Date()); // Fallback to current date if endVoting is undefined
        setEditModalVisible(true);
        setEditChosenDateStart(e.chosen_date_start);
        setEditChosenDateEnd(e.chosen_date_end);
        setEditEventId(e.id_event);
    }

    function closeEditEvent() {
        setEditModalVisible(false);
        setEditEvent(null);
    }
    function handleNextStepEdit() {
        if (!editEvent) return;
        if (editStep < 4) {
            setEditStep(prev => prev + 1);
        } else {
            finalizeEditEvent();
        }
    }
    function handlePrevStepEdit() {
        if (editStep === 1) {
            closeEditEvent();
        } else {
            setEditStep(prev => prev - 1);
        }
    }

    async function finalizeEditEvent() {
        if (!editEvent) return;
        if (!editTitle.trim()) {
            Alert.alert('Missing Title', 'Provide a title.');
            return;
        }

        // Check if `editEndVoting` is in the future
        const currentTime = new Date();
        const endVotingTime = new Date(editEndVoting);

        if (endVotingTime <= currentTime) {
            Alert.alert('Invalid End Voting Time', 'The end voting time must be in the future.');
            return;
        }

        const UpdatedEvent = {
            id_event: editEventId,
            id_user: currentUser?.id_user || 'unknown',
            name: editTitle,
            description: editDesc,
            location: editLoc,
            end_voting_date: editEndVoting.toISOString(),
            sysrowstate: 1,
            date_options: editDays.map(day => ({
                date_start: day.date_start.toISOString(),
                date_end: day.date_end.toISOString(),
                id_date_option: day.id_date_option ? day.id_date_option : 0,
                id_event: day.id_event ? day.id_event : 0
            })),
            participant_ids: editInvitees
                .filter(invite => invite.id)
                .map(invite => invite.id)
        }
        //console.log(UpdatedEvent);
        let response = await eventService.updateEvent(UpdatedEvent);

        if (response.success && response.data) {
            let updated = transformEvents([response.data], currentUser?.id_user ? currentUser.id_user : '');

            setEvents(events.map(ev => {
                return ev.id_event == updated[0].id_event ? updated[0] : ev
            }
            ));
        } else {
            console.log(response.error)
        }

        closeEditEvent();
    }

    /* Step2 (edit) => addDayModalEdit */
    function openAddDayModalEdit(index?: number) {
        if (typeof index === 'number' && editDays[index]) {
            // Editing an existing day
            setTempDayIndexEdit(index);
            const existing = editDays[index];
            setTempDateEdit(existing.date_start ? getDateFrom(existing.date_start) : new Date());
            setTempStartEdit(existing.date_start ? getHoursFrom(existing.date_start) : '08:00');
            setTempEndEdit(existing.date_end ? getHoursFrom(existing.date_end) : '10:00');
        } else {
            // Adding a new day
            setTempDayIndexEdit(null);
            setTempDateEdit(new Date());
            setTempStartEdit('08:00'); // Default start time in 24-hour format
            setTempEndEdit('10:00'); // Default end time in 24-hour format
        }
        setAddDayModalVisibleEdit(true);
        if (isIOS) setEditModalVisible(false);
    }

    function closeAddDayModalEdit() {
        setAddDayModalVisibleEdit(false);
        if (isIOS) setEditModalVisible(true);
    }

    function handleSaveDayEdit() {
        // Check if end time is smaller than start time
        const startTimeNumber = convertTimeToNumber(tempStartEdit);
        const endTimeNumber = convertTimeToNumber(tempEndEdit);

        if (endTimeNumber < startTimeNumber) {
            Alert.alert("End time cannot be earlier than start time. Please correct the time.");
            return;
        }

        const dateStart = new Date(`${tempDateEdit.toISOString().split('T')[0]}T${tempStartEdit}:00`);
        const dateEnd = new Date(`${tempDateEdit.toISOString().split('T')[0]}T${tempEndEdit}:00`);

        // Proceed with saving data if validation passes
        if (tempDayIndexEdit === null) {  // new
            setEditDays((prev) => [...prev, { date_start: dateStart, date_end: dateEnd }]);
        } else {  // edit
            const copy = [...editDays];
            copy[tempDayIndexEdit] = { date_start: dateStart, date_end: dateEnd };
            setEditDays(copy);
        }

        closeAddDayModalEdit();
    }

    function removeDayEdit(i: number) {
        Alert.alert('Remove Day', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () => {
                    setEditDays(prev => prev.filter((_, idx) => idx !== i));
                }
            }
        ]);
    }

    function saveVotingData() {
        setIsVotingModalVisible(false);
        setIsEventModalVisible(true);

        Object.entries(availability).forEach(async ([key, value]) => {
            let vote: Vote = {
                id_date_option: value.id_date_option,
                id_user: currentUser ? currentUser.id_user : 'undefined'
            }

            if (currentDbavailability[key]) {
                if (currentDbavailability[key].isAvailable != value.isAvailable) {
                    if (value.isAvailable) {
                        vote.status = "accepted";
                        let response = await eventService.castVote(vote);

                        if (!response.success) {
                            console.log(response.error)
                        } else {
                            console.log(response.data)
                        }
                    } else {
                        vote.status = "declined";
                        let response = await eventService.deleteVote(vote);

                        if (!response.success) {
                            console.log(response.error)
                        } else {
                            console.log(response.data)
                        }
                    }
                }
            }
            else {
                if (value.isAvailable) {
                    vote.status = "accepted";
                    let response = await eventService.castVote(vote);

                    if (!response.success) {
                        console.log(response.error)
                    } else {
                        console.log(response.data)
                    }
                }
            }
        });

        setCurrentDbavailability(availability);
    }

    /* Step2 pick date/time for edit */
    function onPickDateChangeEdit(sel?: Date) {
        if (sel) {
            sel.setHours(sel.getHours() + 1);
            setTempDateEdit(sel);
        }
    }

    function savePickDateEdit() {
        setPickDateModalEditVisible(false);
        setAddDayModalVisibleEdit(true);
    }

    /* Step3 (edit): invites */
    function addFriendInviteEdit(friend: User) {
        if (!editInvitees.find(i => i.email === friend.email)) {
            setEditInvitees([...editInvitees, { id: friend.id_user, username: friend.username, email: friend.email, status: 'pending', pfp_url: friend.pfp_url }]);
        }
    }

    function addTypedInviteEdit() {
        if (!editTypedInvite.trim()) return;
        if (!editInvitees.find(i => i.email === editTypedInvite)) {
            const newPart: Participant = {
                id: Math.random().toString(),
                username: editTypedInvite.split('@')[0],
                email: editTypedInvite,
                status: 'pending',
                pfp_url: 'https://i.pravatar.cc/100?img=48'
            };
            setEditInvitees([...editInvitees, newPart]);
        }
        setEditTypedInvite('');
    }

    function removeInviteEdit(email: string) {
        setEditInvitees(prev => prev.filter(i => i.email !== email));
    }

    /* Step4 (edit) => voting date */
    function onVotingDateChangeEdit(sel?: Date) {
        if (sel) setEditEndVoting(sel);
    }
    function openVotingDatePickerEdit() {
        setVotingPickerEditVisible(true);
        if (isIOS) setEditModalVisible(false);
    }
    function cancelVotingDateEdit() {
        setVotingPickerEditVisible(false);
        if (isIOS) setEditModalVisible(true);
    }
    function saveVotingDateEdit() {
        setVotingPickerEditVisible(false);
        if (isIOS) setEditModalVisible(true);
    }

    /* =============== VIEW / VOTE =============== */
    function openView(event: EventData) {
        setSelectedEvent(event); // Set the selected event
        setIsEventModalVisible(true); // Show the modal
    }

    function closeView() {
        setIsEventModalVisible(false); // Hide the modal
        setSelectedEvent(null); // Clear the selected event
    }

    /* Partition MY vs. OTHERS */
    const myEvents = events.filter(e => e.id_user === currentUser?.id_user);
    const otherEvents = events.filter(e => e.id_user !== currentUser?.id_user);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerText}>FLOCK</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.card}>
                        <Text style={styles.greeting}>Hi {currentUser?.username || 'User'}!</Text>
                    </View>

                    {/* My Events */}
                    <View style={styles.card}>
                        <Text style={styles.eventsTitle}>My Events</Text>
                        {myEvents.length === 0 ? (
                            <Text style={styles.noEvents}>No events. Create one below!</Text>
                        ) : (
                            <ScrollView
                                horizontal={false}
                                showsVerticalScrollIndicator={false}
                            >
                                {myEvents.map(evt => {
                                    const eventStatus = getEventStatus(evt);
                                    const userParticipant = evt.participants?.find(p => p.email === currentUser?.email);
                                    return <TouchableOpacity
                                        key={evt.id_event}
                                        style={styles.eventCard}
                                        onPress={() => openView(evt)}
                                        activeOpacity={0.8}
                                        accessible={true}
                                        accessibilityLabel={`Edit event ${evt.name}`}
                                    >
                                        {/* Event Header */}
                                        <View style={styles.eventHeader}>
                                            <Text style={styles.eventTitle}>{evt.name}</Text>
                                            <View style={[
                                                styles.statusBadge,
                                                getStatusStyle(eventStatus)
                                            ]}>
                                                <MaterialIcons
                                                    name={getStatusIcon(eventStatus)}
                                                    size={16}
                                                    color="#fff"
                                                    style={{ marginRight: 4 }}
                                                />
                                                <Text style={styles.statusText}>
                                                    {eventStatus.toUpperCase()}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Event Description */}
                                        <Text style={styles.eventDescription} numberOfLines={2}>
                                            {evt.description}
                                        </Text>

                                        {/* Event Dates */}
                                        <View style={styles.eventDates}>
                                            <View style={styles.dateRow}>
                                                <MaterialIcons name="today" size={20} color="#4CAF50" />
                                                <Text style={styles.dateText}>
                                                    Voting Ends: {formatDate(evt.end_voting_date)}
                                                </Text>
                                            </View>
                                            {evt.chosen_date_start && (
                                                <View style={styles.dateRow}>
                                                    <MaterialIcons name="event" size={20} color="#4CAF50" />
                                                    <Text style={styles.dateText}>
                                                        Event Date: {formatDate(evt.chosen_date_start)}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Participants */}
                                        <View style={styles.participants}>
                                            <MaterialIcons name="people" size={20} color="#4CAF50" />
                                            <Text style={styles.participantsText}>
                                                {evt.participants?.length} Participants
                                            </Text>
                                        </View>

                                        {/* User Voting Status */}
                                        {eventStatus === 'voting' && userParticipant && (
                                            <View style={styles.userStatus}>
                                                <MaterialIcons name="how-to-vote" size={20} color="#4CAF50" />
                                                <Text style={styles.userStatusText}>
                                                    Your Vote: {['accepted', 'declined'].includes(userParticipant.status.toLowerCase()) ? 'VOTED' : 'PENDING'}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                })}
                            </ScrollView>
                        )}
                    </View>

                    {/* Other Events */}
                    <View style={styles.card}>
                        <Text style={styles.eventsTitle}>Other Events</Text>
                        {otherEvents.length === 0 ? (
                            <Text style={styles.noEvents}>No other events available.</Text>
                        ) : (
                            <ScrollView
                                horizontal={false}
                                showsVerticalScrollIndicator={false}
                            >
                                {otherEvents.map(evt => {
                                    const eventStatus = getEventStatus(evt);
                                    const userParticipant = evt.participants?.find(p => p.email === currentUser?.email);
                                    return (
                                        <TouchableOpacity
                                            key={evt.id_event}
                                            style={styles.eventCard}
                                            onPress={() => openView(evt)}
                                            activeOpacity={0.8}
                                            accessible={true}
                                            accessibilityLabel={`View event ${evt.name}`}
                                        >
                                            {/* Event Header */}
                                            <View style={styles.eventHeader}>
                                                <Text style={styles.eventTitle}>{evt.name}</Text>
                                                <View style={[
                                                    styles.statusBadge,
                                                    getStatusStyle(eventStatus)
                                                ]}>
                                                    <MaterialIcons
                                                        name={getStatusIcon(eventStatus)}
                                                        size={16}
                                                        color="#fff"
                                                        style={{ marginRight: 4 }}
                                                    />
                                                    <Text style={styles.statusText}>
                                                        {eventStatus.toUpperCase()}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Event Description */}
                                            <Text style={styles.eventDescription} numberOfLines={2}>
                                                {evt.description}
                                            </Text>

                                            {/* Event Dates or Location */}
                                            <View style={styles.eventDates}>
                                                {eventStatus === 'voting' ? (
                                                    <View style={styles.dateRow}>
                                                        <MaterialIcons name="today" size={20} color="#4CAF50" />
                                                        <Text style={styles.dateText}>
                                                            Voting Ends: {formatDate(evt.end_voting_date)}
                                                        </Text>
                                                    </View>
                                                ) : (
                                                    <View style={styles.dateRow}>
                                                        <MaterialIcons name="location-on" size={20} color="#4CAF50" />
                                                        <Text style={styles.dateText}>
                                                            Location: {evt.location}
                                                        </Text>
                                                    </View>
                                                )}
                                                {eventStatus === 'in progress' && evt.chosen_date_start && (
                                                    <View style={styles.dateRow}>
                                                        <MaterialIcons name="event" size={20} color="#4CAF50" />
                                                        <Text style={styles.dateText}>
                                                            Event Date: {formatDate(evt.chosen_date_start)}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>

                                            {/* Participants */}
                                            <View style={styles.participants}>
                                                <MaterialIcons name="people" size={20} color="#4CAF50" />
                                                <Text style={styles.participantsText}>
                                                    {evt.participants?.length} Participants
                                                </Text>
                                            </View>

                                            {/* User Voting Status */}
                                            {eventStatus === 'voting' && userParticipant && (
                                                <View style={styles.userStatus}>
                                                    <MaterialIcons name="how-to-vote" size={20} color="#4CAF50" />
                                                    <Text style={styles.userStatusText}>
                                                        Your Vote: {['accepted', 'declined'].includes(userParticipant.status.toLowerCase()) ? 'VOTED' : 'PENDING'}
                                                    </Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    )
                                })}
                            </ScrollView>
                        )}
                    </View>

                    {/* Event Details Modal */}
                    <Modal
                        visible={isEventModalVisible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={closeView}
                    >
                        <TouchableWithoutFeedback onPress={closeView}>
                            <View style={styles.modalOverlay}>
                                <TouchableWithoutFeedback onPress={() => { /* Prevent modal from closing when tapping inside */ }}>
                                    <View style={styles.modalContainer}>
                                        {selectedEvent ? (
                                            (() => {
                                                const eventStatus = getEventStatus(selectedEvent);
                                                // Check if current user created this event
                                                const isCreator = selectedEvent.id_user === currentUser?.id_user;

                                                return (
                                                    <>
                                                        {/* Modal Header */}
                                                        <View style={styles.modalHeader}>
                                                            <Text style={styles.modalTitle}>{selectedEvent.name}</Text>
                                                            <TouchableOpacity
                                                                onPress={closeView}
                                                                accessibilityLabel="Close Modal"
                                                            >
                                                                <MaterialIcons name="close" size={24} color="#333" />
                                                            </TouchableOpacity>
                                                        </View>

                                                        {/* Main Content */}
                                                        <ScrollView
                                                            style={{ maxHeight: '80%' }}
                                                            contentContainerStyle={{ paddingBottom: 20 }}
                                                            showsVerticalScrollIndicator={false}
                                                        >
                                                            {/* Event Details */}
                                                            <View style={styles.detailsCard}>
                                                                <Text style={styles.sectionHeader}>Event Details</Text>
                                                                <View style={styles.detailRow}>
                                                                    <Text style={styles.detailLabel}>Creator:</Text>
                                                                    <Text style={styles.detailValue}>
                                                                        {(() => {
                                                                            // If current user is the creator
                                                                            if (selectedEvent.id_user === currentUser?.id_user) {
                                                                                return `${currentUser?.username} (${currentUser?.email})`;
                                                                            }

                                                                            // Otherwise, look for them in `friends`
                                                                            const creatorInFriends = friends?.find(
                                                                                (friend) => friend.id_user === selectedEvent.id_user
                                                                            );
                                                                            if (creatorInFriends) {
                                                                                return `${creatorInFriends.username} (${creatorInFriends.email})`;
                                                                            }

                                                                            // Fallback to 'Unknown'
                                                                            if (selectedEvent.id_user) {
                                                                                return "User id: " + selectedEvent.id_user;
                                                                            }
                                                                            return 'Unknown';
                                                                        })()}
                                                                    </Text>
                                                                </View>
                                                                <View style={styles.detailRow}>
                                                                    <Text style={styles.detailLabel}>Description:</Text>
                                                                    <Text style={styles.detailValue}>{selectedEvent.description}</Text>
                                                                </View>

                                                                <View style={styles.detailRow}>
                                                                    <Text style={styles.detailLabel}>Location:</Text>
                                                                    <Text style={styles.detailValue}>{selectedEvent.location}</Text>
                                                                </View>
                                                                {eventStatus !== 'voting' && (
                                                                    <View style={styles.detailRow}>
                                                                        <Text style={styles.detailLabel}>Event Date:</Text>
                                                                        <Text style={styles.detailValue}>
                                                                            {selectedEvent.chosen_date_start ? formatDate(selectedEvent.chosen_date_start) : 'Not set'}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                                {selectedEvent.end_voting_date && eventStatus === 'voting' && (
                                                                    <View style={styles.detailRow}>
                                                                        <Text style={styles.detailLabel}>Voting Ends:</Text>
                                                                        <Text style={styles.detailValue}>
                                                                            {formatDate(selectedEvent.end_voting_date)}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            </View>

                                                            {/* Participants Preview */}
                                                            <View style={styles.detailsCard}>
                                                                <Text style={styles.sectionHeader}>Participants</Text>
                                                                <View style={styles.participantsPreviewRow}>
                                                                    <MaterialIcons name="people" size={20} color="#4CAF50" />
                                                                    <Text style={styles.participantsPreviewText}>
                                                                        {selectedEvent.participants?.length} total
                                                                    </Text>
                                                                </View>
                                                                <TouchableOpacity
                                                                    style={styles.participantsButton}
                                                                    onPress={() => setShowParticipantsModal(true)}
                                                                >
                                                                    <MaterialIcons name="list" size={20} color="#fff" />
                                                                    <Text style={styles.participantsButtonText}>
                                                                        View Participants
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </ScrollView>

                                                        {/* Action Buttons Based on Status */}
                                                        <View style={styles.modalActions}>
                                                            {eventStatus === 'voting' && (
                                                                <>
                                                                    <TouchableOpacity
                                                                        style={[styles.actionButton, styles.voteButton]}
                                                                        onPress={() => {
                                                                            setIsVotingModalVisible(true);
                                                                            if (isIOS) setIsEventModalVisible(false);
                                                                        }}
                                                                    >
                                                                        <MaterialIcons name="how-to-vote" size={20} color="#fff" />
                                                                        <Text style={styles.buttonText}>Vote</Text>
                                                                    </TouchableOpacity>
                                                                </>
                                                            )}

                                                            {eventStatus === 'upcoming' && (
                                                                <>
                                                                    <Text style={styles.modalLabel}>Confirm participation:</Text>
                                                                    {participationStatus === 'confirmed' ? (
                                                                        <View style={styles.statusContainer}>
                                                                            <Text style={styles.statusTextParticipation}>
                                                                                Participation:{' '}
                                                                                <Text style={styles.confirmedText}>CONFIRMED</Text>
                                                                            </Text>
                                                                            <TouchableOpacity
                                                                                style={[styles.actionButton, styles.denyButton]}
                                                                                onPress={() => setParticipationStatus('denied')}
                                                                            >
                                                                                <MaterialIcons name="cancel" size={20} color="#fff" />
                                                                                <Text style={styles.buttonText}>Change to Deny</Text>
                                                                            </TouchableOpacity>
                                                                        </View>
                                                                    ) : participationStatus === 'denied' ? (
                                                                        <View style={styles.statusContainer}>
                                                                            <Text style={styles.statusTextParticipation}>
                                                                                Participation:{' '}
                                                                                <Text style={styles.deniedText}>DENIED</Text>
                                                                            </Text>
                                                                            <TouchableOpacity
                                                                                style={[styles.actionButton, styles.confirmButton]}
                                                                                onPress={() => setParticipationStatus('confirmed')}
                                                                            >
                                                                                <MaterialIcons name="check-circle" size={20} color="#fff" />
                                                                                <Text style={styles.buttonText}>Change to Confirm</Text>
                                                                            </TouchableOpacity>
                                                                        </View>
                                                                    ) : (
                                                                        <>
                                                                            <TouchableOpacity
                                                                                style={[styles.actionButton, styles.confirmButton]}
                                                                                onPress={() => setParticipationStatus('confirmed')}
                                                                            >
                                                                                <MaterialIcons name="check-circle" size={20} color="#fff" />
                                                                                <Text style={styles.buttonText}>Confirm</Text>
                                                                            </TouchableOpacity>
                                                                            <TouchableOpacity
                                                                                style={[styles.actionButton, styles.denyButton]}
                                                                                onPress={() => setParticipationStatus('denied')}
                                                                            >
                                                                                <MaterialIcons name="cancel" size={20} color="#fff" />
                                                                                <Text style={styles.buttonText}>Deny</Text>
                                                                            </TouchableOpacity>
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}

                                                            {eventStatus === 'in progress' && (
                                                                <>
                                                                    <Text style={styles.modalLabel}>Confirm participation:</Text>
                                                                    {participationStatus === 'confirmed' ? (
                                                                        <View style={styles.statusContainer}>
                                                                            <Text style={styles.statusTextParticipation}>
                                                                                Participation:{' '}
                                                                                <Text style={styles.confirmedText}>CONFIRMED</Text>
                                                                            </Text>
                                                                            <TouchableOpacity
                                                                                style={[styles.actionButton, styles.denyButton]}
                                                                                onPress={() => setParticipationStatus('denied')}
                                                                            >
                                                                                <MaterialIcons name="cancel" size={20} color="#fff" />
                                                                                <Text style={styles.buttonText}>Change to Deny</Text>
                                                                            </TouchableOpacity>
                                                                        </View>
                                                                    ) : participationStatus === 'denied' ? (
                                                                        <View style={styles.statusContainer}>
                                                                            <Text style={styles.statusTextParticipation}>
                                                                                Participation:{' '}
                                                                                <Text style={styles.deniedText}>DENIED</Text>
                                                                            </Text>
                                                                            <TouchableOpacity
                                                                                style={[styles.actionButton, styles.confirmButton]}
                                                                                onPress={() => setParticipationStatus('confirmed')}
                                                                            >
                                                                                <MaterialIcons name="check-circle" size={20} color="#fff" />
                                                                                <Text style={styles.buttonText}>Change to Confirm</Text>
                                                                            </TouchableOpacity>
                                                                        </View>
                                                                    ) : (
                                                                        <>
                                                                            <TouchableOpacity
                                                                                style={[styles.actionButton, styles.confirmButton]}
                                                                                onPress={() => setParticipationStatus('confirmed')}
                                                                            >
                                                                                <MaterialIcons name="check-circle" size={20} color="#fff" />
                                                                                <Text style={styles.buttonText}>Confirm</Text>
                                                                            </TouchableOpacity>
                                                                            <TouchableOpacity
                                                                                style={[styles.actionButton, styles.denyButton]}
                                                                                onPress={() => setParticipationStatus('denied')}
                                                                            >
                                                                                <MaterialIcons name="cancel" size={20} color="#fff" />
                                                                                <Text style={styles.buttonText}>Deny</Text>
                                                                            </TouchableOpacity>
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}

                                                            {/* If currentUser is the creator, show an "Edit" button. */}
                                                            {isCreator && (
                                                                <TouchableOpacity
                                                                    style={[styles.actionButton, styles.editButton]}
                                                                    onPress={() => {
                                                                        setIsEventModalVisible(false);
                                                                        openEdit(selectedEvent);
                                                                    }}
                                                                >
                                                                    <MaterialIcons name="edit" size={20} color="#fff" style={{ marginRight: 4 }} />
                                                                    <Text style={styles.buttonText}>Edit</Text>
                                                                </TouchableOpacity>
                                                            )}
                                                            <TouchableOpacity
                                                                style={[styles.actionButton, styles.closeButton]}
                                                                onPress={closeView}
                                                            >
                                                                <MaterialIcons name="close" size={20} color="#fff" />
                                                                <Text style={styles.buttonText}>Close</Text>
                                                            </TouchableOpacity>

                                                            {/* If currentUser is the creator, show an "Edit" button. */}
                                                            {isCreator && (
                                                                <TouchableOpacity
                                                                    style={[styles.actionButton, styles.deleteButton]}
                                                                    onPress={() => {
                                                                        deleteEvent(selectedEvent, Number(currentUser?.id_user));
                                                                    }}
                                                                >
                                                                    <MaterialIcons name="delete" size={20} color="#fff" style={{ marginRight: 4 }} />
                                                                    <Text style={styles.buttonText}>Delete</Text>
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>

                                                        {/* Participants Modal */}
                                                        <Modal
                                                            visible={showParticipantsModal}
                                                            animationType="slide"
                                                            transparent={true}
                                                            onRequestClose={() => setShowParticipantsModal(false)}
                                                        >
                                                            <View style={styles.modalOverlay}>
                                                                <View style={styles.participantsModalContainer}>

                                                                    {/* Header */}
                                                                    <View style={styles.modalHeader}>
                                                                        <Text style={styles.modalTitle}>Participants</Text>
                                                                        <TouchableOpacity
                                                                            onPress={() => setShowParticipantsModal(false)}
                                                                            accessibilityLabel="Close Participants Modal"
                                                                        >
                                                                            <MaterialIcons name="close" size={24} color="#333" />
                                                                        </TouchableOpacity>
                                                                    </View>

                                                                    {/* Summary: Accepted / Declined / Pending (or Voted / Pending if "voting") */}
                                                                    {(() => {
                                                                        const participants = selectedEvent?.participants ?? [];

                                                                        if (eventStatus === 'voting') {
                                                                            const votedCount = participants.filter((p) => p.status.toLowerCase() !== 'pending').length;
                                                                            const pendingCount = participants.filter((p) => p.status.toLowerCase() === 'pending').length;
                                                                            return (
                                                                                <View style={styles.summaryRow}>
                                                                                    <Text style={styles.summaryText}>
                                                                                        Voted: {votedCount} | Pending: {pendingCount}
                                                                                    </Text>
                                                                                </View>
                                                                            );
                                                                        } else {
                                                                            const acceptedCount = participants.filter((p) => p.status.toLowerCase() === 'accepted').length;
                                                                            const declinedCount = participants.filter((p) => p.status.toLowerCase() === 'declined').length;
                                                                            const pendingCount = participants.filter((p) => p.status.toLowerCase() === 'pending').length;
                                                                            return (
                                                                                <View style={styles.summaryRow}>
                                                                                    <Text style={styles.summaryText}>
                                                                                        Accepted: {acceptedCount} | Declined: {declinedCount} | Pending: {pendingCount}
                                                                                    </Text>
                                                                                </View>
                                                                            );
                                                                        }
                                                                    })()}

                                                                    {/* Scrollable List of Participants */}
                                                                    <ScrollView
                                                                        style={styles.participantsScroll}
                                                                        contentContainerStyle={{ paddingBottom: 20 }}
                                                                        nestedScrollEnabled={true}
                                                                    >
                                                                        {(() => {
                                                                            const participants = selectedEvent?.participants ?? [];
                                                                            const order: Record<string, number> = {
                                                                                accepted: 0,
                                                                                declined: 1,
                                                                                pending: 2,
                                                                            };

                                                                            const sortedParticipants = participants.slice().sort((a, b) => {
                                                                                const statusA = a.status.toLowerCase();
                                                                                const statusB = b.status.toLowerCase();
                                                                                const sortA = order[statusA] ?? 999;
                                                                                const sortB = order[statusB] ?? 999;
                                                                                return sortA - sortB;
                                                                            });

                                                                            return sortedParticipants.map((p, index) => {
                                                                                // If the event is in "voting" status, show either "VOTED" or "PENDING"
                                                                                if (eventStatus === 'voting') {
                                                                                    const isPending = p.status.toLowerCase() === 'pending';
                                                                                    return (
                                                                                        <View key={index} style={styles.participantRow}>
                                                                                            <Image source={
                                                                                                p.pfp_url.startsWith('http')
                                                                                                    ? { uri: p.pfp_url }
                                                                                                    : require('../../assets/images/default_profile.png')
                                                                                            } style={friendStyles.friendPfp} />
                                                                                            <View style={{ flex: 1 }}>
                                                                                                <Text style={styles.participantName}>{p.username}</Text>
                                                                                                <Text style={styles.participantEmail}>{p.email}</Text>
                                                                                            </View>
                                                                                            <View style={styles.statusContainer}>
                                                                                                {isPending ? (
                                                                                                    <>
                                                                                                        <MaterialIcons
                                                                                                            name="help-outline"
                                                                                                            size={20}
                                                                                                            color="orange"
                                                                                                            style={{ marginRight: 4 }}
                                                                                                        />
                                                                                                        <Text style={styles.participantStatus}>PENDING</Text>
                                                                                                    </>
                                                                                                ) : (
                                                                                                    <>
                                                                                                        <MaterialIcons
                                                                                                            name="check-circle"
                                                                                                            size={20}
                                                                                                            color="green"
                                                                                                            style={{ marginRight: 4 }}
                                                                                                        />
                                                                                                        <Text style={styles.participantStatus}>VOTED</Text>
                                                                                                    </>
                                                                                                )}
                                                                                            </View>
                                                                                        </View>
                                                                                    );
                                                                                }

                                                                                // Otherwise, use the existing accepted/declined/pending logic
                                                                                return (
                                                                                    <View key={index} style={styles.participantRow}>
                                                                                        <Image source={
                                                                                            p.pfp_url.startsWith('http')
                                                                                                ? { uri: p.pfp_url }
                                                                                                : require('../../assets/images/default_profile.png')
                                                                                        } style={friendStyles.friendPfp} />
                                                                                        <View style={{ flex: 1 }}>
                                                                                            <Text style={styles.participantName}>{p.username}</Text>
                                                                                            <Text style={styles.participantEmail}>{p.email}</Text>
                                                                                        </View>
                                                                                        <View style={styles.statusContainer}>
                                                                                            {p.status.toLowerCase() === 'accepted' ? (
                                                                                                <>
                                                                                                    <MaterialIcons
                                                                                                        name="check-circle"
                                                                                                        size={20}
                                                                                                        color="green"
                                                                                                        style={{ marginRight: 4 }}
                                                                                                    />
                                                                                                    <Text style={styles.participantStatus}>ACCEPTED</Text>
                                                                                                </>
                                                                                            ) : p.status.toLowerCase() === 'declined' ? (
                                                                                                <>
                                                                                                    <MaterialIcons
                                                                                                        name="cancel"
                                                                                                        size={20}
                                                                                                        color="red"
                                                                                                        style={{ marginRight: 4 }}
                                                                                                    />
                                                                                                    <Text style={styles.participantStatus}>DECLINED</Text>
                                                                                                </>
                                                                                            ) : (
                                                                                                <>
                                                                                                    <MaterialIcons
                                                                                                        name="help-outline"
                                                                                                        size={20}
                                                                                                        color="orange"
                                                                                                        style={{ marginRight: 4 }}
                                                                                                    />
                                                                                                    <Text style={styles.participantStatus}>PENDING</Text>
                                                                                                </>
                                                                                            )}
                                                                                        </View>
                                                                                    </View>
                                                                                );
                                                                            });
                                                                        })()}
                                                                    </ScrollView>

                                                                    {/* Bottom Button */}
                                                                    <View style={styles.modalActions}>
                                                                        <TouchableOpacity
                                                                            style={styles.cancelButton}
                                                                            onPress={() => setShowParticipantsModal(false)}
                                                                            accessibilityLabel="Back"
                                                                        >
                                                                            <Text style={styles.cancelButtonText}>Back</Text>
                                                                        </TouchableOpacity>
                                                                    </View>

                                                                </View>
                                                            </View>
                                                        </Modal>
                                                    </>
                                                );
                                            })()
                                        ) : (
                                            <ActivityIndicator size="large" color="#4CAF50" />
                                        )}
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>

                    {/* VOTING MODAL SYSTEM */}
                    <Modal
                        visible={isVotingModalVisible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setIsVotingModalVisible(false)}
                    >
                        <TouchableWithoutFeedback onPress={() => setIsVotingModalVisible(false)}>
                            <View style={styles.modalOverlay}>
                                <TouchableWithoutFeedback onPress={() => { /* Prevent modal from closing when tapping inside */ }}>
                                    <View style={styles.votingModalContainer}>
                                        <View style={styles.votingModalHeader}>
                                            <Text style={styles.modalTitle}>
                                                Select Availability For <Text style={styles.eventTitle}>{selectedEvent?.name || 'Event'}</Text>
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => { setIsVotingModalVisible(false); setIsEventModalVisible(true); }}
                                                accessibilityLabel="Close Voting Modal"
                                            >
                                                <MaterialIcons name="close" size={24} color="#333" />
                                            </TouchableOpacity>
                                        </View>
                                        <ScrollView contentContainerStyle={styles.votingModalContent}>
                                            {/* Availability Selection for Each Day */}
                                            {selectedEvent && selectedEvent.date_options.map((dayTime, index) => {
                                                const dayKey = getDateFrom(dayTime.date_start).toISOString()+'.'+getHoursFrom(dayTime.date_start)+'.'+getHoursFrom(dayTime.date_end);
                                                const isAvailable = availability[dayKey]?.isAvailable; // to check if user has already chosen

                                                //console.log(isAvailable);

                                                return (
                                                    <View key={index} style={styles.dayContainer}>
                                                        <View style={styles.dayHeader}>
                                                            <Text style={styles.dayTitle}>
                                                                {getDateFrom(dayTime.date_start).toLocaleDateString('en-US', { weekday: 'long' })},{' '}
                                                                {getDateFrom(dayTime.date_start).toLocaleDateString()}
                                                            </Text>
                                                            <View style={styles.availableContainer}>
                                                                <MaterialIcons name="schedule" size={20} color="#4CAF50" />
                                                                <Text style={styles.availableText}>
                                                                    {getHoursFrom(dayTime.date_start)} - {getHoursFrom(dayTime.date_end)}
                                                                </Text>
                                                            </View>
                                                        </View>

                                                        <View style={styles.selectTimeSection}>
                                                            <Text style={styles.modalLabel}>Are you available?</Text>

                                                            {/* If user already selected, show 'Change mind' approach */}
                                                            {typeof isAvailable === 'boolean' ? (
                                                                <View style={styles.alreadySelectedContainer}>
                                                                    <MaterialIcons
                                                                        name={isAvailable ? 'check-circle' : 'cancel'}
                                                                        size={20}
                                                                        color={isAvailable ? '#4CAF50' : '#e74c3c'}
                                                                    />
                                                                    <Text style={styles.alreadySelectedText}>
                                                                        {isAvailable ? 'You said: YES' : 'You said: NO'}
                                                                    </Text>
                                                                    <TouchableOpacity
                                                                        style={styles.changeMindButton}
                                                                        onPress={() => handleAvailabilityResponse(dayKey, !isAvailable)}
                                                                    >
                                                                        <Text style={styles.changeMindButtonText}>Change Mind</Text>
                                                                    </TouchableOpacity>
                                                                </View>
                                                            ) : (
                                                                /* Otherwise, show initial YES/NO buttons */
                                                                <View style={styles.responseButtonsContainer}>
                                                                    <TouchableOpacity
                                                                        style={[styles.responseButton, styles.yesButton]}
                                                                        onPress={() => handleAvailabilityResponse(dayKey, true)}
                                                                    >
                                                                        <MaterialIcons name="check" size={20} color="#fff" />
                                                                        <Text style={styles.responseButtonText}>Yes</Text>
                                                                    </TouchableOpacity>
                                                                    <TouchableOpacity
                                                                        style={[styles.responseButton, styles.noButton]}
                                                                        onPress={() => handleAvailabilityResponse(dayKey, false)}
                                                                    >
                                                                        <MaterialIcons name="close" size={20} color="#fff" />
                                                                        <Text style={styles.responseButtonText}>No</Text>
                                                                    </TouchableOpacity>
                                                                </View>
                                                            )}
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </ScrollView>
                                        {/* Voting Modal Actions */}
                                        <View style={styles.modalActions}>
                                            <Button
                                                title="Save"
                                                onPress={() => { saveVotingData() }}
                                                color="#757575"
                                            />
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                </ScrollView>

                {/* FAB */}
                <TouchableOpacity style={styles.fab} onPress={startCreateEvent}>
                    <MaterialIcons name="add" size={28} color="white" />
                </TouchableOpacity>

                {/* CREATE EVENT MODAL */}
                <Modal
                    visible={createModalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={closeCreateEvent}
                >
                    <KeyboardAvoidingView
                        style={styles.modalOverlay}
                        behavior={keyboardOffset}
                    >
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Create Event (Step {createStep}/4)</Text>
                            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                                {/* Step1 Basic */}
                                {createStep === 1 && (
                                    <>
                                        <View style={styles.sectionContainer}>
                                            <MaterialIcons name="info" size={24} color="#4CAF50" style={styles.sectionIcon} />
                                            <Text style={styles.label}>Basic Info</Text>
                                        </View>

                                        {/* Title Input */}
                                        <View style={styles.inputContainer}>
                                            <MaterialIcons name="event" size={24} color="#4CAF50" style={styles.iconStyle} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Title"
                                                placeholderTextColor="#999"
                                                value={createTitle}
                                                onChangeText={setCreateTitle}
                                                accessible={true}
                                                accessibilityLabel="Event Title"
                                            />
                                        </View>

                                        {/* Description Input */}
                                        <View style={styles.inputContainer}>
                                            <MaterialIcons name="description" size={24} color="#4CAF50" style={styles.iconStyle} />
                                            <TextInput
                                                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                                placeholder="Description"
                                                placeholderTextColor="#999"
                                                value={createDesc}
                                                onChangeText={setCreateDesc}
                                                multiline
                                                accessible={true}
                                                accessibilityLabel="Event Description"
                                            />
                                        </View>

                                        {/* Location Input */}
                                        <View style={styles.inputContainer}>
                                            <MaterialIcons name="location-on" size={24} color="#4CAF50" style={styles.iconStyle} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Location"
                                                placeholderTextColor="#999"
                                                value={createLoc}
                                                onChangeText={setCreateLoc}
                                                accessible={true}
                                                accessibilityLabel="Event Location"
                                            />
                                        </View>
                                    </>
                                )}

                                {/* Step2 Days */}
                                {createStep === 2 && (
                                    <>
                                        {/* Days Selection Section */}
                                        <View style={styles.sectionContainer}>
                                            <MaterialIcons name="event" size={24} color="#4CAF50" style={styles.sectionIcon} />
                                            <Text style={styles.label}>Days</Text>
                                        </View>

                                        {/* Displaying Selected Days */}
                                        {createDays.length === 0 ? (
                                            <Text style={styles.noDaysText}>No days added yet.</Text>
                                        ) : (
                                            <View style={styles.daysContainer}>
                                                {createDays.map((d, i) => (
                                                    <View key={i} style={styles.dayItem}>
                                                        <TouchableOpacity
                                                            style={styles.dayInfo}
                                                            onPress={() => openAddDayModalCreate(i)}
                                                        >
                                                            <Text style={styles.dayText}>
                                                                {formatDay(getDateFrom(d.date_start))} | {getHoursFrom(d.date_start)} - {getHoursFrom(d.date_end)}
                                                            </Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            onPress={() => removeDayCreate(i)}
                                                            style={styles.removeDayButton}
                                                        >
                                                            <MaterialIcons name="delete" size={24} color="#e74c3c" />
                                                        </TouchableOpacity>
                                                    </View>
                                                ))}
                                            </View>
                                        )}

                                        {/* Add Day Button */}
                                        <TouchableOpacity
                                            style={styles.addDayButton}
                                            onPress={() => openAddDayModalCreate()}
                                        >
                                            <MaterialIcons name="add-circle-outline" size={24} color="#fff" />
                                            <Text style={styles.addDayButtonText}>Add Day</Text>
                                        </TouchableOpacity>
                                    </>
                                )}

                                {/* Step3 Invites */}
                                {createStep === 3 && (
                                    <>
                                        {/* Invite Friends Section */}
                                        <View style={styles.sectionContainer}>
                                            <MaterialIcons name="person-add" size={24} color="#4CAF50" style={styles.sectionIcon} />
                                            <Text style={styles.label}>Invite Friends</Text>
                                        </View>

                                        {/* Friends List */}
                                        <ScrollView horizontal style={styles.friendsScrollView}>
                                            {friends?.map((f) => (
                                                <TouchableOpacity
                                                    key={f.id_user}
                                                    style={styles.inviteChip}
                                                    onPress={() => addFriendInvite(f)}
                                                >
                                                    <Text style={styles.inviteChipText}>{f.username}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>

                                        {/* Add Invitee Input */}
                                        <View style={styles.inviteInputContainer}>
                                            <TextInput
                                                style={styles.inviteInput}
                                                placeholder="Type username/email"
                                                placeholderTextColor="#999"
                                                value={typedInvite}
                                                onChangeText={setTypedInvite}
                                                onSubmitEditing={addTypedInvite}
                                                returnKeyType="done"
                                            />
                                            <TouchableOpacity
                                                style={styles.addInviteButton}
                                                onPress={addTypedInvite}
                                            >
                                                <MaterialIcons name="add" size={24} color="#fff" />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Display Invited Friends */}
                                        {invitees.length > 0 && (
                                            <View style={styles.invitedContainer}>
                                                <Text style={styles.invitedLabel}>Invited:</Text>
                                                <View style={styles.invitedList}>
                                                    {invitees.map((p, idx) => (
                                                        <View key={idx} style={styles.invitedItem}>
                                                            <Text style={styles.invitedText}>
                                                                {p.username} ({p.email})
                                                            </Text>
                                                            <TouchableOpacity onPress={() => removeInvite(p.email)}>
                                                                <MaterialIcons name="close" size={20} color="#e74c3c" />
                                                            </TouchableOpacity>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        )}
                                    </>
                                )}

                                {/* Step4 Voting Deadline */}
                                {createStep === 4 && (
                                    <>
                                        {/* Voting Deadline Section */}
                                        <View style={styles.sectionContainer}>
                                            <MaterialIcons name="event-note" size={24} color="#4CAF50" style={styles.sectionIcon} />
                                            <Text style={styles.label}>Voting Deadline</Text>
                                        </View>

                                        {/* Voting Deadline Button */}
                                        <TouchableOpacity
                                            style={styles.votingButton}
                                            onPress={openVotingDatePickerCreate}
                                            accessible={true}
                                            accessibilityLabel="Select Voting Deadline"
                                        >
                                            <MaterialIcons name="calendar-today" size={24} color="#4CAF50" />
                                            <Text style={styles.votingButtonText}>
                                                End Voting: {formatDate(endVotingDate)}
                                            </Text>
                                        </TouchableOpacity>

                                        {/* DateTimePicker Modal */}
                                        {showVotingPicker && (
                                            <DateTimePicker
                                                value={endVotingDate}
                                                mode="datetime"
                                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                onChange={handleVotingDateChange}
                                                minimumDate={new Date()} // Prevent selecting past dates
                                                textColor="black" // Ensures visibility
                                            />
                                        )}
                                    </>
                                )}

                            </ScrollView>
                            <View style={styles.modalEventButtons}>
                                <Button title={createStep === 1 ? 'Cancel' : 'Back'} onPress={handlePrevStepCreate} />
                                <Button title={createStep < 4 ? 'Next' : 'Finish'} onPress={handleNextStepCreate} />
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                {/* ADD DAY MODAL (CREATE) */}
                <Modal visible={addDayModalVisible} transparent animationType="slide">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                {/* Header */}
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>
                                        {tempDayIndex !== null ? 'Edit Day' : 'Add Day'}
                                    </Text>
                                    <TouchableOpacity onPress={closeAddDayModalCreate}>
                                        <MaterialIcons name="close" size={24} color="#333" />
                                    </TouchableOpacity>
                                </View>

                                {/* Content */}
                                <View style={styles.modalContent}>
                                    {/* Date Selection */}
                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.label}>Date</Text>
                                        <View style={styles.valueButtonRow}>
                                            <Text style={styles.valueText}>{formatDay(tempDate)}</Text>
                                            <TouchableOpacity
                                                style={styles.pickerButton}
                                                onPress={openPickDate}
                                            >
                                                <MaterialIcons name="calendar-today" size={20} color="#fff" />
                                                <Text style={styles.pickerButtonText}>Pick Date</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Start Time Selection */}
                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.label}>Start Time</Text>
                                        <View style={styles.valueButtonRow}>
                                            <Text style={styles.valueText}>{tempStart}</Text>
                                            <TouchableOpacity
                                                style={styles.pickerButton}
                                                onPress={() => openPickStartTime()}
                                            >
                                                <MaterialIcons name="access-time" size={20} color="#fff" />
                                                <Text style={styles.pickerButtonText}>Pick Start</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* End Time Selection */}
                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.label}>End Time</Text>
                                        <View style={styles.valueButtonRow}>
                                            <Text style={styles.valueText}>{tempEnd}</Text>
                                            <TouchableOpacity
                                                style={styles.pickerButton}
                                                onPress={() => openPickEndTime()}
                                            >
                                                <MaterialIcons name="access-time" size={20} color="#fff" />
                                                <Text style={styles.pickerButtonText}>Pick End</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                {/* Actions */}
                                <View style={styles.modalEventButtons}>
                                    <TouchableOpacity style={styles.cancelButton} onPress={() => closeAddDayModalCreate()}>
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.saveButton} onPress={() => handleSaveDayCreate()}>
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                {/* PICK DATE (CREATE) */}
                <Modal visible={pickDateModalVisible} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Pick Date</Text>
                            {isIOS ? (
                                // iOS Date Picker
                                <DateTimePicker
                                    value={tempDate}
                                    mode="date"
                                    display="spinner"
                                    onChange={(event, selectedDate) => {
                                        onPickDateChange(selectedDate);
                                    }}
                                    textColor='black' // Set text color to ensure visibility
                                />
                            ) : (
                                // Android Date Picker
                                <DateTimePickerComponent
                                    visible={pickDateModalVisible}
                                    date={tempDate}
                                    mode="date"
                                    onConfirm={(datetime) => {
                                        onPickDateChange(datetime);
                                        setPickDateModalVisible(false);
                                    }}
                                    onCancel={() => {
                                        setPickDateModalVisible(false);
                                    }}
                                />
                            )}
                            <View style={styles.modalEventButtons}>
                                <Button title="Cancel" onPress={() => closePickDate()} />
                                <Button title="Save" onPress={() => savePickDate()} />
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* PICK START TIME (CREATE) */}
                {isIOS ? (
                    <Modal visible={pickStartModalVisible} transparent animationType="fade">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>Pick Start Time</Text>
                                <DateTimePicker
                                    value={tempStart ? new Date(`1970-01-01T${tempStart}:00`) : new Date()} // Use tempStart or fallback to current time
                                    mode="time"
                                    display="spinner"
                                    onChange={(ev, sel) => {
                                        if (!sel) return;
                                        const hhmm = sel.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false, // Use 24-hour format
                                        });
                                        setTempStart(hhmm); // Update temporary state with selected time
                                    }}
                                    textColor="black" // Ensure visibility
                                />
                                <View style={styles.modalEventButtons}>
                                    <Button
                                        title="Cancel"
                                        onPress={() => {
                                            setPickStartModalVisible(false);
                                            setAddDayModalVisible(true);
                                        }}
                                    />
                                    <Button
                                        title="Save"
                                        onPress={() => {
                                            setTempStart(tempStart); // Save selected time to main state
                                            setPickStartModalVisible(false);
                                            setAddDayModalVisible(true);
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    </Modal>
                ) : (
                    <DateTimePickerComponent
                        visible={pickStartModalVisible}
                        date={tempStart ? new Date(`1970-01-01T${tempStart}:00`) : new Date()} // Use tempStart or fallback to current time
                        mode="time"
                        onConfirm={(datetime) => {
                            const hhmm = datetime.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false, // Use 24-hour format
                            });
                            setTempStart(hhmm);
                            setPickStartModalVisible(false);
                        }}
                        onCancel={() => {
                            setPickStartModalVisible(false);
                        }}
                    />
                )}

                {/* PICK END TIME (CREATE) */}
                {isIOS ? (
                    <Modal visible={pickEndModalVisible} transparent animationType="fade">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>Pick End Time</Text>
                                <DateTimePicker
                                    value={tempEnd ? new Date(`1970-01-01T${tempEnd}:00`) : new Date()} // Use tempEnd or fallback to current time
                                    mode="time"
                                    display="spinner"
                                    onChange={(ev, sel) => {
                                        if (!sel) return;
                                        const hhmm = sel.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false, // Ensure 24-hour format
                                        });
                                        setTempEnd(hhmm); // Update temporary state with selected time
                                    }}
                                    textColor="black" // Ensure visibility
                                />
                                <View style={styles.modalEventButtons}>
                                    <Button
                                        title="Cancel"
                                        onPress={() => {
                                            setPickEndModalVisible(false);
                                            setAddDayModalVisible(true);
                                        }}
                                    />
                                    <Button
                                        title="Save"
                                        onPress={() => {
                                            setTempEnd(tempEnd); // Save selected time to main state
                                            setPickEndModalVisible(false);
                                            setAddDayModalVisible(true);
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    </Modal>
                ) : (
                    <DateTimePickerComponent
                        visible={pickEndModalVisible}
                        date={tempEnd ? new Date(`1970-01-01T${tempEnd}:00`) : new Date()} // Use tempEnd or fallback to current time
                        mode="time"
                        onConfirm={(datetime) => {
                            const hhmm = datetime.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false, // Ensure 24-hour format
                            });
                            setTempEnd(hhmm);
                            setPickEndModalVisible(false);
                        }}
                        onCancel={() => {
                            setPickEndModalVisible(false);
                        }}
                    />
                )}

                {/* VOTING PICKER CREATE */}
                {isIOS ? (
                    <Modal visible={votingPickerVisible} transparent animationType="fade">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>Pick Voting Deadline</Text>
                                <DateTimePicker
                                    value={endVotingDate} // Current deadline
                                    mode="datetime"
                                    display="spinner"
                                    onChange={(ev, sel) => {
                                        onVotingDateChange(sel); // Update deadline
                                    }}
                                    textColor="black" // Ensure visibility
                                />
                                <View style={styles.modalEventButtons}>
                                    <Button title="Cancel" onPress={() => cancelVotingDate()} />
                                    <Button title="Save" onPress={() => saveVotingDate()} />
                                </View>
                            </View>
                        </View>
                    </Modal>
                ) : (
                    <DateTimePickerComponent
                        visible={votingPickerVisible}
                        date={endVotingDate} // Current deadline
                        mode="datetime"
                        onConfirm={(datetime) => {
                            onVotingDateChange(datetime); // Update deadline
                            setVotingPickerVisible(false); // Close picker
                        }}
                        onCancel={() => {
                            setVotingPickerVisible(false); // Close picker
                        }}
                    />
                )}

                {/* EDIT EVENT MODAL */}
                <Modal visible={editModalVisible} transparent animationType="slide">
                    {editEvent && (
                        <KeyboardAvoidingView style={styles.modalOverlay} behavior={keyboardOffset}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>Edit Event (Step {editStep}/4)</Text>
                                <ScrollView>
                                    {editStep === 1 && (
                                        <>
                                            <View style={styles.sectionContainer}>
                                                <MaterialIcons name="info" size={24} color="#4CAF50" style={styles.sectionIcon} />
                                                <Text style={styles.label}>Basic Info</Text>
                                            </View>
                                            {/* Title Input */}
                                            <View style={styles.inputContainer}>
                                                <MaterialIcons name="event" size={24} color="#4CAF50" style={styles.iconStyle} />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Title"
                                                    placeholderTextColor="#999"
                                                    value={editTitle}
                                                    onChangeText={setEditTitle}
                                                    accessible={true}
                                                    accessibilityLabel="Event Title"
                                                />
                                            </View>

                                            {/* Description Input */}
                                            <View style={styles.inputContainer}>
                                                <MaterialIcons name="description" size={24} color="#4CAF50" style={styles.iconStyle} />
                                                <TextInput
                                                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                                    placeholder="Description"
                                                    placeholderTextColor="#999"
                                                    value={editDesc}
                                                    onChangeText={setEditDesc}
                                                    multiline
                                                    accessible={true}
                                                    accessibilityLabel="Event Description"
                                                />
                                            </View>

                                            {/* Location Input */}
                                            <View style={styles.inputContainer}>
                                                <MaterialIcons name="location-on" size={24} color="#4CAF50" style={styles.iconStyle} />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Location"
                                                    placeholderTextColor="#999"
                                                    value={editLoc}
                                                    onChangeText={setEditLoc}
                                                    accessible={true}
                                                    accessibilityLabel="Event Location"
                                                />
                                            </View>
                                        </>
                                    )}
                                    {editStep === 2 && (
                                        <>
                                            {/* Days Selection Section */}
                                            <View style={styles.sectionContainer}>
                                                <MaterialIcons name="event" size={24} color="#4CAF50" style={styles.sectionIcon} />
                                                <Text style={styles.label}>Days</Text>
                                            </View>
                                            {editDays.length === 0 && <Text style={styles.noDaysText}>No days added yet.</Text>}
                                            <View style={styles.daysContainer}>
                                                {editDays.map((d, i) => (
                                                    <View key={i} style={styles.dayItem}>
                                                        <TouchableOpacity
                                                            style={styles.dayInfo}
                                                            onPress={() => openAddDayModalEdit(i)}
                                                        >
                                                            <Text style={styles.dayText}>
                                                                {formatDay(getDateFrom(d.date_start))} | {getHoursFrom(d.date_start)} - {getHoursFrom(d.date_end)}
                                                            </Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            onPress={() => removeDayEdit(i)}
                                                            style={styles.removeDayButton}
                                                        >
                                                            <MaterialIcons name="delete" size={24} color="#e74c3c" />
                                                        </TouchableOpacity>
                                                    </View>
                                                ))}
                                            </View>

                                            {/* Add Day Button */}
                                            <TouchableOpacity
                                                style={styles.addDayButton}
                                                onPress={() => openAddDayModalEdit()}
                                            >
                                                <MaterialIcons name="add-circle-outline" size={24} color="#fff" />
                                                <Text style={styles.addDayButtonText}>Add Day</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}

                                    {editStep === 3 && (
                                        <>
                                            {/* Invite Friends Section */}
                                            <View style={styles.sectionContainer}>
                                                <MaterialIcons name="person-add" size={24} color="#4CAF50" style={styles.sectionIcon} />
                                                <Text style={styles.label}>Invite Friends</Text>
                                            </View>
                                            {/* Friends List */}
                                            <ScrollView horizontal style={styles.friendsScrollView}>
                                                {friends?.map((f) => (
                                                    <TouchableOpacity
                                                        key={f.id_user}
                                                        style={styles.inviteChip}
                                                        onPress={() => addFriendInviteEdit(f)}
                                                    >
                                                        <Text style={styles.inviteChipText}>{f.username}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>

                                            {/* Add Invitee Input */}
                                            <View style={styles.inviteInputContainer}>
                                                <TextInput
                                                    style={styles.inviteInput}
                                                    placeholder="Type username/email"
                                                    placeholderTextColor="#999"
                                                    value={editTypedInvite}
                                                    onChangeText={setEditTypedInvite}
                                                    onSubmitEditing={addTypedInviteEdit}
                                                    returnKeyType="done"
                                                />
                                                <TouchableOpacity
                                                    style={styles.addInviteButton}
                                                    onPress={() => addTypedInviteEdit()}
                                                >
                                                    <MaterialIcons name="add" size={24} color="#fff" />
                                                </TouchableOpacity>
                                            </View>

                                            {/* Display Invited Friends */}
                                            {editInvitees.length > 0 && (
                                                <View style={styles.invitedContainer}>
                                                    <Text style={styles.invitedLabel}>Invited:</Text>
                                                    <View style={styles.invitedList}>
                                                        {editInvitees.map((p, idx) => (
                                                            <View key={idx} style={styles.invitedItem}>
                                                                <Text style={styles.invitedText}>
                                                                    {p.username} ({p.email})
                                                                </Text>
                                                                <TouchableOpacity onPress={() => removeInviteEdit(p.email)}>
                                                                    <MaterialIcons name="close" size={20} color="#e74c3c" />
                                                                </TouchableOpacity>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            )}
                                        </>
                                    )}

                                    {editStep === 4 && (
                                        <>

                                            {/* Voting Deadline Section */}
                                            <View style={styles.sectionContainer}>
                                                <MaterialIcons name="event-note" size={24} color="#4CAF50" style={styles.sectionIcon} />
                                                <Text style={styles.label}>Voting Deadline</Text>
                                            </View>

                                            {/* Voting Deadline Button */}
                                            <TouchableOpacity
                                                style={styles.votingButton}
                                                onPress={() => openVotingDatePickerEdit()}
                                                accessible={true}
                                                accessibilityLabel="Select Voting Deadline"
                                            >
                                                <MaterialIcons name="calendar-today" size={24} color="#4CAF50" />
                                                <Text style={styles.votingButtonText}>
                                                    End Voting: {formatDate(editEndVoting)}
                                                </Text>
                                            </TouchableOpacity>

                                            {/* DateTimePicker Modal */}
                                            {showVotingPicker && (
                                                <DateTimePicker
                                                    value={endVotingDate}
                                                    mode="datetime"
                                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                    onChange={handleVotingDateChange}
                                                    minimumDate={new Date()} // Prevent selecting past dates
                                                    textColor="black" // Ensures visibility
                                                />
                                            )}
                                        </>
                                    )}
                                </ScrollView>
                                <View style={styles.modalEventButtons}>
                                    <Button title={editStep === 1 ? 'Cancel' : 'Back'} onPress={() => handlePrevStepEdit()} />
                                    <Button title={editStep < 4 ? 'Next' : 'Save'} onPress={() => handleNextStepEdit()} />
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    )}
                </Modal>

                {/* ADD DAY (EDIT) */}
                <Modal visible={addDayModalVisibleEdit} transparent animationType="slide">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                {/* Header */}
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>
                                        {tempDayIndexEdit !== null ? 'Edit Day' : 'Add Day'}
                                    </Text>
                                    <TouchableOpacity onPress={() => closeAddDayModalEdit()}>
                                        <MaterialIcons name="close" size={24} color="#333" />
                                    </TouchableOpacity>
                                </View>

                                {/* Content */}
                                <View style={styles.modalContent}>
                                    {/* Date Selection */}
                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.label}>Date</Text>
                                        <View style={styles.valueButtonRow}>
                                            <Text style={styles.valueText}>{formatDay(tempDateEdit)}</Text>
                                            <TouchableOpacity
                                                style={styles.pickerButton}
                                                onPress={() => openPickDateEdit()}
                                            >
                                                <MaterialIcons name="calendar-today" size={20} color="#fff" />
                                                <Text style={styles.pickerButtonText}>Pick Date</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Start Time Selection */}
                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.label}>Start Time</Text>
                                        <View style={styles.valueButtonRow}>
                                            <Text style={styles.valueText}>{tempStartEdit}</Text>
                                            <TouchableOpacity
                                                style={styles.pickerButton}
                                                onPress={() => openPickStartTimeEdit()}
                                            >
                                                <MaterialIcons name="access-time" size={20} color="#fff" />
                                                <Text style={styles.pickerButtonText}>Pick Start</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* End Time Selection */}
                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.label}>End Time</Text>
                                        <View style={styles.valueButtonRow}>
                                            <Text style={styles.valueText}>{tempEndEdit}</Text>
                                            <TouchableOpacity
                                                style={styles.pickerButton}
                                                onPress={() => openPickEndTimeEdit()}
                                            >
                                                <MaterialIcons name="access-time" size={20} color="#fff" />
                                                <Text style={styles.pickerButtonText}>Pick End</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                {/* Actions */}
                                <View style={styles.modalEventButtons}>
                                    <TouchableOpacity style={styles.cancelButton} onPress={() => closeAddDayModalEdit()}>
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.saveButton} onPress={() => handleSaveDayEdit()}>
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                {/* PICK DATE (EDIT) */}
                {isIOS ? (
                    <Modal visible={pickDateModalEditVisible} transparent animationType="fade">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>Pick Date (Edit)</Text>
                                <DateTimePicker
                                    value={tempDateEdit}
                                    mode="date"
                                    display="spinner"
                                    onChange={(ev, sel) => onPickDateChangeEdit(sel)}
                                    textColor="black"
                                />
                                <View style={styles.modalEventButtons}>
                                    <Button
                                        title="Cancel"
                                        onPress={() => {
                                            setPickDateModalEditVisible(false);
                                            setAddDayModalVisibleEdit(true);
                                        }}
                                    />
                                    <Button title="Save" onPress={() => savePickDateEdit()} />
                                </View>
                            </View>
                        </View>
                    </Modal>
                ) : (
                    <DateTimePickerComponent
                        visible={pickDateModalEditVisible}
                        date={tempDateEdit}
                        mode="date"
                        onConfirm={(datetime) => {
                            onPickDateChangeEdit(datetime);
                            setPickDateModalEditVisible(false);
                        }}
                        onCancel={() => {
                            setPickDateModalEditVisible(false);
                        }}
                    />
                )}

                {/* PICK START TIME (EDIT) */}
                {isIOS ? (
                    <Modal visible={pickStartModalEditVisible} transparent animationType="fade">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>Pick Start Time (Edit)</Text>
                                <DateTimePicker
                                    value={tempStartEdit ? new Date(`1970-01-01T${tempStartEdit}:00`) : new Date()}
                                    mode="time"
                                    display="spinner"
                                    onChange={(ev, sel) => {
                                        if (!sel) return;
                                        const hhmm = sel.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false,
                                        });
                                        setTempStartEdit(hhmm);
                                    }}
                                    textColor="black"
                                />
                                <View style={styles.modalEventButtons}>
                                    <Button
                                        title="Cancel"
                                        onPress={() => {
                                            setPickStartModalEditVisible(false);
                                            setAddDayModalVisibleEdit(true);
                                        }}
                                    />
                                    <Button
                                        title="Save"
                                        onPress={() => {
                                            setTempStartEdit(tempStartEdit);
                                            setPickStartModalEditVisible(false);
                                            setAddDayModalVisibleEdit(true);
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    </Modal>
                ) : (
                    <DateTimePickerComponent
                        visible={pickStartModalEditVisible}
                        date={tempStartEdit ? new Date(`1970-01-01T${tempStartEdit}:00`) : new Date()}
                        mode="time"
                        onConfirm={(datetime) => {
                            const hhmm = datetime.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                            });
                            setTempStartEdit(hhmm);
                            setPickStartModalEditVisible(false);
                        }}
                        onCancel={() => {
                            setPickStartModalEditVisible(false);
                        }}
                    />
                )}

                {/* PICK END TIME (EDIT) */}
                {isIOS ? (
                    <Modal visible={pickEndModalEditVisible} transparent animationType="fade">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>Pick End Time (Edit)</Text>
                                <DateTimePicker
                                    value={tempEndEdit ? new Date(`1970-01-01T${tempEndEdit}:00`) : new Date()}
                                    mode="time"
                                    display="spinner"
                                    onChange={(ev, sel) => {
                                        if (!sel) return;
                                        const hhmm = sel.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false,
                                        });
                                        setTempEndEdit(hhmm);
                                    }}
                                    textColor="black"
                                />
                                <View style={styles.modalEventButtons}>
                                    <Button
                                        title="Cancel"
                                        onPress={() => {
                                            setPickEndModalEditVisible(false);
                                            setAddDayModalVisibleEdit(true);
                                        }}
                                    />
                                    <Button
                                        title="Save"
                                        onPress={() => {
                                            setTempEndEdit(tempEndEdit);
                                            setPickEndModalEditVisible(false);
                                            setAddDayModalVisibleEdit(true);
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    </Modal>
                ) : (
                    <DateTimePickerComponent
                        visible={pickEndModalEditVisible}
                        date={tempEndEdit ? new Date(`1970-01-01T${tempEndEdit}:00`) : new Date()}
                        mode="time"
                        onConfirm={(datetime) => {
                            const hhmm = datetime.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                            });
                            setTempEndEdit(hhmm);
                            setPickEndModalEditVisible(false);
                        }}
                        onCancel={() => {
                            setPickEndModalEditVisible(false);
                        }}
                    />
                )}

                {/* VOTING date/time PICKER EDIT */}
                {isIOS ? (
                    <Modal visible={votingPickerEditVisible} transparent animationType="fade">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>Pick Voting Deadline (Edit)</Text>
                                <DateTimePicker
                                    value={editEndVoting}
                                    mode="datetime"
                                    display="spinner"
                                    onChange={(ev, sel) => onVotingDateChangeEdit(sel)}
                                    textColor="black"
                                />
                                <View style={styles.modalEventButtons}>
                                    <Button title="Cancel" onPress={() => cancelVotingDateEdit()} />
                                    <Button title="Save" onPress={() => saveVotingDateEdit()} />
                                </View>
                            </View>
                        </View>
                    </Modal>
                ) : (
                    <DateTimePickerComponent
                        visible={votingPickerEditVisible}
                        date={editEndVoting}
                        mode="datetime"
                        onConfirm={(datetime) => {
                            onVotingDateChangeEdit(datetime);
                            setVotingPickerEditVisible(false);
                        }}
                        onCancel={() => {
                            setVotingPickerEditVisible(false);
                        }}
                    />
                )}
            </View>
        </TouchableWithoutFeedback>
    );
};