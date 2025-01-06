import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  TextField,
  Typography,
  Button,
  Grid,
  Link,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import "/node_modules/@fontsource/roboto/index.css";
import { authService } from '../../services/authservice';

interface DarkModeProp {
  darkMode: boolean;
}

const Register: React.FC<DarkModeProp> = ({ darkMode }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [surname, setSurname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    let validationErrors: Record<string, string> = {};

    if (!validateEmail(email)) {
      validationErrors.email = "Please enter a valid email address.";
    }

    if (!validatePassword(password)) {
      validationErrors.password =
        "Password must be at least 8 characters long and contain at least one letter and one number.";
    }

    if (password !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(validationErrors);

    try {
      let data = {
        first_name: name,
        last_name: surname,
        username: username,
        email: email,
        password: password
      }
      const session = await authService.register(data);
      console.log('Register successful:', session);

      navigate("/login");

    } catch (error) {
        console.error('Register failed:', error);
        // @ts-ignore
        Alert.alert('Register Failed', error.message || '');
    }

    if (Object.keys(validationErrors).length === 0) {
      console.log("Registering...");
      localStorage.setItem("username", username);
      navigate("/Hello");
    }
  };

  return (
    <Container maxWidth="sm">
      <Container sx={{ textAlign: "center" }}>
        <Typography
          variant="h3"
          sx={{
            ml: "auto",
            mr: "auto",
            mt: 5,
            fontWeight: "bold",
            color: "#4CAF50",
            cursor: "pointer"
          }}

          component={RouterLink}
          to="/homepage"
        >
          FLOCK
        </Typography>
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            color: darkMode ? "white" : "black",
          }}
        >
          A new way to make plans
        </Typography>
      </Container>

      <Paper elevation={10} sx={{ marginTop: 5, padding: 2 }}>
        <Typography component="h1" variant="h4" sx={{ textAlign: "center", fontWeight: "bold" }}>
          Create an Account
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField label="Name" fullWidth required onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Surname" fullWidth required onChange={(e) => setSurname(e.target.value)} sx={{ mb: 2 }} />
            </Grid>
          </Grid>

          <TextField
            label="Username"
            fullWidth
            required
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            fullWidth
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            fullWidth
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={Boolean(errors.password)}
            helperText={errors.password}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Confirm Password"
            fullWidth
            required
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword}
            sx={{ mb: 3 }}
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
            Register
          </Button>
        </Box>
        <Grid container justifyContent="center" sx={{ mt: 2 }}>
          <Grid item>
            <Typography variant="body2" align="center" sx={{ fontSize: 16 }}>
              Already have an account?{" "}
              <Link
                component={RouterLink}
                to="/auth/login"
                variant="body2"
                sx={{
                  fontSize: 16,
                  color: "#4CAF50",
                  fontWeight: "bold",
                  textDecoration: "underline",
                }}
              >
                Login here
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Register;
