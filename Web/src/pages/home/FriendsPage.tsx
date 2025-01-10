import React, { useState, forwardRef } from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';

const FriendList = [
    {
        username: "MyUser",
        email: "myuser@domain.com",
        status: "pending",
        pfpUrl: "https://i.pravatar.cc/100?img=12",
    },
    {
        username: "Alice",
        email: "alice@example.com",
        status: "pending",
        pfpUrl: "https://i.pravatar.cc/100?img=28",
    },
    {
        username: "Bob",
        email: "bob@example.com",
        status: "accepted",
        pfpUrl: "https://i.pravatar.cc/100?img=36",
    },
];

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

const FriendsPage: React.FC = () => {
    const [FriendListArray, setFriendsList] = useState(FriendList);
    const [selectedFriend, setSelectedFriend] = useState<typeof FriendList[0] | null>(null);

    const handleChipClick = (friend: typeof FriendList[0]) => {
        setSelectedFriend(friend);
    };

    const handleClose = () => {
        setSelectedFriend(null);
    };

    const handleAccept = () => {
        if (selectedFriend) {
            setFriendsList((prevParticipants) =>
                prevParticipants.map((friend) =>
                    friend.email === selectedFriend.email
                        ? { ...friend, status: 'accepted' }
                        : friend
                )
            );
        }
        setSelectedFriend(null);
    };

    const handleDeny = () => {
        if (selectedFriend) {
            setFriendsList((prevParticipants) =>
                prevParticipants.filter((friend) => friend.email !== selectedFriend.email)
            );
        }
        setSelectedFriend(null);
    };

    const handleRemoveFriend = () => {
        if (selectedFriend) {
            setFriendsList((prevParticipants) =>
                prevParticipants.filter((friend) => friend.email !== selectedFriend.email)
            );
        }
        setSelectedFriend(null);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                padding: '40px',
            }}
        >
            <Typography
                variant="h4"
                sx={{
                    textAlign: "center",
                    marginBottom: "30px",
                    fontWeight: 700,
                    color: '#333',
                }}
            >
                Friends
            </Typography>
            <List
                sx={{
                    maxWidth: '600px',
                    margin: '0 auto',
                }}
            >
                {FriendListArray.map((friend) => (
                    <ListItem
                        key={friend.email}
                        sx={{
                            display: 'flex',
                            // Align items to the left instead of center
                            justifyContent: 'flex-start',
                            marginBottom: '16px',
                        }}
                    >
                        <Chip
                            label={`${friend.username} (${friend.email}) ${friend.status === 'pending' ? '- Pending' : ''}`}
                            avatar={
                                <Avatar
                                    src={friend.pfpUrl}
                                    sx={{
                                        width: 60,
                                        height: 60,
                                    }}
                                />
                            }
                            variant="filled"
                            sx={{
                                justifyContent: 'flex-start',
                                minWidth: '85%',
                                padding: '10px 16px',
                                fontSize: '1rem',
                                height: 'auto',
                                borderRadius: '24px',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                backgroundColor: '#fff',
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                                '&:hover': {
                                    transform: 'scale(1.03)',
                                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.15)',
                                },
                                '& .MuiChip-avatar': {
                                    width: 60,
                                    height: 60,
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
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        padding: '8px',
                    },
                }}
            >
                <DialogTitle
                    variant="h5"
                    sx={{
                        textAlign: 'center',
                        fontWeight: 700,
                        position: 'relative',
                    }}
                >
                    Friend Information
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 16,
                            top: 16,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon sx={{ color: "#ff6666" }} />
                    </IconButton>
                </DialogTitle>
                <DialogContent
                    sx={{
                        textAlign: 'center',
                        overflowY: 'auto',
                    }}
                >
                    {selectedFriend && (
                        <>
                            <DialogContentText sx={{ mb: 1 }}>
                                <strong>Username:</strong> {selectedFriend.username}
                            </DialogContentText>
                            <DialogContentText sx={{ mb: 1 }}>
                                <strong>Email:</strong> {selectedFriend.email}
                            </DialogContentText>
                            
                            {selectedFriend.status === 'pending' && (
                                <DialogContentText sx={{ mb: 2 }}>
                                    <strong>Status:</strong> {capitalizeFirstLetter(selectedFriend.status)}
                                </DialogContentText>
                            )}

                            {selectedFriend.status === 'pending' && (
                                <DialogContentText sx={{ mb: 2, color: 'orange', textAlign: 'center' }}>
                                    This friend request is still pending. Please respond to accept or deny.
                                </DialogContentText>
                            )}

                            <Avatar
                                src={selectedFriend.pfpUrl}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    margin: '20px auto',
                                }}
                            />

                            {selectedFriend.status === 'pending' ? (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleDeny}
                                        sx={{
                                            backgroundColor: '#ff6666',
                                            '&:hover': { backgroundColor: '#ff4d4d' },
                                        }}
                                    >
                                        Deny
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleAccept}
                                        sx={{
                                            backgroundColor: '#4CAF50',
                                            '&:hover': { backgroundColor: '#43A047' },
                                        }}
                                    >
                                        Accept
                                    </Button>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleRemoveFriend}
                                        sx={{
                                            backgroundColor: '#ff6666',
                                            '&:hover': { backgroundColor: '#ff4d4d' },
                                        }}
                                    >
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
