import React, { useState } from "react";
import {
    Avatar,
    Box,
    Container,
    Paper,
    TextField,
    Typography,
    Button,
    Grid,
    Link,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import '@fontsource/roboto';

const RegisterPage = () => {
    const navigate = useNavigate(); // Ustvarimo instanco za navigacijo
    const [username, setUsername] = useState(""); // State za uporabniško ime

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("register");
        // Shranjevanje uporabniškega imena v localStorage
        localStorage.setItem("username", username);
        navigate("/Hello");
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
                    fontWeight: "bold",
                    color: "black",
                }}
            >
                A new way to make plans
            </Typography>
            <Paper elevation={10} sx={{marginTop: 5, padding: 2}}>
                <Typography component="h1" variant="h4" sx={{textAlign: "center", fontWeight: 'bold'}}>
                    Create an Account
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Name"
                                fullWidth
                                required
                                sx={{mb: 2}}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Surname"
                                fullWidth
                                required
                                sx={{mb: 2}}
                            />
                        </Grid>
                    </Grid>

                    <TextField
                        label="Username"
                        fullWidth
                        required
                        onChange={(e) => setUsername(e.target.value)}  // Povezava inputa z state
                        sx={{mb: 2}}
                    />
                    <TextField
                        label="Email"
                        fullWidth
                        required
                        type="email"
                        sx={{mb: 2}}
                    />
                    <TextField
                        label="Password"
                        fullWidth
                        required
                        type="password"
                        sx={{mb: 2}}
                    />
                    <TextField
                        label="Confirm Password"
                        fullWidth
                        required
                        type="password"
                        sx={{mb: 3}}
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
                            fontWeight: 'bold',
                        }}
                    >
                        Register
                    </Button>
                </Box>
                <Grid container justifyContent="center" sx={{mt: 2}}>
                    <Grid item>
                        <Typography variant="body2" align="center" sx={{fontSize: 16}}>
                            Already have an account?{" "}
                            <Link
                                component={RouterLink}
                                to="/login"
                                variant="body2"
                                sx={{
                                    fontSize: 16,
                                    color: '#4CAF50',
                                    fontWeight: 'bold',
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

export default RegisterPage;
