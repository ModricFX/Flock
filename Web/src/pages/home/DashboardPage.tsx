import React, { useState, useEffect, ChangeEvent, useRef,forwardRef,useImperativeHandle } from "react";
import YourEvents from "./YourEvents";
import AllEvents from "./AllEvents";
import Notifications from "./Notifications";
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
import PeopleIcon from '@mui/icons-material/People';//ikona ljudle
import HowToVoteIcon from '@mui/icons-material/HowToVote';//ikona vote

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
  deadline?: { date: string; DeadlineTime: string}[]; 
}

interface Friend {
  name: string;
  email: string;
}

const DashboardPage = forwardRef((props, ref) => {

  //skrolanje
  const yourEventsRef = useRef<HTMLDivElement | null>(null);
  const otherEventsRef = useRef<HTMLDivElement | null>(null);

  // Scroll functions
  useImperativeHandle(ref, () => ({
    scrollToOtherEvents: () => {
      console.log("Scrolling to other events section");
      if (otherEventsRef.current) {
        otherEventsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    },
    scrollToYourEvents: () => {
      console.log("Scrolling to your events section");
      if (yourEventsRef.current) {
        yourEventsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    },
  }));



  const [events, setEvents] = useState<Event[]>([]);
  const [otherEvents, setOtherEvents] = useState<Event[]>([
    {
      title: "Other Event 1",
      startDate: "2025-01-10",
      startTime: "10:00",
      endDate: "2025-01-10",
      endTime: "12:00",
      description: "An interesting event organized by someone else.",
      location: "Park",
      participants: 15,
      StartHour: 0,
      StartMinute: 0,
      DeadlineDate: "",
      DeadlineTime: ""
    },
    {
      title: "Other Event 2",
      startDate: "2025-01-12",
      startTime: "14:00",
      endDate: "2025-01-12",
      endTime: "16:00",
      description: "Another event you might be interested in.",
      location: "Library",
      participants: 20,
      StartHour: 0,
      StartMinute: 0,
      DeadlineDate: "",
      DeadlineTime: ""
    },
  ]);


  const [openDialog, setOpenDialog] = useState(false); // State to manage dialog visibility
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(4);
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

  const handleRemoveDeadline = (index: number) => {
    const updatedDeadline = newEvent.deadline?.filter((_, i) => i !== index) || [];
    setNewEvent({ ...newEvent, deadline: updatedDeadline });
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
        deadline: [],
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

  const [addDeadlineDialogOpen, setAddDeadlineDialogOpen] = useState(false); // Manage dialog visibility
  const [selectedDeadline, setSelectedDeadlineDate] = useState(""); // Track selected date
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

  const [DeadlineTime, setDeadlineTime] = useState<string>(""); // Shranjuje deadline čas

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

       {/* Other Events Section */}
       <div ref={otherEventsRef}>
        <Paper elevation={5} sx={{ padding: 2, marginBottom: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
            Other Events
          </Typography>
          {otherEvents.length === 0 ? (
            <Typography>No events available from others.</Typography>
          ) : (
            <List>
              {otherEvents.map((event, index) => (
                <Paper
                  key={index}
                  elevation={3}
                  sx={{ marginBottom: 2, padding: 2, backgroundColor: "#f5f5f5" }}
                >
                  <ListItem sx={{ flexDirection: "column", alignItems: "flex-start" }}>
                    <ListItemText
                      primary={`${event.title} (${event.startDate} ${event.startTime} - ${event.endDate} ${event.endTime})`}
                      secondary={
                        <Typography component="span">
                          <Box>
                            <strong>Location:</strong> {event.location}
                            <br />
                            <strong>Description:</strong> {event.description}
                            <br />
                            <strong>Participants:</strong> {event.participants}
                          </Box>
                        </Typography>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          )}
        </Paper>
       </div>
       

      {/* Your Events Section */}
      <div ref={yourEventsRef}>
        <Paper elevation={5} sx={{ padding: 2, marginBottom: 3,}}>
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
                    primary={`${event.title}`}
                    secondary={
                      <>
                        <Typography>
                          <strong>Description: </strong> {event.description}
                        </Typography>
                        <Typography sx={{ display: "flex", alignItems: "center", marginTop: 1 }}>
                          <EventIcon sx={{ color: "#4CAF50", marginRight: "8px" }} />
                          <strong>Voting Ends:  {" "}
                            {format(new Date(selectedDeadline), "dd.MM.yyyy")} at {DeadlineTime}
                          </strong>
                        </Typography>
                        <Typography sx={{ display: "flex", alignItems: "center", marginTop: 1 }}>
                          <LocationOnIcon sx={{ color: "#4CAF50", marginRight: "8px" }} />
                          <strong>Location:{" "}
                            {event.location}
                          </strong>
                        </Typography>
                        <Typography sx={{ display: "flex", alignItems: "center", marginTop: 1 }}>
                        <PeopleIcon sx={{ color: "#4CAF50", marginRight: "8px" }} />     
                          <strong>Participants: </strong> {event.participants} Participants
                        </Typography>
                        <Typography sx={{ display: "flex", alignItems: "center", marginTop: 1 }}>
                          <HowToVoteIcon sx={{ color: "#4CAF50", marginRight: "8px" }} />
                          <strong>Your Vote: </strong>
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
      </div> 

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





          {/* Display Existing Days */}
          {newEvent.deadline && newEvent.deadline.length > 0 ? (
              <List>
                {newEvent.deadline.map((deadline, index) => (
                  <ListItem key={index} sx={{ borderBottom: "1px solid #ddd", paddingBottom: 2 }}>
                    <ListItemText
                      primary={`Date: ${deadline.date}`}
                      secondary={`Start: ${deadline.DeadlineTime}`}
                    />
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveDeadline(index)}>
                    <CloseIcon style={{ color: '#ff6666' }} />
                  </IconButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" sx={{ color: "#9E9E9E", marginBottom: 2 }}>
                <Box display="flex" alignItems="center">
                  <EventIcon style={{ marginRight: 8, color: "#4caf50" }} />
                  <Typography variant="body1" onClick={() => setAddDeadlineDialogOpen(true)} style={{ cursor: "pointer" }}>
                    Pick deadline
                  </Typography>
                </Box>
              </Typography>
            )}

          {/* Dialog Popup */}
          <Dialog open={addDeadlineDialogOpen} onClose={()=> setAddDeadlineDialogOpen}>
            <DialogTitle>Set Voting Deadline</DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <TextField
                  type="date"
                  value={selectedDeadline}
                  onChange={(e) => setSelectedDeadlineDate(e.target.value)}
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
                <TextField
                  type="time"
                  value={DeadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
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
            <DialogActions>
              <Button 
                onClick={() => setAddDeadlineDialogOpen(false)}
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
                  const newDeadline = { date: selectedDeadline, DeadlineTime };
                  const updatedDeadline = [...(newEvent.deadline || []), newDeadline];
                  setNewEvent({ ...newEvent, deadline: updatedDeadline }); // Add new day to the event
                  setAddDeadlineDialogOpen(false); // Close dialog
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
});

export default DashboardPage;