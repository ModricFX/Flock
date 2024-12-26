import React, { useState, ChangeEvent } from "react";
import {
  Container,
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
  Paper,
  IconButton,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";

import { Event } from './../../types';


interface YourEventsProps {
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

const YourEvents: React.FC<YourEventsProps> = ({ events, setEvents }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [shareOpen, setShareOpen] = useState<boolean>(false);
  const [editEventIndex, setEditEventIndex] = useState<number | null>(null);
  const [shareEventIndex, setShareEventIndex] = useState<number | null>(null);
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

  const handleShareOpen = (eventIndex: number): void => {
    setShareEventIndex(eventIndex);
    setShareOpen(true);
  };

  const handleShareClose = (): void => {
    setShareOpen(false);
    setShareEventIndex(null);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, type: keyof Event): void => {
    setNewEvent((prev) => ({ ...prev, [type]: e.target.value }));
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
      (newEvent.participants ?? 0) >= 0 // Handle undefined participants
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
      <Typography variant="h4" align="center" sx={{ fontWeight: "bold", marginBottom: 3 }}>
        Your Events
      </Typography>

      <Paper elevation={5} sx={{ padding: 3, marginBottom: 3 }}>
        {events.length === 0 ? (
          <Typography>No events yet. Click "+" to add one!</Typography>
        ) : (
          <List>
            {events.map((event, index) => (
              <Paper
                key={index}
                elevation={3}
                sx={{ marginBottom: 2, padding: 2, backgroundColor: "#f5f5f5" }}
              >
                <ListItem sx={{ flexDirection: "column", alignItems: "flex-start" }}>
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
                          <strong>Participants:</strong> {event.participants}
                        </Typography>
                      </>
                    }
                  />
                  <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpen(index)}
                    >
                      Edit
                    </Button>
                    <IconButton
                      color="secondary"
                      onClick={() => handleShareOpen(index)}
                    >
                      <ShareIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </Paper>

      <Box sx={{ textAlign: "center", marginTop: 3 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() => handleOpen()}
          sx={{
            fontSize: 16,
            padding: "6px 12px",
            borderRadius: "50%",
            minWidth: "40px",
            minHeight: "40px",
          }}
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
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
              value={newEvent.startDate}
              onChange={(e) => handleDateChange(e, "startDate")}
            />
            <TextField
              margin="dense"
              label="Start Time"
              type="time"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
              value={newEvent.startTime}
              onChange={(e) => handleDateChange(e, "startTime")}
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
            <TextField
              margin="dense"
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
              value={newEvent.endDate}
              onChange={(e) => handleDateChange(e, "endDate")}
            />
            <TextField
              margin="dense"
              label="End Time"
              type="time"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
              value={newEvent.endTime}
              onChange={(e) => handleDateChange(e, "endTime")}
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
            onChange={(e) =>
              setNewEvent({ ...newEvent, participants: Math.max(0, parseInt(e.target.value, 10)) })
            }
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

      <Dialog open={shareOpen} onClose={handleShareClose}>
        <DialogTitle>Share Event</DialogTitle>
        <DialogContent>
          <List>
            {/* Friends list or sharing functionality can go here */}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleShareClose} color="error">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default YourEvents;
