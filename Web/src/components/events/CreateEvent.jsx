import React, { useState } from "react";
import {
    Box,
    Container,
    //FormControlLabel,
    Paper,
    TextField,
    Typography,
    //Checkbox,
    Button,
    //Grid,
    //Link
  } from "@mui/material";
import '@fontsource/roboto';
import { Link as RouterLink, useNavigate } from "react-router-dom";

const CreateEvent = () => {
    const navigate = useNavigate();

      const handleSubmit = (e) => {
      e.preventDefault();

      navigate("/Hello"); // Po uspešnem loginu preusmerimo na /Hello
    };
  
    return (
      <Container maxWidth="sm">
        <Paper elevation={10} sx={{ marginTop: 5, padding: 2 }}>
          <Typography component="h1" variant="h4" sx={{textAlign: "center", fontWeight: "bold",}}>
            Create event
          </Typography>
            <br />
          <Typography component="div" sx={{textAlign: "center",fontSize: '19px' }}>
            Enter events details
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              placeholder="MyEvent"
              label="Event name"
              variant="outlined"
              fullWidth
              required
              autoFocus
              sx={{ mb: 3 }}
              id="event-name"
              name="event-name"
            />
            <TextField
              placeholder="Enter address (address 5, city, country)"
              label="Location"
              variant="outlined"
              fullWidth
              required
              sx={{ mb: 2 }}
              id="event-location"
              name="event-location"
            />
            <TextField
              placeholder="Event description"
              label="Description"
              variant="outlined"
              fullWidth
              required
              sx={{ mb: 2 }}
              multiline
              rows={4}
              maxRows={10}
              id="event-description"
              name="event-description"
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
            Create your event
          </Button>
          </Box>
        </Paper>
      </Container>
    );
  };
  
export default CreateEvent;
  