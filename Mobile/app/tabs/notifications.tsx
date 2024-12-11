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
} from 'react-native';


// Example notifications data
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
    const [menuVisible, setMenuVisible] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<any>(null); // Track the selected notification for options

    const handleNotificationClick = (notification: any) => {
        console.log("Clicked notification: ", notification);
        setData((prevData) =>
            prevData.map((item) =>
                item.id === notification.id ? { ...item, unread: false } : item
            )
        );
    };

    const markAllAsRead = () => {
        setData((prevData) =>
            prevData.map((item) => ({ ...item, unread: false }))
        );
        setMenuVisible(false);
    };

    const markAsUnread = () => {
        setData((prevData) =>
            prevData.map((item) =>
                item.id === selectedNotification?.id ? { ...item, unread: true } : item
            )
        );
        setSelectedNotification(null);
    };

    const deleteNotification = () => {
        setData((prevData) =>
            prevData.filter((item) => item.id !== selectedNotification?.id)
        );
        setSelectedNotification(null);
    };

    const filteredData = filter === "all" ? data : data.filter((item) => item.unread);

    const formatTime = (date: string) => {
        const now = new Date();
        const notificationDate = new Date(date);
        const diff = now.getTime() - notificationDate.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);

        if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
        if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
        if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
        if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
        if (minutes > 0) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
        return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
    };

    const renderNotification = ({ item }: any) => (
        <View style={styles.notificationView}>
            <Pressable
                onPress={() => {
                    handleNotificationClick(item);
                    setMenuVisible(false);
                }}
                onLongPress={() => {
                    setSelectedNotification(item);
                    setPopupVisible(true); // Show the options menu
                }}
                android_ripple={{ color: "#bcbcbc", borderless: true }}
                style={styles.notification}>
                {item.unread && <View style={styles.unreadDot} />}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
                <View pointerEvents="none">
                    <Text style={[styles.time, item.unread && styles.unreadTime]}>{formatTime(item.date)}</Text>
                </View>
            </Pressable>
        </View>
    );

    return (
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View style={styles.container}>
                <StatusBar backgroundColor="#f9f9f9" barStyle="dark-content" translucent={false} />
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => {
                            setFilter("all");
                            setMenuVisible(false);
                        }}
                        style={[styles.tagButton, filter === "all" && styles.activeTagButton]}
                    >
                        <Text style={styles.tagButtonText}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setFilter("unread");
                            setMenuVisible(false);
                        }}
                        style={[styles.tagButton, filter === "unread" && styles.activeTagButton]}
                    >
                        <Text style={styles.tagButtonText}>Unread</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => setMenuVisible(!menuVisible)}
                    >
                        <Text style={styles.menuDots}>...</Text>
                    </TouchableOpacity>
                </View>
                {menuVisible && (
                    <View style={styles.menu}>
                        <TouchableOpacity onPress={markAllAsRead}>
                            <Text style={styles.menuOption}>Mark All as Read</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <FlatList
                    data={filteredData}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 8 }}  // Add padding after the last notification
                />

                {/* Popup Modal for notification options (Mark as unread, Delete) */}
                <Modal
                    visible={popupVisible && selectedNotification !== null}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setPopupVisible(false)}
                    // terrific solution, but I'm not wasting another 3 hours figuring out how to properly fix this
                    onShow={() => {
                        StatusBar.setBackgroundColor("#636363");
                        StatusBar.setBarStyle("light-content");
                        } // Darken the status bar
                    }
                    onDismiss={() => {
                        StatusBar.setBackgroundColor("#f9f9f9");
                        StatusBar.setBarStyle("dark-content");
                        } // Reset status bar
                    }
                >
                    <TouchableWithoutFeedback onPress={() => setPopupVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <TouchableOpacity onPress={markAsUnread}>
                                    <Text style={styles.modalOption}>Mark as unread</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={deleteNotification}>
                                    <Text style={styles.modalOption}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
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
        flexDirection: "row",
        marginVertical: 8,
    },
    menuButton: {
        marginLeft: "auto",
    },
    menuDots: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#555",
        marginRight: 24,
    },
    menu: {
        position: "absolute",
        top: 55,
        right: 10,
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 6,
        elevation: 8,  // Android shadow
        shadowColor: "#000",  // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        zIndex: 10,
    },
    menuOption: {
        fontSize: 16,
        color: "#333",
        padding: 6,
    },
    notification: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 15,
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
        fontWeight: "bold",
        fontSize: 16,
        color: "#333",
    },
    description: {
        fontSize: 14,
        color: "#555",
    },
    time: {
        fontSize: 12,
        color: "#888",
    },
    unreadTime: {
        color: "#0A84FF",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    modalContent: {
        backgroundColor: "#fff",
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 10,
        width: "60%",
    },
    modalOption: {
        fontSize: 16,
        marginVertical: 16,
        color: "#333",
    },
    tagButton: {
        paddingVertical: 7,
        paddingHorizontal: 18,
        borderRadius: 24,
        backgroundColor: "#cdcdcd",
        marginLeft: 12,
    },
    activeTagButton: {
        backgroundColor: "#4CAF50",
    },
    tagButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        textAlign: "center",
    },
    notificationView: {
        alignSelf: 'stretch',
        justifyContent: 'center',
        borderRadius: 8,
        elevation: 3,  // Android shadow
        shadowColor: '#000',  // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        margin: 5,
        marginHorizontal: 10,
    }
});
