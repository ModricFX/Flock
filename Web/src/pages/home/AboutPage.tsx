import React, { useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const AboutPage: React.FC = () => {


  useEffect(() => {
    const homeTypo = document.getElementById("home-typo");
    const handleScroll = () => {
      const boxHeight = document.getElementById("home-box")?.offsetHeight || 0;
      if (window.scrollY > boxHeight) {
        if (homeTypo) {
          homeTypo.style.transition = "opacity 0.3s ease-in";
          homeTypo.style.opacity = "1";
          homeTypo.innerHTML = "FLOCK";
        }
      } else {
        if (homeTypo) {
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
      <Box id="home-box" style={styles.heroSection}>
        <Typography variant="h1" noWrap style={styles.title}>
          FLOCK
        </Typography>
        <Typography variant="h4" noWrap style={styles.subtitle}>
          A new way to make plans
        </Typography>
      </Box>

      <Box style={styles.aboutContainer}>
        <Container maxWidth="md" style={styles.aboutInner}>
          <Typography variant="h4" gutterBottom style={styles.headerText}>
            About FLOCK
          </Typography>

          <Typography variant="body1" style={styles.paragraphText}>
            FLOCK is built around the idea that coordinating events, plans, and
            projects with friends, family, or coworkers should be both fun and
            simple. We believe in removing barriers to productivity — no more
            lengthy group chats or endless polls to pick a date. Whether you’re
            planning a small meetup or a large group activity, FLOCK is here to
            streamline everything.
          </Typography>

          <Typography variant="body1" style={styles.paragraphText}>
            Our platform brings together scheduling, invitations, and reminders,
            so you can focus on the fun part: actually getting together! With just
            a few clicks, you can create an event, invite people, and pick dates
            that work for everyone. FLOCK handles the complicated bits in the
            background, like sending out notifications and tracking confirmations.
          </Typography>

          <Typography variant="body1" style={styles.paragraphText}>
            Interested in learning more? Feel free to explore, or sign up now to
            start creating your own events. We look forward to seeing how FLOCK
            helps bring your community together!
          </Typography>

          {/* Q&A Section (Accordions) */}
          <Box style={styles.accordionSection}>
            <Typography variant="h5" gutterBottom style={styles.accordionHeader}>
              Frequently Asked Questions
            </Typography>

            <Accordion style={styles.accordion}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography style={styles.accordionTitle}>
                  What makes FLOCK different from other scheduling apps?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography style={styles.accordionText}>
                  FLOCK combines scheduling, event planning, and voting features
                  into one streamlined platform. Instead of juggling multiple
                  tools, you can create and finalize plans in one place with
                  minimal hassle.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion style={styles.accordion}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography style={styles.accordionTitle}>
                  Is FLOCK free to use?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography style={styles.accordionText}>
                  Yes! Creating an account and using our core event features are
                  completely free. We may introduce premium features in the
                  future, but our goal is to keep the essential tools accessible
                  to everyone.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion style={styles.accordion}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel3a-content"
                id="panel3a-header"
              >
                <Typography style={styles.accordionTitle}>
                  How do I invite friends to my event?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography style={styles.accordionText}>
                  After creating an event, you can send invitations via email or
                  share a direct link with your friends. They don’t need an
                  account to respond, but signing up unlocks more features like
                  reminders and personal event tracking.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion style={styles.accordion}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel4a-content"
                id="panel4a-header"
              >
                <Typography style={styles.accordionTitle}>
                  Can I use FLOCK for business or team projects?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography style={styles.accordionText}>
                  Absolutely. FLOCK works well for both personal and professional
                  contexts. Teams can use it to coordinate deadlines, schedule
                  meetings, or plan off-site events.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default AboutPage;

/* ========== Styles ========== */
const styles: { [key: string]: React.CSSProperties } = {
  heroSection: {
    width: "100vw",
    minHeight: "40vh",
    backgroundColor: "#4CAF50",
    padding: "2rem",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage: "linear-gradient(135deg, #4CAF50 0%, #81C784 100%)",
    textAlign: "center",
  },
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
  accordionSection: {
    marginTop: "2rem",
  },
  accordionHeader: {
    marginBottom: "1rem",
    fontWeight: "bold",
    color: "#388E3C",
  },
  accordion: {
    marginBottom: "1rem",
    borderRadius: "4px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  accordionTitle: {
    fontWeight: 600,
    fontSize: "1rem",
    color: "#fff",
  },
  accordionText: {
    fontSize: "0.95rem",
    color: "#fff",
    lineHeight: 1.5,
  },
};