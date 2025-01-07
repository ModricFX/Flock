import React, { useState, useEffect, ChangeEvent } from "react";
import InfoIcon from '@mui/icons-material/Info';
import {
  Avatar,
  Chip,
  Container,
  Drawer,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Toolbar,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { format } from 'date-fns';


import { Link as RouterLink, useNavigate } from "react-router-dom";
import { authService } from '../../services/authservice';
import InboxIcon from "@mui/icons-material/MoveToInbox";
import EventIcon from "@mui/icons-material/Event";//ikona za evente
import DescriptionIcon from "@mui/icons-material/Description"; //ikona za description
import LocationOnIcon from "@mui/icons-material/LocationOn"; //ikona za lokation
import TimerIcon from "@mui/icons-material/Timer"; // Ikona za timer (ura)
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";// Ikona za datum (ura)
import AccessTimeIcon from "@mui/icons-material/AccessTime";// Ikona za uro
import PersonAddIcon from '@mui/icons-material/PersonAdd'; //ikona za dodajanje oseb
import CloseIcon from '@mui/icons-material/Close';

import { DesktopDateTimePicker } from "@mui/x-date-pickers/DesktopDateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
const drawerWidth = 240;

interface Event {
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  description: string;
  location: string;
  participants: number;
  StartHour: number,
  StartMinute: number,
  DeadlineDate: string,
  DeadlineTime: string,
  days?: { date: string; startTime: string; endTime: string }[]; 
}

interface Friend {
  name: string;
  email: string;
}

const DashboardPage: React.FC = () => {

  const [openDialog, setOpenDialog] = useState(false); // State to manage dialog visibility
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(4);
  const [events, setEvents] = useState<Event[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [votingDate, setVotingDate] = useState<Date | null>(null); 
  const [editEventIndex, setEditEventIndex] = useState<number | null>(null);
  const [username, setUsername] = useState<string>('');
  const [invitedUsers, setInvitedUsers] = useState<Friend[]>([]);
  const exampleFriends: Friend[] = [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
    { name: 'Jane', email: 'jane@example.com' }
  ];
  
  const [newEvent, setNewEvent] = useState<Event>({
    title: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    description: "",
    location: "",
    participants: 0,
    StartHour: 0,
    StartMinute: 0,
    DeadlineDate: "",
    DeadlineTime: "",
  });

  const handleAddUser = (friend: Friend) => {
    if (friend.name.trim() && !invitedUsers.some(user => user.email === friend.email)) {
      setInvitedUsers([...invitedUsers, friend]);
      setUsername('');
    }
  };

  const handleRemoveUser = (index: number) => {
    const updatedUsers = invitedUsers.filter((_, i) => i !== index);
    setInvitedUsers(updatedUsers);
  };

 // Handle opening the dialog
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Handle closing the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

   // Handle change in DateTimePicker
   const handleDateTimeChange = (newDate: Date | null) => {
    setVotingDate(newDate);
  };

  const handleRemoveDay = (index: number) => {
    const updatedDays = newEvent.days?.filter((_, i) => i !== index) || [];
    setNewEvent({ ...newEvent, days: updatedDays });
  };

  useEffect(() => {
          const homeTypo = document.getElementById("home-typo");
          if(homeTypo != null)
            homeTypo.style.opacity = "1";
          const checkUserData = async () => {
              const result = await authService.getUserData();
              /*if (!result.success) {
                  navigate("/login");
              }*/
          };
          checkUserData();
      }, [navigate]);

  const handleOpen = (eventIndex: number | null = null): void => {
    if (eventIndex !== null) {
      setEditEventIndex(eventIndex);
      setNewEvent(events[eventIndex]);
    } else {
      setNewEvent({
        title: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        description: "",
        location: "",
        participants: 0,
        StartHour: 0,
        StartMinute: 0,
        DeadlineDate: "",
        DeadlineTime: "",
        days: [],
      });
    }
    setOpen(true);
    setStep(1);
  };

  //KORAKI
  const handleNext = (): void => {
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = (): void => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleClose = (): void => {
    setOpen(false);
    setEditEventIndex(null);
  };

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    type: keyof Event
  ): void => {
    setNewEvent({ ...newEvent, [type]: e.target.value });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, type: keyof Event): void => {
    setNewEvent({ ...newEvent, [type]: e.target.value });
  };

  const handleParticipantsChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setNewEvent({ ...newEvent, participants: parseInt(e.target.value, 10) || 0 });
  };

  const [addDayDialogOpen, setAddDayDialogOpen] = useState(false); // Manage dialog visibility
  const [selectedDate, setSelectedDate] = useState(""); // Track selected date
  /*const handleAddDay = (date: string): void => {
    if (date) {
      console.log("Day added:", date); // Replace with your logic to store the date
    }
  };*/

  const handleSave = (): void => {
    if (
      newEvent.title &&
      newEvent.description &&
      newEvent.location
    ) {
      if (editEventIndex !== null) {
        const updatedEvents = [...events];
        updatedEvents[editEventIndex] = newEvent;
        setEvents(updatedEvents);
      } else {
        setEvents([...events, newEvent]);
      }
      handleClose();
    }
  };

  const [startTime, setStartTime] = useState<string>(""); // Shranjuje začetni čas
  const [endTime, setEndTime] = useState<string>(""); // Shranjuje končni čas
  const handleAddDay = (data: { date: string; startTime: string; endTime: string }) => {
    if (data.date && data.startTime && data.endTime) {
      setNewEvent((prevEvent) => ({
        ...prevEvent,
        days: [...(prevEvent.days || []), data], // Dodaj dan
      }));
    }
  };

  return (
    <Container maxWidth="md" sx={{ marginTop: 5 }}>
      <Paper elevation={10} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h4" sx={{ textAlign: "center", fontWeight: "bold" }}>
          Hi User!
        </Typography>
        <Typography variant="body2" align="center" sx={{ fontSize: 16 }}>
          Welcome to your account. Below are your created events.
        </Typography>
      </Paper>

      <Paper elevation={5} sx={{ padding: 2, marginBottom: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          Your Events
        </Typography>
        {events.length === 0 ? (
          <Typography>No events yet. Create one by clicking the "+" button!</Typography>
        ) : (
          <List>
            {events.map((event, index) => (
              <ListItem key={index} sx={{ flexDirection: "column", alignItems: "flex-start" }}>
                <ListItemText
                  primary={`${event.title} (${event.startDate} ${event.startTime} - ${event.endDate} ${event.endTime})`}
                  secondary={
                    <>
                      <Typography>
                        <strong>Location:</strong> {event.location}
                      </Typography>
                      <Typography>
                        <strong>Description:</strong> {event.description}
                      </Typography>
                      <Typography>
                        <strong>Participants:</strong> {event.participants} people
                      </Typography>
                    </>
                  }
                />
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleOpen(index)}
                  sx={{ marginTop: 2 }}
                >
                  Edit
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Box sx={{ textAlign: "center", marginTop: 3 }}>
        <Button
          variant="contained"
          sx={{ fontSize: 24, padding: "10px 20px", borderRadius: "50%", backgroundColor: '#4CAF50', color: '#fff' }}
          onClick={() => handleOpen()}
        >
          +
        </Button>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editEventIndex !== null ? `Edit Event (Step ${step}/4)` : `Create Event (Step ${step}/4)`}</DialogTitle>
        <DialogContent>
        {step === 1 && (
            <Box>
                {/* basic info */}
                <Box display="flex" alignItems="center" marginBottom={2}>
                  <InfoIcon sx={{ color: "#4CAF50", marginRight: 1 }} />
                  <Typography variant="h6">Basic Info</Typography>
                </Box>

                {/* title */}
                <TextField
                  autoFocus
                  margin="dense"
                  label="Event Title"
                  fullWidth
                  variant="outlined"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventIcon sx={{ color: "#4CAF50" }}/>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* description */}
                <TextField
                  margin="dense"
                  label="Description"
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon sx={{ color: "#4CAF50" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* location */}
                <TextField
                  autoFocus
                  margin="dense"
                  label="Event Location"
                  fullWidth
                  variant="outlined"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: "#4CAF50" }} />
                      </InputAdornment>
                    ),
                  }}
                />
            </Box>
            
        )}

        {step === 2 && (
          <Box>
            {/* Section Title */}
            <Box display="flex" alignItems="center" marginBottom={2}>
              <DescriptionIcon sx={{ color: "#4CAF50", marginRight: 1 }} />
              <Typography variant="h6">Days</Typography>
            </Box>

            {/* Display Existing Days */}
            {newEvent.days && newEvent.days.length > 0 ? (
              <List>
                {newEvent.days.map((day, index) => (
                  <ListItem key={index} sx={{ borderBottom: "1px solid #ddd", paddingBottom: 2 }}>
                    <ListItemText
                      primary={`Date: ${day.date}`}
                      secondary={`Start: ${day.startTime} | End: ${day.endTime}`}
                    />
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveDay(index)}>
                    <CloseIcon style={{ color: '#ff6666' }} />
                  </IconButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" sx={{ color: "#9E9E9E", marginBottom: 2 }}>
                No days added yet.
              </Typography>
            )}

            {/* Add Day Button */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "16px",
              }}
            >
              <Button
                variant="contained"
                onClick={() => setAddDayDialogOpen(true)} // Open dialog for adding a day
                sx={{
                  backgroundColor: "#4CAF50",
                  color: "#fff",
                  textTransform: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#388E3C",
                  },
                }}
              >
                + Add Day
              </Button>
            </Box>

            {/* Dialog for Adding Day */}
            <Dialog
              open={addDayDialogOpen}
              onClose={() => setAddDayDialogOpen(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>Add Day</DialogTitle>
              <DialogContent sx={{ padding: "24px" }}>
                {/* Date Picker */}
                <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom={3}>
                  <Typography>Date</Typography>
                  <TextField
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    sx={{
                      marginLeft: 2,
                      flexGrow: 1,
                      maxWidth: '200px',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#4CAF50',
                        },
                        '&:hover fieldset': {
                          borderColor: '#4CAF50',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4CAF50',
                        },
                      },
                    }}
                  />
                </Box>

                {/* Start Time Picker */}
                <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom={3}>
                  <Typography>Start Time</Typography>
                  <TextField
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    sx={{
                      marginLeft: 2,
                      flexGrow: 1,
                      maxWidth: '200px',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#4CAF50',
                        },
                        '&:hover fieldset': {
                          borderColor: '#4CAF50',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4CAF50',
                        },
                      },
                    }}
                  />
                </Box>

                {/* End Time Picker */}
                <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom={3}>
                  <Typography>End Time</Typography>
                  <TextField
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    sx={{
                      marginLeft: 2,
                      flexGrow: 1,
                      maxWidth: '200px',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#4CAF50',
                        },
                        '&:hover fieldset': {
                          borderColor: '#4CAF50',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4CAF50',
                        },
                      },
                    }}
                  />
                </Box>

              </DialogContent>
              <DialogActions sx={{ justifyContent: "space-between", paddingBottom: "16px", paddingLeft: "20px", padding: "20px" }}>
                <Button
                  onClick={() => setAddDayDialogOpen(false)}
                  sx={{
                    backgroundColor: "#E0E0E0", // Gray button
                    color: "#000",
                    textTransform: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    "&:hover": {
                      backgroundColor: "#BDBDBD",
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const newDay = { date: selectedDate, startTime, endTime };
                    const updatedDays = [...(newEvent.days || []), newDay];
                    setNewEvent({ ...newEvent, days: updatedDays }); // Add new day to the event
                    setAddDayDialogOpen(false); // Close dialog
                  }}
                  sx={{
                    backgroundColor: "#4CAF50",
                    color: "#fff",
                    textTransform: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    "&:hover": {
                      backgroundColor: "#388E3C",
                    },
                    marginLeft: "16px",
                  }}
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {step === 3 && (
          <>
            <Box display="flex" alignItems="center">
              <PersonAddIcon style={{ color: '#4CAF50' }}/>
              <Typography variant="body1" style={{ marginLeft: 8 }}>
                Invite Friends
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" marginTop={2}>
              {exampleFriends.map((friend, index) => (
                <Chip
                  key={index}
                  label={<Typography variant="body1" style={{ fontSize: '1rem' }}>{friend.name}</Typography>}
                  onClick={() => handleAddUser(friend)}
                  style={{ margin: 4 }}
                />
              ))}
            </Box>
            <Box display="flex" alignItems="center" marginTop={2} width="100%" padding={2}>
              <TextField
                label="Type username/email"
                variant="outlined"
                size="small"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ marginRight: 8, flexGrow: 1 }}
              />
              <Button variant="contained" style={{ backgroundColor: '#4CAF50', color: '#fff', height: '40px' }} onClick={() => handleAddUser({ name: username, email: username })}>
                +
              </Button>
            </Box>
            <Typography variant="h6" style={{ marginTop: 8, marginBottom: 4 }}>
              Invited:
            </Typography>
            <Box display="flex" flexDirection="column" alignItems="flex-start" marginTop={1} width="100%" padding={1}>
              {invitedUsers.map((user, index) => (
                <Chip
                  key={index}
                  label={<Typography variant="body1" style={{ fontSize: '1rem' }}>{`${user.name} (${user.email})`}</Typography>}
                  onDelete={() => handleRemoveUser(index)}
                  deleteIcon={<CloseIcon style={{ color: '#ff6666' }} />}
                  style={{ margin: 3, maxWidth: 'fit-content' }}
                />
              ))}
            </Box>
          </>
        )}

        {step === 4 && (
          <div>
          <Box display="flex" alignItems="center" marginY={2}>
            <CalendarMonthIcon style={{ marginRight: 8, color: "#4caf50" }} />
            <Typography variant="subtitle1">Voting Deadline</Typography>
          </Box>

          <Box display="flex" alignItems="center">
            <EventIcon style={{ marginRight: 8, color: "#4caf50" }} />
            <Typography variant="body1" onClick={handleOpenDialog} style={{ cursor: "pointer" }}>
              Pick deadline
            </Typography>
          </Box>

          {/* Dialog Popup */}
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Set Voting Deadline</DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <TextField
                  margin="dense"
                  label="DeadlineDate"
                  type="date"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                  value={newEvent.DeadlineDate}
                  onChange={(e) => handleDateChange(e, "DeadlineDate")}
                />
                <TextField
                  margin="dense"
                  label="DeadlineTime"
                  type="time"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                  value={newEvent.DeadlineTime}
                  onChange={(e) => handleDateChange(e, "DeadlineTime")}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Cancel
              </Button>
              <Button onClick={handleCloseDialog} color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </div>
        )}

        </DialogContent>
        <DialogActions>
          {step == 1 && (
            <Button onClick={handleClose} color="primary" sx={{ textTransform: 'none', marginRight: 'auto' }} >
              Cancel
            </Button>
          )}

          {step > 1 && (
            <Button onClick={handleBack} color="primary" sx={{ textTransform: 'none',  marginRight: 'auto' }}>
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button onClick={handleNext} color="primary" sx={{ textTransform: 'none' }}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSave} color="primary" sx={{ textTransform: 'none' }}>
              Finish
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DashboardPage;