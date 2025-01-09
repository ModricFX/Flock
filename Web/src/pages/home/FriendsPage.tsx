import React, { useState, forwardRef } from 'react';
import { Box, Typography, List, ListItem, Chip, Avatar, Dialog, DialogTitle, DialogContent, DialogContentText, IconButton, Button, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';

const initialParticipants = [
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
    const [participants, setParticipants] = useState(initialParticipants);
    const [selectedFriend, setSelectedFriend] = useState<typeof initialParticipants[0] | null>(null);

    const handleChipClick = (friend: typeof initialParticipants[0]) => {
        setSelectedFriend(friend);
    };

    const handleClose = () => {
        setSelectedFriend(null);
    };

    const handleAccept = () => {
        if (selectedFriend) {
            setParticipants((prevParticipants) =>
                prevParticipants.map((participant) =>
                    participant.email === selectedFriend.email
                        ? { ...participant, status: 'accepted' }
                        : participant
                )
            );
        }
        setSelectedFriend(null);
    };

    const handleDeny = () => {
        if (selectedFriend) {
            setParticipants((prevParticipants) =>
                prevParticipants.filter((participant) => participant.email !== selectedFriend.email)
            );
        }
        setSelectedFriend(null);
    };

    const handleRemoveFriend = () => {
        if (selectedFriend) {
            setParticipants((prevParticipants) =>
                prevParticipants.filter((participant) => participant.email !== selectedFriend.email)
            );
        }
        setSelectedFriend(null);
    };

    return (
        <Box sx={{ padding: '20px' }}>
            <Typography variant="h4" sx={{ textAlign: "center", marginBottom: "20px" }}>Friends</Typography>
            <List>
                {participants.map((participant) => (
                    <ListItem key={participant.email} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Chip
                            label={`${participant.username} (${participant.email}) - ${capitalizeFirstLetter(participant.status)}`}
                            avatar={
                                <Avatar 
                                    src={participant.pfpUrl} 
                                    sx={{ 
                                        width: 60, 
                                        height: 60 
                                    }} 
                                />
                            }
                            variant="filled"
                            sx={{ 
                                marginLeft: '10px',
                                padding: '10px',
                                fontSize: '1rem',
                                height: 'auto',
                                borderRadius: '16px',
                                '& .MuiChip-avatar': {
                                    width: 60,
                                    height: 60,
                                }
                            }}
                            onClick={() => handleChipClick(participant)}
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
                        <CloseIcon sx={{ color: "#ff6666" }}/>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedFriend && (
                        <>
                            <DialogContentText>
                                <strong>Username:</strong> {selectedFriend.username}
                            </DialogContentText>
                            <DialogContentText>
                                <strong>Email:</strong> {selectedFriend.email}
                            </DialogContentText>
                            <DialogContentText>
                                <strong>Status:</strong> {capitalizeFirstLetter(selectedFriend.status)}
                            </DialogContentText>
                            <Avatar 
                                src={selectedFriend.pfpUrl} 
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