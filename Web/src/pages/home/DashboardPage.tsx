import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Chip,
  Container,
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
  IconButton,
  InputAdornment,
  DialogContentText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Stack
} from "@mui/material";
import { format } from "date-fns";
import InfoIcon from "@mui/icons-material/Info";
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TimerIcon from "@mui/icons-material/Timer";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";
import PeopleIcon from "@mui/icons-material/People";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import CompletedIcon from "@mui/icons-material/Done";
import VotingIcon from "@mui/icons-material/PlayArrow";
import InProgressIcon from "@mui/icons-material/Autorenew";
import UpcomingIcon from "@mui/icons-material/AccessTime";
import { toast } from "react-toastify";

import { authService } from '../../services/authservice';
import { EventService } from '../../services/EventService';
import { apiService } from '../../services/ApiService';

import { User } from '../../models/User';
import { Participant } from '../../models/Participant';
import { EventData } from '../../models/EventData';
import { SingleDay } from '../../models/SingleDay';
import { Vote } from '../../models/Vote';
import { FriendService } from '../../services/FriendService';
import { UserAttendance } from '../../models/UserAttendance';

const api = apiService.getApi();
const friendService = new FriendService(api);
const eventService = new EventService(api);

interface DashboardPageProps {
  darkMode: boolean;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ darkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const yourEventsRef = useRef<HTMLDivElement | null>(null);
  const otherEventsRef = useRef<HTMLDivElement | null>(null);

  const [friends, setFriends] = useState<User[]>();
  const [events, setEvents] = useState<EventData[]>([]);

  // Step3
  const [invitees, setInvitees] = useState<Participant[]>([]);
  const [typedInvite, setTypedInvite] = useState('');

  // Step4
  useEffect(() => {
    if (!location.state) return;
    const { scrollTo } = location.state as { scrollTo?: string };

    const scrollWithOffset = (el: HTMLElement, offset: number) => {
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    };

    if (scrollTo === "yourEvents" && yourEventsRef.current) {
      scrollWithOffset(yourEventsRef.current, 100);
    } else if (scrollTo === "otherEvents" && otherEventsRef.current) {
      scrollWithOffset(otherEventsRef.current, 100);
    }
  }, [location.state]);

