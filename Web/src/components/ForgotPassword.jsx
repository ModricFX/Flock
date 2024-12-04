import React, { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grow,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

const ForgotPassword = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = () => {
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    console.log("Reset link sent to:", email);
    setSnackbarOpen(true); // Prikaže obvestilo
    onClose(); // Zapre dialog po uspešnem oddaji
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false); // Zapre obvestilo
  };

  return (
    <>
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth TransitionComponent={Grow} transitionDuration={300}>
      <DialogTitle>Reset Password</DialogTitle>
      <DialogContent >
      <Typography variant="body1" sx={{ mb: 2 }}>
          Enter your email address and we'll send you a link to reset your
          password.
        </Typography>
        <TextField
          autoFocus
          required
          margin="dense"
          label="Email Address"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          error={!!error}
          helperText={error}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3 }}>
        <Button onClick={onClose} variant="contained" color="error" sx={{ mb: 2, height: 40 }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="success" sx={{ mb: 2, height: 40 }}>
          Send Reset Link
        </Button>
      </DialogActions>
    </Dialog>

    <Snackbar
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: "100%" }}>
        Password reset link sent succesfully!
      </Alert>
    </Snackbar>
    </>
  );
};

export default ForgotPassword;

