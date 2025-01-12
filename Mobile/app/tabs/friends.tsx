// Friends.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    FlatList, // Use FlatList instead of ScrollView
    TouchableOpacity,
    Image,
    Modal,
    Button,
    TextInput,
    Platform,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    RefreshControl, // Import if needed
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/FriendsPageStyles';
import { apiService } from '../services/ApiService';
import { FriendService } from '../services/FriendService';
import { router } from 'expo-router';
import { User } from '../models/User';
import { authService } from '../services/authservice';
import CryptoJS from 'crypto-js';

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
    const [friends, setFriends] = useState<Friend[]>([]);
    const [dataHash, setDataHash] = useState<string>('');
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newFriendUsername, setNewFriendUsername] = useState('');
    const [alertModalVisible, setAlertModalVisible] = useState(false);
    const [alertText, setAlertText] = useState("");
    const [refreshing, setRefreshing] = useState(false); // New state for pull-to-refresh

    const generateHash = (friends: Friend[]): string => {
        const hash = CryptoJS.SHA256(JSON.stringify(friends));
        return hash.toString(CryptoJS.enc.Hex);
    };

    const fetchFriends = async () => {
        try {
            let user = await authService.getUserData();
            if (user.success && user.data) {
                if (user.data?.id_user) {
                    const relationships = await friendService.getFriends(user.data.id_user, 'all');
                    let fetchedFriends: Friend[] = [];

                    for (const rel of relationships) {
                        if (rel.status === 'accepted' || rel.status === 'blocked') {
                            let id = rel.id_user === user.data.id_user ? rel.use_id_user : rel.id_user;
                            let friend = await friendService.getFriendData(id);
                            if (friend && rel.status !== 'blocked') {
                                fetchedFriends.push({
                                    id: friend.id_user,
                                    username: friend.username,
                                    email: friend.email,
                                    pfp_url: friend.pfp_url || '',
                                    status: rel.status as 'accepted' | 'pending', // Ensure type correctness
                                });
                            }
                        } else {
                            if (rel.use_id_user === user.data.id_user) {
                                let friend = await friendService.getFriendData(rel.id_user);
                                if (friend) {
                                    fetchedFriends.push({
                                        id: friend.id_user,
                                        username: friend.username,
                                        email: friend.email,
                                        pfp_url: friend.pfp_url || '',
                                        status: rel.status as 'accepted' | 'pending', // Ensure type correctness
                                    });
                                }
                            }
                        }
                    }

                    const newHash = generateHash(fetchedFriends);
                    if (newHash !== dataHash) {
                        setFriends(fetchedFriends);
                        setDataHash(newHash);
                    }
                }
            } else {
                router.replace('/auth/login');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            router.replace('/auth/login');
        }
    };

    useEffect(() => {
        fetchFriends();
        const intervalId = setInterval(() => {
            fetchFriends();
        }, 60000);
        return () => clearInterval(intervalId);
    }, [dataHash]);

    const handleOpenFriendDetails = (friend: Friend) => {
        setSelectedFriend(friend);
    };

    const handleRemoveFriend = async (friendId: number) => {

        let response = await friendService.updateRelationshipStatus(friendId, 'remove');

        if(response.status == 200) {
            setFriends((prev) => prev.filter((f) => f.id !== friendId));
        } else {
            console.log("Failed to remove friend.");
        }
        setSelectedFriend(null);
    };

    const handleAcceptFriend = async (friendId: number) => {
        let response = await friendService.updateRelationshipStatus(friendId, 'accepted');
        if (response.status === 200) {
            setFriends((prev) => prev.map((f) => (f.id === friendId ? { ...f, status: 'accepted' } : f)));
        } else {
            console.log("Failed to accept friend.");
        }
        setSelectedFriend(null);
    };

    const handleDenyFriend = async (friendId: number) => {
        let response = await friendService.updateRelationshipStatus(friendId, 'rejected');
        if (response.status === 200) {
            setFriends((prev) => prev.filter((f) => f.id !== friendId));
        } else {
            console.log("Failed to deny friend.");
        }
        setSelectedFriend(null);
    };

    const handleAddFriend = async () => {
        if (!newFriendUsername.trim()) return;
        setIsAddModalVisible(false);
        let response = await friendService.sendFriendRequest(newFriendUsername);
        if (response.success) {
            setAlertText("Friend request sent successfully!");
            setAlertModalVisible(true);
        } else {
            setAlertText(response.error ? response.error : 'Failed to send friend request.');
            setAlertModalVisible(true);
        }
        setNewFriendUsername('');
    };

    const sortedFriends = [...friends].sort((a, b) => {
        if (a.status === 'accepted' && b.status === 'pending') return -1;
        if (a.status === 'pending' && b.status === 'accepted') return 1;
        return 0;
    });

    /**
     * Handle pull-to-refresh action
     */
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchFriends();
        setRefreshing(false);
    };

    /**
     * Render each friend item
     */
    const renderFriend = ({ item }: { item: Friend }) => (
        <TouchableOpacity
            key={item.id}
            style={styles.friendCard}
            onPress={() => handleOpenFriendDetails(item)}
        >
            <Image
                source={
                    item.pfp_url.startsWith('http')
                        ? { uri: item.pfp_url }
                        : require('../../assets/images/default_profile.png')
                }
                style={styles.friendPfp}
            />
            <View style={styles.friendInfo}>
                <Text style={styles.friendUsername}>{item.username}</Text>
                <Text style={styles.friendStatus}>
                    {item.status === 'pending' ? 'Pending' : item.email}
                </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Friends</Text>
                </View>
                <FlatList
                    data={sortedFriends}
                    renderItem={renderFriend}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.flatList} // Add style for flex:1
                    contentContainerStyle={[
                        styles.flatListContent,
                        sortedFriends.length === 0 && styles.noFriendsContainer,
                    ]}
                    ListEmptyComponent={
                        <View style={styles.noFriendsContainer}>
                            <Text style={styles.noFriendsText}>You have no friends yet.</Text>
                            <Text style={styles.noFriendsText}>Try adding some!</Text>
                        </View>
                    }
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    // Optional: Add refreshControl if further customization is needed
                    // refreshControl={
                    //     <RefreshControl
                    //         refreshing={refreshing}
                    //         onRefresh={onRefresh}
                    //         colors={['#0000ff']} // Android
                    //         tintColor="#0000ff" // iOS
                    //         title="Refreshing..."
                    //         titleColor="#0000ff"
                    //     />
                    // }
                />
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
