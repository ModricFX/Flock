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

interface DaySchedule {
    start: string;
    end: string;
}

/**
 * "EventData" with scheduleOptions stored by day-of-week,
 * a multi-step approach for both create and edit.
 */
interface EventData {
    id: string;
    createdBy: string;
    title: string;
    description: string;
    location: string;

    /* Days (Mon–Sun) each with start/end times */
    scheduleOptions: Record<string, DaySchedule>;

    participants: Participant[];
    endVoting: Date;            // People can vote until this date/time
    eventDate?: Date;          // The final chosen date/time (if set)

    createdAt: Date;
    updatedAt: Date;
    votes: Record<string, any>; // optional: store user votes, not used here
}

/* Mock "current" user */
const mockCurrentUser: User = {
    id: 'u-001',
    username: 'MyUser',
    email: 'myuser@domain.com',
};

/* Mock friend list for invites */
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
        scheduleOptions: {
            Monday: { start: '8:00 PM', end: '11:00 PM' },
        },
        participants: [
            { username: 'Alice', email: 'alice@example.com', status: 'pending' },
            { username: 'Bob', email: 'bob@example.com', status: 'accepted' },
        ],
        endVoting: new Date(Date.now() + 1000 * 60 * 60 * 24),
        eventDate: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        votes: {},
    },
    {
        id: 'evt-2',
        createdBy: 'u-004', // belongs to Charlie
        title: 'Yoga Retreat',
        description: 'Relaxing yoga for all levels',
        location: 'Health & Wellness Center',
        scheduleOptions: {
            Saturday: { start: '9:00 AM', end: '12:00 PM' },
        },
        participants: [
            { username: 'MyUser', email: 'myuser@domain.com', status: 'pending' },
            { username: 'Charlie', email: 'charlie@example.com', status: 'pending' },
        ],
        endVoting: new Date(Date.now() - 1000 * 60 * 60 * 2), // ended 2 hours ago
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 48),
        createdAt: new Date(),
        updatedAt: new Date(),
        votes: {},
    },
];

const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

