import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Modal,
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";

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
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const handleOpenModal = (notification: Notification) => {
    setSelectedNotification(notification);
    setModalOpen(true);
    handleMarkAsRead(notification.id);
  };

  const handleCloseModal = () => {
    setSelectedNotification(null);
    setModalOpen(false);
  };

  const handleFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: "all" | "unread"
  ) => {
    if (newFilter) setFilter(newFilter);
  };

  const filteredNotifications = notifications.filter((notif) =>
    filter === "unread" ? notif.unread : true
  );

  return (
    <>
      <Typography
        variant="h4"
        sx={{
          my: 4,
          textAlign: "center",
          fontWeight: 700
        }}
      >
        Notifications
      </Typography>

      <Box sx={{ textAlign: "center", mb: 4 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          aria-label="notification filter"
        >
          <ToggleButton value="all" aria-label="all notifications">
            All
          </ToggleButton>
          <ToggleButton value="unread" aria-label="unread notifications">
            Unread
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={2} sx={{ px: 2 }}>
        {filteredNotifications.length === 0 ? (
          <Typography
            variant="h6"
            align="center"
            sx={{ width: "100%" }}
          >
            No notifications to display.
          </Typography>
        ) : (
          filteredNotifications.map((notif) => (
            <Grid item xs={12} key={notif.id}>
              <Card
                variant="outlined"
                onClick={() => handleOpenModal(notif)}
                sx={{
                  cursor: "pointer",
                  borderLeft: notif.unread ? "6px solid #1976d2" : "none",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "scale(1.01)",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)"
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {notif.sender}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, color: "text.secondary" }}
                  >
                    {notif.message}
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block", mb: 2 }}>
                    {notif.time}
                  </Typography>
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
              borderRadius: 2
            }}
          >
            <Typography
              variant="h5"
              sx={{ mb: 2, fontWeight: 700 }}
            >
              {selectedNotification.sender}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedNotification.message}
            </Typography>
            <Typography
              variant="caption"
              sx={{ display: "block", mb: 2, color: "text.secondary" }}
            >
              {selectedNotification.time}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleDelete(selectedNotification.id);
                  handleCloseModal();
                }}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                onClick={handleCloseModal}
              >
                Close
              </Button>
            </Box>
          </Box>
        </Modal>
      )}
    </>
  );
};

export default Notifications;
