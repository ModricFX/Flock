import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    TextInput,
    Button,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Models } from 'appwrite';
import { authService } from '../services/authservice';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function HomeScreen() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<Models.User<{}> | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [eventData, setEventData] = useState<{
        title: string;
        duration: string;
        schedule: Record<string, any>; // Or specify a more precise type if known
        location: string;
        description: string;
        days: Record<string, { start: string; end: string }>;
    }>({
        title: '',
        duration: '',
        schedule: {},
        location: '',
        description: '',
        days: {},
    });

    const [timePicker, setTimePicker] = useState<{
        visible: boolean;
        day: string;
        type: 'start' | 'end';
        tempTime: Date;
    }>({ visible: false, day: '', type: 'start', tempTime: new Date() });

    const router = useRouter();

    const [keyboardOffset, setKeyboardOffset] = useState<'padding' | undefined>(undefined);


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await authService.getUserData();
                setUser(currentUser);
            } catch (error) {
                console.error('Error fetching user:', error);
                router.push('/auth/login'); // spremeni na /tabs/home za dashboard
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleDayToggle = (day: string) => {
        Keyboard.dismiss();
        setEventData((prevData) => {
            const days = { ...prevData.days };
            if (days[day]) {
                delete days[day];
            } else {
                days[day] = { start: '08:00 AM', end: '10:00 PM' };
            }
            return { ...prevData, days };
        });
    };


    const handleTimeChange = (_: unknown, selectedTime: Date | undefined) => {
        if (selectedTime) {
            setTimePicker((prev) => ({ ...prev, tempTime: selectedTime }));
        }
    };

    const saveTimeChange = () => {
        Keyboard.dismiss();
        const { day, type, tempTime } = timePicker;
        setEventData((prevData) => {
            const days = { ...prevData.days };
            days[day][type] = tempTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            return { ...prevData, days };
        });
        setTimePicker({ visible: false, day: '', type: 'start', tempTime: new Date() });
    };

    const handleCreateEvent = () => {
        console.log('Event Created:', eventData);
        setIsModalVisible(false);
        setEventData({
            title: '',
            duration: '',
            schedule: {},
            location: '',
            description: '',
            days: {},
        });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEventData({
            title: '',
            duration: '',
            schedule: {},
            location: '',
            description: '',
            days: {},
        });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
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
                        <MaterialIcons name="notifications" size={24} color="white" />
                        <MaterialIcons name="account-circle" size={24} color="white" style={styles.userIcon} />
                    </View>
                </View>

                {/* Main Content */}
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <View style={styles.card}>
                        <Text style={styles.greeting}>Hi {user?.name || 'User'}!</Text>
                        <Text style={styles.message}>Welcome to your account. Below are your created events.</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.eventsTitle}>Your Events</Text>
                        <Text style={styles.noEvents}>No events yet. Create one by clicking the "+" button!</Text>
                    </View>
                </ScrollView>

                {/* Floating Action Button */}
                <TouchableOpacity style={styles.fab} onPress={() => setIsModalVisible(true)}>
                    <MaterialIcons name="add" size={28} color="white" />
                </TouchableOpacity>

                {/* Add Event Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={handleCancel}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <KeyboardAvoidingView
                            style={styles.modalContainer}
                            behavior={Platform.OS === 'ios' ? keyboardOffset : undefined}
                        >
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Create New Event</Text>
                                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                                    <TextInput
                                        style={[styles.input, { marginTop: 20 }]}
                                        placeholder="Event Title"
                                        placeholderTextColor="#999"
                                        value={eventData.title}
                                        onFocus={() => setKeyboardOffset(undefined)} // No modal movement for Event Title
                                        onChangeText={(text) => setEventData({ ...eventData, title: text })}
                                    />
                                    <Text style={styles.label}>Select Days and Times:</Text>
                                    {daysOfWeek.map((day) => (
                                        <View key={day} style={styles.dayRow}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.dayButton,
                                                    eventData.days[day] && styles.dayButtonSelected,
                                                ]}
                                                onPress={() => handleDayToggle(day)}
                                            >
                                                <Text
                                                    style={
                                                        eventData.days[day]
                                                            ? styles.dayButtonTextSelected
                                                            : styles.dayButtonText
                                                    }
                                                >
                                                    {day}
                                                </Text>
                                            </TouchableOpacity>
                                            {eventData.days[day] && (
                                                <View style={styles.timeRow}>
                                                    <TouchableOpacity
                                                        style={[styles.timeButton, { backgroundColor: '#f0f0f0' }]}
                                                        onPress={() => {
                                                            Keyboard.dismiss();
                                                            setTimePicker({ visible: true, day, type: 'start', tempTime: new Date() });
                                                        }}
                                                    >
                                                        <Text style={[styles.timeButtonText, { color: '#333' }]}>
                                                            Start: {eventData.days[day].start}
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={[styles.timeButton, { backgroundColor: '#f0f0f0' }]}
                                                        onPress={() => {
                                                            Keyboard.dismiss();
                                                            setTimePicker({ visible: true, day, type: 'end', tempTime: new Date() });
                                                        }}
                                                    >
                                                        <Text style={[styles.timeButtonText, { color: '#333' }]}>
                                                            End: {eventData.days[day].end}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    ))}

                                    {timePicker.visible && (
                                        <View style={styles.timePickerContainer}>
                                            <DateTimePicker
                                                value={timePicker.tempTime}
                                                mode="time"
                                                display="spinner"
                                                themeVariant="dark"
                                                textColor="#000"
                                                onChange={(event, time) => handleTimeChange(event, time)}
                                            />
                                            <Button title="Set Time" onPress={saveTimeChange} />
                                        </View>
                                    )}

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Location"
                                        placeholderTextColor="#999"
                                        value={eventData.location}
                                        onFocus={() => setKeyboardOffset('padding')}
                                        onChangeText={(text) => setEventData({ ...eventData, location: text })}
                                    />
                                    <TextInput
                                        style={styles.textArea}
                                        placeholder="Description"
                                        placeholderTextColor="#999"
                                        value={eventData.description}
                                        onFocus={() => setKeyboardOffset('padding')}
                                        multiline
                                        numberOfLines={4}
                                        onChangeText={(text) => setEventData({ ...eventData, description: text })}
                                    />

                                    <View style={styles.modalActions}>
                                        <Button title="Cancel" color="red" onPress={handleCancel} />
                                        <Button title="Save" onPress={handleCreateEvent} />
                                    </View>
                                </ScrollView>
                            </View>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        padding: 55,
        paddingBottom: 15,
    },
    headerText: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userIcon: {
        marginLeft: 15,
    },
    contentContainer: {
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    greeting: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    message: {
        fontSize: 14,
        color: '#555',
    },
    eventsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    noEvents: {
        fontSize: 14,
        color: '#888',
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        fontSize: 14,
        color: '#000',
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        fontSize: 14,
        color: '#000',
        height: 100,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginVertical: 5,
    },
    dayRow: {
        marginBottom: 10,
    },
    dayButton: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        alignItems: 'center',
    },
    dayButtonSelected: {
        backgroundColor: '#4CAF50',
    },
    dayButtonText: {
        color: '#555',
    },
    dayButtonTextSelected: {
        color: 'white',
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    timeButton: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    timeButtonText: {
        fontSize: 14,
        color: '#555',
    },
    timePickerContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
});
