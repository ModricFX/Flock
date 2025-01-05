import React from "react";
import { Container, Typography, Box } from "@mui/material";

const AboutPage: React.FC = () => {
  return (
    <Box style={styles.aboutContainer}>
      <Container maxWidth="md" style={styles.aboutInner}>
        <Typography variant="h4" gutterBottom style={styles.headerText}>
          About FLOCK
        </Typography>
        <Typography variant="body1" paragraph style={styles.paragraphText}>
          FLOCK is built around the idea that coordinating events, plans, and
          projects with friends, family, or coworkers should be both fun and
          simple. We believe in removing barriers to productivity — no more
          lengthy group chats or endless polls to pick a date. Whether you’re
          planning a small meetup or a large group activity, FLOCK is here to
          streamline everything.
        </Typography>
        <Typography variant="body1" paragraph style={styles.paragraphText}>
          Our platform brings together scheduling, invitations, and reminders,
          so you can focus on the fun part: actually getting together! With just
          a few clicks, you can create an event, invite people, and pick dates
          that work for everyone. FLOCK handles the complicated bits in the
          background, like sending out notifications and tracking
          confirmations.
        </Typography>
        <Typography variant="body1" paragraph style={styles.paragraphText}>
          Interested in learning more? Feel free to explore, or sign up now to
          start creating your own events. We look forward to seeing how FLOCK
          helps bring your community together!
        </Typography>
      </Container>
    </Box>
  );
};

export default AboutPage;

/* ========== Styles ========== */
const styles: { [key: string]: React.CSSProperties } = {
  aboutContainer: {
    width: "100vw",
    minHeight: "80vh",
    backgroundColor: "#FAFDF9",
    padding: "2rem 0",
    display: "flex",
    justifyContent: "center",
  },
  aboutInner: {
    backgroundColor: "#ffffff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    color: "#333",
  },
  headerText: {
    marginBottom: "1rem",
    color: "#388E3C",
    fontWeight: "bold",
  },
  paragraphText: {
    marginBottom: "1rem",
    lineHeight: 1.6,
  },
};
