import React, { useState } from 'react';
import {
    View,
    Text,
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

/* IMPORT STYLES */
import styles from '../styles/FriendsPageStyles';

interface Friend {
    id: string;
    username: string;
    pfp: string;
    email: string;
    status: 'accepted' | 'pending';
}

export default function Friends() {
    // Sample friend data
    const [friends, setFriends] = useState<Friend[]>([
        {
            id: '1',
            username: 'JohnDoe',
            pfp: 'https://i.pravatar.cc/100?img=12',
            email: 'johndoe@gmail.com',
            status: 'accepted',
        },
        {
            id: '2',
            username: 'JaneSmith',
            pfp: 'https://i.pravatar.cc/100?img=28',
            email: 'janesmith@gmail.com',
            status: 'accepted',
        },
        {
            id: '3',
            username: 'ModricFX',
            pfp: 'https://i.pravatar.cc/100?img=36',
            email: 'modricfx@gmail.com',
            status: 'pending',
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

    // Handle ACCEPT (change status to 'accepted')
    const handleAcceptFriend = (friendId: string) => {
        setFriends((prev) =>
            prev.map((f) =>
                f.id === friendId ? { ...f, status: 'accepted' } : f
            )
        );
        setSelectedFriend(null);
    };

    // Handle DENY (remove from list)
    const handleDenyFriend = (friendId: string) => {
        setFriends((prev) => prev.filter((f) => f.id !== friendId));
        setSelectedFriend(null);
    };

    // Handle adding a friend -> new friends start in "pending"
    const handleAddFriend = () => {
        if (!newFriendUsername.trim()) return;

        const newFriend: Friend = {
            id: Math.random().toString(),
            username: newFriendUsername,
            pfp: 'https://i.pravatar.cc/100?img=60', // Or some default image
            email: newFriendUsername + '@gmail.com', // Or some default email
            status: 'pending', // newly added friend is pending
        };

        setFriends((prev) => [newFriend, ...prev]);
        setNewFriendUsername('');
        setIsAddModalVisible(false);
    };

    // Sort friends so 'accepted' are on top and 'pending' at the bottom
    const sortedFriends = [...friends].sort((a, b) => {
        if (a.status === 'accepted' && b.status === 'pending') return -1;
        if (a.status === 'pending' && b.status === 'accepted') return 1;
        return 0;
    });

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerText}>Friends</Text>
                </View>

                {/* Friends List */}
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {sortedFriends.map((friend) => (
                        <TouchableOpacity
                            key={friend.id}
                            style={styles.friendCard}
                            onPress={() => handleOpenFriendDetails(friend)}
                        >
                            <Image source={{ uri: friend.pfp }} style={styles.friendPfp} />
                            <View style={styles.friendInfo}>
                                <Text style={styles.friendUsername}>{friend.username}</Text>
                                {/* If status is pending, show "Pending", else show the email */}
                                <Text style={styles.friendStatus}>
                                    {friend.status === 'pending' ? 'Pending' : friend.email}
                                </Text>
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
                                        <Text style={styles.modalUsername}>
                                            {selectedFriend.username}
                                        </Text>
                                        <Text style={styles.modalStatus}>
                                            E-mail: {selectedFriend.email}
                                        </Text>

                                        <View style={styles.modalActions}>
                                            {/* If friend is pending, show Accept/Deny; otherwise Remove/Close */}
                                            {selectedFriend.status === 'pending' ? (
                                                <>
                                                    <Button
                                                        title="Deny"
                                                        color="red"
                                                        onPress={() =>
                                                            handleDenyFriend(selectedFriend.id)
                                                        }
                                                    />
                                                    <Button
                                                        title="Accept"
                                                        onPress={() =>
                                                            handleAcceptFriend(selectedFriend.id)
                                                        }
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        title="Remove Friend"
                                                        color="red"
                                                        onPress={() =>
                                                            handleRemoveFriend(selectedFriend.id)
                                                        }
                                                    />
                                                    <Button
                                                        title="Close"
                                                        onPress={() => setSelectedFriend(null)}
                                                    />
                                                </>
                                            )}
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
