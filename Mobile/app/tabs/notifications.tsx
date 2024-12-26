import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    StatusBar,
    Modal,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Pressable,
    Button,
    Animated,
} from 'react-native';

const notifications = [
    { id: "1", title: "Event Reminder", description: "Don't miss the 'Tech Conference' tomorrow!", unread: true, date: new Date(Date.now() - 6000) }, // 6 seconds ago
    { id: "2", title: "Event Cancelled", description: "The event 'Cooking Class' has been cancelled.", unread: false, date: new Date(Date.now() - 6 * 60 * 1000) }, // 6 minutes ago
    { id: "3", title: "Event Reminder", description: "The event 'Charity Run' is happening tomorrow.", unread: true, date: new Date(Date.now() - 17 * 60 * 1000) }, // 17 minutes ago
    { id: "4", title: "Event Starting Soon", description: "The event 'Art Workshop' starts in 30 minutes.", unread: true, date: new Date(Date.now() - 30 * 60 * 1000) }, // 30 minutes ago
    { id: "5", title: "Friend Request", description: "Alice sent you a friend request.", unread: true, date: new Date(Date.now() - 2 * 60 * 60 * 1000) }, // 2 hours ago
    { id: "6", title: "Event Cancelled", description: "The event 'Hackathon' has been cancelled.", unread: false, date: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // 1 day ago
    { id: "7", title: "New Message", description: "You have a new message from Bob.", unread: true, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) }, // 4 days ago
    { id: "8", title: "Event Updated", description: "The event 'Team Meetup' has been rescheduled.", unread: false, date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) }, // 8 days ago
    { id: "9", title: "Friend Request", description: "John sent you a friend request.", unread: false, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }, // 10 days ago
    { id: "10", title: "New Follower", description: "David is now following you.", unread: false, date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }, // 14 days ago
    { id: "11", title: "Achievement Unlocked", description: "Congratulations on completing 10 events!", unread: true, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // 1 month ago
    { id: "12", title: "Friend Joined", description: "Your friend Charlie just joined the app.", unread: false, date: new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000) }, // 2 months ago
];
export default function Notifications() {
    const [data, setData] = useState(notifications);
    const [filter, setFilter] = useState("all");
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<any>(null);
    const [notificationPopupVisible, setNotificationPopupVisible] = useState(false);
    const slideAnim = useState(new Animated.Value(300))[0];

    const handleNotificationClick = (notification: any) => {
        setSelectedNotification(notification);
        setNotificationPopupVisible(true);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeNotificationPopup = () => {
        Animated.timing(slideAnim, {
            toValue: 300,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setNotificationPopupVisible(false);
        });
    };

    const markAsRead = () => {
        setData((prevData) =>
            prevData.map((item) =>
                item.id === selectedNotification.id ? { ...item, unread: false } : item
            )
        );
        closeNotificationPopup();
    };

    const filteredData = filter === "all" ? data : data.filter((item) => item.unread);

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes} min ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hr ago`;
        const days = Math.floor(hours / 24);
        return `${days} days ago`;
    };

    const renderNotification = ({ item }: any) => (
        <Pressable
            onPress={() => handleNotificationClick(item)}
            onLongPress={() => {
                setSelectedNotification(item);
                setPopupVisible(true);
            }}
            style={[styles.notification, item.unread && styles.unreadNotification]}
        >
            {item.unread && <View style={styles.unreadDot} />}
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.time}>{formatTime(item.date)}</Text>
            </View>
        </Pressable>
    );

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
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 8 }}
                />

                <Modal
                    visible={popupVisible && selectedNotification !== null}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setPopupVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setPopupVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setData((prev) =>
                                            prev.map((item) =>
                                                item.id === selectedNotification.id
                                                    ? { ...item, unread: true }
                                                    : item
                                            )
                                        );
                                        setPopupVisible(false);
                                    }}
                                >
                                    <Text style={styles.modalOption}>Mark as Unread</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setData((prev) =>
                                            prev.filter((item) => item.id !== selectedNotification.id)
                                        );
                                        setPopupVisible(false);
                                    }}
                                >
                                    <Text style={styles.modalOption}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                {/* Notification Popup */}
                <Modal
                    visible={notificationPopupVisible && selectedNotification !== null}
                    transparent
                    animationType="none"
                    onRequestClose={closeNotificationPopup}
                >
                    <View style={styles.popupOverlay}>
                        <Animated.View style={[styles.popupContent, { transform: [{ translateY: slideAnim }] }]}>
                            <Text style={styles.popupTitle}>{selectedNotification?.title}</Text>
                            <Text style={styles.popupDescription}>{selectedNotification?.description}</Text>
                            <Button title="OK" onPress={markAsRead} />
                        </Animated.View>
                    </View>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 10,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    headerText: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 10,
    },
    filters: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    filterText: {
        fontSize: 16,
        color: "#555",
    },
    activeFilterText: {
        fontWeight: "600",
        color: "#000",
    },
    notification: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    unreadNotification: {
        backgroundColor: "#e6f7ff",
    },
    unreadDot: {
        width: 10,
        height: 10,
        backgroundColor: "#0A84FF",
        borderRadius: 5,
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
    },
    description: {
        fontSize: 14,
        color: "#555",
    },
    time: {
        fontSize: 12,
        color: "#888",
        marginTop: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        width: "80%",
        alignItems: "center",
    },
    modalOption: {
        fontSize: 16,
        color: "#333",
        marginVertical: 10,
    },
    popupOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    popupContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "80%",
    },
    popupTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    popupDescription: {
        fontSize: 16,
        color: "#555",
        marginBottom: 20,
    },
});
