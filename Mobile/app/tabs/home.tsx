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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import axios, { AxiosInstance } from 'axios';

/* IMPORT STYLES */

import styles from '../styles/HomePageStyles';
import { EventService } from '../services/EventService';
import { apiService } from '../services/ApiService';


/* ----------------------------------------
   Mock user, friend list, and data models
---------------------------------------- */
interface User {
    id: string;
    username: string;
    email: string;
}

interface Participant {
    id: string;
    username: string;
    email: string;
    status: 'pending' | 'accepted' | 'declined';
}

/**
 * "EventData" used for both create and edit flows.
 * We store an array of dayTimes, each item = SingleDay
 */
interface EventData {
    id_event: string;
    id_user: string;

    name: string;
    description: string;
    location: string;
    date_options: DateOption[];
    tag_ids: number[];
    sysrowstate: number;

    date_created: Date;
    date_updated: Date;

    chosen_date_start: Date,
    chosen_date_end: Date,
    end_voting_date: Date;

    participants: Participant[];
}

interface DateOption{
    id_date_option: string;
    id_event: string;
    dateStart: Date;
    dateEnd: Date;
}

/* Mock "current" user */
const mockCurrentUser: User = {
    id: '6',
    username: 'MyUser',
    email: 'myuser@domain.com',
};

/* Mock friend list */
const mockFriends: User[] = [
    { id: '7', username: 'Alice', email: 'alice@example.com' },
    { id: '8', username: 'Bob', email: 'bob@example.com' },
    { id: '9', username: 'Charlie', email: 'charlie@example.com' },
];

/* Some initial events 
const initialEvents: EventData[] = [
    {
        id: 'evt-1',
        createdBy: mockCurrentUser.id,
        title: 'My Birthday Party',
        description: 'Pizza and cake!',
        location: 'My House',
        dayTimes: [
            {
                date: new Date(2024, 0, 15),
                start: '08:00',
                end: '11:00',
            },
        ],
        participants: [
            { username: 'MyUser', email: 'myuser@domain.com', status: 'pending' },
            { username: 'Alice', email: 'alice@example.com', status: 'pending' },
            { username: 'Bob', email: 'bob@example.com', status: 'accepted' },
        ],
        endVoting: new Date(Date.now() + 1000 * 60 * 60 * 24),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'evt-2',
        createdBy: 'u-004', // belongs to Charlie
        title: 'Yoga Retreat',
        description: 'Relaxing yoga for all levels',
        location: 'Health & Wellness Center',
        dayTimes: [
            {
                date: new Date(2024, 1, 5),
                start: '09:00',
                end: '12:00',
            },
        ],
        participants: [
            { username: 'MyUser', email: 'myuser@domain.com', status: 'pending' },
            { username: 'Charlie', email: 'charlie@example.com', status: 'pending' },
        ],
        endVoting: new Date(Date.now() - 1000 * 60 * 60 * 2), // ended 2 hours ago
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 48),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'evt-3',
        createdBy: 'u-004', // belongs to Charlie
        title: 'Test event',
        description: 'Testing the events',
        location: 'Home alone',
        dayTimes: [
            {
                date: new Date(2024, 1, 5),
                start: '09:00',
                end: '13:00',
            },
            {
                date: new Date(2024, 1, 6),
                start: '15:00',
                end: '20:00',
            }
        ],
        participants: [
            { username: 'MyUser', email: 'myuser@domain.com', status: 'pending' },
            { username: 'Charlie', email: 'charlie@example.com', status: 'pending' },
            { username: 'Bob1', email: 'bob@gmail.com', status: 'declined' },
            { username: 'Bob2', email: 'bob@gmail.com', status: 'accepted' },
            { username: 'Bob3', email: 'bob@gmail.com', status: 'accepted' },
            { username: 'Bob4', email: 'bob@gmail.com', status: 'accepted' },
            { username: 'Bob5', email: 'bob@gmail.com', status: 'accepted' },
            { username: 'Bob6', email: 'bob@gmail.com', status: 'accepted' },
            { username: 'Bob7', email: 'bob@gmail.com', status: 'accepted' },
            { username: 'Bob8', email: 'bob@gmail.com', status: 'accepted' },
            { username: 'Bob9', email: 'bob@gmail.com', status: 'accepted' },
            { username: 'Bob10', email: 'bob@gmail.com', status: 'accepted' },
        ],
        endVoting: new Date(Date.now() + 1000 * 60 * 60 * 2),
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 48),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'evt-4',
        createdBy: 'u-003', // belongs to Bob
        title: 'Beach Day',
        description: 'Fun in the sun!',
        location: 'Sunny Beach',
        dayTimes: [
            {
                date: new Date(2024, 1, 5),
                start: '09:00 AM',
                end: '12:00 PM',
            },
        ],
        participants: [
            { username: 'MyUser', email: 'myuser@domain.com', status: 'pending' },
            { username: 'Bob', email: 'bob@gmail.com', status: 'accepted' },
        ],
        endVoting: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        eventDate: new Date(Date.now() - 1000 * 60 * 60 * 48),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'evt-5',
        createdBy: 'u-002', // belongs to Alice
        title: 'Neki Day',
        description: 'Fun',
        location: 'House apartment',
        dayTimes: [
            {
                date: new Date(2024, 1, 5),
                start: '09:00',
                end: '12:00',
            },
        ],
        participants: [
            { username: 'MyUser', email: 'myuser@domain.com', status: 'pending' },
            { username: 'Bob', email: 'bob@gmail.com', status: 'accepted' },
        ],
        endVoting: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        eventDate: new Date(Date.now() - 500 * 60),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];*/

