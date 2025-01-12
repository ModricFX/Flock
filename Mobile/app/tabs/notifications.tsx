// Notifications.tsx

import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    FlatList,
    StatusBar,
    Modal,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Pressable,
    Button,
    Animated,
    ActivityIndicator,
    Alert,
} from 'react-native';

/* IMPORT STYLES */
import styles from '../styles/NotificationsPageStyles';

// Import the NotificationService
import { notificationService } from '../services/notificationservice'; // Adjust the path as necessary

// Import date-fns functions
import { format, parseISO, isValid } from 'date-fns';

// Define the Notification interface matching the API response
interface Notification {
    id_User: number;
    id_Notification: number;
    unread: boolean;
    date_Received: string;
    notification: {
        id_Notification: number;
        title: string;
        description: string;
    };
}

export default function Notifications() {
    const [data, setData] = useState<Notification[]>([]);
    const [filter, setFilter] = useState("all");
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [notificationPopupVisible, setNotificationPopupVisible] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const slideAnim = useRef(new Animated.Value(100)).current; // Use useRef for Animated.Value

    /**
     * Helper function to parse date strings as UTC.
     * If the date string lacks a timezone, append 'Z' to treat it as UTC.
     * @param dateString The date string from the server.
     * @returns A valid Date object or Invalid Date.
     */
    const parseUTCDate = (dateString: string): Date => {
        if (!dateString) {
            return new Date(NaN);
        }
        // Check if dateString already has a timezone designator
        const hasTimezone = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})$/.test(dateString);
        if (hasTimezone) {
            return parseISO(dateString);
        }
        // Assume UTC if no timezone
        return parseISO(`${dateString}Z`);
    };

    /**
     * Function to fetch notifications from the server.
     */
    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const notifications = await notificationService.getNotifications();
            console.log('Fetched Notifications:', notifications); // Debugging

            // Filter out notifications with invalid dates
            const validNotifications = notifications.filter(notification => {
                const date = parseUTCDate(notification.date_Received);
                if (!isValid(date)) {
                    console.warn(`Invalid date string: ${notification.date_Received}`);
                }
                return isValid(date);
            });

            // Sort notifications by date_Received descending
            const sortedNotifications = validNotifications.sort((a, b) => {
                const dateA = parseUTCDate(a.date_Received).getTime();
                const dateB = parseUTCDate(b.date_Received).getTime();
                return dateB - dateA;
            });

            setData(sortedNotifications);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch notifications.');
            console.error('Fetch Notifications Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchNotifications();

        // Set up interval to fetch every minute (60000 ms)
        const intervalId = setInterval(() => {
            fetchNotifications();
        }, 60000);

        // Clean up the interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    /**
     * Handler for when a notification is clicked.
     * @param notification The notification that was clicked.
     */
    const handleNotificationClick = (notification: Notification) => {
        setSelectedNotification(notification);
        setNotificationPopupVisible(true);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start();
    };

    /**
     * Closes the notification popup with an animation.
     */
    const closeNotificationPopup = () => {
        Animated.timing(slideAnim, {
            toValue: 100,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            setNotificationPopupVisible(false);
        });
    };

    /**
     * Marks the selected notification as read.
     */
    const markAsRead = async () => {
        if (!selectedNotification) return;

        try {
            await notificationService.markAsRead(selectedNotification.id_Notification);
            // Update the local state to mark as read
            setData((prevData) =>
                prevData.map((item) =>
                    item.id_Notification === selectedNotification.id_Notification
                        ? { ...item, unread: false }
                        : item
                )
            );
            closeNotificationPopup();
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to mark notification as read.');
        }
    };

    /**
     * Filters notifications based on the selected filter.
     */
    const filteredData = filter === "all" ? data : data.filter((item) => item.unread);

    /**
     * Formats the relative time difference between now and the notification time.
     * @param dateString The UTC date string from the server.
     * @returns A string representing how long ago the notification was received.
     */
    const formatRelativeTime = (dateString: string): string => {
        const date = parseUTCDate(dateString);
        if (!isValid(date)) {
            return 'Invalid date';
        }

        const now = new Date();
        const diffInMilliseconds = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMilliseconds / 60000);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hr ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    };

    /**
     * Formats the exact local time of the notification.
     * @param dateString The UTC date string from the server.
     * @returns A formatted string representing the local time.
     */
    const formatExactTime = (dateString: string): string => {
        const date = parseUTCDate(dateString);
        if (!isValid(date)) {
            return 'Invalid date';
        }
        return format(date, 'p, MMM dd, yyyy'); // Example: "3:35 PM, Jan 12, 2025"
    };

    /**
     * Renders each notification item in the FlatList.
     * @param item The notification item to render.
     */
    const renderNotification = ({ item }: { item: Notification }) => (
        <Pressable
            onPress={() => handleNotificationClick(item)}
            style={[styles.notification, item.unread && styles.unreadNotification]}
            accessibilityLabel={`Notification: ${item.notification.title}`}
            accessibilityRole="button"
        >
            {item.unread && <View style={styles.unreadDot} />}
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.notification.title}</Text>
                <Text style={styles.description}>{item.notification.description}</Text>
                <Text style={styles.time}>{formatRelativeTime(item.date_Received)}</Text>
            </View>
        </Pressable>
    );

    /**
     * Displays a loading indicator while notifications are being fetched.
     */
    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading notifications...</Text>
            </View>
        );
    }

    /**
     * Displays an error message if fetching notifications fails.
     */
    if (error) {
        return (
            <View style={[styles.container, styles.errorContainer]}>
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Retry" onPress={fetchNotifications} />
            </View>
        );
    }

    /**
     * Main render of the Notifications component.
     */
    return (
        <TouchableWithoutFeedback>
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.header}>
                    <Text style={styles.headerText}>Notifications</Text>
                    <View style={styles.filters}>
                        <TouchableOpacity onPress={() => setFilter("all")}>
                            <Text style={[styles.filterText, filter === "all" && styles.activeFilterText]}>All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setFilter("unread")}>
                            <Text style={[styles.filterText, filter === "unread" && styles.activeFilterText]}>Unread</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <FlatList
                    data={filteredData}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item.id_Notification.toString()} // Use id_Notification as key
                    contentContainerStyle={{ paddingBottom: 8 }}
                    ListEmptyComponent={<Text style={styles.emptyText}>No notifications to display.</Text>}
                    refreshing={loading}
                    onRefresh={fetchNotifications}
                />

                {/* Notification Popup */}
                <Modal
                    visible={notificationPopupVisible && selectedNotification !== null}
                    transparent
                    animationType="none"
                    onRequestClose={closeNotificationPopup}
                >
                    <TouchableWithoutFeedback onPress={closeNotificationPopup}>
                        <View style={styles.popupOverlay}>
                            <Animated.View style={[styles.popupContent, { transform: [{ translateY: slideAnim }] }]}>
                                <Text style={styles.popupTitle}>{selectedNotification?.notification.title}</Text>
                                <Text style={styles.popupDescription}>{selectedNotification?.notification.description}</Text>
                                <Text style={styles.popupExactTime}>
                                    Received at: {formatExactTime(selectedNotification?.date_Received || '')}
                                </Text>
                                <Button title="OK" onPress={markAsRead} />
                            </Animated.View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
}
