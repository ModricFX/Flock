import React, { useState, MouseEvent } from "react";

import { Routes, Route, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
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
import YourEvents from "./pages/home/YourEvents";
import AllEvents from "./pages/home/AllEvents";
import Notifications from "./pages/home/Notifications";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import HomePage from "./pages/home/HomePage";
import {authService} from "./services/authservice.ts";

const drawerWidth = 240;

interface Notification {
    sender: string;
    message: string;
    time: string;
}

interface Event {
    title: string;
    startDate: string;
    location: string;
}

interface AppProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const App: React.FC<AppProps> = ({ darkMode, toggleDarkMode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userEvents, setUserEvents] = useState<Event[]>([]);
    const [otherEvents] = useState<Event[]>([
        { title: "Community Meetup", startDate: "2024-12-15", location: "City Park" },
        { title: "Tech Talk: Future of AI", startDate: "2024-12-20", location: "Tech Hub" },
    ]);

    const [notifications, setNotifications] = useState<Notification[]>([
        { sender: "Admin", message: "Your event was approved!", time: "2 hours ago" },
        { sender: "Community", message: "Reminder: Meetup tomorrow!", time: "1 day ago" },
    ]);

    const [readNotifications, setReadNotifications] = useState<Set<number>>(new Set());
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: MouseEvent<HTMLElement>): void => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (): void => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await authService.logout();
        navigate("/auth/login");
    };

    const handleNotificationClick = (): void => {
        const unreadNotifications = notifications
            .map((_, index) => index)
            .filter((index) => !readNotifications.has(index));

        const newReadNotifications = new Set(readNotifications);
        unreadNotifications.forEach((index) => newReadNotifications.add(index));

        setReadNotifications(newReadNotifications);
    };

    const unreadNotificationsCount = notifications.length - readNotifications.size;

    const routesWithoutSidebar = ["/auth/login", "/auth/register"];
    const hideSidebar = routesWithoutSidebar.includes(location.pathname);

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            {!hideSidebar && (
                <>
                    <AppBar
                        position="fixed"
                        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: "#4CAF50" }}
                    >
                        <Toolbar>
                            <Typography
                                variant="h4"
                                noWrap
                                sx={{ flexGrow: 1, cursor: "pointer" }}
                                component={Link}
                                to="/homepage"
                                style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                }}
                            >
                                FLOCK
                            </Typography>
                            <IconButton
                                color="inherit"
                                sx={{ marginRight: 2 }}
                                component={Link}
                                to="/home/notifications"
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
                                    <ListItemButton component={Link} to="/home/allevents">
                                        <ListItemIcon>
                                            <InboxIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="All Events" />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton component={Link} to="/home/yourevents">
                                        <ListItemIcon>
                                            <EventIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Your Events" />
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        </Box>
                    </Drawer>
                </>
            )}

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Routes>
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/register" element={<Register />} />
                    <Route path="/homepage" element={<HomePage />} />
                    <Route
                        path="/home/allevents"
                        element={
                            <AllEvents
                                userEvents={userEvents}
                                otherEvents={otherEvents}
                                setNotifications={setNotifications}
                            />
                        }
                    />
                    <Route
                        path="/home/yourevents"
                        element={<YourEvents events={userEvents} setEvents={setUserEvents} />}
                    />
                    <Route
                        path="/home/notifications"
                        element={<Notifications notifications={notifications} />}
                    />
                    <Route path="*" element={<Navigate to="/auth/login" />} />
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
                <MenuItem onClick={handleLogout}>
                    <Logout fontSize="small" />
                    Logout
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default App;
