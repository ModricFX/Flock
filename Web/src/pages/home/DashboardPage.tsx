import React, { useState, useEffect, ChangeEvent } from "react";
import {
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
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { authService } from '../../services/authservice';

interface Event {
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  description: string;
  location: string;
  participants: number;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [editEventIndex, setEditEventIndex] = useState<number | null>(null);
  const [newEvent, setNewEvent] = useState<Event>({
    title: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    description: "",
    location: "",
    participants: 0,
  });

  useEffect(() => {
          const checkUserData = async () => {
              const result = await authService.getUserData();
              if (!result.success) {
                  navigate("/login");
              }
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
      });
    }
    setOpen(true);
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

  const handleSave = (): void => {
    if (
      newEvent.title &&
      newEvent.startDate &&
      newEvent.startTime &&
      newEvent.endDate &&
      newEvent.endTime &&
      newEvent.description &&
      newEvent.location &&
      newEvent.participants >= 0
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
          color="primary"
          onClick={() => handleOpen()}
          sx={{ fontSize: 24, padding: "10px 20px", borderRadius: "50%" }}
        >
          +
        </Button>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editEventIndex !== null ? "Edit Event" : "Create New Event"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Event Title"
            fullWidth
            variant="outlined"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
            <TextField
              margin="dense"
              label="Start Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              value={newEvent.startDate}
              onChange={(e) => handleDateChange(e, "startDate")}
            />
            <TextField
              margin="dense"
              label="Start Time"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              value={newEvent.startTime}
              onChange={(e) => handleTimeChange(e, "startTime")}
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
            <TextField
              margin="dense"
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              value={newEvent.endDate}
              onChange={(e) => handleDateChange(e, "endDate")}
            />
            <TextField
              margin="dense"
              label="End Time"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              value={newEvent.endTime}
              onChange={(e) => handleTimeChange(e, "endTime")}
            />
          </Box>

          <TextField
            margin="dense"
            label="Location"
            fullWidth
            variant="outlined"
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
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
          />
          <TextField
            margin="dense"
            label="Participants"
            type="number"
            fullWidth
            variant="outlined"
            value={newEvent.participants}
            onChange={handleParticipantsChange}
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DashboardPage;