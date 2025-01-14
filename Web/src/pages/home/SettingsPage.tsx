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
import Cookies from "js-cookie";


export default function SettingsPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const checkUserData = async () => {
            const result = await authService.getUserData();
            if (!result.success) {
                navigate("/auth/login");
            } else {
                setUsername(result.data.username);
                setEmail(result.data.email);
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

    const handleSaveProfileInfo = async () => {
        if (!username && !email) {
            window.alert("Please fill out at least one field (username or email).");
            return;
        }
        await authService.updateProfile(username, email);
        window.alert("Profile information updated successfully!");
    };
    
    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            window.alert("Both current and new passwords are required.");
            return;
        }
        await authService.updatePassword(currentPassword, newPassword);
        window.alert("Password updated successfully!");
    };

    const handleLogout = async () => {
        await authService.logout();
        console.log("Logging out...");
        navigate("/auth/login");
    };

    const handleDeleteAccount = () => {
        setDeleteDialogOpen(true);
    };

    const confirmDeleteAccount = async () => {
        setDeleteDialogOpen(false);
        await authService.deleteAccount();
        window.alert("Your account has been deleted.");
        navigate("/auth/login");
    };

    // Trigger file input (for changing profile photo)
    const handleChangePhoto = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const toggleTheme = () => {
        const newTheme = selectedTheme === "light" ? "dark" : "light";
        setSelectedTheme(newTheme);
        Cookies.set("theme", newTheme);
        Cookies.set("darkMode", newTheme === "dark" ? "true" : "false");
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