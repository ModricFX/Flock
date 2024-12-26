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

interface ForgotPasswordProps {
  open: boolean;
  onClose: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ open, onClose }) => {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (): void => {
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    console.log("Reset link sent to:", email);
    setSnackbarOpen(true); // Show notification
    onClose(); // Close dialog after successful submission
  };

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ): void => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false); // Close notification
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Grow}
        transitionDuration={300}
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
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
          <Button
            onClick={onClose}
            variant="contained"
            color="error"
            sx={{ mb: 2, height: 40 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="success"
            sx={{ mb: 2, height: 40 }}
          >
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
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Password reset link sent successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ForgotPassword;
