import React, { useState, useEffect } from "react";
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
import { authService } from "../../services/authservice";
import { useNavigate } from "react-router-dom";
import { format, isValid } from 'date-fns';


// Import the NotificationService
import { notificationService } from '../../services/notificationservice'; // Adjust the path as necessary

// Define the Notification interface matching the API response
interface Notification {
  id_User: number;
  id_Notification: number;
  unread: boolean;
  date_Received: string;
  notification: {
    id_Notification: number;
    title: string;
    description: string;
  };
}

const Notifications: React.FC = () => {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Notification[]>([]);

  const parseISODate = (dateString: string): Date => {
    if (!dateString || typeof dateString !== "string") {
      console.warn(`Invalid date string: "${dateString}"`);
      return new Date(NaN); // Return an invalid date
    }
  
    // Regex to validate and extract components of an ISO 8601 date string
    const isoRegex = /^(\d{4})-(\d{2})-(\d{2})[T ]?(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-]\d{2}:\d{2})?$/;
    const match = dateString.match(isoRegex);
  
    if (!match) {
      console.warn(`Date string does not match ISO format: "${dateString}"`);
      return new Date(NaN); // Return an invalid date if regex doesn't match
    }
  
    // Extract date and time components
    const [
      ,
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond = "0", // Default to 0 if milliseconds are missing
      timezone = "Z",    // Default to UTC if timezone is missing
    ] = match;
  
    // Convert components to numbers
    const parsedYear = parseInt(year, 10);
    const parsedMonth = parseInt(month, 10) - 1; // Months are 0-indexed in JS Date
    const parsedDay = parseInt(day, 10);
    const parsedHour = parseInt(hour, 10);
    const parsedMinute = parseInt(minute, 10);
    const parsedSecond = parseInt(second, 10);
    const parsedMillisecond = parseInt(millisecond.padEnd(3, "0"), 10); // Ensure 3 digits
  
    // Create a Date object
    let date = new Date(
      Date.UTC(
        parsedYear,
        parsedMonth,
        parsedDay,
        parsedHour,
        parsedMinute,
        parsedSecond,
        parsedMillisecond
      )
    );
  
    // Adjust for time zone if specified
    if (timezone !== "Z") {
      const [sign, tzHour, tzMinute] = timezone.match(/([+-])(\d{2}):(\d{2})/)!.slice(1);
      const tzOffset =
        parseInt(tzHour, 10) * 60 + parseInt(tzMinute, 10); // Offset in minutes
      const offsetInMs = tzOffset * 60 * 1000;
  
      date = new Date(date.getTime() + (sign === "+" ? -offsetInMs : offsetInMs));
    }
  
    return date;
  };

  const parseUTCDate = (dateString: string): Date => {
    if (!dateString || typeof dateString !== "string") {
      console.warn(`Invalid or missing date string: "${dateString}"`);
      return new Date(NaN); // Return an invalid date if the input is not valid
    }
  
    try {
      // Check if the string already has a timezone designator
      const hasTimezone = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})$/.test(dateString);
  
      // Use our custom parseISODate function
      const parsedDate = hasTimezone ? parseISODate(dateString) : parseISODate(`${dateString}Z`);
  
      if (isNaN(parsedDate.getTime())) {
        console.warn(`Parsed date is invalid: "${dateString}"`);
        return new Date(NaN); // Return an invalid date if parsing fails
      }
  
      return parsedDate;
    } catch (error) {
      console.error(`Error parsing UTC date string: "${dateString}".`, error);
      return new Date(NaN); // Return an invalid date if an exception occurs
    }
  };
  



  const fetchNotifications = async () => {
    try {
      setError(null);
      const notifications = await notificationService.getNotifications();
      console.log('Fetched Notifications:', notifications); // Debugging

      // Parse and validate dates
      const validNotifications = notifications.filter(notification => {
        const date = parseUTCDate(notification.date_Received);
        if (!isValid(date)) {
          console.warn(`Invalid date string: ${notification.date_Received}`);
        }
        return isValid(date);
      });

      // Sort notifications by date_Received descending
      const sortedNotifications = validNotifications.sort((a, b) => {
        const dateA = parseUTCDate(a.date_Received).getTime();
        const dateB = parseUTCDate(b.date_Received).getTime();
        return dateB - dateA;
      });

      setData(sortedNotifications);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications.');
      console.error('Fetch Notifications Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    const initialFetch = async () => {
      setLoading(true);
      console.log("fetching");
      await fetchNotifications();
    };
    initialFetch();

    // Set up interval to fetch every minute (60000 ms)
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const formatRelativeTime = (dateString: string): string => {
    const date = parseUTCDate(dateString);
    if (!isValid(date)) {
      return 'Invalid date';
    }

    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const formatExactTime = (dateString: string): string => {
    const date = parseUTCDate(dateString);
    if (!isValid(date)) {
      return 'Invalid date';
    }
    return format(date, 'd MMM, HH:mm'); // Example: "14 May, 14:30"
  };

  const formatNotificationDescription = (description: string): string => {
    return description.replace(/{(.*?)}/g, (match, p1) => {
      const date = parseUTCDate(p1);
      return isValid(date) ? formatExactTime(p1) : match;
    });
  };

  const handleDelete = (id: string) => {
    console.log("Deleted event");
    // Implement delete functionality if needed
  };

  const handleOpenModal = async (notification: Notification) => {
    setSelectedNotification(notification);
    setModalOpen(true);
    try {
      await notificationService.markAsRead(notification.id_Notification);
      setData(prevData =>
        prevData.map(item =>
          item.id_Notification === notification.id_Notification
            ? { ...item, unread: false }
            : item
        )
      );
    } catch (err: any) {
      console.error('Mark As Read Error:', err);
    }
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

  const filteredNotifications = data.filter((notif) =>
    filter === "unread" ? notif.unread : true
  );

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
            <Grid item xs={12} key={notif.id_Notification}>
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
                    {notif.notification.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, color: "text.secondary" }}
                  >
                    {formatNotificationDescription(notif.notification.description)}
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block", mb: 2 }}>
                    {formatRelativeTime(notif.date_Received)}
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
              {selectedNotification.notification.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {formatNotificationDescription(selectedNotification.notification.description)}
            </Typography>
            <Typography
              variant="caption"
              sx={{ display: "block", mb: 2, color: "text.secondary" }}
            >
              {formatRelativeTime(selectedNotification.date_Received)}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleDelete(selectedNotification.id_Notification.toString());
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
