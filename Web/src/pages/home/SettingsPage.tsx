import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    Container,
    Typography,
    Card,
    CardHeader,
    CardContent,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Avatar,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    DialogContentText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { authService } from '../../services/authservice';


export default function SettingsPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const checkUserData = async () => {
            const result = await authService.getUserData();
            if (!result.success) {
                navigate("/login");
            }
        };
        checkUserData();
    }, [navigate]);

    // Profile Info
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");

    // Password
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // Profile Image
    const [profileImage, setProfileImage] = useState<string>("");

    // Dropdown: Language
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    // Dropdown: Theme
    const [selectedTheme, setSelectedTheme] = useState("light");

    // Dialog for Delete Account
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // File input ref (hidden in UI)
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSaveProfileInfo = () => {
        if (!username && !email) {
            window.alert("Please fill out at least one field (username or email).");
            return;
        }
        // Save logic here...
        window.alert("Profile information updated successfully!");
    };

    const handleChangePassword = () => {
        if (!currentPassword || !newPassword) {
            window.alert("Both current and new passwords are required.");
            return;
        }
        // Change password logic here...
        window.alert("Password updated successfully!");
    };

    const handleLogout = () => {
        // Logout logic...
        console.log("Logging out...");
        navigate("/auth/login");
    };

    const handleDeleteAccount = () => {
        setDeleteDialogOpen(true);
    };

    const confirmDeleteAccount = () => {
        setDeleteDialogOpen(false);
        // Delete account logic...
        window.alert("Your account has been deleted.");
        navigate("/auth/login");
    };

    // Trigger file input (for changing profile photo)
    const handleChangePhoto = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Handle file selection
    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            // Use URL.createObjectURL for a more efficient preview
            const imageURL = URL.createObjectURL(file);
            setProfileImage(imageURL);
        }
    };

    return (
        <Container maxWidth="md" sx={styles.container}>
            <Typography variant="h4" gutterBottom sx={styles.pageTitle}>
                Profile Settings
            </Typography>

            {/* Profile Image */}
            <Card sx={styles.card}>
                <CardHeader title="Profile Photo" />
                <CardContent sx={styles.profilePhotoContent}>
                    <Avatar
                        alt="Profile"
                        src={profileImage}
                        sx={styles.avatarStyle}
                    />
                    <Button
                        variant="contained"
                        sx={styles.uploadButton}
                        onClick={handleChangePhoto}
                    >
                        Change Photo
                    </Button>
                    {/* Hidden file input */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />
                </CardContent>
            </Card>

            {/* Personal Info */}
            <Card sx={styles.card}>
                <CardHeader title="Personal Information" />
                <CardContent>
                    <Box sx={styles.fieldGroup}>
                        <TextField
                            label="Username"
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={styles.textField}
                        />
                    </Box>
                    <Box sx={styles.fieldGroup}>
                        <TextField
                            label="Email"
                            variant="outlined"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={styles.textField}
                        />
                    </Box>
                    <Button variant="contained" onClick={handleSaveProfileInfo}>
                        Save Changes
                    </Button>
                </CardContent>
            </Card>

            {/* Security */}
            <Card sx={styles.card}>
                <CardHeader title="Security" />
                <CardContent>
                    <Box sx={styles.fieldGroup}>
                        <TextField
                            label="Current Password"
                            variant="outlined"
                            fullWidth
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            sx={styles.textField}
                        />
                    </Box>
                    <Box sx={styles.fieldGroup}>
                        <TextField
                            label="New Password"
                            variant="outlined"
                            fullWidth
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            sx={styles.textField}
                        />
                    </Box>
                    <Button variant="contained" onClick={handleChangePassword}>
                        Update Password
                    </Button>
                </CardContent>
            </Card>

            {/* Appearance */}
            <Card sx={styles.card}>
                <CardHeader title="Appearance" />
                <CardContent>
                    {/* <Box sx={styles.fieldGroup}>
                        <FormControl fullWidth sx={styles.textField}>
                            <InputLabel id="language-select-label">Language</InputLabel>
                            <Select
                                labelId="language-select-label"
                                value={selectedLanguage}
                                label="Language"
                                onChange={(e) => setSelectedLanguage(e.target.value as string)}
                            >
                                <MenuItem value="en">English</MenuItem>
                                <MenuItem value="es">Spanish</MenuItem>
                                <MenuItem value="fr">French</MenuItem>
                            </Select>
                        </FormControl>
                    </Box> */}
                    <Box sx={styles.fieldGroup}>
                        <FormControl fullWidth sx={styles.textField}>
                            <InputLabel id="theme-select-label">Theme</InputLabel>
                            <Select
                                labelId="theme-select-label"
                                value={selectedTheme}
                                label="Theme"
                                onChange={(e) => setSelectedTheme(e.target.value as string)}
                            >
                                <MenuItem value="light">Light</MenuItem>
                                <MenuItem value="dark">Dark</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card sx={[styles.card, styles.dangerZoneCard]}>
                <CardHeader title="Danger Zone" />
                <CardContent>
                    <Typography variant="body2" sx={styles.dangerText}>
                        Deleting your account is permanent. All data will be lost.
                    </Typography>
                    <Button variant="contained" color="error" onClick={handleDeleteAccount}>
                        Delete Account
                    </Button>
                </CardContent>
            </Card>

            {/* Logout */}
            <Box sx={styles.logoutContainer}>
                <Button variant="outlined" color="secondary" onClick={handleLogout}>
                    Logout
                </Button>
            </Box>

            {/* Confirm Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Account?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to permanently delete your account? This
                        action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDeleteAccount} autoFocus color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

/* ======== Styles ======== */
const styles = {
    container: {
        mt: 4,
        mb: 6,
    },
    pageTitle: {
        mb: 3,
        fontWeight: "bold",
    },
    card: {
        mb: 3,
        boxShadow: 2,
    },
    profilePhotoContent: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: 2,
    },
    avatarStyle: {
        width: 120,
        height: 120,
        mb: 2,
    },
    uploadButton: {
        alignSelf: "center",
    },
    fieldGroup: {
        mb: 2,
    },
    textField: {
        mb: 1,
    },
    dangerZoneCard: {
        border: "1px solid #f44336",
    },
    dangerText: {
        mb: 2,
    },
    logoutContainer: {
        display: "flex",
        justifyContent: "center",
        mt: 2,
    },
} as const;
