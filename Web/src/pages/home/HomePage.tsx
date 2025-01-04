import React, { useState, useEffect, ChangeEvent } from "react";
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

interface Event {
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  description: string;
  location: string;
  participants: number;
}

const HomePage: React.FC = () => {
  const [text, setText] = useState<string>("");

    useEffect(() => {
        const homeTypo = document.getElementById("home-typo");
        const handleScroll = () => {
            const boxHeight = document.getElementById("home-box")?.offsetHeight || 0;
            if (window.scrollY > boxHeight) {
              if(homeTypo != null){
                homeTypo.style.transition = "opacity 0.3s ease-in";
                homeTypo.style.opacity = "1";
                homeTypo.innerHTML = "FLOCK";
              }
                
            } else {
                if(homeTypo != null){
                  homeTypo.style.transition = "opacity 0.3s ease-out";
                  homeTypo.style.opacity = "0";
                  homeTypo.innerHTML = "";
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);
  return (
    <>
      <Box
          id="home-box"
          sx={{
              bgcolor: "#4CAF50",
              width: "100vw",
              py: 2,
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Add box shadow
              display: "flex", // Use flexbox to center content
              flexDirection: "column", // Stack the items vertically
              alignItems: "center", // Vertically center
              justifyContent: "center", // Horizontally center
              backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.092), rgba(255, 255, 255, 0.092))",
          }}
      >
          <Typography
              variant="h1"
              noWrap
              sx={{ textAlign: "center", mb: 1 }} // Added margin-bottom for spacing
              style={{
                  textDecoration: "none",
                  color: "white",
              }}
          >
              FLOCK
          </Typography>
          <Typography
              variant="h4"
              noWrap
              sx={{ textAlign: "center" }}
              style={{
                  textDecoration: "none",
                  color: "white",
              }}
          >
              A new way to make plans
          </Typography>
      </Box>


      <Container sx={{ mb: 1000}}>
        <Typography variant="body1">Hello</Typography>
      </Container>
    </>
  );
};

export default HomePage;