  const [open, setOpen] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);

  const [addDayDialogOpen, setAddDayDialogOpen] = useState(false);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetchUserData();
    fetchData();
  }, []);

  function addTypedInvite() {
    if (!typedInvite.trim()) return;
    if (!invitees.find(i => i.email === typedInvite)) {
      if (friends) {
        let friend = friends.find(i => i.email === typedInvite || i.username === typedInvite);
        if (friend)
          setInvitees([...invitees, { id: friend.id_user, username: friend.username, email: friend.email, pfp_url: friend.pfp_url, status: 'pending' }]);
        else {
          toast.error('No friend with this email / username found');
        }
      }
      else {
        toast.error('No friends found');
      }
    }
    setTypedInvite('');
  }

  useEffect(() => {
    const homeTypo = document.getElementById("home-typo");
    if (homeTypo) {
      homeTypo.style.opacity = "1";
    }
    const checkUserData = async () => {
      const result = await authService.getUserData();
      if (!result.success) {
        navigate("/auth/login");
      }
    };
    checkUserData();
  }, [navigate]);

  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isMine, setIsMine] = useState<boolean>(false);
  const [participationStatus, setParticipationStatus] = useState<Record<string, number>>({});

  const [availability, setAvailability] = useState<{
    [key: number]: {
      startTime: Date;
      endTime: Date;
      selectedTimes: Date[];
      isAvailable?: boolean;
      id_date_option: number;
    };
  }>({});

  const [currentDbavailability, setCurrentDbavailability] = useState<{
    [key: number]: {
      startTime: Date;
      endTime: Date;
      selectedTimes: Date[];
      isAvailable?: boolean;
      id_date_option: number;
    }
  }>({});

  async function updateUserEventAttendance(id_event: string, will_attend: number) {
    if (!currentUser) {
      alert('User not logged in');
      return;
    }

    let userAttendance: UserAttendance = {
      id_event: id_event,
      id_user: currentUser.id_user,
      will_attend: will_attend
    };

    let response = await eventService.updateAttendance(userAttendance);
    if (!response.success) {
      alert('Error updating attendance');
    }

    const copy = { ...participationStatus };
    copy[id_event] = will_attend;
    setParticipationStatus(copy);
  }

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editEventId, setEditEventId] = useState('');

  const fetchData = async () => {
    try {
      await fetchUserData();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  function makeDateUTC(date: Date) {
    return new Date(date.toString()[date.toString().length - 1] === 'Z' ? date : date + 'Z');
  }

  function transformEvents(events: EventData[], currentUserId: string) {
    events.forEach(ev => {
      if (!ev.id_user) {
        console.warn(`Event is missing id_user:`, ev);
        ev.id_user = 'unknown';
      }

      ev.date_created = makeDateUTC(ev.date_created);
      ev.date_updated = makeDateUTC(ev.date_updated);
      ev.end_voting_date = makeDateUTC(ev.end_voting_date);

      if (ev.chosen_date_end) {
        ev.chosen_date_end = makeDateUTC(ev.chosen_date_end);
        if (ev.chosen_date_end.getUTCFullYear() < 2000) {
          ev.chosen_date_end = undefined;
        }
      }

      if (ev.chosen_date_start) {
        ev.chosen_date_start = makeDateUTC(ev.chosen_date_start);
        if (ev.chosen_date_start.getUTCFullYear() < 2000) {
          ev.chosen_date_start = undefined;
        }
      }

      ev.date_options = ev.date_options.map(dateOption => ({
        id_date_option: dateOption.id_date_option,
        id_event: dateOption.id_event,
        date_start: makeDateUTC(dateOption.date_start),
        date_end: makeDateUTC(dateOption.date_end),
      }));

      if (ev.invitations) {
        ev.invitations.forEach(inv => {
          const invitedFriend = inv.user;
          if (!invitedFriend || !invitedFriend.id_user) return;
          let status: "pending" | "accepted" | "declined" =
            ev.votes?.some(vote => vote.id_user === invitedFriend.id_user) ? "accepted" : "pending";

          ev.participants = ev.participants || [];
          ev.participants.push({
            id: invitedFriend.id_user,
            email: invitedFriend.email || '',
            username: invitedFriend.username || '',
            pfp_url: invitedFriend.pfp_url || '',
            status: status,
          });

          if (invitedFriend.id_user === currentUserId) {
            const mergedAvailability: { [key: number]: any } = currentDbavailability;

            ev.votes?.forEach(vote => {
              if (vote.id_user === currentUserId) {
                const date_option = ev.date_options.find(
                  dt => dt.id_date_option == vote.id_date_option
                );

                if (date_option) {
                  const dayKey = date_option.id_date_option;

                  if (currentDbavailability[dayKey]) {
                    mergedAvailability[dayKey] = {
                      ...currentDbavailability[dayKey],
                    };
                  } else {
                    const startTime = new Date(date_option.date_start);
                    startTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

                    const endTime = new Date(date_option.date_end);
                    endTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

                    mergedAvailability[dayKey] = {
                      startTime,
                      endTime,
                      selectedTimes: [],
                      isAvailable: vote.status == "accepted",
                      id_date_option: date_option.id_date_option,
                    };
                  }
                }
              }
            });

            setAvailability(mergedAvailability);
            setCurrentDbavailability(mergedAvailability);
          }
        });
      }

      if (ev.user_attendances) {
        ev.user_attendances.forEach((attendance) => {
          if (attendance.id_user == currentUserId) {
            let newParticipations = participationStatus;
            newParticipations[ev.id_event] = attendance.will_attend;
            setParticipationStatus(newParticipations);
          }
        });
      }
    });

    return events;
  }


  const handleCloseVoting = () => {
    setVotingModalOpen(false);
    setAvailability(currentDbavailability);
  }

  const fetchUserData = async () => {
    try {
      const user = await authService.getUserData();
      if (user.success && user.data) {
        setCurrentUser(user.data);

        if (user.data?.id_user) {
          const relationships = await friendService.getFriends(user.data.id_user, 'accepted');
          const friends: User[] = [];

          for (const rel of relationships) {
            const id = rel.id_user === user.data.id_user ? rel.use_id_user : rel.id_user;
            const friend = await friendService.getFriendData(id);

            if (friend) {
              friends.push({
                id_user: friend.id_user,
                username: friend.username,
                email: friend.email,
                pfp_url: friend.pfp_url || '',
              });
            }
          }

          setFriends(friends);

          const eventResponse = await eventService.getMyEvents(user.data.id_user);

          if (eventResponse.success && eventResponse.data) {
            const events = transformEvents(eventResponse.data, user.data.id_user);
            setEvents(events);
          } else {
            console.error('Error fetching events:', eventResponse.error);
          }
        }
      } else {
        navigate('/auth/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      navigate('/auth/login');
    }
  };

  const [votingModalOpen, setVotingModalOpen] = useState<boolean>(false);

  function openEventDetails(e: EventData, mine: boolean) {
    setSelectedEvent(e);
    setIsMine(mine);
    setDetailsModalOpen(true);
  }


  function closeEventDetails() {
    setDetailsModalOpen(false);
    setSelectedEvent(null);
    setIsMine(false);
  }

  function handleVote() {
    if (!selectedEvent) return;
    const initResp: { [key: number]: boolean } = {};
    selectedEvent.date_options.forEach((_, idx) => {
      initResp[idx] = false;
    });
    setVotingResponses(initResp);
    setVotingModalOpen(true);
  }

  function closeVotingModal() {
    setVotingModalOpen(false);
  }

  const [votingResponses, setVotingResponses] = useState<{ [key: number]: boolean }>({});


  async function saveVotingData() {
    // Close the Voting Modal
    setVotingModalOpen(false);
    // Optionally reopen the event details modal if needed:
    setDetailsModalOpen(true);

    // Iterate over each availability entry and process votes
    for (const [key, value] of Object.entries(availability)) {
      const daykey = Number(key);
      let vote: Vote = {
        id_date_option: value.id_date_option,
        id_user: currentUser ? currentUser.id_user : 'undefined',
      };
      let error;

      if (currentDbavailability[daykey]) {
        if (currentDbavailability[daykey].isAvailable !== value.isAvailable) {
          if (value.isAvailable) {
            vote.status = "accepted";
            const response = await eventService.castVote(vote);
            if (!response.success) {
              error = response.error;
            }
          } else {
            vote.status = "declined";
            const response = await eventService.deleteVote(vote);
            if (!response.success) {
              error = response.error;
            }
          }
        }
      } else {
        if (value.isAvailable) {
          vote.status = "accepted";
          const response = await eventService.castVote(vote);
          if (!response.success) {
            error = response.error;
          }
        }
      }

      if (error) {
        console.error('Error saving voting data:', error);
        return;
      }
    }

    // Update the local currentDbavailability to reflect the latest responses
    setCurrentDbavailability(availability);
    toast.success('Voting data saved successfully!', { position: "top-center", autoClose: 2000 });
  }


  const handleAvailabilityResponse = (dayKey: number, isAvailable: boolean) => {
    // 1) Update the local "availability" state
    setAvailability((prevAvailability) => {
      const updated = { ...prevAvailability };
      if (!updated[dayKey]) {
        updated[dayKey] = {
          startTime: new Date(),
          endTime: new Date(),
          selectedTimes: [],
          isAvailable,
          id_date_option: dayKey,
        };
      } else {
        updated[dayKey] = { ...updated[dayKey], isAvailable };
      }
      return updated;
    });

    // 2) Update the selected event’s participants
    setSelectedEvent((prevEvent) => {
      if (!prevEvent) return null;
      const newStatus: "accepted" | "declined" | "pending" = isAvailable ? "accepted" : "declined";
      const updatedParticipants = prevEvent.participants?.map((p) => {
        if (p.email === currentUser?.email) {
          return { ...p, status: newStatus };
        }
        return p;
      });
      return { ...prevEvent, participants: updatedParticipants };
    });

    // 3) Update the global events array to reflect changes on the homepage
    setEvents((prevEvents) =>
      prevEvents.map((evt) => {
        if (evt.id_event === selectedEvent?.id_event) {
          return {
            ...evt,
            participants: evt.participants?.map((p) =>
              p.email === currentUser?.email
                ? { ...p, status: isAvailable ? "accepted" : "declined" }
                : p
            ),
          } as EventData; // Ensure this is cast as EventData
        }
        return evt;
      })
    );

  };


  function openEdit(e: EventData) {
    setIsEditing(true);
    setEditEventId(e.id_event);
    setEventForm({
      title: e.name || '',
      description: e.description || '',
      location: e.location || '',
      days: e.date_options,
      end_voting_date: e.end_voting_date ? new Date(e.end_voting_date) : new Date(),
      invitees: e.invitations?.map(inv => ({
        id: inv.user?.id_user,
        username: inv.user?.username,
        email: inv.user?.email,
        pfp_url: inv.user?.pfp_url,
        status: inv.status || 'pending',
      })) || [],
    });
    setStep(1);
    setOpen(true);
  }

  const [participantsModalOpen, setParticipantsModalOpen] = useState<boolean>(false);

  const openParticipantsModal = () => {
    setParticipantsModalOpen(true);
  };

  const closeParticipantsModal = () => {
    setParticipantsModalOpen(false);
  };


  const [eventForm, setEventForm] = useState<any>({
    title: "",
    description: "",
    location: "",
    days: [],
    end_voting_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to one week later
    invitees: [],
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);


  const handleEditFromDetails = () => {
    if (!selectedEvent) return;
    setDetailsModalOpen(false);
    openEdit(selectedEvent);
    return;
  };

  function getHoursFrom(dateTime: Date) {
    const date = new Date(dateTime);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  function startCreateEvent() {
    setIsEditing(false);
    setStep(1);
    setEventForm({
      title: "",
      description: "",
      location: "",
      days: [],
      end_voting_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      invitees: [],
    });
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setStep(1);
  }

  function handleNext() {
    setStep((prev) => Math.min(prev + 1, 4));
  }

  function handleBack() {
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleSave() {
    // Common Validations
    if (!eventForm.title.trim()) {
      toast.error('Please enter a title for your event.', { position: "top-center", autoClose: 2000 });
      return;
    }
    if (eventForm.days.length === 0) {
      toast.error('Please add at least one day for your event.', { position: "top-center", autoClose: 2000 });
      return;
    }
    if (!eventForm.end_voting_date) {
      toast.error('Please set a voting deadline for your event.', { position: "top-center", autoClose: 2000 });
      return;
    }

    const currentTime = new Date();

    if (isEditing) {
      // Editing Existing Event
      const endVotingTime = new Date(eventForm.end_voting_date);
      if (endVotingTime <= currentTime) {
        toast.error('Please select a valid voting deadline in the future.', { position: "top-center", autoClose: 2000 });
        return;
      }

      const UpdatedEvent = {
        id_event: editEventId,
        id_user: currentUser?.id_user || 'unknown',
        name: eventForm.title,
        description: eventForm.description,
        location: eventForm.location,
        end_voting_date: eventForm.end_voting_date,
        sysrowstate: 1,
        date_options: (eventForm.days as any[]).map(day => ({
          date_start: day.date_start,
          date_end: day.date_end,
          id_date_option: day.id_date_option || 0,
          id_event: day.id_event || 0,
        })),
        participant_ids: eventForm.invitees
          .filter((invite: Participant) => invite.id)
          .map((invite: Participant) => invite.id),
      };

      try {
        const response = await eventService.updateEvent(UpdatedEvent);

        if (response.success && response.data) {
          const updatedEvents = transformEvents([response.data], currentUser?.id_user || '');
          setEvents(events.map(ev => ev.id_event === updatedEvents[0].id_event ? updatedEvents[0] : ev));
          toast.success('Event updated successfully!', { position: "top-center", autoClose: 2000 });
        } else {
          console.error(response.error);
          toast.error('Error updating event. Please try again later.', { position: "top-center", autoClose: 2000 });
        }
      } catch (error) {
        console.error('Error updating event:', error);
        toast.error('Unexpected error. Please try again later.', { position: "top-center", autoClose: 2000 });
      }
    } else {
      // Creating New Event
      const endVotingTime = new Date(eventForm.end_voting_date);
      if (endVotingTime <= currentTime) {
        toast.error('Please select a valid voting deadline in the future.', { position: "top-center", autoClose: 2000 });
        return;
      }

      // Ensure current user is in invitees
      const updatedInvitees = [...eventForm.invitees];
      if (currentUser?.id_user) {
        const isCurrentUserAdded = updatedInvitees.some(inv => inv.id === currentUser.id_user);
        if (!isCurrentUserAdded) {
          updatedInvitees.push({
            id: currentUser.id_user,
            username: currentUser.username,
            email: currentUser.email,
            pfp_url: currentUser.pfp_url || '',
            status: 'pending',
          });
        }
      }

      const newEvt = {
        name: eventForm.title,
        description: eventForm.description,
        location: eventForm.location,
        end_voting_date: eventForm.end_voting_date,
        id_user: currentUser?.id_user || 'unknown',
        date_options: (eventForm.days as any[]).map(day => ({
          date_start: day.date_start,
          date_end: day.date_end,
          id_date_option: day.id_date_option || 0,
          id_event: day.id_event || 0,
        })),
        tag_ids: [], // Add tags if necessary
        participant_ids: updatedInvitees
          .filter((inv: Participant) => inv.id)
          .map((inv: Participant) => inv.id),
      };

      setLoading(true);

      try {
        const response = await eventService.createEvent(newEvt);

        if (response.success && response.data) {
          const createdEvents = transformEvents([response.data], currentUser?.id_user || '');
          setEvents(prev => [...prev, createdEvents[0]]);
          toast.success('Event created successfully!', { position: "top-center", autoClose: 2000 });
        } else {
          console.error(response.error);
          toast.error('Error creating event. Please try again later.', { position: "top-center", autoClose: 2000 });
        }
      } catch (error) {
        console.error('Error creating event:', error);
        toast.error('Unexpected error. Please try again later.', { position: "top-center", autoClose: 2000 });
      } finally {
        setLoading(false);
      }
    }

    handleClose();
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<number | null>(null);


  const handleDeleteClick = (id_event: number | Number) => {
    setDeleteEventId(Number(id_event)); // Convert `Number` to primitive `number`
    setDeleteDialogOpen(true);
  };


  const handleDeleteConfirm = async () => {
    if (deleteEventId === null || !currentUser) {
      toast.error("Invalid event or user details.");
      return;
    }

    try {
      const response = await eventService.deleteEvent(
        Number(deleteEventId), // Ensure deleteEventId is a number
        Number(currentUser.id_user) // Convert currentUser.id_user to a number
      );

      if (response.success) {
        setEvents((prevEvents) =>
          prevEvents.filter((event) => Number(event.id_event) !== Number(deleteEventId))
        );
        toast.success("Event deleted successfully!");
        closeEventDetails();
      } else {
        toast.error("Failed to delete event. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Unexpected error occurred while deleting event.");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteEventId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteEventId(null);
  };

  function handleRemoveDay(index: number) {
    const updatedDays = [...eventForm.days];
    updatedDays.splice(index, 1);
    setEventForm({ ...eventForm, days: updatedDays });
  }

  function getEventStatus(e: EventData): 'voting' | 'upcoming' | 'completed' | 'in progress' {
    const now = Date.now();

    if (e.end_voting_date && e.end_voting_date instanceof Date && e.end_voting_date.getTime() > now) {
      return 'voting';
    }

    if (e.chosen_date_start && e.chosen_date_end) {
      const eventStart = e.chosen_date_start.getTime();
      const eventEnd = e.chosen_date_end.getTime();

      if (now >= eventStart && now <= eventEnd) {
        return 'in progress';
      }

      if (now > eventEnd) {
        return 'completed';
      }
    }

    return 'upcoming';
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "upcoming":
        return <UpcomingIcon />;
      case "voting":
        return <VotingIcon />;
      case "completed":
        return <CompletedIcon />;
      case "in progress":
        return <InProgressIcon />;
      default:
        return <UpcomingIcon />;
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case "voting":
        return "#FF9800";
      case "in progress":
        return "#2196F3";
      case "completed":
        return "#9E9E9E";
      default:
        return "#4CAF50";
    }
  }

  const myEvents = events.filter(e => e.id_user === currentUser?.id_user);
  const otherEvents = events.filter(e => e.id_user !== currentUser?.id_user);

  function addFriendInvite(friend: User) {
    if (!eventForm.invitees.find((i: Participant) => i.email === friend.email)) {
      setEventForm({
        ...eventForm,
        invitees: [
          ...eventForm.invitees,
          {
            id: friend.id_user,
            username: friend.username,
            email: friend.email,
            pfp_url: friend.pfp_url,
            status: 'pending',
          },
        ],
      });
    } else {
      toast.info('Friend already invited.', { position: "top-center", autoClose: 2000 });
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          // background color depending on darkmode
          backgroundColor: darkMode ? '#333' : '#fff',
        }}
      >
        <CircularProgress sx={{ color: "#4CAF50", marginBottom: 2 }} />
        <Typography variant="h6" sx={{ color: darkMode ? '#fff' : '#000' }}>
          Loading, please wait...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ marginTop: 5 }}>
      <Paper elevation={10} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h4" sx={{ textAlign: "center", fontWeight: "bold" }}>
          Hi {currentUser?.username || 'User'}!
        </Typography>
        <Typography variant="body2" align="center" sx={{ fontSize: 16 }}>
          Welcome to your account. Below are your created events.
        </Typography>
      </Paper>

      <div ref={yourEventsRef} style={{ cursor: "pointer" }}>
        <Paper
          elevation={5}
          sx={{
            padding: 2,
            marginBottom: 3,
            backgroundColor: darkMode ? '#333' : '#fff',
            color: darkMode ? '#fff' : '#000',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
            Your Events
          </Typography>
          {myEvents.length === 0 ? (
            <Typography>No events yet. Create one by clicking the "+" button!</Typography>
          ) : (
            <List>
              {myEvents.map((evt, index) => {
                const status = getEventStatus(evt);
                const icon = getStatusIcon(status);
                return (
                  <Paper
                    key={index}
                    elevation={3}
                    sx={{
                      border: "1px solid rgb(116, 117, 116)",
                      borderRadius: "8px",
                      padding: 2,
                      marginBottom: 2,
                      backgroundColor: darkMode ? '#444' : '#f9f9f9',
                      color: darkMode ? '#fff' : '#000',
                      position: "relative",
                    }}
                    onClick={() => openEventDetails(evt, true)}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: getStatusColor(status),
                        borderRadius: "4px",
                        paddingX: 1,
                        paddingY: 0.5,
                      }}
                    >
                      {React.cloneElement(icon, { style: { color: "#fff" } })}
                      <Typography variant="body2" sx={{ color: "#fff", marginLeft: 0.5 }}>
                        {status.toUpperCase()}
                      </Typography>
                    </Box>

                    <ListItem sx={{ flexDirection: "column", alignItems: "flex-start" }}>
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ color: darkMode ? '#fff' : '#000' }}>
                            {evt.name}
                          </Typography>
                        }
                        secondary={
                          <div>
                            <Typography sx={{ display: "flex", alignItems: "center" }}>
                              {evt.description}
                            </Typography>
                            <Typography
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                marginTop: 1,
                              }}
                            >
                              <LocationOnIcon sx={{ marginRight: 1, color: "#4CAF50" }} />
                              <strong>Location:&nbsp;</strong>
                              <Typography component="span">{evt.location}</Typography>
                            </Typography>
                            <Box sx={{ marginTop: 1 }}>
                              <Typography
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginBottom: 1,
                                }}
                              >
                                <TimerIcon sx={{ marginRight: 1, color: "#4CAF50" }} />
                                <strong>Days:</strong>
                              </Typography>
                              <Typography component="div">
                                <ul>
                                  {evt.date_options.map((d, i) => (
                                    <li key={i}>
                                      {format(d.date_start, "dd.MM.yyyy")} (
                                      {getHoursFrom(d.date_start)} - {getHoursFrom(d.date_end)})
                                    </li>
                                  ))}
                                </ul>
                              </Typography>
                            </Box>
                            <Typography
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                marginTop: 1,
                              }}
                            >
                              <PeopleIcon sx={{ marginRight: 1, color: "#4CAF50" }} />
                              <strong>Participants:&nbsp;</strong> {evt.invitations?.length}
                            </Typography>
                            {status === "voting" && (
                              <Typography
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 1,
                                }}
                              >
                                <HowToVoteIcon sx={{ marginRight: 1, color: "#4CAF50" }} />
                                <strong>Voting Ends:&nbsp;</strong>{" "}
                                {format(evt.end_voting_date, "dd.MM.yyyy")} at{" "}
                                {getHoursFrom(evt.end_voting_date)}
                              </Typography>
                            )}
                          </div>
                        }
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}

                      />
                    </ListItem>
                  </Paper>
                );
              })}
            </List>
          )}
        </Paper>
      </div>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this event? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>


      <Box sx={{ textAlign: "center", paddingBottom: 6 }}>
        <Button
          variant="contained"
          sx={{
            fontSize: 24,
            padding: "10px 20px",
            borderRadius: "50%",
            backgroundColor: "#4CAF50",
            color: "#fff",
          }}
          onClick={() => startCreateEvent()}
        >
          +
        </Button>
      </Box>

      <div ref={otherEventsRef} style={{ cursor: "pointer" }}>
        <Paper
          elevation={5}
          sx={{
            padding: 2,
            marginBottom: 3,
            backgroundColor: darkMode ? '#333' : '#fff',
            color: darkMode ? '#fff' : '#000',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
            Other Events
          </Typography>
          {otherEvents.length === 0 ? (
            <Typography>No other events available.</Typography>
          ) : (
            <List>
              {otherEvents.map((evt, index) => {
                const status = getEventStatus(evt);
                const icon = getStatusIcon(status);
                return (
                  <Paper
                    key={index}
                    elevation={3}
                    sx={{
                      border: "1px solid rgb(116, 117, 116)",
                      borderRadius: "8px",
                      padding: 2,
                      marginBottom: 2,
                      backgroundColor: darkMode ? '#444' : '#f9f9f9',
                      color: darkMode ? '#fff' : '#000',
                      position: "relative",
                    }}
                    onClick={() => openEventDetails(evt, false)}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: getStatusColor(status),
                        borderRadius: "4px",
                        paddingX: 1,
                        paddingY: 0.5,
                      }}
                    >
                      {React.cloneElement(icon, { style: { color: "#fff" } })}
                      <Typography variant="body2" sx={{ color: "#fff", marginLeft: 0.5 }}>
                        {status.toUpperCase()}
                      </Typography>
                    </Box>

                    <ListItem sx={{ flexDirection: "column", alignItems: "flex-start" }}>
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ color: darkMode ? '#fff' : '#000' }}>
                            {evt.name}
                          </Typography>
                        }
                        secondary={
                          <div>
                            <Typography sx={{ display: "flex", alignItems: "center" }}>
                              {evt.description}
                            </Typography>
                            <Typography
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                marginTop: 1,
                              }}
                            >
                              <LocationOnIcon sx={{ marginRight: 1, color: "#4CAF50" }} />
                              <strong>Location:&nbsp;</strong>
                              <Typography component="span">{evt.location}</Typography>
                            </Typography>
                            <Box sx={{ marginTop: 1 }}>
                              <Typography
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginBottom: 1,
                                }}
                              >
                                <TimerIcon sx={{ marginRight: 1, color: "#4CAF50" }} />
                                <strong>Days:</strong>
                              </Typography>
                              <Typography component="div">
                                <ul>
                                  {evt.date_options && evt.date_options.length > 0 ? (
                                    evt.date_options.map((d, i) => (
                                      <Typography key={i} component="div">
                                        <li>
                                          {format(d.date_start, "dd.MM.yyyy")} (
                                          {getHoursFrom(d.date_start)} -{" "}
                                          {getHoursFrom(d.date_end)})
                                        </li>
                                      </Typography>
                                    ))
                                  ) : (
                                    <Typography sx={{ marginLeft: 3 }}>N/A</Typography>
                                  )}
                                </ul>
                              </Typography>
                            </Box>
                            <Typography
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                marginTop: 1,
                              }}
                            >
                              <PeopleIcon sx={{ marginRight: 1, color: "#4CAF50" }} />
                              <strong>Participants:&nbsp;</strong> {evt.invitations?.length}
                            </Typography>
                            {status === "voting" && (
                              <Typography
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 1,
                                }}
                              >
                                <HowToVoteIcon sx={{ marginRight: 1, color: "#4CAF50" }} />
                                <strong>Voting Ends:&nbsp;</strong>{" "}
                                {format(evt.end_voting_date, "dd.MM.yyyy")} at{" "}
                                {getHoursFrom(evt.end_voting_date)}
                              </Typography>
                            )}
                          </div>
                        }
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                  </Paper>
                );
              })}
            </List>
          )}
        </Paper>
      </div>

      {/* Create/Edit Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { minHeight: 500 } }}
      >
        <DialogTitle>
          {isEditing
            ? `Edit Event (Step ${step}/4)`
            : `Create Event (Step ${step}/4)`}
        </DialogTitle>

        <DialogContent sx={{ minHeight: 300 }}>
          {step === 1 && (
            <Box>
              <Box display="flex" alignItems="center" marginBottom={2}>
                <InfoIcon sx={{ color: "#4CAF50", marginRight: 1 }} />
                <Typography variant="h6">Basic Info</Typography>
              </Box>
              <TextField
                autoFocus
                margin="dense"
                label="Event Title"
                fullWidth
                variant="outlined"
                value={eventForm.title}
                onChange={(e) =>
                  setEventForm({ ...eventForm, title: e.target.value })
                }
                placeholder="Title"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon sx={{ color: "#4CAF50" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="dense"
                label="Description"
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                value={eventForm.description}
                onChange={(e) =>
                  setEventForm({ ...eventForm, description: e.target.value })
                }
                placeholder="Description"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon sx={{ color: "#4CAF50" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="dense"
                label="Event Location"
                fullWidth
                variant="outlined"
                value={eventForm.location}
                onChange={(e) =>
                  setEventForm({ ...eventForm, location: e.target.value })
                }
                placeholder="Location"
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
              <Box display="flex" alignItems="center" marginBottom={2}>
                <TimerIcon sx={{ color: "#4CAF50", marginRight: 1 }} />
                <Typography variant="h6">Days</Typography>
              </Box>
              {eventForm.days && eventForm.days.length > 0 ? (
                <List>
                  {eventForm.days.map((day: SingleDay, index: number) => (
                    <ListItem key={index} sx={{ borderBottom: "1px solid #ddd", paddingBottom: 2 }}>
                      <ListItemText
                        primary={`Date: ${format(day.date_start, "dd.MM.yyyy")}`}
                        secondary={`Start: ${getHoursFrom(day.date_start)} | End: ${getHoursFrom(day.date_end)}`}
                      />
                      <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveDay(index)}>
                        <CloseIcon style={{ color: "#ff6666" }} />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>


              ) : (
                <Typography variant="body2" sx={{ color: "#9E9E9E", marginBottom: 2 }}>
                  No days added yet.
                </Typography>
              )}


              <Box sx={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
                <Button
                  variant="contained"
                  onClick={() => setAddDayDialogOpen(true)}
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

              {/* Add Day Dialog */}
              <Dialog
                open={addDayDialogOpen}
                onClose={() => setAddDayDialogOpen(false)}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
                  Add Day
                </DialogTitle>
                <DialogContent sx={{ padding: "24px" }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    marginBottom={3}
                  >
                    <Typography>Date</Typography>
                    <TextField
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      sx={{
                        marginLeft: 2,
                        flexGrow: 1,
                        maxWidth: "200px",
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "#4CAF50" },
                          "&:hover fieldset": { borderColor: "#4CAF50" },
                          "&.Mui-focused fieldset": { borderColor: "#4CAF50" },
                        },
                      }}
                    />
                  </Box>

                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    marginBottom={3}
                  >
                    <Typography>Start Time</Typography>
                    <TextField
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      sx={{
                        marginLeft: 2,
                        flexGrow: 1,
                        maxWidth: "200px",
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "#4CAF50" },
                          "&:hover fieldset": { borderColor: "#4CAF50" },
                          "&.Mui-focused fieldset": { borderColor: "#4CAF50" },
                        },
                      }}
                    />
                  </Box>

                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    marginBottom={3}
                  >
                    <Typography>End Time</Typography>
                    <TextField
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      sx={{
                        marginLeft: 2,
                        flexGrow: 1,
                        maxWidth: "200px",
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "#4CAF50" },
                          "&:hover fieldset": { borderColor: "#4CAF50" },
                          "&.Mui-focused fieldset": { borderColor: "#4CAF50" },
                        },
                      }}
                    />
                  </Box>
                </DialogContent>

                <DialogActions
                  sx={{
                    justifyContent: "space-between",
                    padding: "20px",
                  }}
                >
                  <Button
                    onClick={() => setAddDayDialogOpen(false)}
                    sx={{
                      backgroundColor: "#E0E0E0",
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
                      if (!selectedDate || !startTime || !endTime) {
                        toast.error("Please fill in all fields before saving.", {
                          position: "top-center",
                          autoClose: 2000,
                        });
                        return;
                      }
                      const chosenDate = new Date(selectedDate);
                      const now = new Date();
                      chosenDate.setHours(0, 0, 0, 0);
                      now.setHours(0, 0, 0, 0);
                      if (chosenDate < now) {
                        toast.error("Date cannot be in the past.", {
                          position: "top-center",
                          autoClose: 3000,
                        });
                        return;
                      }
                      const [startH, startM] = startTime.split(":").map(Number);
                      const [endH, endM] = endTime.split(":").map(Number);
                      if (startH > endH || (startH === endH && startM >= endM)) {
                        toast.error("Start time must be before end time.", {
                          position: "top-center",
                          autoClose: 3000,
                        });
                        return;
                      }
                      const newDay: SingleDay = {
                        date_start: new Date(`${selectedDate}T${startTime}`),
                        date_end: new Date(`${selectedDate}T${endTime}`),
                        id_date_option: 0,  // Set default or dynamic values as needed
                        id_event: 0,        // Set default or dynamic values as needed
                      };
                      const updatedDays = [...eventForm.days, newDay];
                      setEventForm({ ...eventForm, days: updatedDays });
                      setAddDayDialogOpen(false);
                      toast.success("Day added successfully!", {
                        position: "top-center",
                        autoClose: 2000,
                      });
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
            <Box>
              <Box display="flex" alignItems="center">
                <PersonAddIcon style={{ color: "#4CAF50" }} />
                <Typography variant="body1" style={{ marginLeft: 8 }}>
                  Invite Friends
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" marginTop={2} flexWrap="wrap" gap={1}>
                {friends?.map((friend, index) => (
                  <Chip
                    key={friend.id_user}
                    label={
                      <Typography variant="body1" style={{ fontSize: "1rem" }}>
                        {friend.username}
                      </Typography>
                    }
                    onClick={() => addFriendInvite(friend)}
                    sx={{ margin: 0 }}
                  />
                ))}
              </Box>

              <Box display="flex" alignItems="center" marginTop={2} width="100%" padding={2}>
                <TextField
                  label="Type username/email"
                  variant="outlined"
                  size="small"
                  value={typedInvite}
                  onChange={(e) => setTypedInvite(e.target.value)}
                  style={{ marginRight: 8, flexGrow: 1 }}
                />
                <Button
                  variant="contained"
                  style={{ backgroundColor: "#4CAF50", color: "#fff", height: "40px" }}
                  onClick={addTypedInvite}
                >
                  +
                </Button>
              </Box>

              <Typography variant="h6" style={{ marginTop: 8, marginBottom: 4 }}>
                Invited:
              </Typography>

              <Box
                display="flex"
                flexWrap="wrap"
                gap={1}
                maxHeight="120px"
                overflow="auto"
                sx={{
                  padding: 1,
                  borderRadius: 1,
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#b0b0b0",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "#888",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "#f0f0f0",
                  },
                }}
              >
                {eventForm.invitees.map((user: Participant, index: number) => (
                  <Chip
                    key={index}
                    label={
                      <Typography variant="body1" style={{ fontSize: "1rem" }}>
                        {`${user.username} (${user.email})`}
                      </Typography>
                    }
                    onDelete={() => {
                      const updatedInvitees = [...eventForm.invitees];
                      updatedInvitees.splice(index, 1);
                      setEventForm({ ...eventForm, invitees: updatedInvitees });
                    }}
                    deleteIcon={<CloseIcon style={{ color: "#ff6666" }} />}
                  />
                ))}
              </Box>
            </Box>
          )}

          {step === 4 && (
            <Box>
              <Typography variant="h6" sx={{ marginBottom: 2 }}>
                Voting Deadline
              </Typography>
              <TextField
                label="Voting End Date"
                type="datetime-local"
                value={format(eventForm.end_voting_date, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setEventForm({ ...eventForm, end_voting_date: new Date(e.target.value) })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}>
            {step > 1 && (
              <Button onClick={handleBack} color="primary" disableRipple>
                Back
              </Button>
            )}
            {step === 1 && (
              <Button
                onClick={handleClose} // Call handleClose to cancel and close the dialog
                color="error"
                disableRipple
              >
                Cancel
              </Button>
            )}
            {step < 4 ? (
              <Button onClick={handleNext} color="primary" disableRipple>
                Next
              </Button>
            ) : (
              <Button onClick={handleSave} color="primary" disableRipple>
                Finish
              </Button>
            )}
          </Box>
        </DialogActions>

      </Dialog>


      {/* Event Details Modal */}
      <Dialog
        open={detailsModalOpen}
        onClose={closeEventDetails}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            bgcolor: "background.default",
            color: "text.primary",
            borderRadius: 3,
            boxShadow: 10,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
            pb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {selectedEvent?.name}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={closeEventDetails}
            sx={{
              color: "text.secondary",
              "&:hover": { color: "error.main" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ px: 4, py: 2 }}>
          {selectedEvent && (
            <>
              <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>
                {selectedEvent.description}
              </Typography>
              <Typography sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <LocationOnIcon sx={{ mr: 1, color: "success.main" }} />
                <strong>Location:&nbsp;</strong>
                {selectedEvent.location}
              </Typography>
              <Typography sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <TimerIcon sx={{ mr: 1, color: "success.main" }} />
                <strong>Days:</strong>
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                {selectedEvent.date_options.map((d, idx) => (
                  <li key={idx} style={{ marginBottom: "6px", color: "text.secondary" }}>
                    {format(d.date_start, "dd.MM.yyyy")} ({getHoursFrom(d.date_start)} -{" "}
                    {getHoursFrom(d.date_end)})
                  </li>
                ))}
              </Box>
              <Typography sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <PeopleIcon sx={{ mr: 1, color: "success.main" }} />
                <strong>Participants: {selectedEvent.participants?.length}</strong>
                {selectedEvent?.participants?.length ? (
                  <Button
                    variant="text"
                    onClick={openParticipantsModal}
                    sx={{
                      ml: 2,
                      textTransform: "none",
                      color: "primary.main",
                    }}
                  >
                    View participants
                  </Button>
                ) : null}
              </Typography>
              {getEventStatus(selectedEvent) === "voting" && (
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mt: 2,
                    color: "warning.main",
                  }}
                >
                  <HowToVoteIcon sx={{ mr: 1 }} />
                  <strong>Voting Ends:&nbsp;</strong>
                  {format(selectedEvent.end_voting_date, "dd.MM.yyyy")} at{" "}
                  {getHoursFrom(selectedEvent.end_voting_date)}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: "column",
            alignItems: "stretch",
            gap: 2,
            px: 4,
            py: 2,
            bgcolor: darkMode ? '#333' : '#f9f9f9',
          }}
        >
          {selectedEvent && (
            <>
              {(() => {
                const status = selectedEvent ? getEventStatus(selectedEvent) : "upcoming";
                if (status === "voting") {
                  return (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleVote}
                        sx={{ textTransform: "none" }}
                      >
                        Vote
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={closeEventDetails}
                        sx={{ textTransform: "none", color: "text.secondary" }}
                      >
                        Close
                      </Button>
                    </>
                  );
                } else if (status === "in progress" || status === "upcoming") {
                  return (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Typography align="center">Confirm Participation:</Typography>
                      {participationStatus[selectedEvent.id_event] === 1 ? (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Typography sx={{ mr: 2, color: "success.main" }}>
                            <strong>CONFIRMED</strong>
                          </Typography>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() =>
                              updateUserEventAttendance(selectedEvent.id_event, 0)
                            }
                            sx={{ textTransform: "none" }}
                          >
                            Change to Deny
                          </Button>
                        </Box>
                      ) : participationStatus[selectedEvent.id_event] === 0 ? (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Typography sx={{ mr: 2, color: "error.main" }}>
                            <strong>DENIED</strong>
                          </Typography>
                          <Button
                            variant="outlined"
                            color="success"
                            onClick={() =>
                              updateUserEventAttendance(selectedEvent.id_event, 1)
                            }
                            sx={{ textTransform: "none" }}
                          >
                            Change to Confirm
                          </Button>
                        </Box>
                      ) : (
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() =>
                              updateUserEventAttendance(selectedEvent.id_event, 1)
                            }
                            sx={{ textTransform: "none" }}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() =>
                              updateUserEventAttendance(selectedEvent.id_event, 0)
                            }
                            sx={{ textTransform: "none" }}
                          >
                            Deny
                          </Button>
                        </Box>
                      )}
                    </Box>
                  );
                }
              })()}
            </>
          )}

          {selectedEvent && isMine && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                variant="outlined"
                onClick={handleEditFromDetails}
                sx={{
                  textTransform: "none",
                  color: "info.main",
                  borderColor: "info.main",
                }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleDeleteClick(Number(selectedEvent.id_event))}
                sx={{
                  textTransform: "none",
                }}
              >
                Delete
              </Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>



      {/* Participants Modal */}
      <Dialog
        open={participantsModalOpen}
        onClose={closeParticipantsModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Participants</DialogTitle>
        <DialogContent>
          {selectedEvent?.participants?.length ? (
            <>
              {selectedEvent && getEventStatus(selectedEvent) === "voting" ? (
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Voted: {selectedEvent.participants.filter(p => p.status !== "pending").length}{" | "}
                  Pending: {selectedEvent.participants.filter(p => p.status === "pending").length}
                </Typography>
              ) : (
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Accepted: {selectedEvent.participants.filter(p => p.status === "accepted").length}{" | "}
                  Denied: {selectedEvent.participants.filter(p => p.status === "declined").length}{" | "}
                  Pending: {selectedEvent.participants.filter(p => p.status === "pending").length}
                </Typography>
              )}
              <List>
                {selectedEvent.participants.map((participant) => (
                  <ListItem key={participant.id}>
                    <ListItemAvatar>
                      <Avatar src={participant.pfp_url} alt={participant.username} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${participant.username} (${participant.email})`}
                      secondary={
                        selectedEvent && getEventStatus(selectedEvent) === "voting"
                          ? `Status: ${participant.status !== "pending" ? "Voted" : "Pending"}`
                          : (currentUser && Number(participant.id) === Number(currentUser.id_user))
                            ? `Status: ${participationStatus[selectedEvent.id_event] === 1
                              ? "Accepted"
                              : participationStatus[selectedEvent.id_event] === 0
                                ? "Denied"
                                : "Pending"
                            }`
                            : `Status: ${participant.status}`
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            <Typography>No participants.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeParticipantsModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>




      {/* Voting Modal */}
      <Dialog
        open={votingModalOpen}
        onClose={closeVotingModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            bgcolor: darkMode ? "grey.900" : "background.paper",
            color: darkMode ? "grey.100" : "text.primary",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: darkMode ? "1px solid grey.700" : "1px solid grey.300",
          }}
        >
          <Typography variant="h6">
            Select Availability For {selectedEvent?.name || "Event"}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={closeVotingModal}
            sx={{ color: darkMode ? "grey.400" : "grey.500" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            {selectedEvent &&
              selectedEvent.date_options.map((dayTime) => {
                const dayKey = dayTime.id_date_option;
                const dayName = format(dayTime.date_start, "EEEE");
                const dateLabel = format(dayTime.date_start, "dd.MM.yyyy");
                const hoursStart = getHoursFrom(dayTime.date_start);
                const hoursEnd = getHoursFrom(dayTime.date_end);

                return (
                  <Paper
                    key={dayKey}
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: darkMode ? "grey.800" : "background.paper",
                      color: darkMode ? "grey.100" : "text.primary",
                      borderColor: darkMode ? "grey.700" : "grey.300",
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {dayName}, {dateLabel}: {hoursStart} - {hoursEnd}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Are you available?
                    </Typography>
                    {availability[dayKey] &&
                      typeof availability[dayKey].isAvailable === "boolean" ? (
                      <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                        <Typography>
                          You said:{" "}
                          {availability[dayKey].isAvailable ? (
                            <Typography component="span" color="success.main" fontWeight="bold">YES</Typography>
                          ) : (
                            <Typography component="span" color="error.main" fontWeight="bold">NO</Typography>
                          )}
                        </Typography>
                        <Button
                          variant="text"
                          onClick={() =>
                            handleAvailabilityResponse(
                              dayKey,
                              !availability[dayKey].isAvailable
                            )
                          }
                          sx={{ ml: 2 }}
                        >
                          Change Mind
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => handleAvailabilityResponse(dayKey, true)}
                        >
                          Yes
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleAvailabilityResponse(dayKey, false)}
                        >
                          No
                        </Button>
                      </Box>
                    )}
                  </Paper>
                );
              })}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "flex-end", p: 2 }}>
          <Button onClick={handleCloseVoting} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ textTransform: "none" }}
            onClick={saveVotingData}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>


    </Container >
  );

};

export default DashboardPage;
