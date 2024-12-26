import React, { useState, FormEvent } from "react";
import {
  Box,
  Container,
  FormControlLabel,
  Paper,
  TextField,
  Typography,
  Checkbox,
  Button,
  Grid,
  Link,
} from "@mui/material";
import "/node_modules/@fontsource/roboto/index.css";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import ForgotPassword from "./ForgotPassword";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log("login");

    // Save username to localStorage
    localStorage.setItem("username", username);

    navigate("/Hello"); // Redirect to /Hello after successful login
  };

  return (
    <Container maxWidth="sm">
      <Typography
        variant="h3"
        sx={{
          textAlign: "center",
          mt: 5,
          fontWeight: "bold",
          color: "#4CAF50",
        }}
      >
        FLOCK
      </Typography>
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          color: "black",
          fontWeight: "bold",
        }}
      >
        A new way to make plans
      </Typography>
      <Paper elevation={10} sx={{ marginTop: 5, padding: 2 }}>
        <Typography
          component="h1"
          variant="h4"
          sx={{ textAlign: "center", fontWeight: "bold" }}
        >
          Welcome back!
        </Typography>
        <br />
        <Typography component="div" sx={{ textAlign: "center", fontSize: "19px" }}>
          Log in to your account
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mt: 1 }}
        >
          <TextField
            placeholder="Enter username or email"
            label="Username or email"
            variant="outlined"
            fullWidth
            required
            autoFocus
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 3 }}
          />
          <TextField
            placeholder="Enter password"
            label="Password"
            variant="outlined"
            fullWidth
            required
            type="password"
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me?"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              bgcolor: "#4CAF50",
              padding: 2,
              display: "flex",
              gap: 1,
              fontWeight: "bold",
            }}
          >
            Login
          </Button>
        </Box>
        <Grid container justifyContent="space-between" sx={{ mt: 1 }}>
          <Grid item>
            <Typography variant="body2" align="center" sx={{ fontSize: 16 }}>
              <Button
                variant="text"
                onClick={() => setIsForgotPasswordOpen(true)}
                sx={{
                  fontSize: 16,
                  color: "#4CAF50",
                  fontWeight: "bold",
                  textTransform: "none",
                  textDecoration: "underline",
                }}
              >
                Forgot password?
              </Button>
            </Typography>
          </Grid>
          <Grid item>
            <Typography
              variant="body2"
              align="center"
              sx={{ fontSize: 16, mt: 1 }}
            >
              Don't have an account?{" "}
              <Link
                component={RouterLink}
                to="/auth/register"
                variant="body2"
                sx={{
                  fontSize: 16,
                  color: "#4CAF50",
                  fontWeight: "bold",
                  textDecoration: "underline",
                }}
              >
                Register Now
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      <ForgotPassword
        open={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </Container>
  );
};

export default Login;