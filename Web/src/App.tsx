import React, { useState, useEffect, MouseEvent } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
import { format, isValid } from 'date-fns';
import NotificationsIcon from "@mui/icons-material/Notifications";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DashboardPage from "./pages/home/DashboardPage.tsx";
import { authService } from "./services/authservice.ts";
import HomePage from "./pages/home/HomePage.tsx";
import AboutPage from "./pages/home/AboutPage.tsx";
import logo from '/flock-logo-bel.svg';
import { AppNotification } from "./types";
import SettingsPage from "./pages/home/SettingsPage.tsx";
import NotificationsPage from "./pages/home/Notifications.tsx";

import InboxIcon from "@mui/icons-material/MoveToInbox";
import EventIcon from "@mui/icons-material/Event";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import FriendsPage from "./pages/home/FriendsPage.tsx";
import DarkModeToggle from "./components/dark-mode-toggle.tsx";

// Import the NotificationService
import { notificationService } from './services/notificationservice'; // Adjust the path as necessary


const drawerWidth = 240;

import { User } from './models/User';


interface AppProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
}


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

const App: React.FC<AppProps> = ({ darkMode, toggleDarkMode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userData, setUserData] = useState(null);
    const [User, setUser] = useState<User | null>(null);
    const [data, setData] = useState<Notification[]>([]);


    const handleNavigateToNotifications = () => {
        navigate("/notifications");
    };

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
            console.error('Fetch Notifications Error:', err);
        }
    };

    useEffect(() => {
        // Initial fetch
        const initialFetch = async () => {
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

    useEffect(() => {
        const fetchAndSetUserData = async () => {
            try {
                const result = await authService.getUserData();
                if (result.success) {
                    setUserData(result.data);
                } else {
                    console.error("Failed to fetch user data");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchAndSetUserData();
    }, [navigate]);

    useEffect(() => {
        if (!userData) return; // Wait until userData is not null

        const fetchUser = async () => {
            try {
                const result = await authService.getUserData();
                if (result.success) {
                    setUser(result.data);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUser();
    }, [userData]);

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

    const unreadNotificationsCount = data.filter((notification) => notification.unread).length;

    const routesWithoutHeader = ["/auth/login", "/auth/register"];
    const routesWithoutSidebar = ["/auth/login", "/auth/register", "/homepage", "/about", "/settings"];

    const hideHeader = routesWithoutHeader.includes(location.pathname);
    const hideSidebar = routesWithoutSidebar.includes(location.pathname);

    const handleScrollToYourEvents = () => {
        // Programmatically navigate to /dashboard
        // with a piece of state: { scrollTo: "yourEvents" }
        navigate("/dashboard", { state: { scrollTo: "yourEvents" } });
    };

    const handleScrollToOtherEvents = () => {
        // Similarly for "otherEvents"
        navigate("/dashboard", { state: { scrollTo: "otherEvents" } });
    };

    const handleFriendsPage = () => {
        // Similarly for "friends"
        navigate("/friends");
    }

    return (
        <Box sx={{ display: "flex" }}>
            <ToastContainer />
            <CssBaseline />
            {!hideHeader && (
                <>
                    <AppBar
                        position="fixed"
                        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: "#4CAF50", boxShadow: location.pathname === "/homepage" ? "none" : "var(--Paper-shadow)", backgroundImage: "none" }}
                    >
                        <Toolbar>
                            <Typography
                                id={"home-typo"}
                                variant="h4"
                                noWrap
                                sx={{
                                    flexGrow: 1,
                                    cursor: "pointer",
                                    opacity: location.pathname === "/homepage" ? "0" : "1",
                                }}
                                component={Link}
                                to="/homepage"
                                style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                }}
                            >
                                {location.pathname === "/homepage" ? "" : <img src={logo} alt="Flock Logo" style={{ width: '150px', height: 'auto', marginTop: '10px' }} />}
                            </Typography>
                            {userData ? (
                                <>
                                    <Box sx={{ mr: 2 }}>
                                        <Link
                                            to="/dashboard"
                                            style={{
                                                textDecoration: "none",
                                                color: "inherit",
                                                fontSize: "16px",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            Dashboard
                                        </Link>
                                    </Box>

                                    <IconButton
                                        color="inherit"
                                        sx={{ marginRight: 2 }}
                                        component={Link}
                                        to="/notifications"
                                    >
                                        <Badge badgeContent={unreadNotificationsCount} color="error">
                                            <NotificationsIcon />
                                        </Badge>
                                    </IconButton>
                                    <DarkModeToggle isDarkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                                    <Tooltip title="Account settings">
                                        <IconButton onClick={handleClick} size="small" sx={{ ml: 2 }}>
                                            <Avatar
                                                sx={{ width: 40, height: 40 }}
                                                src={User?.pfp_url || ""}
                                                alt={User?.username || "User"}
                                            >
                                                {User?.username?.charAt(0).toUpperCase() || "U"}
                                            </Avatar>
                                        </IconButton>
                                    </Tooltip>
                                </>
                            ) : (
                                <Link
                                    to="/auth/login"
                                    style={{
                                        textDecoration: "none",
                                        color: "inherit",
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Login
                                </Link>
                            )}
                        </Toolbar>
                    </AppBar>
                </>
            )}
            {!hideSidebar && (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: {
                            width: drawerWidth,
                            boxSizing: "border-box",
                            bgcolor: darkMode ? "#" : "f9f9f9",
                            color: darkMode ? "white" : "black",
                            mt: "60px",
                        },
                    }}
                >
                    <Box sx={{ overflow: "auto" }}>
                        <List>
                            <ListItem disablePadding>
                                <ListItemButton onClick={handleScrollToYourEvents}>
                                    <ListItemIcon sx={{ color: darkMode ? "white" : "black" }}>
                                        <EventIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Your Events" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={handleScrollToOtherEvents}>
                                    <ListItemIcon sx={{ color: darkMode ? "white" : "black" }}>
                                        <InboxIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Other Events" />
                                </ListItemButton>
                            </ListItem>
                            <Divider sx={{ backgroundColor: darkMode ? "white" : "black", marginTop: "10px", marginBottom: "10px" }} />
                            <ListItem disablePadding>
                                <ListItemButton onClick={handleFriendsPage}>
                                    <ListItemIcon sx={{ color: darkMode ? "white" : "black" }}>
                                        <PeopleAltIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Friends" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={handleNavigateToNotifications} >
                                    <ListItemIcon sx={{ color: darkMode ? "white" : "black" }}>
                                        <NotificationsIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Notifications" />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Box>
                </Drawer>
            )}

            <Box component="main" sx={{ flexGrow: 1, pt: 3, mt: 4 }}>
                <Routes>
                    {/* Redirect root to homepage */}
                    <Route path="/" element={<Navigate to="/homepage" />} />

                    {/* Public Pages */}
                    <Route path="/homepage" element={<HomePage />} />
                    <Route path="/auth/login" element={<Login darkMode={darkMode} />} />
                    <Route path="/auth/register" element={<Register darkMode={darkMode} />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/friends" element={<FriendsPage darkMode={darkMode} />} />
                    <Route path="/settings" element={<SettingsPage />} />

                    <Route path="/dashboard" element={<DashboardPage darkMode={darkMode} />}>
                        <Route path="allevents" />
                        <Route path="yourevents" />
                    </Route>
                    <Route path="/notifications" element={<NotificationsPage />} />

                    {/* Fallback for any unknown route */}
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                sx={{
                    width: "250px",
                    borderRadius: "8px",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                    padding: "8px 0",
                }}
            >
                {/* Profile Section */}
                <MenuItem
                    onClick={() => navigate("/settings")}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        padding: "12px 16px",
                    }}
                >
                    <Avatar
                        sx={{ width: 36, height: 36 }}
                        src={User?.pfp_url || ""}
                        alt={User?.username || "User"}
                    >
                        {User?.username?.charAt(0).toUpperCase() || "U"}
                    </Avatar>
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                            {User?.username || "User"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            View Profile
                        </Typography>
                    </Box>
                </MenuItem>

                <Divider sx={{ margin: "8px 0" }} />

                {/* Settings Option */}
                <MenuItem
                    onClick={() => navigate("/settings")}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        padding: "12px 16px",
                    }}
                >
                    <Settings fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Settings
                    </Typography>
                </MenuItem>

                {/* Logout Option */}
                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        padding: "12px 16px",
                    }}
                >
                    <Logout fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Logout
                    </Typography>
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default App;
