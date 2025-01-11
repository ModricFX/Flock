import React, { useEffect, useState } from 'react';
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
import { apiService } from '../services/ApiService';
import { FriendService } from '../services/FriendService';
import { router } from 'expo-router';
import { User } from '../models/User';
import { authService } from '../services/authservice';

interface Friend {
    id: number;
    username: string;
    pfp_url: string;
    email: string;
    status: 'accepted' | 'pending';
}

const api = apiService.getApi();

const friendService = new FriendService(api);

export default function Friends() {
    // Sample friend data
    const [friends, setFriends] = useState<Friend[]>([]);

    useEffect(() => {
            const fetchUserData = async () => {
                try {
                    let user = await authService.getUserData();
                    if (user.success && user.data) {
                    
                        if (user.data?.id_user) {
                            const relationships = await friendService.getFriends(user.data.id_user, 'all');
                            let friends: Friend[] = [];
        
                            for (const rel of relationships) {
                                if(rel.status == 'accepted' || rel.status == 'blocked') {
                                    let id = rel.id_user === user.data.id_user ? rel.use_id_user : rel.id_user;

                                    let friend = await friendService.getFriendData(id);
                                    
                                    if (friend && rel.status != 'blocked') {
                                        friends.push({
                                            id: friend.id_user,
                                            username: friend.username,
                                            email: friend.email,
                                            pfp_url: friend.pfp_url || '',
                                            status: rel.status
                                        });
                                    }
                                }
                                else {
                                    if(rel.use_id_user == user.data.id_user) {
                                        let friend = await friendService.getFriendData(rel.id_user);
                                    
                                        if (friend) {
                                            friends.push({
                                                id: friend.id_user,
                                                username: friend.username,
                                                email: friend.email,
                                                pfp_url: friend.pfp_url || '',
                                                status: rel.status
                                            });
                                        }
                                    }
                                }
                            }
        
                            setFriends(friends);
                        }
                    } else {
                        router.replace('/auth/login');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    router.replace('/auth/login');
                }
            };
        
            fetchUserData();
        }, []);
        

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
    const handleRemoveFriend = async (friendId: number) => {
        let response = await friendService.updateRelationshipStatus(friendId, 'blocked');

        if(response.status == 200) {
            setFriends((prev) => prev.filter((f) => f.id !== friendId));
        } else {
            console.log("failed");
        }
        
        setSelectedFriend(null);
    };

    // Handle ACCEPT (change status to 'accepted')
    const handleAcceptFriend = async (friendId: number) => {
        let response = await friendService.updateRelationshipStatus(friendId, 'accepted');

        if(response.status == 200) {
            setFriends((prev) => prev.map((f) => (f.id === friendId ? { ...f, status: 'accepted' } : f)));
        } else {
            console.log("failed");
        }
        setSelectedFriend(null);
    };

    // Handle DENY (remove from list)
    const handleDenyFriend = async (friendId: number) => {
        let response = await friendService.updateRelationshipStatus(friendId, 'rejected');

        if(response.status == 200) {
            setFriends((prev) => prev.filter((f) => f.id !== friendId));
        } else {
            console.log("failed");
        }
        setSelectedFriend(null);
    };

    // Handle adding a friend -> new friends start in "pending"
    const [alertModalVisible, setAlertModalVisible] = useState(false);
    const [alertText, setAlertText] = useState("");

    const handleAddFriend = async () => {
        if (!newFriendUsername.trim()) return;
        setIsAddModalVisible(false);
        let response = await friendService.sendFriendRequest(newFriendUsername);

        if (response.success) {
            setAlertText("Friend request sent successfully!");
            setAlertModalVisible(true);
        } else {
            setAlertText(response.error? response.error : 'Failed to send friend request.' );
            setAlertModalVisible(true);
        }

        setNewFriendUsername('');
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
                            <Image source={
                                            friend.pfp_url.startsWith('http')
                                                ? { uri: friend.pfp_url }
                                                : require('../../assets/images/default_profile.png')
                                            } style={styles.friendPfp} />
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
                                            source={
                                                selectedFriend.pfp_url.startsWith('http')
                                                    ? { uri: selectedFriend.pfp_url }
                                                    : require('../../assets/images/default_profile.png')
                                            }
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

                {/* Alert Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={alertModalVisible}
                    onRequestClose={() => setAlertModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.addFriendTitle}>{alertText}</Text>
                            <Button
                                title="Ok"
                                onPress={() => setAlertModalVisible(false)}
                            />
                        </View>
                    </View>
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
