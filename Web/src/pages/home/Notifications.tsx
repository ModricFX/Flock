import React, { useState } from "react";
import { Card, CardContent, Typography, Grid, Button, Modal, Box } from "@mui/material";

interface Notification {
  id: string;
  sender: string;
  message: string;
  time: string;
  unread: boolean;
}

interface NotificationsProps {
  notifications: Notification[];
}

const Notifications: React.FC<NotificationsProps> = ({ notifications: initialNotifications }) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notif) => notif.id !== id)
    );
  };

  const handleOpenModal = (notification: Notification) => {
    setSelectedNotification(notification);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedNotification(null);
    setModalOpen(false);
  };

  return (
    <>
      <Grid container spacing={2}>
        {notifications.length === 0 ? (
          <Typography variant="h6" align="center" sx={{ width: "100%" }}>
            No new notifications.
          </Typography>
        ) : (
          notifications.map((notif) => (
            <Grid item xs={12} key={notif.id}>
              <Card variant="outlined" sx={{ borderLeft: notif.unread ? "4px solid blue" : "none" }}>
                <CardContent>
                  <Typography variant="h6">{notif.sender}</Typography>
                  <Typography variant="body1">{notif.message}</Typography>
                  <Typography variant="caption">{notif.time}</Typography>
                  <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-start", gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleMarkAsRead(notif.id)}
                      disabled={!notif.unread}
                    >
                      Mark as Read
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenModal(notif)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => handleDelete(notif.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {selectedNotification && (
        <Modal open={modalOpen} onClose={handleCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              {selectedNotification.sender}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedNotification.message}
            </Typography>
            <Typography variant="caption" sx={{ display: "block", mb: 2 }}>
              {selectedNotification.time}
            </Typography>
            <Button fullWidth variant="contained" onClick={handleCloseModal}>
              Close
            </Button>
          </Box>
        </Modal>
      )}
    </>
  );
};

export default Notifications;
