import React, { useState } from "react";
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

const HomePage = () => {
  const [events, setEvents] = useState([]); // Seznam dogodkov
  const [open, setOpen] = useState(false); // Modalno okno za kreacijo dogodka
  const [editEventIndex, setEditEventIndex] = useState(null); // Indeks dogodka, ki ga urejamo
  const [newEvent, setNewEvent] = useState({
    title: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    description: "",
    location: "",
    participants: 0, // Dodano za število udeležencev
  }); // State za nov dogodek

  // Odpri modalno okno za kreacijo dogodka
  const handleOpen = (eventIndex = null) => {
    if (eventIndex !== null) {
      // Če je index, bomo urejali obstoječi dogodek
      setEditEventIndex(eventIndex);
      setNewEvent(events[eventIndex]); // Napolni podatke za urejanje
    } else {
      // Če ni indexa, ustvarjamo nov dogodek
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

  // Zapri modalno okno za kreacijo dogodka
  const handleClose = () => {
    setOpen(false);
    setEditEventIndex(null); // Resetiranje indeksa
  };

  // Funkcija za obravnavo spremembe datuma
  const handleDateChange = (e, type) => {
    const date = e.target.value;
    setNewEvent({ ...newEvent, [type]: date });
  };

  // Funkcija za obravnavo spremembe časa
  const handleTimeChange = (e, type) => {
    const time = e.target.value;
    setNewEvent({ ...newEvent, [type]: time });
  };

  // Funkcija za obravnavo spremembe števila udeležencev
  const handleParticipantsChange = (e) => {
    const participants = e.target.value;
    setNewEvent({ ...newEvent, participants: participants });
  };

  // Shrani nov dogodek
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
        // Če urejamo obstoječi dogodek, posodobimo
        const updatedEvents = [...events];
        updatedEvents[editEventIndex] = newEvent;
        setEvents(updatedEvents);
      } else {
        // Če ustvarjamo nov dogodek
        setEvents([...events, newEvent]);
      }
      handleClose(); // Zapri modalno okno za kreacijo dogodka
    }
  };

  return (
    <Container maxWidth="md" sx={{ marginTop: 5 }}>
      {/* Pozdravni del */}
      <Paper elevation={10} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h4" sx={{ textAlign: "center", fontWeight: "bold" }}>
          Hi User!
        </Typography>
        <Typography variant="body2" align="center" sx={{ fontSize: 16 }}>
          Welcome to your account. Below are your created events.
        </Typography>
      </Paper>

      {/* Seznam dogodkov */}
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
                {/* Gumb za urejanje dogodka */}
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

      {/* Gumb za dodajanje dogodka */}
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

      {/* Modalno okno za kreacijo ali urejanje dogodka */}
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

          {/* Začetni datum in ura */}
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
              onChange={(e) => handleTimeChange(e, "startTime")}
            />
          </Box>

          {/* Končni datum in ura */}
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

export default HomePage;
