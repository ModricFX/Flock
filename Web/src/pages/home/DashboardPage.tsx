import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
} from "react";
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
} from "@mui/material";
import { format } from "date-fns";
import { authService } from "../../services/authservice";

import InfoIcon from "@mui/icons-material/Info";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TimerIcon from "@mui/icons-material/Timer";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";
import PeopleIcon from "@mui/icons-material/People";
import HowToVoteIcon from "@mui/icons-material/HowToVote";

import CompletedIcon from "@mui/icons-material/Done";
import VotingIcon from "@mui/icons-material/PlayArrow";
import InProgressIcon from "@mui/icons-material/Autorenew";
import UpcomingIcon from "@mui/icons-material/AccessTime";

interface Participant {
  username: string;
  email: string;
  pfpUrl: string;
  status: "pending" | "accepted" | "declined";
}

interface SingleDay {
  dateStart: Date;
  dateEnd: Date;
}

interface EventData {
  id_event: string;
  name: string;
  description: string;
  location: string;
  end_voting_date: Date;
  id_user: string;
  date_options: SingleDay[];
  participants: Participant[];
  eventDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  votes?: Record<string, any>;
}

const initialOtherEvents: EventData[] = [
  {
    id_event: "evt-1",
    id_user: "1",
    name: "My Birthday Party",
    description: "Pizza and cake!",
    location: "My House",
    date_options: [
      {
        dateStart: new Date(2024, 0, 15, 8, 0),
        dateEnd: new Date(2024, 0, 15, 11, 0),
      },
    ],
    participants: [
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
    ],
    end_voting_date: new Date(Date.now() + 1000 * 60 * 60 * 24),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id_event: "evt-2",
    id_user: "u-004",
    name: "Yoga Retreat",
    description: "Relaxing yoga for all levels",
    location: "Health & Wellness Center",
    date_options: [
      {
        dateStart: new Date(2024, 1, 5, 9, 0),
        dateEnd: new Date(2024, 1, 5, 12, 0),
      },
    ],
    participants: [
      {
        username: "MyUser",
        email: "myuser@domain.com",
        status: "pending",
        pfpUrl: "https://i.pravatar.cc/100?img=36",
      },
      {
        username: "Charlie",
        email: "charlie@example.com",
        status: "pending",
        pfpUrl: "https://i.pravatar.cc/100?img=28",
      },
    ],
    end_voting_date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 48),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id_event: "evt-3",
    id_user: "u-004",
    name: "Test event",
    description: "Testing the events",
    location: "Home alone",
    date_options: [
      {
        dateStart: new Date(2024, 1, 5, 9, 0),
        dateEnd: new Date(2024, 1, 5, 13, 0),
      },
      {
        dateStart: new Date(2024, 1, 6, 15, 0),
        dateEnd: new Date(2024, 1, 6, 20, 0),
      },
    ],
    participants: [
      {
        username: "MyUser",
        email: "myuser@domain.com",
        status: "pending",
        pfpUrl: "https://i.pravatar.cc/100?img=11",
      },
      {
        username: "Charlie",
        email: "charlie@example.com",
        status: "pending",
        pfpUrl: "https://i.pravatar.cc/100?img=10",
      },
      {
        username: "Bob1",
        email: "bob@gmail.com",
        status: "declined",
        pfpUrl: "https://i.pravatar.cc/100?img=08",
      },
      {
        username: "Bob2",
        email: "bob@gmail.com",
        status: "accepted",
        pfpUrl: "https://i.pravatar.cc/100?img=08",
      },
      {
        username: "Bob3",
        email: "bob@gmail.com",
        status: "accepted",
        pfpUrl: "https://i.pravatar.cc/100?img=08",
      },
      {
        username: "Bob4",
        email: "bob@gmail.com",
        status: "accepted",
        pfpUrl: "https://i.pravatar.cc/100?img=08",
      },
      {
        username: "Bob5",
        email: "bob@gmail.com",
        status: "accepted",
        pfpUrl: "https://i.pravatar.cc/100?img=08",
      },
      {
        username: "Bob6",
        email: "bob@gmail.com",
        status: "accepted",
        pfpUrl: "https://i.pravatar.cc/100?img=08",
      },
      {
        username: "Bob7",
        email: "bob@gmail.com",
        status: "accepted",
        pfpUrl: "https://i.pravatar.cc/100?img=08",
      },
      {
        username: "Bob8",
        email: "bob@gmail.com",
        status: "accepted",
        pfpUrl: "https://i.pravatar.cc/100?img=08",
      },
      {
        username: "Bob9",
        email: "bob@gmail.com",
        status: "accepted",
        pfpUrl: "https://i.pravatar.cc/100?img=08",
      },
      {
        username: "Bob10",
        email: "bob@gmail.com",
        status: "accepted",
        pfpUrl: "https://i.pravatar.cc/100?img=08",
      },
    ],
    end_voting_date: new Date(Date.now() + 1000 * 60 * 60 * 2),
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 48),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id_event: "evt-4",
    id_user: "u-003",
    name: "Beach Day",
    description: "Fun in the sun!",
    location: "Sunny Beach",
    date_options: [
      {
        dateStart: new Date(2024, 1, 5, 9, 0),
        dateEnd: new Date(2024, 1, 5, 12, 0),
      },
    ],
    participants: [
      {
        username: "MyUser",
        email: "myuser@domain.com",
        status: "pending",
        pfpUrl: "https://i.pravatar.cc/100?img=07",
      },
      {
        username: "Bob",
        email: "bob@gmail.com",
        status: "accepted",
        pfpUrl: "https://i.pravatar.cc/100?img=06",
      },
    ],
    end_voting_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    eventDate: new Date(Date.now() - 1000 * 60 * 60 * 48),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id_event: "evt-5",
    id_user: "u-002",
    name: "Neki Day",
    description: "Fun",
    location: "House apartment",
    date_options: [
      {
        dateStart: new Date(2024, 1, 5, 9, 0),
        dateEnd: new Date(2024, 1, 5, 12, 0),
      },
    ],
    participants: [
      {
        username: "MyUser",
        email: "myuser@domain.com",
        status: "pending",
        pfpUrl: "https://i.pravatar.cc/100?img=05",
      },
      {
        username: "Bob",
        email: "bob@gmail.com",
        status: "accepted",
        pfpUrl: "https://i.pravatar.cc/100?img=04",
      },
    ],
    end_voting_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    eventDate: new Date(Date.now() - 500 * 60),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