/* Utility: get 'voting' or 'finished' from endVoting */
function getEventStatus(evt: EventData) {
    const now = Date.now();
    if (evt.endVoting.getTime() > now) return 'voting';
    return 'finished';
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

export default function HomeScreen() {
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [events, setEvents] = useState<EventData[]>(initialEvents);
    const [friends] = useState<User[]>(mockFriends);

    /* ---------------------------------------
         CREATE EVENT (4 Steps)
    --------------------------------------- */
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [createStep, setCreateStep] = useState(1);

    const [createTitle, setCreateTitle] = useState('');
    const [createDesc, setCreateDesc] = useState('');
    const [createLoc, setCreateLoc] = useState('');
    const [createSchedule, setCreateSchedule] = useState<Record<string, DaySchedule>>({});
    const [invitees, setInvitees] = useState<Participant[]>([]);
    const [typedInvite, setTypedInvite] = useState('');
    const [endVotingDate, setEndVotingDate] = useState<Date>(
        new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    );

    /* ---------------------------------------
         EDIT EVENT (4 Steps)
    --------------------------------------- */
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editStep, setEditStep] = useState(1);

    // All the fields for editing steps
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editLoc, setEditLoc] = useState('');
    const [editSchedule, setEditSchedule] = useState<Record<string, DaySchedule>>({});
    const [editInvitees, setEditInvitees] = useState<Participant[]>([]);
    const [editTypedInvite, setEditTypedInvite] = useState('');
    const [editEndVoting, setEditEndVoting] = useState<Date>(new Date());
    const [editEvent, setEditEvent] = useState<EventData | null>(null);

    /* -------------- Voting & TimePicker Modals -------------- */
    // Voting date/time modal is used by both create & edit
    const [votingPickerVisible, setVotingPickerVisible] = useState(false);
    const [votingPickerMode, setVotingPickerMode] = useState<'create' | 'edit'>('create');

    // Time Picker (shared for day start/end)
    const [timePickerVisible, setTimePickerVisible] = useState(false);
    const [timePickerDay, setTimePickerDay] = useState('');
    const [timePickerField, setTimePickerField] = useState<'start' | 'end'>('start');
    const [timePickerMode, setTimePickerMode] = useState<'create' | 'edit'>('create');
    const [tempTime, setTempTime] = useState(new Date());

    /* -------------------------------------------------- 
         VIEW / VOTE (Other Events) 
    -------------------------------------------------- */
    const [voteModalVisible, setVoteModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);


    // Simulate fetching user
    useEffect(() => {
        setTimeout(() => {
            setCurrentUser(mockCurrentUser);
            setLoading(false);
        }, 800);
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }



    function startCreateEvent() {
        setCreateStep(1);
        setCreateTitle('');
        setCreateDesc('');
        setCreateLoc('');
        setCreateSchedule({});
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
            // finalize
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
            Alert.alert('Missing Title', 'Provide a title for your event.');
            return;
        }
        const newEvent: EventData = {
            id: Math.random().toString(),
            createdBy: currentUser?.id || 'unknown',
            title: createTitle,
            description: createDesc,
            location: createLoc,
            scheduleOptions: createSchedule,
            participants: invitees,
            endVoting: endVotingDate,
            eventDate: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
            votes: {},
        };
        setEvents([...events, newEvent]);
        closeCreateEvent();
    }

    /* Step2 (Create): toggling day-of-week, picking times */
    function toggleDayCreate(day: string) {
        const copy = { ...createSchedule };
        if (copy[day]) {
            delete copy[day];
        } else {
            copy[day] = { start: '08:00 AM', end: '10:00 PM' };
        }
        setCreateSchedule(copy);
    }

    /* Step2: open time picker (create) */
    function openTimePickerCreate(day: string, field: 'start' | 'end') {
        setTimePickerDay(day);
        setTimePickerField(field);
        setTimePickerMode('create');
        setTempTime(new Date());
        // hide create modal => open time modal
        setCreateModalVisible(false);
        setTimePickerVisible(true);
    }

    /* Step3 (Create): Invites */
    function addFriendInvite(friend: User) {
        if (!invitees.find(i => i.email === friend.email)) {
            setInvitees(prev => [...prev, { username: friend.username, email: friend.email, status: 'pending' }]);
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
            setInvitees(prev => [...prev, newPart]);
        }
        setTypedInvite('');
    }

    /* Step4: pick endVoting date/time => hide create modal => open special modal */
    function openVotingDatePickerCreate() {
        setCreateModalVisible(false);
        setTempTime(endVotingDate);
        setVotingPickerVisible(true);
        setVotingPickerMode('create');
    }

    /* ---------------------------------------
         EDIT EVENT (4 Steps)
    --------------------------------------- */

    function openEdit(event: EventData) {
        setEditEvent(event);
        setEditStep(1);

        // Populate the fields with event data
        setEditTitle(event.title || '');
        setEditDesc(event.description || '');
        setEditLoc(event.location || '');
        setEditSchedule({ ...event.scheduleOptions });
        setEditInvitees([...event.participants]);
        setEditEndVoting(event.endVoting || new Date());

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
            // finalize
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
            Alert.alert('Missing Title', 'Provide a title for your event.');
            return;
        }
        // create a copy with the updated fields
        const updated: EventData = {
            ...editEvent,
            title: editTitle,
            description: editDesc,
            location: editLoc,
            scheduleOptions: editSchedule,
            participants: editInvitees,
            endVoting: editEndVoting,
            updatedAt: new Date(),
        };
        setEvents(prev => prev.map(e => (e.id === updated.id ? updated : e)));
        closeEditEvent();
    }

    /* Step2 (Edit): toggling days and picking times */
    function toggleDayEdit(day: string) {
        const copy = { ...editSchedule };
        if (copy[day]) delete copy[day];
        else copy[day] = { start: '08:00 AM', end: '10:00 PM' };
        setEditSchedule(copy);
    }

    function openTimePickerEdit(day: string, field: 'start' | 'end') {
        setTimePickerDay(day);
        setTimePickerField(field);
        setTimePickerMode('edit');
        setTempTime(new Date());
        // hide edit modal => open time picker
        setEditModalVisible(false);
        setTimePickerVisible(true);
    }

    /* Step3 (Edit): invites */
    function addFriendInviteEdit(friend: User) {
        if (!editInvitees.find(i => i.email === friend.email)) {
            setEditInvitees(prev => [...prev, { username: friend.username, email: friend.email, status: 'pending' }]);
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
            setEditInvitees(prev => [...prev, newPart]);
        }
        setEditTypedInvite('');
    }
    function removeInviteEdit(email: string) {
        setEditInvitees(prev => prev.filter(i => i.email !== email));
    }

    /* Step4 (Edit): endVoting date/time */
    function openVotingDatePickerEdit() {
        // hide edit modal, open special modal
        setTempTime(editEndVoting);
        setVotingPickerMode('edit');
        setEditModalVisible(false);
        setVotingPickerVisible(true);
    }

    /* DELETING EVENT ENTIRELY */
    function handleDeleteEvent() {
        if (!editEvent) return;
        Alert.alert('Confirm Delete', 'Are you sure you want to delete this event?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    setEvents(prev => prev.filter(ev => ev.id !== editEvent.id));
                    closeEditEvent();
                },
            },
        ]);
    }

    /* -------------- Voting & TimePicker Modals -------------- */
    // Voting date/time modal is used by both create & edit

    function cancelVotingDate() {
        setVotingPickerVisible(false);
        if (votingPickerMode === 'create') {
            // show create modal again
            setCreateModalVisible(true);
        } else {
            // show edit modal again
            setEditModalVisible(true);
        }
    }

    function saveVotingDate() {
        setVotingPickerVisible(false);
        if (votingPickerMode === 'create') {
            setEndVotingDate(tempTime);
            setCreateModalVisible(true);
        } else {
            setEditEndVoting(tempTime);
            setEditModalVisible(true);
        }
    }

    // Time Picker (shared for day start/end)

    function onTimePickerChange(_event: DateTimePickerEvent, sel?: Date) {
        if (sel) setTempTime(sel);
    }

    function cancelTimePicker() {
        setTimePickerVisible(false);
        if (timePickerMode === 'create') {
            setCreateModalVisible(true);
        } else {
            setEditModalVisible(true);
        }
    }

    function saveTimePicker() {
        setTimePickerVisible(false);
        if (timePickerMode === 'create') {
            // update createSchedule
            if (!createSchedule[timePickerDay]) {
                setCreateModalVisible(true);
                return;
            }
            const copy = { ...createSchedule };
            copy[timePickerDay][timePickerField] = tempTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
            setCreateSchedule(copy);
            setCreateModalVisible(true);
        } else {
            // update editSchedule
            if (!editSchedule[timePickerDay]) {
                setEditModalVisible(true);
                return;
            }
            const copy = { ...editSchedule };
            copy[timePickerDay][timePickerField] = tempTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
            setEditSchedule(copy);
            setEditModalVisible(true);
        }
    }

    /* -------------------------------------------------- 
         VIEW / VOTE (Other Events) 
    -------------------------------------------------- */


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

    /* Partition MY vs OTHERS */
    const myEvents = events.filter(e => e.createdBy === currentUser?.id);
    const otherEvents = events.filter(e => e.createdBy !== currentUser?.id);

    return (
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
                    <Text style={styles.greeting}>
                        Hi {currentUser?.username || 'User'}!
                    </Text>
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
                        <Text style={styles.noEvents}>No other events are available.</Text>
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

            {/* FAB: Start Creating */}
            <TouchableOpacity style={styles.fab} onPress={startCreateEvent}>
                <MaterialIcons name="add" size={28} color="white" />
            </TouchableOpacity>

            {/* =====================
          CREATE EVENT MODAL
            ===================== */}
            <Modal
                visible={createModalVisible}
                transparent
                animationType="slide"
                onRequestClose={closeCreateEvent}
            >
                <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Create Event (Step {createStep}/4)</Text>
                        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                            {/* STEP 1: BASIC INFO */}
                            {createStep === 1 && (
                                <>
                                    <Text style={styles.label}>Basic Info</Text>
                                    <TextInput
                                        style={[styles.input, { marginTop: 10 }]}
                                        placeholder="Title"
                                        placeholderTextColor="#999"
                                        value={createTitle}
                                        onChangeText={setCreateTitle}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Description"
                                        placeholderTextColor="#999"
                                        value={createDesc}
                                        onChangeText={setCreateDesc}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Location"
                                        placeholderTextColor="#999"
                                        value={createLoc}
                                        onChangeText={setCreateLoc}
                                    />
                                </>
                            )}

                            {/* STEP 2: DAYS & TIMES */}
                            {createStep === 2 && (
                                <>
                                    <Text style={styles.label}>Select Days & Times</Text>
                                    {daysOfWeek.map(day => (
                                        <View key={day} style={styles.dayRow}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.dayButton,
                                                    createSchedule[day] && styles.dayButtonSelected,
                                                ]}
                                                onPress={() => toggleDayCreate(day)}
                                            >
                                                <Text
                                                    style={
                                                        createSchedule[day]
                                                            ? styles.dayButtonTextSelected
                                                            : styles.dayButtonText
                                                    }
                                                >
                                                    {day}
                                                </Text>
                                            </TouchableOpacity>
                                            {createSchedule[day] && (
                                                <View style={styles.timeRow}>
                                                    <TouchableOpacity
                                                        style={[styles.timeButton, { backgroundColor: '#f0f0f0' }]}
                                                        onPress={() => openTimePickerCreate(day, 'start')}
                                                    >
                                                        <Text style={{ color: '#333' }}>
                                                            Start: {createSchedule[day].start}
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={[styles.timeButton, { backgroundColor: '#f0f0f0' }]}
                                                        onPress={() => openTimePickerCreate(day, 'end')}
                                                    >
                                                        <Text style={{ color: '#333' }}>
                                                            End: {createSchedule[day].end}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </>
                            )}

                            {/* STEP 3: INVITES */}
                            {createStep === 3 && (
                                <>
                                    <Text style={styles.label}>Invite Friends</Text>
                                    <ScrollView horizontal style={{ marginBottom: 8 }} contentContainerStyle={{ flexDirection: 'row' }}>
                                        {friends.map(f => (
                                            <TouchableOpacity
                                                key={f.id}
                                                style={styles.inviteChip}
                                                onPress={() => addFriendInvite(f)}
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
                                            value={typedInvite}
                                            onChangeText={setTypedInvite}
                                        />
                                        <TouchableOpacity
                                            style={[styles.timeButton, { marginLeft: 8, backgroundColor: '#2196F3' }]}
                                            onPress={addTypedInvite}
                                        >
                                            <Text style={{ color: '#fff' }}>Add</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {invitees.length > 0 && (
                                        <View style={{ marginTop: 10 }}>
                                            <Text style={[styles.label, { marginBottom: 5 }]}>Invited:</Text>
                                            {invitees.map((p, idx) => (
                                                <Text key={idx}>
                                                    {p.username} ({p.email})
                                                </Text>
                                            ))}
                                        </View>
                                    )}
                                </>
                            )}

                            {/* STEP 4: VOTING DEADLINE */}
                            {createStep === 4 && (
                                <>
                                    <Text style={styles.label}>Voting Deadline</Text>
                                    <TouchableOpacity
                                        style={[styles.timeButton, { backgroundColor: '#f0f0f0' }]}
                                        onPress={openVotingDatePickerCreate}
                                    >
                                        <Text style={{ color: '#333' }}>
                                            End Voting: {formatDate(endVotingDate)}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </ScrollView>
                        <View style={styles.modalActions}>
                            <Button
                                title={createStep === 1 ? 'Cancel' : 'Back'}
                                onPress={handlePrevStepCreate}
                            />
                            <Button
                                title={createStep < 4 ? 'Next' : 'Finish'}
                                onPress={handleNextStepCreate}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* =====================
          EDIT EVENT MODAL
      ===================== */}
            <Modal
                visible={editModalVisible}
                transparent
                animationType="slide"
                onRequestClose={closeEditEvent}
            >
                {editEvent && (
                    <KeyboardAvoidingView
                        style={styles.modalOverlay}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Edit Event (Step {editStep}/4)</Text>
                            <ScrollView>
                                {/* STEP 1: BASIC INFO */}
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
                                {/* STEP 2: DAYS & TIMES */}
                                {editStep === 2 && (
                                    <>
                                        <Text style={styles.label}>Days & Times</Text>
                                        {daysOfWeek.map(day => (
                                            <View key={day} style={styles.dayRow}>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.dayButton,
                                                        editSchedule[day] && styles.dayButtonSelected,
                                                    ]}
                                                    onPress={() => toggleDayEdit(day)}
                                                >
                                                    <Text
                                                        style={
                                                            editSchedule[day]
                                                                ? styles.dayButtonTextSelected
                                                                : styles.dayButtonText
                                                        }
                                                    >
                                                        {day}
                                                    </Text>
                                                </TouchableOpacity>
                                                {editSchedule[day] && (
                                                    <View style={styles.timeRow}>
                                                        <TouchableOpacity
                                                            style={[styles.timeButton, { backgroundColor: '#f0f0f0' }]}
                                                            onPress={() => openTimePickerEdit(day, 'start')}
                                                        >
                                                            <Text style={{ color: '#333' }}>
                                                                Start: {editSchedule[day].start}
                                                            </Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            style={[styles.timeButton, { backgroundColor: '#f0f0f0' }]}
                                                            onPress={() => openTimePickerEdit(day, 'end')}
                                                        >
                                                            <Text style={{ color: '#333' }}>
                                                                End: {editSchedule[day].end}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                    </>
                                )}

                                {/* STEP 3: INVITES */}
                                {editStep === 3 && (
                                    <>
                                        <Text style={styles.label}>Invite Friends</Text>
                                        <ScrollView horizontal style={{ marginBottom: 8 }} contentContainerStyle={{ flexDirection: 'row' }}>
                                            {friends.map(f => (
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

                                {/* STEP 4: VOTING DEADLINE */}
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
                                <Button
                                    title={editStep === 1 ? 'Cancel' : 'Back'}
                                    onPress={handlePrevStepEdit}
                                />
                                <Button
                                    title={editStep < 4 ? 'Next' : 'Save'}
                                    onPress={handleNextStepEdit}
                                />
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                )}
            </Modal>


            {/* VOTING date/time for CREATE or EDIT */}
            <Modal
                transparent
                animationType="fade"
                visible={votingPickerVisible}
                onRequestClose={cancelVotingDate}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>
                                Select Voting Deadline
                            </Text>
                            <View style={styles.datePickerWrapper}>
                                <DateTimePicker
                                    value={tempTime}
                                    mode="datetime"   // let the user pick both date and time
                                    display="spinner"
                                    textColor="#000"
                                    onChange={(_, selectedDate) => {
                                        if (selectedDate) setTempTime(selectedDate);
                                    }}
                                />
                            </View>
                            <View style={styles.modalActions}>
                                <Button title="Cancel" onPress={cancelVotingDate} />
                                <Button
                                    title="Save"
                                    onPress={saveVotingDate}
                                />
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* TIME PICKER shared for CREATE or EDIT */}
            <Modal
                transparent
                animationType="fade"
                visible={timePickerVisible}
                onRequestClose={cancelTimePicker}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>
                                {timePickerMode === 'create'
                                    ? `Select ${timePickerField === 'start' ? 'Start' : 'End'} Time for ${timePickerDay} (Create)`
                                    : `Select ${timePickerField === 'start' ? 'Start' : 'End'} Time for ${timePickerDay} (Edit)`}
                            </Text>
                            <View style={styles.datePickerWrapper}>
                                <DateTimePicker
                                    value={tempTime}
                                    mode="time"
                                    display="spinner"
                                    textColor="#000"
                                    onChange={onTimePickerChange}
                                />
                            </View>
                            <View style={styles.modalActions}>
                                <Button title="Cancel" onPress={cancelTimePicker} />
                                <Button title="Save" onPress={saveTimePicker} />
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* VIEW/VOTE MODAL */}
            <Modal visible={voteModalVisible} transparent onRequestClose={closeView}>
                {selectedEvent && (
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

                            <Text style={[styles.label, { marginTop: 10 }]}>Possible Day/Times:</Text>
                            {Object.entries(selectedEvent.scheduleOptions).length === 0 ? (
                                <Text style={{ marginBottom: 10 }}>No days set</Text>
                            ) : (
                                Object.entries(selectedEvent.scheduleOptions).map(([day, times], i) => (
                                    <Text key={i}>
                                        {day}: {times.start} - {times.end}
                                    </Text>
                                ))
                            )}

                            <View style={styles.modalActions}>
                                <Button title="Decline" color="red" onPress={handleDecline} />
                                <Button title="Accept" onPress={handleAccept} />
                            </View>
                        </View>
                    </View>
                )}
            </Modal>
        </View>
    );
}

/* -----------------------------------------
   Styles
----------------------------------------- */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
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
    scrollContent: {
        padding: 20,
    },
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

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,

        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
        shadowOpacity: 0.2,
        elevation: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginVertical: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        marginBottom: 10,
        fontSize: 14,
    },
    dayRow: {
        marginBottom: 8,
    },
    dayButton: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        alignItems: 'center',
    },
    dayButtonSelected: {
        backgroundColor: '#4CAF50',
    },
    dayButtonText: {
        color: '#555',
        fontSize: 14,
    },
    dayButtonTextSelected: {
        color: '#fff',
        fontSize: 14,
    },
    timeRow: {
        flexDirection: 'row',
        marginTop: 4,
    },
    timeButton: {
        flex: 1,
        alignItems: 'center',
        padding: 10,
        marginHorizontal: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },

    inviteChip: {
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 10,
    },
    inviteChipText: {
        fontSize: 14,
        color: '#333',
    },
    datePickerWrapper: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
    },
});