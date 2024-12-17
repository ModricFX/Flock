import React, { useState } from "react";
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

const YourEvents = ({ events, setEvents }) => {
  const [open, setOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [editEventIndex, setEditEventIndex] = useState(null);
  const [shareEventIndex, setShareEventIndex] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    description: "",
    location: "",
    participants: 0,
  });

  /*const [friends, setFriends] = useState([
    "John Doe",
    "Jane Smith",
    "Alice Johnson",
    "Bob Brown",
  ]);*/

  const handleOpen = (eventIndex = null) => {
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

  const handleClose = () => {
    setOpen(false);
    setEditEventIndex(null);
  };

  const handleShareOpen = (eventIndex) => {
    setShareEventIndex(eventIndex);
    setShareOpen(true);
  };

  const handleShareClose = () => {
    setShareOpen(false);
    setShareEventIndex(null);
  };

  const handleShare = (friend) => {
    const sharedEvent = events[shareEventIndex];
    console.log(`Event "${sharedEvent.title}" shared with ${friend}`);
    handleShareClose();
  };

  const handleDateChange = (e, type) => {
    const value = e.target.value;
    setNewEvent((prev) => ({ ...prev, [type]: value }));
  };

  const handleSave = () => {
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

      {/* Add Event Button */}
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

      {/* Event Dialog */}
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
              setNewEvent({ ...newEvent, participants: Math.max(0, e.target.value) })
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

      {/* Share Dialog */}
      <Dialog open={shareOpen} onClose={handleShareClose}>
        <DialogTitle>Share Event</DialogTitle>
        <DialogContent>
          <List>
            {/*{friends.map((friend, index) => (
              <ListItem key={index} button onClick={() => handleShare(friend)}>
                <ListItemText primary={friend} />
              </ListItem>
            ))}*/}
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
