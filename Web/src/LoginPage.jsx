import React, { useState } from "react";
import {
    Avatar,
    Box,
    Container,
    FormControlLabel,
    Paper,
    TextField,
    Typography,
    Checkbox,
    Button,
    Grid,
    Link
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LoginIcon from '@mui/icons-material/Login';
import '@fontsource/roboto';
import { Link as RouterLink, useNavigate } from "react-router-dom";

const LoginPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("login");

        // Shranjevanje uporabniškega imena v localStorage
        localStorage.setItem("username", username);

        navigate("/Hello"); // Po uspešnem loginu preusmerimo na /Hello
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
                    fontWeight: 'bold',
                }}
            >
                A new way to make plans
            </Typography>
            <Paper elevation={10} sx={{marginTop: 5, padding: 2}}>
                <Typography component="h1" variant="h4" sx={{textAlign: "center", fontWeight: "bold",}}>
                    Welcome back!
                </Typography>
                <br/>
                <Typography component="div" sx={{textAlign: "center", fontSize: '19px'}}>
                    Log in to your account
                </Typography>

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                    sx={{mt: 1}}
                >
                    <TextField
                        placeholder="Enter username or email"
                        fullWidth
                        required
                        autoFocus
                        onChange={(e) => setUsername(e.target.value)}  // Povezava inputa z state
                        sx={{mb: 2}}
                    />
                    <TextField
                        placeholder="Enter password"
                        fullWidth
                        required
                        type="password"
                        sx={{mb: 3}}
                    />
                    <FormControlLabel
                        control={<Checkbox value="remember" color="primary"/>}
                        label="Remember me?"
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{bgcolor: "#4CAF50", mt: 1, padding: 2, display: "flex", gap: 1}}
                    >
                        Login
                    </Button>
                </Box>
                <Grid container justifyContent="space-between" sx={{mt: 1}}>
                    <Grid item>
                        <Typography variant="body2" align="center">
                            <Link href="/forgot" variant="body2"
                                  sx={{textDecoration: "none", fontSize: 16, color: '#4CAF50',}}>
                                Forgot password?
                            </Link>
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body2" align="center" sx={{fontSize: 16}}>
                            Don't have an account?{" "}
                            <Link
                                component={RouterLink}
                                to="/register"
                                variant="body2"
                                sx={{
                                    fontSize: 16,
                                    color: '#4CAF50',
                                    fontWeight: 'bold',
                                    textDecoration: "underline",
                                }}
                            >
                                Register Now
                            </Link>
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default LoginPage;
