// Notifications.jsx
import React from "react";
import { Card, CardContent, Typography, Grid } from "@mui/material";

const Notifications = ({ notifications }) => {
  return (
    <Grid container spacing={2}>
      {notifications.length === 0 ? (
        <Typography variant="h6" align="center" sx={{ width: "100%" }}>
          No new notifications.
        </Typography>
      ) : (
        notifications.map((notif, index) => (
          <Grid item xs={12} key={index}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">{notif.sender}</Typography>
                <Typography variant="body1">{notif.message}</Typography>
                <Typography variant="caption">{notif.time}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default Notifications;
