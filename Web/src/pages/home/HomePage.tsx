import React, { useState, ChangeEvent } from "react";
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
  return (
    <Container>
      Hello
    </Container>
  );
};

export default HomePage;