const Event_service = new EventService(apiService.getApi());
const initialEvents: EventData[] = [];

async function getdata() {
    try {
        const realEventData = await Event_service.getEvents();
        //console.log("realEventData");
        //console.log(realEventData);

        realEventData.forEach((event_data: EventData) => {
            event_data.end_voting_date = new Date(event_data.end_voting_date);
            event_data.chosen_date_start = new Date(event_data.chosen_date_start);
            event_data.chosen_date_end = new Date(event_data.chosen_date_end);

            event_data.date_created = new Date(event_data.date_created);
            event_data.date_updated = new Date(event_data.date_updated);

            event_data.participants = [];

            console.log(event_data.id_user);

            initialEvents.push(event_data);
        });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios Error:", error.message);
            console.error("Config:", error.config);
            console.error("Request:", error.request);
        } else {
            console.error("Error:", error);
        }
    }
}
getdata();

/* Returns 'voting' if now < endVoting, 'finished' if voting has ended but the event hasn't occurred yet, 
   and 'done' if the picked date is in the past. */
function getEventStatus(e: EventData): 'voting' | 'upcoming' | 'completed' | 'in progress' {
    console.log(e.end_voting_date);
    const now = Date.now();

    if (e.end_voting_date && e.end_voting_date.getDate() > now) {
        return 'voting';
    }

    if (e.chosen_date_start) {
        const eventStart = e.chosen_date_start.getDate();
        const eventEnd = e.chosen_date_end.getDate();

        if (now >= eventStart && now <= eventEnd) {
            return 'in progress';
        }

        if (now > eventEnd) {
            return 'completed';
        }
    }

    return 'upcoming';
}



function formatDate(date: Date) {
    return date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23', // Use 24-hour format
    });
}


