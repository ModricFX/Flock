import React, {useState, FormEvent, useEffect} from "react";
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
import { authService } from '../../services/authservice';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState<boolean>(false);

    useEffect(() => {
        const checkUserData = async () => {
            const result = await authService.getUserData();
            if (result.success) {
                navigate("/dashboard");
            }
        };
        checkUserData();
    }, [navigate]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        try {
            console.log('Attempting login with email:', username);
            
            const session = await authService.login(username, password);
            console.log('Login successful:', session);
            
            navigate("/dashboard");
            console.log('Redirecting to /homepage');

        } catch (error) {
            console.error('Login failed:', error);
            // @ts-ignore
            Alert.alert('Login Failed', error.message || 'Invalid email or password. Please try again.');
        }
    };

  return (
    <Container maxWidth="sm">
      <Container sx={{ textAlign: "center"}}>
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
                color: "black",
              }}
            >
              A new way to make plans
            </Typography>
            </Container>
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
            onChange={(e) => setPassword(e.target.value)}
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