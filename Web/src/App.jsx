import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Badge,
} from "@mui/material";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import EventIcon from "@mui/icons-material/Event";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import YourEvents from "./components/YourEvents";
import AllEvents from "./components/AllEvents";
import Notifications from "./components/Notifications";

const drawerWidth = 240;

const App = () => {
  const [userEvents, setUserEvents] = useState([]);
  const [otherEvents, setOtherEvents] = useState([
    { title: "Community Meetup", startDate: "2024-12-15", location: "City Park" },
    { title: "Tech Talk: Future of AI", startDate: "2024-12-20", location: "Tech Hub" },
  ]);

  const [notifications, setNotifications] = useState([
    { sender: "Admin", message: "Your event was approved!", time: "2 hours ago" },
    { sender: "Community", message: "Reminder: Meetup tomorrow!", time: "1 day ago" },
  ]);

  const [readNotifications, setReadNotifications] = useState(new Set());
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = () => {
    const unreadNotifications = notifications
      .map((notif, index) => index)
      .filter((index) => !readNotifications.has(index));
    const newReadNotifications = new Set(readNotifications);

    unreadNotifications.forEach((index) => {
      newReadNotifications.add(index);
    });
    setReadNotifications(newReadNotifications);
  };

  const unreadNotificationsCount = notifications.length - readNotifications.size;

  return (
    <Router>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar
          position="absolute"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: "#4CAF50" }}
        >
          <Toolbar>
            <Typography variant="h4" noWrap sx={{ flexGrow: 1 }}>
              FLOCK
            </Typography>
            <IconButton
              color="inherit"
              sx={{ marginRight: 2 }}
              component={Link}
              to="/notifications"
              onClick={handleNotificationClick}
            >
              <Badge badgeContent={unreadNotificationsCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Tooltip title="Account settings">
              <IconButton onClick={handleClick} size="small" sx={{ ml: 2 }}>
                <Avatar sx={{ width: 40, height: 40 }} />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: "#f9f9f9",
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: "auto" }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/all-events">
                  <ListItemIcon>
                    <InboxIcon />
                  </ListItemIcon>
                  <ListItemText primary="All Events" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/your-events">
                  <ListItemIcon>
                    <EventIcon />
                  </ListItemIcon>
                  <ListItemText primary="Your Events" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Routes>
            <Route
              path="/all-events"
              element={
                <AllEvents
                  userEvents={userEvents}
                  otherEvents={otherEvents}
                  setNotifications={setNotifications}
                />
              }
            />
            <Route path="/your-events" element={<YourEvents events={userEvents} setEvents={setUserEvents} />} />
            <Route path="/notifications" element={<Notifications notifications={notifications} />} />
          </Routes>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
        >
          <MenuItem>
            <Avatar /> Profile
          </MenuItem>
          <MenuItem>
            <Avatar /> My account
          </MenuItem>
          <Divider />
          <MenuItem>
            <PersonAdd fontSize="small" />
            Add another account
          </MenuItem>
          <MenuItem>
            <Settings fontSize="small" />
            Settings
          </MenuItem>
          <MenuItem>
            <Logout fontSize="small" />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Router>
  );
};

export default App;
