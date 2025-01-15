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
    RefreshControl,
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
        if (!dateString || typeof dateString !== 'string') {
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
        try {
            setError(null);
            const notifications = await notificationService.getNotifications();
            console.log('Fetched Notifications:', notifications); // Debugging

            // Parse and validate dates
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
        const initialFetch = async () => {
            setLoading(true);
            await fetchNotifications();
        };
        initialFetch();

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
    const deleteNotification = async () => {
        if (!selectedNotification) return;

        try {
            await notificationService.deleteNotification(selectedNotification.id_Notification);
            // Update the local state to remove the deleted notification
            setData((prevData) =>
                prevData.filter((item) => item.id_Notification !== selectedNotification.id_Notification)
            );
            closeNotificationPopup();
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete notification.');
            console.error('Delete Notification Error:', err);
        }
    };


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
            console.error('Mark As Read Error:', err);
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
        return format(date, 'd MMM, HH:mm'); // Example: "14 May, 14:30"
    };

    /**
     * Formats the notification description by replacing {date} with the formatted local time.
     * @param description The notification description containing {date}.
     * @returns The formatted description.
     */
    const formatNotificationDescription = (description: string): string => {
        return description.replace(/{(.*?)}/g, (match, p1) => {
            const date = parseUTCDate(p1);
            return isValid(date) ? formatExactTime(p1) : match;
        });
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
                <Text style={styles.description}>{formatNotificationDescription(item.notification.description)}</Text>
                <Text style={styles.time}>{formatRelativeTime(item.date_Received)}</Text>
            </View>
        </Pressable>
    );
    
    /**
     * Displays a loading indicator while notifications are being fetched.
     */
    if (loading && data.length === 0) {
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
    if (error && data.length === 0) {
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
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={fetchNotifications}
                            colors={['#0000ff']} // Android
                            tintColor="#0000ff" // iOS
                            title="Refreshing..."
                            titleColor="#0000ff"
                        />
                    }
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
                                <Text style={styles.popupDescription}>
                                    {formatNotificationDescription(selectedNotification?.notification.description || '')}
                                </Text><Text style={styles.popupExactTime}>
                                    Received at: {formatExactTime(selectedNotification?.date_Received || '')}
                                </Text>
                                <View style={styles.buttonContainer}>
                                    <Button title="Delete" onPress={deleteNotification} />
                                    <Button title="OK" onPress={markAsRead} />
                                </View>
                            </Animated.View>
                        </View>
                    </TouchableWithoutFeedback>

                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
}
