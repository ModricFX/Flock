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
    <Container maxWidth="md">
      <Paper elevation={10} sx={{ marginTop: 5, padding: 2 }}>
        <Typography component="h1" variant="h4" sx={{ textAlign: "center", fontWeight: 'bold' }}>
          Hi {username || "User"}! {/* Če ni uporabniškega imena, izpiši "User" */}
        </Typography>
        <Typography variant="body2" align="center" sx={{ fontSize: 16 }}>
          Welcome to your account.
        </Typography>
        <Container>
          <Typography variant="body2" align="center" sx={{ fontSize: 16 }}>
            Your events:
          </Typography>
          <Typography variant="body2" align="center" sx={{ fontSize: 16 }}>
            <a href="/events/create">Create an event</a>
          </Typography>
        </Container>
      </Paper>
    </Container>
  );
};

export default HelloUser;
