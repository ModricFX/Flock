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
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";

const CreateEvent = ({route}) => {
    const navigate = useNavigate();
    const {state} = useLocation();
    const [image, setImage] = useState(null); 

    console.log(state);
    if(state != null){
      const {name, location, description, image} = state;

      //enter data to database
      console.log(name, location, description, image);

      navigate('/Hello');
    }

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImage(file);
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();

      const eventName = e.target["event-name"].value;
      const eventLocation = e.target["event-location"].value;
      const eventDescription = e.target["event-description"].value;

      if (!eventName || !eventLocation || !eventDescription || !image) {
        alert("Please fill in all fields and upload an image.");
        return;
      }

      // validate data
      
      navigate('/events/create', 
        {
          state :{
            name: eventName,
            location: eventLocation,
            description: eventDescription,
            image: image
          }
        });
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
              placeholder="Enter event name (MyEvent)"
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
              sx={{ mb: 2 }}
              multiline
              rows={4}
              maxRows={10}
              id="event-description"
              name="event-description"
            />
             <Button
            variant="contained"
            component="label"
            fullWidth
            sx={{
              bgcolor: "#1976d2",
              color: "#fff",
              fontWeight: "bold",
              mb: 2,
            }}
          >
            Upload Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </Button>
          {image && (
            <Typography sx={{ mb: 2 }}>Selected file: {image.name}</Typography>
          )}
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
  