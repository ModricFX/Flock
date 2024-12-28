import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
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

/* ----------------------------------------
   Mock user, friend list, and data models
---------------------------------------- */
interface User {
    id: string;
    username: string;
    email: string;
}

interface Participant {
    username: string;
    email: string;
    status: 'pending' | 'accepted' | 'declined';
}

/** A single day record with date, times, etc. */
interface SingleDay {
    date: Date;       // e.g. 2024-01-15
    start: string;    // e.g. '08:00 AM'
    end: string;      // e.g. '10:00 PM'
}

/**
 * "EventData" used for both create and edit flows.
 * We store an array of dayTimes, each item = SingleDay
 */
interface EventData {
    id: string;
    createdBy: string;
    title: string;
    description: string;
    location: string;

    dayTimes: SingleDay[];       // List of chosen days
    participants: Participant[];
    endVoting: Date;             // People can vote until this date/time
    eventDate?: Date;            // Final chosen date/time (if set)
    createdAt: Date;
    updatedAt: Date;
    votes?: Record<string, any>; // optional
}

/* Mock "current" user */
const mockCurrentUser: User = {
    id: 'u-001',
    username: 'MyUser',
    email: 'myuser@domain.com',
};

/* Mock friend list */
const mockFriends: User[] = [
    { id: 'u-002', username: 'Alice', email: 'alice@example.com' },
    { id: 'u-003', username: 'Bob', email: 'bob@example.com' },
    { id: 'u-004', username: 'Charlie', email: 'charlie@example.com' },
];

/* Some initial events */
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
                start: '08:00 PM',
                end: '11:00 PM',
            },
        ],
        participants: [
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
                start: '09:00 AM',
                end: '12:00 PM',
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
];

/* Returns 'voting' if now < endVoting, otherwise 'finished' */
function getEventStatus(e: EventData): 'voting' | 'finished' {
    return e.endVoting.getTime() > Date.now() ? 'voting' : 'finished';
}