/** Returns string like "Monday, 15.01.2024" */
function formatDay(date: Date) {
    const weekdayNames = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday'
    ];
    const dayName = weekdayNames[date.getDay()]; // 0=Sunday
    // Format date as DD.MM.YYYY
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dayName}, ${dd}.${mm}.${yyyy}`;
}

export default function HomeScreen() {
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [events, setEvents] = useState<EventData[]>(initialEvents);

    // iOS keyboard offset
    const keyboardOffset = Platform.OS === 'ios' ? 'padding' : undefined;

    // Simulate fetch user
    useEffect(() => {
        setTimeout(() => {
            setCurrentUser(mockCurrentUser);
            setLoading(false);
        }, 800);
    }, []);

    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
    useEffect(() => {
        if (!selectedEvent) return;

        // If we already have availability for this event, don't overwrite
        // Or if you want to detect event ID changes:
        // if (availability.__eventId === selectedEvent.id) return;

        if (selectedEvent.date_options.length > 0) {
            const mergedAvailability: { [key: string]: any } = {};

            selectedEvent.date_options.forEach((date_option) => {
                const dayKey = date_option.dateStart.toISOString();

                // If we already have availability for dayKey, preserve it
                if (availability[dayKey]) {
                    mergedAvailability[dayKey] = {
                        ...availability[dayKey],
                    };
                } else {
                    // Otherwise, initialize
                    const startTime = new Date(date_option.dateStart);
                    startTime.setHours(date_option.dateStart.getHours(), date_option.dateStart.getMinutes(), 0, 0);

                    const endTime = new Date(date_option.dateEnd);
                    endTime.setHours(date_option.dateEnd.getHours(), date_option.dateEnd.getMinutes(), 0, 0);

                    mergedAvailability[dayKey] = {
                        startTime,
                        endTime,
                        selectedTimes: [],
                        // isAvailable is left undefined initially
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
    const [createDays, setCreateDays] = useState<DateOption[]>([]);

    // AddDay Modal
    const [addDayModalVisible, setAddDayModalVisible] = useState(false);
    const [tempDayIndex, setTempDayIndex] = useState<number | null>(null);
    const [tempDate, setTempDate] = useState(new Date());
    const [tempStart, setTempStart] = useState(new Date()); // Default start time in 24-hour format
    const [tempEnd, setTempEnd] = useState(new Date()); // Default end time in 24-hour format


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

    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editLoc, setEditLoc] = useState('');
    const [editDays, setEditDays] = useState<DateOption[]>([]);
    const [editInvitees, setEditInvitees] = useState<Participant[]>([]);
    const [editTypedInvite, setEditTypedInvite] = useState('');
    const [editEndVoting, setEditEndVoting] = useState<Date>(new Date());
    const [editEvent, setEditEvent] = useState<EventData | null>(null);

    const [addDayModalVisibleEdit, setAddDayModalVisibleEdit] = useState(false);
    const [tempDayIndexEdit, setTempDayIndexEdit] = useState<number | null>(null);
    const [tempStartEdit, setTempStartEdit] = useState(new Date());
    const [tempEndEdit, setTempEndEdit] = useState(new Date());


    // Additional modals for date/time picking (edit)
    const [pickDateModalEditVisible, setPickDateModalEditVisible] = useState(false);
    const [pickStartModalEditVisible, setPickStartModalEditVisible] = useState(false);
    const [pickEndModalEditVisible, setPickEndModalEditVisible] = useState(false);

    const [votingPickerEditVisible, setVotingPickerEditVisible] = useState(false);

    // =============== VIEW / VOTE ===============
    const [voteModalVisible, setVoteModalVisible] = useState(false);
    const [showVotingPicker, setShowVotingPicker] = useState(false);

    const [showParticipantsModal, setShowParticipantsModal] = useState(false);

    /* ------------------------------------------
       Create Flow
    ------------------------------------------*/
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

    // Get corresponding icon for status
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

    // Get corresponding status style
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
        const newEvt = {
            id_user: currentUser?.id || 'unknown',
            name: createTitle,
            description: createDesc,
            location: createLoc,
            date_options: createDays.map(d => ({ dateStart: d.dateStart.toISOString(), dateEnd: d.dateEnd.toISOString() })),
            end_voting_date: endVotingDate.toISOString(),
            date_created: new Date().toISOString(),
            date_updated: new Date().toISOString(),
            participant_ids: invitees.map(p => p.id),
            tag_ids:[]
        };
        
        console.log(newEvt);
        let response = await Event_service.createEvent(newEvt);

        if (response.success) {
            
        }

        console.log(response);
        closeCreateEvent();
    }

    /* Step2 -> dayTimes => addDayModalCreate */
    function openAddDayModalCreate(index?: number) {
        if (typeof index === 'number') {
            // Editing an existing day
            const existing = createDays[index];
            setTempDayIndex(index);
            setTempStart(existing.dateStart); // Assuming `start` is already in the desired format
            setTempEnd(existing.dateEnd);     // Assuming `end` is already in the desired format
        } else {
            // Adding a new day
            setTempDayIndex(null);
            setTempDate(new Date());
            setTempStart(new Date()); // Default start time in 24-hour format
            setTempEnd(new Date());   // Default end time in 24-hour format
        }

        // Show the Add Day modal and hide the Create Event modal
        setAddDayModalVisible(true);
        setCreateModalVisible(false);
    }

    function closeAddDayModalCreate() {
        setAddDayModalVisible(false);
        setCreateModalVisible(true);
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
            const updatedParticipants = prevEvent.participants.map((p) => {
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
                        participants: evt.participants.map((p) =>
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

    function handleSaveDayCreate() {
        if (tempDayIndex !== null) {
            // edit
            const copy = [...createDays];
            //copy[tempDayIndex] = { dateStart: tempStart, dateEnd: tempEnd };
            setCreateDays(copy);
        } else {
            // new
            setCreateDays(prev => [...prev, { dateStart: tempStart, dateEnd: tempEnd, id_date_option: '', id_event: '' }]);
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
    function openPickDate() {
        // close Day modal, open date modal
        setAddDayModalVisible(false);
        setPickDateModalVisible(true);
    }
    function closePickDate() {
        setPickDateModalVisible(false);
        setAddDayModalVisible(true);
    }
    function onPickDateChange(_ev: DateTimePickerEvent, sel?: Date) {
        if (sel) setTempDate(sel);
    }
    function savePickDate() {
        setPickDateModalVisible(false);
        setAddDayModalVisible(true);
    }

    function openPickStartTime() {
        setAddDayModalVisible(false);
        setPickStartModalVisible(true);
    }
    function openPickEndTime() {
        setAddDayModalVisible(false);
        setPickEndModalVisible(true);
    }

    /* Step3 create -> invites */
    function addFriendInvite(friend: User) {
        if (!invitees.find(i => i.email === friend.email)) {
            setInvitees([...invitees, { id: friend.id, username: friend.username, email: friend.email, status: 'pending' }]);
        }
    }
    function addTypedInvite() {
        if (!typedInvite.trim()) return;
        if (!invitees.find(i => i.email === typedInvite)) {
            const newPart: Participant = {
                id: Math.random().toString(),
                username: typedInvite.split('@')[0],
                email: typedInvite,
                status: 'pending',
            };
            setInvitees([...invitees, newPart]);
        }
        setTypedInvite('');
    }
    // Function to remove an invitee
    function removeInvite(email: string) {
        setInvitees(prev => prev.filter(i => i.email !== email));
    }

    /* Step4 create -> Voting */
    function openVotingDatePickerCreate() {
        setVotingPickerVisible(true);
        setCreateModalVisible(false);
    }
    function cancelVotingDate() {
        setVotingPickerVisible(false);
        setCreateModalVisible(true);
    }
    function saveVotingDate() {
        setVotingPickerVisible(false);
        setCreateModalVisible(true);
    }
    function onVotingDateChange(_ev: DateTimePickerEvent, sel?: Date) {
        if (sel) setEndVotingDate(sel);
    }

    const formatVotingDate = (date: Date) => {
        return date.toLocaleString([], {
            month: 'short',        // e.g., "Jan"
            day: 'numeric',        // e.g., "25"
            year: 'numeric',       // e.g., "2024"
            hour: '2-digit',       // e.g., "14"
            minute: '2-digit',     // e.g., "30"
            hour12: false,         // Ensures 24-hour time format
        });
    };


    // Function to handle date changes from the picker
    const handleVotingDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowVotingPicker(false);
        if (selectedDate) {
            setEndVotingDate(selectedDate);
        }
    };

    const [isOtherEventsModalVisible, setIsOtherEventsModalVisible] = useState<boolean>(false);

    const [isVotingModalVisible, setIsVotingModalVisible] = useState(false);
    const [availability, setAvailability] = useState<{
        [key: string]: {
            startTime: Date;
            endTime: Date;
            selectedTimes: Date[];
            isAvailable?: boolean; // Add this optional property
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
    function finalizeEditEvent() {
        if (!editEvent) return;
        if (!editTitle.trim()) {
            Alert.alert('Missing Title', 'Provide a title.');
            return;
        }
        /*const updated: EventData = {
            ...editEvent,
            name: editTitle,
            description: editDesc,
            location: editLoc,
            date_options: editDays,
            participants: editInvitees,
            endVoting: editEndVoting,
            updatedAt: new Date(),
        };
        setEvents(prev => prev.map(evt => evt.id === updated.id ? updated : evt));*/
        closeEditEvent();
    }

    /* Step2 (edit) => addDayModalEdit */
    function openAddDayModalEdit(index?: number) {
        if (typeof index === 'number' && editDays[index]) {
            // Editing an existing day
            setTempDayIndexEdit(index);
            const existing = editDays[index];
            setTempStartEdit(existing.dateStart || new Date());
            setTempEndEdit(existing.dateEnd || new Date());
        } else {
            // Adding a new day
            setTempDayIndexEdit(null);
            setTempStartEdit(new Date()); // Default start time in 24-hour format
            setTempEndEdit(new Date()); // Default end time in 24-hour format
        }
        setAddDayModalVisibleEdit(true);
        setEditModalVisible(false);
    }

    function closeAddDayModalEdit() {
        setAddDayModalVisibleEdit(false);
        setEditModalVisible(true);
    }
    function handleSaveDayEdit() {
        if (tempDayIndexEdit !== null) {
            const copy = [...editDays];
            copy[tempDayIndexEdit] = {
                dateStart: new Date(tempStartEdit.getTime()), // Create a new Date object with the same time as tempDateEdit,
                dateEnd: new Date(tempEndEdit.getTime()),
                id_date_option: copy[tempDayIndexEdit].id_date_option,
                id_event: copy[tempDayIndexEdit].id_event
            };
            setEditDays(copy);
        } else {
            setEditDays(prev => [...prev, { dateStart: new Date(tempStartEdit.getTime()), dateEnd: new Date(tempEndEdit.getTime()), id_date_option: '', id_event: '' }]);
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

    /* Step2 pick date/time for edit */
    function onPickDateChangeEdit(_ev: DateTimePickerEvent, sel?: Date) {
        if (sel) setTempStartEdit(sel);
    }
    function savePickDateEdit() {
        setPickDateModalEditVisible(false);
        setAddDayModalVisibleEdit(true);
    }

    /* Step3 (edit): invites */
    function addFriendInviteEdit(friend: User) {
        if (!editInvitees.find(i => i.email === friend.email)) {
            setEditInvitees([...editInvitees, { id: friend.id, username: friend.username, email: friend.email, status: 'pending' }]);
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
            };
            setEditInvitees([...editInvitees, newPart]);
        }
        setEditTypedInvite('');
    }
    function removeInviteEdit(email: string) {
        setEditInvitees(prev => prev.filter(i => i.email !== email));
    }

    /* Step4 (edit) => voting date */
    function openVotingDatePickerEdit() {
        setVotingPickerEditVisible(true);
        setEditModalVisible(false);
    }
    function cancelVotingDateEdit() {
        setVotingPickerEditVisible(false);
        setEditModalVisible(true);
    }
    function saveVotingDateEdit() {
        setVotingPickerEditVisible(false);
        setEditModalVisible(true);
    }
    function onVotingDateChangeEdit(_ev: DateTimePickerEvent, sel?: Date) {
        if (sel) setEditEndVoting(sel);
    }

    /* =============== VIEW / VOTE =============== */
    function openView(event: EventData) {
        setSelectedEvent(event); // Set the selected event
        setIsOtherEventsModalVisible(true); // Show the modal
    }

    function closeView() {
        setIsOtherEventsModalVisible(false); // Hide the modal
        setSelectedEvent(null); // Clear the selected event
    }

    /* Partition MY vs. OTHERS */
    const myEvents = events.filter(e => e.id_user == currentUser?.id);
    const otherEvents = events.filter(e => e.id_user != currentUser?.id);

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
                                {myEvents.map(evt => (
                                    <TouchableOpacity
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
                                                getStatusStyle(getEventStatus(evt))
                                            ]}>
                                                <MaterialIcons
                                                    name={getStatusIcon(getEventStatus(evt))}
                                                    size={16}
                                                    color="#fff"
                                                    style={{ marginRight: 4 }}
                                                />
                                                <Text style={styles.statusText}>
                                                    {getEventStatus(evt).toUpperCase()}
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
                                                {evt.participants.length} Participants
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
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
                                    const userParticipant = evt.participants.find(p => p.email === currentUser?.email);
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
                                                    {evt.participants.length} Participants
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

                    {/* Other Event Details Modal */}
                    <Modal
                        visible={isOtherEventsModalVisible}
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
                                                const isCreator = selectedEvent.id_user === currentUser?.id;

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
                                                                        {mockFriends.find(friend => friend.id === selectedEvent.id_user)
                                                                            ? `${mockFriends.find(friend => friend.id === selectedEvent.id_user)?.username} (${mockFriends.find(friend => friend.id === selectedEvent.id_user)?.email})`
                                                                            : 'Unknown'}
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
                                                                        {selectedEvent.participants.length} total
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
                                                                            setIsOtherEventsModalVisible(false);
                                                                            setIsVotingModalVisible(true);
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
                                                                        // Close the details modal
                                                                        setIsOtherEventsModalVisible(false);
                                                                        // Now open your existing edit flow
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
                                                        </View>

                                                        {/* Participants Modal */}
                                                        <Modal
                                                            visible={showParticipantsModal}
                                                            animationType="slide"
                                                            transparent={true}
                                                            onRequestClose={() => setShowParticipantsModal(false)}
                                                        >
                                                            {/* Tapping outside closes the modal */}
                                                            <View style={styles.modalOverlay}>
                                                                {/* Modal Card */}
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

                                                                    {/* Summary: Accepted / Declined / Pending */}
                                                                    {(() => {
                                                                        const participants = selectedEvent?.participants ?? [];
                                                                        const acceptedCount = participants.filter(
                                                                            (p) => p.status.toLowerCase() === 'accepted'
                                                                        ).length;
                                                                        const declinedCount = participants.filter(
                                                                            (p) => p.status.toLowerCase() === 'declined'
                                                                        ).length;
                                                                        const pendingCount = participants.filter(
                                                                            (p) => p.status.toLowerCase() === 'pending'
                                                                        ).length;

                                                                        return (
                                                                            <View style={styles.summaryRow}>
                                                                                <Text style={styles.summaryText}>
                                                                                    Accepted: {acceptedCount} | Declined: {declinedCount} | Pending: {pendingCount}
                                                                                </Text>
                                                                            </View>
                                                                        );
                                                                    })()}

                                                                    {/* Scrollable List of Participants */}
                                                                    <ScrollView
                                                                        style={styles.participantsScroll}
                                                                        contentContainerStyle={{ paddingBottom: 20 }}
                                                                        nestedScrollEnabled={true}
                                                                    >
                                                                        {(() => {
                                                                            const participants = selectedEvent?.participants ?? [];
                                                                            // accepted -> 0, declined -> 1, pending -> 2
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

                                                                            return sortedParticipants.map((p, index) => (
                                                                                <View key={index} style={styles.participantRow}>
                                                                                    {/* Person Icon */}
                                                                                    <MaterialIcons
                                                                                        name="person"
                                                                                        size={20}
                                                                                        color="#4CAF50"
                                                                                        style={{ marginRight: 8 }}
                                                                                    />
                                                                                    {/* Username & Email */}
                                                                                    <View style={{ flex: 1 }}>
                                                                                        <Text style={styles.participantName}>{p.username}</Text>
                                                                                        <Text style={styles.participantEmail}>{p.email}</Text>
                                                                                    </View>
                                                                                    {/* Status Icon & Text */}
                                                                                    <View style={styles.statusContainer}>
                                                                                        {p.status.toLowerCase() === 'accepted' ? (
                                                                                            <MaterialIcons
                                                                                                name="check-circle"
                                                                                                size={20}
                                                                                                color="green"
                                                                                                style={{ marginRight: 4 }}
                                                                                            />
                                                                                        ) : p.status.toLowerCase() === 'declined' ? (
                                                                                            <MaterialIcons
                                                                                                name="cancel"
                                                                                                size={20}
                                                                                                color="red"
                                                                                                style={{ marginRight: 4 }}
                                                                                            />
                                                                                        ) : (
                                                                                            <MaterialIcons
                                                                                                name="help-outline"
                                                                                                size={20}
                                                                                                color="orange"
                                                                                                style={{ marginRight: 4 }}
                                                                                            />
                                                                                        )}
                                                                                        <Text style={styles.participantStatus}>
                                                                                            {p.status.toUpperCase()}
                                                                                        </Text>
                                                                                    </View>
                                                                                </View>
                                                                            ));
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
                                                onPress={() => { setIsVotingModalVisible(false); setIsOtherEventsModalVisible(true); }}
                                                accessibilityLabel="Close Voting Modal"
                                            >
                                                <MaterialIcons name="close" size={24} color="#333" />
                                            </TouchableOpacity>
                                        </View>

                                        <ScrollView contentContainerStyle={styles.votingModalContent}>


                                            {/* Availability Selection for Each Day */}
                                            {selectedEvent && selectedEvent.date_options.map((dayTime, index) => {
                                                const dayKey = dayTime.dateStart.toISOString();
                                                const isAvailable = availability[dayKey]?.isAvailable; // to check if user has already chosen

                                                return (
                                                    <View key={index} style={styles.dayContainer}>
                                                        <View style={styles.dayHeader}>
                                                            <Text style={styles.dayTitle}>
                                                                {dayTime.dateStart.toLocaleDateString('en-US', { weekday: 'long' })},{' '}
                                                                {dayTime.dateStart.toLocaleDateString()}
                                                            </Text>
                                                            <View style={styles.availableContainer}>
                                                                <MaterialIcons name="schedule" size={20} color="#4CAF50" />
                                                                <Text style={styles.availableText}>
                                                                    {dayTime.dateStart.getDate()} - {dayTime.dateEnd.getDate()}
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
                                                title="Back"
                                                onPress={() => { setIsVotingModalVisible(false); setIsOtherEventsModalVisible(true); }}
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
                                                                {formatDay(d.dateStart)} | {d.dateStart.getDate()} - {d.dateEnd.getDate()}
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
                                            {mockFriends.map((f) => (
                                                <TouchableOpacity
                                                    key={f.id}
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


                                {/* Step4 Voting End */}
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
                                                End Voting: {formatVotingDate(endVotingDate)}
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
                                            <TouchableOpacity style={styles.pickerButton} onPress={openPickDate}>
                                                <MaterialIcons name="calendar-today" size={20} color="#fff" />
                                                <Text style={styles.pickerButtonText}>Pick Date</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Start Time Selection */}
                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.label}>Start Time</Text>
                                        <View style={styles.valueButtonRow}>
                                            <Text style={styles.valueText}>{tempStart.toDateString()}</Text>
                                            <TouchableOpacity style={styles.pickerButton} onPress={openPickStartTime}>
                                                <MaterialIcons name="access-time" size={20} color="#fff" />
                                                <Text style={styles.pickerButtonText}>Pick Start</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* End Time Selection */}
                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.label}>End Time</Text>
                                        <View style={styles.valueButtonRow}>
                                            <Text style={styles.valueText}>{tempEnd.toDateString()}</Text>
                                            <TouchableOpacity style={styles.pickerButton} onPress={openPickEndTime}>
                                                <MaterialIcons name="access-time" size={20} color="#fff" />
                                                <Text style={styles.pickerButtonText}>Pick End</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                {/* Actions */}
                                <View style={styles.modalEventButtons}>
                                    <TouchableOpacity style={styles.cancelButton} onPress={closeAddDayModalCreate}>
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    {tempDayIndex !== null && (
                                        <TouchableOpacity
                                            style={styles.removeButton}
                                            onPress={() => {
                                                removeDayCreate(tempDayIndex);
                                                closeAddDayModalCreate();
                                            }}
                                        >
                                            <Text style={styles.removeButtonText}>Remove</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveDayCreate}>
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
                            <DateTimePicker
                                value={tempDate}
                                mode="date"
                                display="spinner"
                                onChange={(ev, sel) => onPickDateChange(ev, sel)}
                                textColor="black" // Set text color to ensure visibility
                            />
                            <View style={styles.modalEventButtons}>
                                <Button title="Cancel" onPress={closePickDate} />
                                <Button title="Save" onPress={savePickDate} />
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* PICK START TIME (CREATE) */}
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
                                        hour12: false, // Set to false for 24-hour format
                                    });
                                    setTempStart(sel); // Update temporary state with selected time
                                }}
                                textColor="black" // Set text color to ensure visibility
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


                {/* PICK END TIME (CREATE) */}
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
                                    setTempEnd(sel); // Update temporary state with selected time
                                }}
                                textColor="black" // Set text color to ensure visibility
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


                {/* VOTING PICKER CREATE */}
                <Modal visible={votingPickerVisible} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Pick Voting Deadline</Text>
                            <DateTimePicker
                                value={endVotingDate}
                                mode="datetime"
                                display="spinner"
                                onChange={onVotingDateChange}
                                textColor="black" // Set text color to ensure visibility
                            />
                            <View style={styles.modalEventButtons}>
                                <Button title="Cancel" onPress={cancelVotingDate} />
                                <Button title="Save" onPress={saveVotingDate} />
                            </View>
                        </View>
                    </View>
                </Modal>

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
                                                                {formatDay(d.dateStart)} | {d.dateStart.getDate()} - {d.dateEnd.getDate()}
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
                                                {mockFriends.map((f) => (
                                                    <TouchableOpacity
                                                        key={f.id}
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
                                                    onPress={addTypedInviteEdit}
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
                                                onPress={openVotingDatePickerEdit}
                                                accessible={true}
                                                accessibilityLabel="Select Voting Deadline"
                                            >
                                                <MaterialIcons name="calendar-today" size={24} color="#4CAF50" />
                                                <Text style={styles.votingButtonText}>
                                                    End Voting: {formatVotingDate(editEndVoting)}
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
                                    <Button title={editStep === 1 ? 'Cancel' : 'Back'} onPress={handlePrevStepEdit} />
                                    <Button title={editStep < 4 ? 'Next' : 'Save'} onPress={handleNextStepEdit} />
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
                                        {tempDayIndex !== null ? 'Edit Day' : 'Add Day'}
                                    </Text>
                                    <TouchableOpacity onPress={closeAddDayModalEdit}>
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
                                            <TouchableOpacity style={styles.pickerButton} onPress={openPickDate}>
                                                <MaterialIcons name="calendar-today" size={20} color="#fff" />
                                                <Text style={styles.pickerButtonText}>Pick Date</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Start Time Selection */}
                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.label}>Start Time</Text>
                                        <View style={styles.valueButtonRow}>
                                            <Text style={styles.valueText}>{tempStart.toDateString()}</Text>
                                            <TouchableOpacity style={styles.pickerButton} onPress={openPickStartTime}>
                                                <MaterialIcons name="access-time" size={20} color="#fff" />
                                                <Text style={styles.pickerButtonText}>Pick Start</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* End Time Selection */}
                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.label}>End Time</Text>
                                        <View style={styles.valueButtonRow}>
                                            <Text style={styles.valueText}>{tempEnd.toDateString()}</Text>
                                            <TouchableOpacity style={styles.pickerButton} onPress={openPickEndTime}>
                                                <MaterialIcons name="access-time" size={20} color="#fff" />
                                                <Text style={styles.pickerButtonText}>Pick End</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                {/* Actions */}
                                <View style={styles.modalEventButtons}>
                                    <TouchableOpacity style={styles.cancelButton} onPress={closeAddDayModalEdit}>
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    {tempDayIndex !== null && (
                                        <TouchableOpacity
                                            style={styles.removeButton}
                                            onPress={() => {
                                                removeDayEdit(tempDayIndex);
                                                closeAddDayModalEdit();
                                            }}
                                        >
                                            <Text style={styles.removeButtonText}>Remove</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveDayEdit}>
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                {/* PICK DATE (EDIT) */}
                <Modal visible={pickDateModalEditVisible} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Pick Date (Edit)</Text>
                            <DateTimePicker
                                value={tempStartEdit}
                                mode="date"
                                display="spinner"
                                onChange={(ev, sel) => onPickDateChangeEdit(ev, sel)}
                                textColor="black" // Set text color to ensure visibility
                            />
                            <View style={styles.modalEventButtons}>
                                <Button
                                    title="Cancel"
                                    onPress={() => {
                                        setPickDateModalEditVisible(false);
                                        setAddDayModalVisibleEdit(true);
                                    }}
                                />
                                <Button
                                    title="Save"
                                    onPress={savePickDateEdit}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* PICK START TIME (EDIT) */}
                <Modal visible={pickStartModalEditVisible} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Pick Start Time (Edit)</Text>
                            <DateTimePicker
                                value={tempStartEdit ? new Date(`1970-01-01T${tempStartEdit}:00`) : new Date()} // Use tempStartEdit or fallback to current time
                                mode="time"
                                display="spinner"
                                onChange={(ev, sel) => {
                                    if (!sel) return;
                                    
                                    setTempStartEdit(sel); // Update temporary state with selected time
                                }}
                                textColor="black" // Set text color to ensure visibility
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
                                        setTempStartEdit(tempStartEdit); // Save selected time to main state
                                        setPickStartModalEditVisible(false);
                                        setAddDayModalVisibleEdit(true);
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>


                {/* PICK END TIME (EDIT) */}
                <Modal visible={pickEndModalEditVisible} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Pick End Time (Edit)</Text>
                            <DateTimePicker
                                value={tempEndEdit ? new Date(`1970-01-01T${tempEndEdit}:00`) : new Date()} // Use tempEndEdit or fallback to current time
                                mode="time"
                                display="spinner"
                                onChange={(ev, sel) => {
                                    if (!sel) return;

                                    setTempEndEdit(sel); // Update temporary state with selected time
                                }}
                                textColor="black" // Set text color to ensure visibility
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
                                        setTempEndEdit(tempEndEdit); // Save selected time to main state
                                        setPickEndModalEditVisible(false);
                                        setAddDayModalVisibleEdit(true);
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>


                {/* VOTING date/time PICKER EDIT */}
                <Modal visible={votingPickerEditVisible} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Pick Voting Deadline (Edit)</Text>
                            <DateTimePicker
                                value={editEndVoting}
                                mode="datetime"
                                display="spinner"
                                onChange={(ev, sel) => onVotingDateChangeEdit(ev, sel)}
                                textColor="black" // Set text color to ensure visibility
                            />
                            <View style={styles.modalEventButtons}>
                                <Button title="Cancel" onPress={cancelVotingDateEdit} />
                                <Button title="Save" onPress={saveVotingDateEdit} />
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
}