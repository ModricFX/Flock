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
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [notificationPopupVisible, setNotificationPopupVisible] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const slideAnim = useRef(new Animated.Value(100)).current; // Use useRef for Animated.Value

    // Function to fetch notifications
    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const notifications = await notificationService.getNotifications();
            // Sort by date_Received descending
            const sortedNotifications = notifications.sort((a, b) => new Date(b.date_Received).getTime() - new Date(a.date_Received).getTime());
            setData(sortedNotifications);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch notifications.');
            console.error(err);
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

    const handleNotificationClick = (notification: Notification) => {
        setSelectedNotification(notification);
        setNotificationPopupVisible(true);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start();
    };

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
     * Marks the selected notification as read by calling the NotificationService
     * and updates the local state to reflect the change.
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
            console.error(err);
        }
    };

    const filteredData = filter === "all" ? data : data.filter((item) => item.unread);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes} min ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hr ago`;
        const days = Math.floor(hours / 24);
        return `${days} days ago`;
    };

    const renderNotification = ({ item }: { item: Notification }) => (
        <Pressable
            onPress={() => handleNotificationClick(item)}
            style={[styles.notification, item.unread && styles.unreadNotification]}
        >
            {item.unread && <View style={styles.unreadDot} />}
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.notification.title}</Text>
                <Text style={styles.description}>{item.notification.description}</Text>
                <Text style={styles.time}>{formatTime(item.date_Received)}</Text>
            </View>
        </Pressable>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading notifications...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.errorContainer]}>
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Retry" onPress={fetchNotifications} />
            </View>
        );
    }

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
                    <View style={styles.popupOverlay}>
                        <Animated.View style={[styles.popupContent, { transform: [{ translateY: slideAnim }] }]}>
                            <Text style={styles.popupTitle}>{selectedNotification?.notification.title}</Text>
                            <Text style={styles.popupDescription}>{selectedNotification?.notification.description}</Text>
                            <Button title="OK" onPress={markAsRead} />
                        </Animated.View>
                    </View>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
}