interface Friend {
  name: string;
  email: string;
}

const DashboardPage = forwardRef((_props, _ref) => {
  const location = useLocation();
  const navigate = useNavigate();

  const yourEventsRef = useRef<HTMLDivElement | null>(null);
  const otherEventsRef = useRef<HTMLDivElement | null>(null);

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

  const [myEvents, setMyEvents] = useState<EventData[]>([
    {
      id_event: "evt-1",
      id_user: "u-001",
      name: "Team Meeting",
      description: "Monthly team catch-up and planning session.",
      location: "Office Room 101",
      date_options: [
        {
          dateStart: new Date(2024, 0, 10, 10, 0),
          dateEnd: new Date(2024, 0, 10, 11, 30),
        },
      ],
      participants: [
        {
          username: "Alice",
          email: "alice@example.com",
          status: "accepted",
          pfpUrl: "https://i.pravatar.cc/100?img=1",
        },
        {
          username: "Bob",
          email: "bob@example.com",
          status: "pending",
          pfpUrl: "https://i.pravatar.cc/100?img=2",
        },
      ],
      end_voting_date: new Date(Date.now() + 1000 * 60 * 60 * 24),
      eventDate: new Date(2024, 0, 10, 10, 0),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id_event: "evt-2",
      id_user: "u-002",
      name: "Yoga Session",
      description: "Relax and unwind with a guided yoga session.",
      location: "Community Hall",
      date_options: [
        {
          dateStart: new Date(2024, 0, 12, 18, 0),
          dateEnd: new Date(2024, 0, 12, 19, 30),
        },
      ],
      participants: [
        {
          username: "Jane",
          email: "jane@example.com",
          status: "accepted",
          pfpUrl: "https://i.pravatar.cc/100?img=3",
        },
        {
          username: "Charlie",
          email: "charlie@example.com",
          status: "declined",
          pfpUrl: "https://i.pravatar.cc/100?img=4",
        },
      ],
      end_voting_date: new Date(Date.now() + 1000 * 60 * 60 * 48),
      eventDate: new Date(2024, 0, 12, 18, 0),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id_event: "evt-3",
      id_user: "u-004",
      name: "Test Event",
      description: "Testing new event management features.",
      location: "Home Alone",
      date_options: [
        {
          dateStart: new Date(2024, 1, 5, 9, 0),
          dateEnd: new Date(2024, 1, 5, 13, 0),
        },
        {
          dateStart: new Date(2024, 1, 6, 15, 0),
          dateEnd: new Date(2024, 1, 6, 20, 0),
        },
      ],
      participants: [
        {
          username: "MyUser",
          email: "myuser@domain.com",
          status: "pending",
          pfpUrl: "https://i.pravatar.cc/100?img=5",
        },
        {
          username: "Charlie",
          email: "charlie@example.com",
          status: "pending",
          pfpUrl: "https://i.pravatar.cc/100?img=6",
        },
        {
          username: "Bob",
          email: "bob@example.com",
          status: "accepted",
          pfpUrl: "https://i.pravatar.cc/100?img=7",
        },
      ],
      end_voting_date: new Date(Date.now() + 1000 * 60 * 60 * 2),
      eventDate: new Date(Date.now() + 1000 * 60 * 60 * 48),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const [others, setOthers] = useState<EventData[]>(initialOtherEvents);

  const [open, setOpen] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [editEventIndex, setEditEventIndex] = useState<number | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [addDayDialogOpen, setAddDayDialogOpen] = useState(false);
  const [addDeadlineDialogOpen, setAddDeadlineDialogOpen] = useState(false);

  const [username, setUsername] = useState("");
  const [invitedUsers, setInvitedUsers] = useState<Friend[]>([]);
  const exampleFriends: Friend[] = [
    { name: "Alice", email: "alice@example.com" },
    { name: "Bob", email: "bob@example.com" },
    { name: "Jane", email: "jane@example.com" },
  ];

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDeadline, setSelectedDeadlineDate] = useState("");
  const [DeadlineTime, setDeadlineTime] = useState("");

  const [newEvent, setNewEvent] = useState<any>({
    title: "",
    description: "",
    location: "",
    days: [],
    deadline: [],
  });

  useEffect(() => {
    const homeTypo = document.getElementById("home-typo");
    if (homeTypo) {
      homeTypo.style.opacity = "1";
    }
    const checkUserData = async () => {
      const result = await authService.getUserData();
    };
    checkUserData();
  }, [navigate]);

  const handleOpen = (eventIndex: number | null = null): void => {
    if (eventIndex !== null) {
      setEditEventIndex(eventIndex);
      setNewEvent(myEvents[eventIndex]);
    } else {
      setNewEvent({
        title: "",
        description: "",
        location: "",
        days: [],
        deadline: [],
      });
    }
    setStep(1);
    setOpen(true);
  };

  function getHoursFrom(dateTime: Date) {
    const date = new Date(dateTime);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  const handleClose = (): void => {
    setOpen(false);
    setEditEventIndex(null);
  };

  const handleNext = (): void => {
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = (): void => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSave = (): void => {
    if (newEvent.title && newEvent.description && newEvent.location) {
      if (editEventIndex !== null) {
        const updated = [...myEvents];
        updated[editEventIndex] = newEvent;
        setMyEvents(updated);
      } else {
        setMyEvents([...myEvents, newEvent]);
      }
      handleClose();
    }
  };

  const handleRemoveDay = (index: number) => {
    const updatedDays = [...newEvent.days];
    updatedDays.splice(index, 1);
    setNewEvent({ ...newEvent, days: updatedDays });
  };

  const handleRemoveDeadline = (index: number) => {
    const updatedDeadline = [...newEvent.deadline];
    updatedDeadline.splice(index, 1);
    setNewEvent({ ...newEvent, deadline: updatedDeadline });
  };

  const handleAddUser = (friend: Friend) => {
    if (friend.name.trim() && !invitedUsers.some((user) => user.email === friend.email)) {
      setInvitedUsers([...invitedUsers, friend]);
      setUsername("");
    }
  };

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

  function getEventStatus(e: EventData): "voting" | "upcoming" | "completed" | "in progress" {
    const now = Date.now();

    if (e.end_voting_date && e.end_voting_date.getTime() > now) {
      return "voting";
    }

    if (e.eventDate) {
      const eventStart = e.eventDate.getTime();
      const eventEnd = eventStart + 3 * 60 * 60 * 1000;

      if (now >= eventStart && now <= eventEnd) {
        return "in progress";
      }
      if (now > eventEnd) {
        return "completed";
      }
    }
    return "upcoming";
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

      <div ref={yourEventsRef}>
        <Paper elevation={5} sx={{ padding: 2, marginBottom: 3 }}>
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
                      backgroundColor: "#f9f9f9",
                      position: "relative",
                    }}
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
                          <Typography variant="h6" sx={{ color: "#000" }}>
                            {evt.name}
                          </Typography>
                        }
                        secondary={
                          <>
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
                              <ul>
                                {evt.date_options && evt.date_options.length > 0 ? (
                                  evt.date_options.map((d, i) => (
                                    <Typography key={i}>
                                      <li>
                                        {format(d.dateStart, "dd.MM.yyyy")} ({getHoursFrom(d.dateStart)} -{" "}
                                        {getHoursFrom(d.dateEnd)})
                                      </li>
                                    </Typography>
                                  ))
                                ) : (
                                  <Typography sx={{ marginLeft: 3 }}>N/A</Typography>
                                )}
                              </ul>
                            </Box>
                            <Typography
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                marginTop: 1,
                              }}
                            >
                              <PeopleIcon sx={{ marginRight: 1, color: "#4CAF50" }} />
                              <strong>Participants:&nbsp;</strong> {evt.participants ? evt.participants.length : 0}
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
                                {format(evt.end_voting_date, "dd.MM.yyyy")} at {getHoursFrom(evt.end_voting_date)}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  </Paper>
                );
              })}
            </List>
          )}
        </Paper>
      </div>

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
          onClick={() => handleOpen()}
        >
          +
        </Button>
      </Box>

      <div ref={otherEventsRef}>
        <Paper elevation={5} sx={{ padding: 2, marginBottom: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
            Other Events
          </Typography>
          {others.length === 0 ? (
            <Typography>No events available from others.</Typography>
          ) : (
            <List>
              {others.map((evt, index) => {
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
                      backgroundColor: "#f9f9f9",
                      position: "relative",
                    }}
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
                          <Typography variant="h6" sx={{ color: "#000" }}>
                            {evt.name}
                          </Typography>
                        }
                        secondary={
                          <>
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
                              <strong>Location:&nbsp;</strong> {evt.location}
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
                                <strong>Days:&nbsp;</strong>
                              </Typography>
                              <ul>
                                {evt.date_options && evt.date_options.length > 0 ? (
                                  evt.date_options.map((d, i) => (
                                    <Typography key={i}>
                                      <li>
                                        {format(d.dateStart, "dd.MM.yyyy")} ({getHoursFrom(d.dateStart)} -{" "}
                                        {getHoursFrom(d.dateEnd)})
                                      </li>
                                    </Typography>
                                  ))
                                ) : (
                                  <Typography sx={{ marginLeft: 3 }}>N/A</Typography>
                                )}
                              </ul>
                            </Box>
                            <Typography
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                marginTop: 1,
                              }}
                            >
                              <PeopleIcon sx={{ marginRight: 1, color: "#4CAF50" }} />
                              <strong>Participants:&nbsp;</strong> {evt.participants ? evt.participants.length : 0}
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
                                {format(evt.end_voting_date, "dd.MM.yyyy")} at {getHoursFrom(evt.end_voting_date)}
                              </Typography>
                            )}
                          </>
                        }
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
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: 500,
          },
        }}
      >
        <DialogTitle>
          {editEventIndex !== null ? `Edit Event (Step ${step}/4)` : `Create Event (Step ${step}/4)`}
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
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
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
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
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
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
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
                <DescriptionIcon sx={{ color: "#4CAF50", marginRight: 1 }} />
                <Typography variant="h6">Days</Typography>
              </Box>
              {newEvent.days && newEvent.days.length > 0 ? (
                <List>
                  {newEvent.days.map((day: any, index: number) => (
                    <ListItem
                      key={index}
                      sx={{ borderBottom: "1px solid #ddd", paddingBottom: 2 }}
                    >
                      <ListItemText
                        primary={`Date: ${day.date}`}
                        secondary={`Start: ${day.startTime} | End: ${day.endTime}`}
                      />
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveDay(index)}
                      >
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
                  <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom={3}>
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
                  <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom={3}>
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
                  <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom={3}>
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
                    paddingBottom: "16px",
                    paddingLeft: "20px",
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
                      const newDay = {
                        date: selectedDate,
                        startTime,
                        endTime,
                      };
                      const updatedDays = [...(newEvent.days || []), newDay];
                      setNewEvent({ ...newEvent, days: updatedDays });
                      setAddDayDialogOpen(false);
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
                <PersonAddIcon style={{ color: "#4CAF50" }} />
                <Typography variant="body1" style={{ marginLeft: 8 }}>
                  Invite Friends
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" marginTop={2} flexWrap="wrap" gap={1}>
                {exampleFriends.map((friend, index) => (
                  <Chip
                    key={index}
                    label={
                      <Typography variant="body1" style={{ fontSize: "1rem" }}>
                        {friend.name}
                      </Typography>
                    }
                    onClick={() => handleAddUser(friend)}
                    sx={{ margin: 0 }}
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
                <Button
                  variant="contained"
                  style={{ backgroundColor: "#4CAF50", color: "#fff", height: "40px" }}
                  onClick={() => handleAddUser({ name: username, email: username })}
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
                    width: "8px", // Width of the scrollbar
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#b0b0b0", // Color of the scrollbar thumb
                    borderRadius: "4px", // Round edges
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "#888", // Thumb color on hover
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "#f0f0f0", // Track color
                  },
                }}
              >
                {invitedUsers.map((user, index) => (
                  <Chip
                    key={index}
                    label={
                      <Typography variant="body1" style={{ fontSize: "1rem" }}>
                        {`${user.name} (${user.email})`}
                      </Typography>
                    }
                    onDelete={() => {
                      const updated = [...invitedUsers];
                      updated.splice(index, 1);
                      setInvitedUsers(updated);
                    }}
                    deleteIcon={<CloseIcon style={{ color: "#ff6666" }} />}
                  />
                ))}
              </Box>
            </>

          )}
          {step === 4 && (
            <div>
              <Box display="flex" alignItems="center">
                <CalendarMonthIcon
                  sx={{
                    color: "#4caf50",
                  }}
                />
                <Typography variant="body1" style={{ marginLeft: 8 }}>
                  Voting deadline
                </Typography>
              </Box>

              {newEvent.deadline && newEvent.deadline.length > 0 ? (
                <List sx={{ maxWidth: 600, margin: "0 auto" }}>
                  {newEvent.deadline.map((dl: any, index: number) => (
                    <ListItem
                      key={index}
                      sx={{
                        borderBottom: "1px solid #ddd",
                        paddingBottom: 2,
                        justifyContent: "center",
                        textAlign: "center",
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            Date: {dl.date} at {dl.DeadlineTime}
                          </Typography>
                        }
                      />
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveDeadline(index)}
                      >
                        <CloseIcon style={{ color: "#ff6666" }} />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="center"
                  marginY={4}
                  sx={{ paddingTop: 4 }}
                >
                  <EventIcon sx={{ color: "#4caf50", fontSize: 32 }} />
                  <Typography
                    variant="body1"
                    sx={{
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      marginLeft: 1,
                      padding: "10px 15px",
                      backgroundColor: "#f0f0f0",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      textAlign: "center",
                      "&:hover": {
                        backgroundColor: "#e0e0e0",
                      },
                    }}
                    onClick={() => setAddDeadlineDialogOpen(true)}
                  >
                    Select voting deadline
                  </Typography>
                </Box>
              )}

              <Dialog open={addDeadlineDialogOpen} onClose={() => setAddDeadlineDialogOpen(false)}>
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
                        maxWidth: "200px",
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "#4CAF50" },
                          "&:hover fieldset": { borderColor: "#4CAF50" },
                          "&.Mui-focused fieldset": { borderColor: "#4CAF50" },
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
                <DialogActions>
                  <Button
                    onClick={() => setAddDeadlineDialogOpen(false)}
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
                      const dl = { date: selectedDeadline, DeadlineTime };
                      const updated = [...(newEvent.deadline || []), dl];
                      setNewEvent({ ...newEvent, deadline: updated });
                      setAddDeadlineDialogOpen(false);
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
          {step === 1 && (
            <Button
              onClick={handleClose}
              color="primary"
              disableRipple
              sx={{
                textTransform: "none",
                marginRight: "auto",
                fontSize: "1rem",
                padding: "10px 20px",
                "&:focus": {
                  outline: "none",
                },
                "&:active, &:hover, &:focus-visible": {
                  boxShadow: "none",
                },
              }}
            >
              Cancel
            </Button>
          )}
          {step > 1 && (
            <Button
              onClick={handleBack}
              color="primary"
              disableRipple
              sx={{
                textTransform: "none",
                marginRight: "auto",
                fontSize: "1rem",
                padding: "10px 20px",
                "&:focus": {
                  outline: "none",
                },
                "&:active, &:hover, &:focus-visible": {
                  boxShadow: "none",
                },
              }}
            >
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              onClick={handleNext}
              color="primary"
              disableRipple
              sx={{
                textTransform: "none",
                fontSize: "1rem",
                padding: "10px 20px",
                "&:focus": {
                  outline: "none",
                },
                "&:active, &:hover, &:focus-visible": {
                  boxShadow: "none",
                },
              }}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              color="primary"
              disableRipple
              sx={{
                textTransform: "none",
                fontSize: "1rem",
                padding: "10px 20px",
                "&:focus": {
                  outline: "none",
                },
                "&:active, &:hover, &:focus-visible": {
                  boxShadow: "none",
                },
              }}
            >
              Finish
            </Button>
          )}

        </DialogActions>
      </Dialog>
    </Container>
  );
});

export default DashboardPage;
