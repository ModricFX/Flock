import React, { useEffect, useState } from "react";
import { Container, Paper, Typography } from "@mui/material";

const HelloUser = () => {
    // Uporaba state za shranjevanje uporabniškega imena
    const [username, setUsername] = useState("");

    useEffect(() => {
        // Preberi uporabniško ime iz localStorage ob nalaganju komponente
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername); // Nastavi uporabniško ime, če obstaja
        }
    }, []);

    return (
        <Container maxWidth="sm">
            <Paper elevation={10} sx={{marginTop: 5, padding: 2}}>
                <Typography component="h1" variant="h4" sx={{textAlign: "center", fontWeight: 'bold'}}>
                    Hi {username || "User"}! {/* Če ni uporabniškega imena, izpiši "User" */}
                </Typography>
                <Typography variant="body2" align="center" sx={{fontSize: 16}}>
                    Welcome to your account.
                </Typography>
            </Paper>
        </Container>
    );
};

export default HelloUser;
