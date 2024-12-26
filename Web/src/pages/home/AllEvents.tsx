import React from "react";
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Box,
  Button,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Event, AppNotification } from "./../../types";

interface AllEventsProps {
  userEvents: Event[];
  otherEvents: Event[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
}

const AllEvents: React.FC<AllEventsProps> = ({ userEvents, otherEvents, setNotifications }) => {
  const handleNewMessage = (): void => {
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      { sender: "System", message: "You have a new message!", time: "Just now" },
    ]);

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

      <Box sx={{ textAlign: "center", marginTop: 3 }}>
        <Button variant="contained" color="primary" onClick={handleNewMessage}>
          Simulate New Message
        </Button>
      </Box>

      <ToastContainer />
    </Container>
  );
};

export default AllEvents;
