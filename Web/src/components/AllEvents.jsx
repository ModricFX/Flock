import React, { useState } from "react";
import { Container, Typography, Paper, List, ListItem, ListItemText, Box, Button } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";  // Uvoz Toast komponenta
import "react-toastify/dist/ReactToastify.css";  // Uvoz CSS za Toast

const AllEvents = ({ userEvents, otherEvents, setNotifications }) => {
  const handleNewMessage = () => {
    // Simuliraj novo sporočilo s povečanjem števila obvestil
    setNotifications(prevNotifications => [
      ...prevNotifications,
      { sender: "System", message: "You have a new message!", time: "Just now" },
    ]);
    
    // Pokaži toast obvestilo, da je prišlo novo sporočilo
    toast.info("You have a new message!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
    });
  };

  return (
    <Container maxWidth="md" sx={{ marginTop: 5 }}>
      <Typography variant="h4" align="center" sx={{ fontWeight: "bold", marginBottom: 3 }}>
        All Events
      </Typography>

      {/* Other Events */}
      <Paper elevation={5} sx={{ padding: 3, marginBottom: 3 }}>
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
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </Paper>

      {/* Your Events */}
      <Paper elevation={5} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          Your Events
        </Typography>
        {userEvents.length === 0 ? (
          <Typography>You have not created any events yet.</Typography>
        ) : (
          <List>
            {userEvents.map((event, index) => (
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
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </Paper>

      {/* Gumb za simulacijo novega sporočila */}
      <Box sx={{ textAlign: "center", marginTop: 3 }}>
        <Button variant="contained" color="primary" onClick={handleNewMessage}>
          Simulate New Message
        </Button>
      </Box>

      {/* Toast Container - Ta bo prikazal obvestila */}
      <ToastContainer />
    </Container>
  );
};

export default AllEvents;
