import React, { useState, forwardRef, useEffect } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    Chip,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    IconButton,
    Button,
    Slide,
    TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authservice";
import { apiService } from "../../services/ApiService";
import { FriendService } from "../../services/FriendService";
import { Friendship } from "../../models/Friendship";

const api = apiService.getApi();
const friendService = new FriendService(api);

interface Friend {
    id: number;
    username: string;
    pfp_url: string;
    email: string;
    status: 'accepted' | 'pending';
}

const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface FriendsPageProps {
    darkMode: boolean;
}

const FriendsPage: React.FC<FriendsPageProps> = ({ darkMode }) => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    const [newFriendInput, setNewFriendInput] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = await authService.getUserData();
                if (user.success && user.data) {
                    const relationships = await friendService.getFriends(user.data.id_user, 'all');
                    const friends = await Promise.all(relationships.map(async (rel: Friendship) => {
                        const id = rel.id_user === user.data.id_user ? rel.use_id_user : rel.id_user;
                        const friend = await friendService.getFriendData(id.toString());
                        return {
                            id: friend.id_user,
                            username: friend.username,
                            email: friend.email,
                            pfp_url: friend.pfp_url || '',
                            status: rel.status
                        };
                    }));
                    setFriends(friends);
                } else {
                    navigate("/auth/login");
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                navigate("/auth/login");
            }
        };
        fetchUserData();
    }, [navigate]);

    const handleChipClick = (friend: Friend) => {
        setSelectedFriend(friend);
    };

    const handleClose = () => {
        setSelectedFriend(null);
    };

    const handleAccept = async () => {
        if (selectedFriend) {
            const response = await friendService.updateRelationshipStatus(selectedFriend.id, 'accepted');
            if (response.status === 200) {
                setFriends((prev) =>
                    prev.map((friend) =>
                        friend.id === selectedFriend.id ? { ...friend, status: 'accepted' } : friend
                    )
                );
            }
            setSelectedFriend(null);
        }
    };

    const handleDeny = async () => {
        if (selectedFriend) {
            const response = await friendService.updateRelationshipStatus(selectedFriend.id, 'rejected');
            if (response.status === 200) {
                setFriends((prev) =>
                    prev.filter((friend) => friend.id !== selectedFriend.id)
                );
            }
            setSelectedFriend(null);
        }
    };

    const handleRemoveFriend = async () => {
        if (selectedFriend) {
            const response = await friendService.updateRelationshipStatus(selectedFriend.id, 'blocked');
            if (response.status === 200) {
                setFriends((prev) =>
                    prev.filter((friend) => friend.id !== selectedFriend.id)
                );
            }
            setSelectedFriend(null);
        }
    };

    const handleAddFriend = async () => {
        // TODO: fix this
        console.log("Adding friend:", newFriendInput);
        if (!newFriendInput.trim()) return;

        let response = await friendService.sendFriendRequest(newFriendInput);

        if (response.success) {
            alert("Friend request sent successfully!");
            // setFriends((prev) => [
            //     ...prev,
            //     {
            //         id: response.data.id_user,
            //         username: response.data.username,
            //         email: response.data.email,
            //         pfp_url: response.data.pfp_url || '',
            //         status: 'pending'
            //     }
            // ]);
        } else {
            alert(response.error? response.error : 'Failed to send friend request.');
        }

        setNewFriendInput('');
    };

    return (
        <Box sx={{ padding: '20px' }}>
            <Typography variant="h4" sx={{ textAlign: "center", marginBottom: "20px" }}>Friends</Typography>
            <Box sx={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
                <TextField
                    label="Friend's Username or Email"
                    variant="outlined"
                    size="small"
                    value={newFriendInput}
                    onChange={(e) => setNewFriendInput(e.target.value)}
                    sx={{ flex: 1, maxWidth: '300px' }}
                />
                <Button variant="contained" onClick={handleAddFriend} sx={{ backgroundColor: '#4CAF50' }}>
                    Add Friend
                </Button>
            </Box>

            <List>
                {friends.map((friend) => (
                    <ListItem key={friend.email} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Chip
                            label={`${friend.username} (${friend.email})${friend.status !== 'accepted' ? ` - ${capitalizeFirstLetter(friend.status)}` : ''}`}
                            avatar={
                                <Avatar
                                    src={friend.pfp_url}
                                    sx={{
                                        width: 60,
                                        height: 60
                                    }}
                                />
                            }
                            variant="filled"
                            sx={{
                                border: '1px solid #ccc',
                                marginLeft: '10px',
                                padding: '10px',
                                fontSize: '1rem',
                                height: 'auto',
                                borderRadius: '16px',
                                backgroundColor: darkMode ? '#333' : '#fff',
                                color: darkMode ? '#fff' : '#000',
                                width: '430px',
                                justifyContent: 'flex-start',
                                '& .MuiChip-avatar': {
                                    width: 60,
                                    height: 60,
                                },
                                boxShadow: darkMode ? "none" : '0 2px 12px rgba(0, 0, 0, 0.1)',
                                '&:hover': {
                                    transform: 'scale(1.03)',
                                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.15)',
                                },
                            }}
                            onClick={() => handleChipClick(friend)}
                        />
                    </ListItem>
                ))}
            </List>
            <Dialog
                maxWidth="xs"
                fullWidth
                open={!!selectedFriend}
                onClose={handleClose}
                TransitionComponent={Transition}
            >
                <DialogTitle variant='h5' sx={{ textAlign: 'center' }}>
                    Friend Information
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon sx={{ color: '#ff6666' }} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center' }}>
                    {selectedFriend && (
                        <>
                            <DialogContentText>
                                <strong>Username:</strong> {selectedFriend.username}
                            </DialogContentText>
                            <DialogContentText>
                                <strong>Email:</strong> {selectedFriend.email}
                            </DialogContentText>
                            {selectedFriend.status === 'pending' && (
                                <DialogContentText sx={{ color: '#f8a202', marginTop: '10px' }}>
                                    This friend request is still pending. Please respond to accept or deny.
                                </DialogContentText>
                            )}
                            <Avatar
                                src={selectedFriend.pfp_url}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    margin: '20px auto'
                                }}
                            />
                            {selectedFriend.status === 'pending' ? (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                    <Button variant="contained" onClick={handleDeny} sx={{ backgroundColor: '#ff6666' }}>
                                        Deny
                                    </Button>
                                    <Button variant="contained" onClick={handleAccept} sx={{ backgroundColor: '#4CAF50' }}>
                                        Accept
                                    </Button>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                    <Button variant="contained" onClick={handleRemoveFriend} sx={{ backgroundColor: '#ff6666' }}>
                                        Remove Friend
                                    </Button>
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default FriendsPage;
