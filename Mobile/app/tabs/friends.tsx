import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Modal,
    Button,
    TextInput,
    Platform,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Friend {
    id: string;
    username: string;
    pfp: string;
    email: string;
}

export default function Friends() {
    // Sample friend data
    const [friends, setFriends] = useState<Friend[]>([
        {
            id: '1',
            username: 'JohnDoe',
            pfp: 'https://i.pravatar.cc/100?img=12',
            email: 'johndoe@gmail.com',
        },
        {
            id: '2',
            username: 'JaneSmith',
            pfp: 'https://i.pravatar.cc/100?img=28',
            email: 'janesmith@gmail.com',
        },
        {
            id: '3',
            username: 'ModricFX',
            pfp: 'https://i.pravatar.cc/100?img=36',
            email: 'modricfx@gmail.com',
        },
    ]);

    // Modal for showing friend details
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

    // Modal for adding a friend
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newFriendUsername, setNewFriendUsername] = useState('');

    // Handle opening friend details
    const handleOpenFriendDetails = (friend: Friend) => {
        setSelectedFriend(friend);
    };

    // Handle removing a friend
    const handleRemoveFriend = (friendId: string) => {
        setFriends((prev) => prev.filter((f) => f.id !== friendId));
        setSelectedFriend(null);
    };

    // Handle adding a friend
    const handleAddFriend = () => {
        if (!newFriendUsername.trim()) return;
        const newFriend: Friend = {
            id: Math.random().toString(),
            username: newFriendUsername,
            pfp: 'https://i.pravatar.cc/100?img=60', // Or some default image
            email: newFriendUsername + '@gmail.com', // Or some default email
        };
        setFriends((prev) => [newFriend, ...prev]);
        setNewFriendUsername('');
        setIsAddModalVisible(false);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerText}>Friends</Text>
                </View>

                {/* Friends List */}
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {friends.map((friend) => (
                        <TouchableOpacity
                            key={friend.id}
                            style={styles.friendCard}
                            onPress={() => handleOpenFriendDetails(friend)}
                        >
                            <Image source={{ uri: friend.pfp }} style={styles.friendPfp} />
                            <View style={styles.friendInfo}>
                                <Text style={styles.friendUsername}>{friend.username}</Text>
                                <Text style={styles.friendStatus}>{friend.email}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#999" />
                        </TouchableOpacity>
                    ))}

                    {friends.length === 0 && (
                        <View style={styles.noFriendsContainer}>
                            <Text style={styles.noFriendsText}>You have no friends yet.</Text>
                            <Text style={styles.noFriendsText}>Try adding some!</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Floating Action Button to add a Friend */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setIsAddModalVisible(true)}
                >
                    <MaterialIcons name="add" size={28} color="white" />
                </TouchableOpacity>

                {/* Friend Details Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={!!selectedFriend}
                    onRequestClose={() => setSelectedFriend(null)}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                {selectedFriend && (
                                    <>
                                        <Image
                                            source={{ uri: selectedFriend.pfp }}
                                            style={styles.modalPfp}
                                        />
                                        <Text style={styles.modalUsername}>{selectedFriend.username}</Text>
                                        <Text style={styles.modalStatus}>E-mail: {selectedFriend.email}</Text>

                                        <View style={styles.modalActions}>
                                            <Button
                                                title="Remove Friend"
                                                color="red"
                                                onPress={() => handleRemoveFriend(selectedFriend.id)}
                                            />
                                            <Button
                                                title="Close"
                                                onPress={() => setSelectedFriend(null)}
                                            />
                                        </View>
                                    </>
                                )}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                {/* Add Friend Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isAddModalVisible}
                    onRequestClose={() => setIsAddModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        style={styles.modalOverlay}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.addFriendTitle}>Add a new friend</Text>
                                <TextInput
                                    style={styles.addFriendInput}
                                    placeholder="Enter friend's username/email"
                                    placeholderTextColor="#999"
                                    value={newFriendUsername}
                                    onChangeText={setNewFriendUsername}
                                />

                                <View style={styles.modalActions}>
                                    <Button
                                        title="Cancel"
                                        color="red"
                                        onPress={() => {
                                            setIsAddModalVisible(false);
                                            setNewFriendUsername('');
                                        }}
                                    />
                                    <Button title="Add" onPress={handleAddFriend} />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
}

// ---- STYLES ----
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    // Header
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
    // Scroll Content
    scrollContent: {
        padding: 16,
    },
    // Friend Card
    friendCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginBottom: 12,
        padding: 12,
        borderRadius: 8,

        // Shadow (iOS)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // Shadow (Android)
        elevation: 2,
    },
    friendPfp: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    friendInfo: {
        flex: 1,
    },
    friendUsername: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
        color: '#333',
    },
    friendStatus: {
        fontSize: 12,
        color: '#888',
    },
    noFriendsContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    noFriendsText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    // FAB
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
    // Modal Overlay
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Modal Container
    modalContainer: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,

        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    // Friend Modal
    modalPfp: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginBottom: 12,
    },
    modalUsername: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 6,
    },
    modalStatus: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    // Add Friend
    addFriendTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
    },
    addFriendInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        fontSize: 14,
        color: '#333',
    },
});