function formatDate(date: Date) {
    return date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
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

    /* =============== CREATE EVENT =============== */
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [createStep, setCreateStep] = useState(1);

    // Step1
    const [createTitle, setCreateTitle] = useState('');
    const [createDesc, setCreateDesc] = useState('');
    const [createLoc, setCreateLoc] = useState('');
    const [createDurationHours, setCreateDurationHours] = useState<string>('1');
    const [createDurationMinutes, setCreateDurationMinutes] = useState<string>('00');

    // Step2
    const [createDuration, setCreateDuration] = useState('');
    const [createDays, setCreateDays] = useState<SingleDay[]>([]);

    // AddDay Modal
    const [addDayModalVisible, setAddDayModalVisible] = useState(false);
    const [tempDayIndex, setTempDayIndex] = useState<number | null>(null);
    const [tempDate, setTempDate] = useState(new Date());
    const [tempStart, setTempStart] = useState('08:00 AM');
    const [tempEnd, setTempEnd] = useState('10:00 PM');

    // Additional modals for date/time picking
    const [pickDateModalVisible, setPickDateModalVisible] = useState(false);
    const [pickStartModalVisible, setPickStartModalVisible] = useState(false);
    const [pickEndModalVisible, setPickEndModalVisible] = useState(false);

    // Step3
    const [invitees, setInvitees] = useState<Participant[]>([]);
    const [typedInvite, setTypedInvite] = useState('');

    // Step4
    const [endVotingDate, setEndVotingDate] = useState<Date>(new Date(Date.now() + 1000 * 60 * 60 * 24 * 7));
    const [votingPickerVisible, setVotingPickerVisible] = useState(false);

    // =============== EDIT EVENT ===============
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editStep, setEditStep] = useState(1);

    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editLoc, setEditLoc] = useState('');
    const [editDuration, setEditDuration] = useState('');
    const [editDays, setEditDays] = useState<SingleDay[]>([]);
    const [editInvitees, setEditInvitees] = useState<Participant[]>([]);
    const [editTypedInvite, setEditTypedInvite] = useState('');
    const [editEndVoting, setEditEndVoting] = useState<Date>(new Date());
    const [editEvent, setEditEvent] = useState<EventData | null>(null);

    const [addDayModalVisibleEdit, setAddDayModalVisibleEdit] = useState(false);
    const [tempDayIndexEdit, setTempDayIndexEdit] = useState<number | null>(null);
    const [tempDateEdit, setTempDateEdit] = useState(new Date());
    const [tempStartEdit, setTempStartEdit] = useState('08:00 AM');
    const [tempEndEdit, setTempEndEdit] = useState('10:00 PM');

    // Additional modals for date/time picking (edit)
    const [pickDateModalEditVisible, setPickDateModalEditVisible] = useState(false);
    const [pickStartModalEditVisible, setPickStartModalEditVisible] = useState(false);
    const [pickEndModalEditVisible, setPickEndModalEditVisible] = useState(false);

    const [votingPickerEditVisible, setVotingPickerEditVisible] = useState(false);

    // =============== VIEW / VOTE ===============
    const [voteModalVisible, setVoteModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
    const [showVotingPicker, setShowVotingPicker] = useState(false);

    /* ------------------------------------------
       Create Flow
    ------------------------------------------*/
    function startCreateEvent() {
        setCreateStep(1);
        setCreateTitle('');
        setCreateDesc('');
        setCreateLoc('');
        setCreateDuration('');
        setCreateDays([]);
        setInvitees([]);
        setTypedInvite('');
        setEndVotingDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 7));
        setCreateModalVisible(true);
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

    function finalizeCreateEvent() {
        if (!createTitle.trim()) {
            Alert.alert('Missing Title', 'Provide a title.');
            return;
        }
        const newEvt: EventData = {
            id: Math.random().toString(),
            createdBy: currentUser?.id || 'unknown',
            title: createTitle,
            description: createDesc,
            location: createLoc,
            dayTimes: createDays,
            participants: invitees,
            endVoting: endVotingDate,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setEvents(prev => [...prev, newEvt]);
        closeCreateEvent();
    }

    /* Step2 -> dayTimes => addDayModalCreate */
    function openAddDayModalCreate(index?: number) {
        if (typeof index === 'number') {
            // editing
            setTempDayIndex(index);
            const existing = createDays[index];
            setTempDate(existing.date);
            setTempStart(existing.start);
            setTempEnd(existing.end);
        } else {
            setTempDayIndex(null);
            setTempDate(new Date());
            setTempStart('08:00 AM');
            setTempEnd('10:00 PM');
        }
        setAddDayModalVisible(true);
        setCreateModalVisible(false);
    }
    function closeAddDayModalCreate() {
        setAddDayModalVisible(false);
        setCreateModalVisible(true);
    }
    function handleSaveDayCreate() {
        if (tempDayIndex !== null) {
            // edit
            const copy = [...createDays];
            copy[tempDayIndex] = { date: tempDate, start: tempStart, end: tempEnd };
            setCreateDays(copy);
        } else {
            // new
            setCreateDays(prev => [...prev, { date: tempDate, start: tempStart, end: tempEnd }]);
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
            setInvitees([...invitees, { username: friend.username, email: friend.email, status: 'pending' }]);
        }
    }
    function addTypedInvite() {
        if (!typedInvite.trim()) return;
        if (!invitees.find(i => i.email === typedInvite)) {
            const newPart: Participant = {
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
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Function to handle date changes from the picker
    const handleVotingDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowVotingPicker(false);
        if (selectedDate) {
            setEndVotingDate(selectedDate);
        }
    };

    /* -----------------------------------------------
       EDIT EVENT
    -----------------------------------------------*/
    function openEdit(e: EventData) {
        setEditEvent(e);
        setEditStep(1);
        setEditTitle(e.title);
        setEditDesc(e.description);
        setEditLoc(e.location);
        setEditDuration('3'); // or empty
        setEditDays(e.dayTimes ? [...e.dayTimes] : []);
        setEditInvitees([...e.participants]);
        setEditEndVoting(e.endVoting);
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
        const updated: EventData = {
            ...editEvent,
            title: editTitle,
            description: editDesc,
            location: editLoc,
            dayTimes: editDays,
            participants: editInvitees,
            endVoting: editEndVoting,
            updatedAt: new Date(),
        };
        setEvents(prev => prev.map(evt => evt.id === updated.id ? updated : evt));
        closeEditEvent();
    }

    /* Step2 (edit) => addDayModalEdit */
    function openAddDayModalEdit(index?: number) {
        if (typeof index === 'number') {
            // editing
            setTempDayIndexEdit(index);
            const existing = editDays[index];
            setTempDateEdit(existing.date);
            setTempStartEdit(existing.start);
            setTempEndEdit(existing.end);
        } else {
            setTempDayIndexEdit(null);
            setTempDateEdit(new Date());
            setTempStartEdit('08:00 AM');
            setTempEndEdit('10:00 PM');
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
                date: tempDateEdit,
                start: tempStartEdit,
                end: tempEndEdit,
            };
            setEditDays(copy);
        } else {
            setEditDays(prev => [...prev, { date: tempDateEdit, start: tempStartEdit, end: tempEndEdit }]);
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
                    setCreateDays(prev => prev.filter((_, idx) => idx !== i));
                }
            }
        ]);
    }

    /* Step2 pick date/time for edit */
    function onPickDateChangeEdit(_ev: DateTimePickerEvent, sel?: Date) {
        if (sel) setTempDateEdit(sel);
    }
    function savePickDateEdit() {
        setPickDateModalEditVisible(false);
        setAddDayModalVisibleEdit(true);
    }

    /* Step3 (edit): invites */
    function addFriendInviteEdit(friend: User) {
        if (!editInvitees.find(i => i.email === friend.email)) {
            setEditInvitees([...editInvitees, { username: friend.username, email: friend.email, status: 'pending' }]);
        }
    }
    function addTypedInviteEdit() {
        if (!editTypedInvite.trim()) return;
        if (!editInvitees.find(i => i.email === editTypedInvite)) {
            const newPart: Participant = {
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
    function openView(e: EventData) {
        setSelectedEvent(e);
        setVoteModalVisible(true);
    }
    function closeView() {
        setVoteModalVisible(false);
        setSelectedEvent(null);
    }
    function handleAccept() {
        if (!selectedEvent || !currentUser) return;
        setEvents(prev =>
            prev.map(ev => {
                if (ev.id === selectedEvent.id) {
                    const updated = { ...ev };
                    updated.participants = updated.participants.map(p =>
                        p.email === currentUser.email ? { ...p, status: 'accepted' } : p
                    );
                    return updated;
                }
                return ev;
            })
        );
        closeView();
    }
    function handleDecline() {
        if (!selectedEvent || !currentUser) return;
        setEvents(prev =>
            prev.map(ev => {
                if (ev.id === selectedEvent.id) {
                    const updated = { ...ev };
                    updated.participants = updated.participants.map(p =>
                        p.email === currentUser.email ? { ...p, status: 'declined' } : p
                    );
                    return updated;
                }
                return ev;
            })
        );
        closeView();
    }

    /* Partition MY vs. OTHERS */
    const myEvents = events.filter(e => e.createdBy === currentUser?.id);
    const otherEvents = events.filter(e => e.createdBy !== currentUser?.id);

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
                    <View style={styles.iconContainer}>
                        <TouchableOpacity onPress={() => Alert.alert('Notifications pressed')}>
                            <MaterialIcons name="notifications" size={30} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginLeft: 20 }} onPress={() => Alert.alert('Profile pressed')}>
                            <MaterialIcons name="account-circle" size={30} color="white" />
                        </TouchableOpacity>
                    </View>
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
                            myEvents.map(evt => (
                                <TouchableOpacity
                                    key={evt.id}
                                    style={styles.eventItem}
                                    onPress={() => openEdit(evt)}
                                >
                                    <Text style={styles.eventTitle}>{evt.title}</Text>
                                    <Text style={styles.eventDescription}>{evt.description}</Text>
                                    <Text style={styles.eventDescription}>
                                        Status: {getEventStatus(evt).toUpperCase()}
                                    </Text>
                                    <Text style={styles.eventDescription}>
                                        Voting Ends: {formatDate(evt.endVoting)}
                                    </Text>
                                    {evt.eventDate && (
                                        <Text style={styles.eventDescription}>
                                            Event Date: {formatDate(evt.eventDate)}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            ))
                        )}
                    </View>

                    {/* Other Events */}
                    <View style={styles.card}>
                        <Text style={styles.eventsTitle}>Other Events</Text>
                        {otherEvents.length === 0 ? (
                            <Text style={styles.noEvents}>No other events available.</Text>
                        ) : (
                            otherEvents.map(evt => (
                                <TouchableOpacity
                                    key={evt.id}
                                    style={styles.eventItem}
                                    onPress={() => openView(evt)}
                                >
                                    <Text style={styles.eventTitle}>{evt.title}</Text>
                                    <Text style={styles.eventDescription}>{evt.description}</Text>
                                    <Text style={styles.eventDescription}>
                                        Status: {getEventStatus(evt).toUpperCase()}
                                    </Text>
                                    {evt.eventDate && (
                                        <Text style={styles.eventDescription}>
                                            Event Date: {formatDate(evt.eventDate)}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
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

                                        {/* Event Duration Section */}
                                        <View style={styles.sectionContainer}>
                                            <MaterialIcons name="timer" size={24} color="#4CAF50" style={styles.sectionIcon} />
                                            <Text style={styles.label}>Event Duration</Text>
                                        </View>

                                        {/* Duration Inputs */}
                                        <View style={styles.durationContainer}>
                                            {/* Hours */}
                                            <View style={styles.durationUnitContainer}>
                                                <Text style={styles.durationLabel}>Hours</Text>
                                                <View style={styles.stepperContainer}>
                                                    <TouchableOpacity
                                                        style={styles.stepperButton}
                                                        onPress={() => {
                                                            const current = parseInt(createDurationHours) || 1;
                                                            const newHours = current > 0 ? (current - 1).toString() : '0';
                                                            setCreateDurationHours(newHours);
                                                        }}
                                                        accessible={true}
                                                        accessibilityLabel="Decrease hours"
                                                    >
                                                        <MaterialIcons name="remove" size={24} color="#fff" />
                                                    </TouchableOpacity>
                                                    <Text style={styles.stepperText}>{createDurationHours}</Text>
                                                    <TouchableOpacity
                                                        style={styles.stepperButton}
                                                        onPress={() => {
                                                            const current = parseInt(createDurationHours) || 0;
                                                            const newHours = (current + 1).toString();
                                                            setCreateDurationHours(newHours);
                                                        }}
                                                        accessible={true}
                                                        accessibilityLabel="Increase hours"
                                                    >
                                                        <MaterialIcons name="add" size={24} color="#fff" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            {/* Minutes */}
                                            <View style={styles.durationUnitContainer}>
                                                <Text style={styles.durationLabel}>Minutes</Text>
                                                <View style={styles.stepperContainer}>
                                                    <TouchableOpacity
                                                        style={styles.stepperButton}
                                                        onPress={() => {
                                                            let current = parseInt(createDurationMinutes) || 0;
                                                            const newMinutes = current >= 5 ? (current - 5).toString().padStart(2, '0') : '00';
                                                            setCreateDurationMinutes(newMinutes);
                                                        }}
                                                        accessible={true}
                                                        accessibilityLabel="Decrease minutes"
                                                    >
                                                        <MaterialIcons name="remove" size={24} color="#fff" />
                                                    </TouchableOpacity>
                                                    <Text style={styles.stepperText}>{createDurationMinutes}</Text>
                                                    <TouchableOpacity
                                                        style={styles.stepperButton}
                                                        onPress={() => {
                                                            let current = parseInt(createDurationMinutes) || 0;
                                                            const newMinutes = current < 55 ? (current + 5).toString().padStart(2, '0') : '60';
                                                            setCreateDurationMinutes(newMinutes === '60' ? '00' : newMinutes);
                                                            if (newMinutes === '60') {
                                                                const newHours = (parseInt(createDurationHours) || 0) + 1;
                                                                setCreateDurationHours(newHours.toString());
                                                            }
                                                        }}
                                                        accessible={true}
                                                        accessibilityLabel="Increase minutes"
                                                    >
                                                        <MaterialIcons name="add" size={24} color="#fff" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </>
                                )}


                                {/* Step2 Duration + Days */}
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
                                                                {formatDay(d.date)} | {d.start} - {d.end}
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
                            <View style={styles.modalActions}>
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
                                            <Text style={styles.valueText}>{tempStart}</Text>
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
                                            <Text style={styles.valueText}>{tempEnd}</Text>
                                            <TouchableOpacity style={styles.pickerButton} onPress={openPickEndTime}>
                                                <MaterialIcons name="access-time" size={20} color="#fff" />
                                                <Text style={styles.pickerButtonText}>Pick End</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                {/* Actions */}
                                <View style={styles.modalActions}>
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
                            <View style={styles.modalActions}>
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
                                value={new Date()}
                                mode="time"
                                display="spinner"
                                onChange={(ev, sel) => {
                                    if (!sel) return;
                                    const hhmm = sel.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                    });
                                    setTempStart(hhmm);
                                }}
                                textColor="black" // Set text color to ensure visibility
                            />
                            <View style={styles.modalActions}>
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
                                value={new Date()}
                                mode="time"
                                display="spinner"
                                onChange={(ev, sel) => {
                                    if (!sel) return;
                                    const hhmm = sel.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                    });
                                    setTempEnd(hhmm);
                                }}
                                textColor="black" // Set text color to ensure visibility
                            />
                            <View style={styles.modalActions}>
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
                            <View style={styles.modalActions}>
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
                                            <Text style={styles.label}>Basic Info</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Title"
                                                placeholderTextColor="#999"
                                                value={editTitle}
                                                onChangeText={setEditTitle}
                                            />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Description"
                                                placeholderTextColor="#999"
                                                value={editDesc}
                                                onChangeText={setEditDesc}
                                            />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Location"
                                                placeholderTextColor="#999"
                                                value={editLoc}
                                                onChangeText={setEditLoc}
                                            />
                                        </>
                                    )}
                                    {editStep === 2 && (
                                        <>
                                            <Text style={styles.label}>Event Duration (hours)</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="e.g. 2"
                                                placeholderTextColor="#999"
                                                value={editDuration}
                                                onChangeText={setEditDuration}
                                                keyboardType="numeric"
                                            />
                                            <Text style={styles.label}>Days</Text>
                                            {editDays.length === 0 && <Text>No days yet.</Text>}
                                            {editDays.map((d, i) => (
                                                <TouchableOpacity
                                                    key={i}
                                                    style={[styles.dayItem, { marginBottom: 8 }]}
                                                    onPress={() => openAddDayModalEdit(i)}
                                                >
                                                    <Text>
                                                        {formatDay(d.date)} | {d.start} - {d.end}
                                                    </Text>
                                                    <TouchableOpacity
                                                        onPress={() => removeDayEdit(i)}
                                                        style={{ marginLeft: 10 }}
                                                    >
                                                        <Text style={{ color: 'red' }}>Remove</Text>
                                                    </TouchableOpacity>
                                                </TouchableOpacity>
                                            ))}
                                            <Button title="Add Day" onPress={() => openAddDayModalEdit()} />
                                        </>
                                    )}
                                    {editStep === 3 && (
                                        <>
                                            <Text style={styles.label}>Invite Friends</Text>
                                            <ScrollView horizontal style={{ marginBottom: 8 }}>
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
                                            <View style={{ flexDirection: 'row', marginTop: 8 }}>
                                                <TextInput
                                                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                                    placeholder="Type username/email"
                                                    placeholderTextColor="#999"
                                                    value={editTypedInvite}
                                                    onChangeText={setEditTypedInvite}
                                                />
                                                <TouchableOpacity
                                                    style={[styles.timeButton, { marginLeft: 8, backgroundColor: '#2196F3' }]}
                                                    onPress={addTypedInviteEdit}
                                                >
                                                    <Text style={{ color: '#fff' }}>Add</Text>
                                                </TouchableOpacity>
                                            </View>
                                            {editInvitees.length > 0 && (
                                                <View style={{ marginTop: 10 }}>
                                                    <Text style={[styles.label, { marginBottom: 5 }]}>Invited:</Text>
                                                    {editInvitees.map((p, idx) => (
                                                        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                                            <Text style={{ flex: 1 }}>
                                                                {p.username} ({p.email}) - {p.status}
                                                            </Text>
                                                            <TouchableOpacity onPress={() => removeInviteEdit(p.email)}>
                                                                <Text style={{ color: 'red' }}>Remove</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        </>
                                    )}
                                    {editStep === 4 && (
                                        <>
                                            <Text style={styles.label}>Voting Deadline</Text>
                                            <TouchableOpacity
                                                style={[styles.timeButton, { backgroundColor: '#f0f0f0' }]}
                                                onPress={openVotingDatePickerEdit}
                                            >
                                                <Text style={{ color: '#333' }}>
                                                    End Voting: {formatDate(editEndVoting)}
                                                </Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </ScrollView>
                                <View style={styles.modalActions}>
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
                                            <Text style={styles.valueText}>{tempStart}</Text>
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
                                            <Text style={styles.valueText}>{tempEnd}</Text>
                                            <TouchableOpacity style={styles.pickerButton} onPress={openPickEndTime}>
                                                <MaterialIcons name="access-time" size={20} color="#fff" />
                                                <Text style={styles.pickerButtonText}>Pick End</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                {/* Actions */}
                                <View style={styles.modalActions}>
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
                                value={tempDateEdit}
                                mode="date"
                                display="spinner"
                                onChange={(ev, sel) => onPickDateChangeEdit(ev, sel)}
                                textColor="black" // Set text color to ensure visibility
                            />
                            <View style={styles.modalActions}>
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
                                value={new Date()}
                                mode="time"
                                display="spinner"
                                onChange={(ev, sel) => {
                                    if (!sel) return;
                                    const hhmm = sel.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                    });
                                    setTempStartEdit(hhmm);
                                }}
                                textColor="black" // Set text color to ensure visibility
                            />
                            <View style={styles.modalActions}>
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
                                value={new Date()}
                                mode="time"
                                display="spinner"
                                onChange={(ev, sel) => {
                                    if (!sel) return;
                                    const hhmm = sel.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                    });
                                    setTempEndEdit(hhmm);
                                }}
                                textColor="black" // Set text color to ensure visibility
                            />
                            <View style={styles.modalActions}>
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
                            <View style={styles.modalActions}>
                                <Button title="Cancel" onPress={cancelVotingDateEdit} />
                                <Button title="Save" onPress={saveVotingDateEdit} />
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* VIEW / VOTE MODAL */}
                <Modal visible={voteModalVisible} transparent onRequestClose={closeView}>
                    {selectedEvent && (
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContainer}>
                                    <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                                    <Text style={{ marginBottom: 10 }}>{selectedEvent.description}</Text>

                                    <Text style={styles.label}>
                                        Status: {getEventStatus(selectedEvent).toUpperCase()}
                                    </Text>
                                    {getEventStatus(selectedEvent) === 'finished' && selectedEvent.eventDate && (
                                        <Text style={{ marginBottom: 6 }}>
                                            Final Event Date: {formatDate(selectedEvent.eventDate)}
                                        </Text>
                                    )}

                                    <Text style={[styles.label, { marginTop: 10 }]}>Possible Days:</Text>
                                    {selectedEvent.dayTimes.length === 0 ? (
                                        <Text>No days set</Text>
                                    ) : (
                                        selectedEvent.dayTimes.map((d, i) => (
                                            <Text key={i}>
                                                {formatDay(d.date)}: {d.start} - {d.end}
                                            </Text>
                                        ))
                                    )}

                                    <View style={styles.modalActions}>
                                        <Button title="Decline" color="red" onPress={handleDecline} />
                                        <Button title="Accept" onPress={handleAccept} />
                                    </View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    )}
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    /* ------------------- Container Styles ------------------- */
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        padding: 20,
    },

    /* ------------------- Header Styles ------------------- */
    header: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 15,
    },
    headerText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#fff',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    /* ------------------- Card Styles ------------------- */
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 2,

        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    greeting: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
    message: {
        fontSize: 14,
        color: '#555',
    },
    eventsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    noEvents: {
        fontSize: 14,
        color: '#888',
    },
    eventItem: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    eventDescription: {
        fontSize: 14,
        color: '#555',
    },

    /* ------------------- Floating Action Button (FAB) Styles ------------------- */
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#2196F3',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },

    /* ------------------- Modal Styles ------------------- */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)', // Slightly darker for better focus
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        elevation: 5, // Adds shadow for Android
        shadowColor: '#000', // Adds shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalContent: {
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    cancelButton: {
        backgroundColor: '#ccc', // Gray background
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginRight: 10,
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
    },
    removeButton: {
        backgroundColor: '#e74c3c', // Red background
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginRight: 10,
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#4CAF50', // Green background
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
    },

    /* ------------------- Input Styles ------------------- */
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    iconStyle: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        padding: 5,
    },
    inviteInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: '#000',
        backgroundColor: '#fff',
    },

    /* ------------------- Section Styles ------------------- */
    sectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 10,
    },
    sectionIcon: {
        marginRight: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
    },
    durationLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#555',
        marginBottom: 6,
    },

    /* ------------------- Duration Styles ------------------- */
    durationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    durationUnitContainer: {
        flex: 0.48,
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stepperButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepperText: {
        fontSize: 16,
        width: 40,
        textAlign: 'center',
        color: '#333',
    },
    durationText: {
        fontSize: 18,
        marginHorizontal: 20,
        minWidth: 40,
        textAlign: 'center',
    },

    /* ------------------- Days Styles ------------------- */
    noDaysText: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
    },
    daysContainer: {
        marginBottom: 16,
    },
    dayItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#f9f9f9',
    },
    dayInfo: {
        flex: 1,
    },
    dayText: {
        fontSize: 16,
        color: '#333',
    },
    removeDayButton: {
        marginLeft: 12,
    },
    addDayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'center',
    },
    addDayButtonText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '500',
    },

    /* ------------------- Invite Styles ------------------- */
    friendsScrollView: {
        marginBottom: 16,
    },
    inviteChip: {
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    inviteChipText: {
        fontSize: 14,
        color: '#333',
    },
    inviteInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    addInviteButton: {
        backgroundColor: '#2196F3',
        padding: 12,
        borderRadius: 8,
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    invitedContainer: {
        marginTop: 10,
    },
    invitedLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginBottom: 5,
    },
    invitedList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    invitedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    invitedText: {
        fontSize: 14,
        color: '#333',
        marginRight: 6,
    },

    /* ------------------- Voting Styles ------------------- */
    votingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    votingButtonText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 8,
    },

     /* ------------------- Time Styles ------------------- */
    fieldContainer: {
        marginBottom: 15,
    },
    pickerButtonText: {
        color: '#fff',
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '500',
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50', // Green background
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginLeft: 10,
    },
    timeButton: {
        alignItems: 'center',
        padding: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ccc',
    },

     /* ------------------- Value Styles ------------------- */
    valueButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    valueText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
});
