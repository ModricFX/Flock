import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Box, Button } from "@mui/material";
import { authService } from '../../services/authservice';


const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkUserData = async () => {
    try {
      const result = await authService.getUserData();
      setIsAuthenticated(result.success);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsAuthenticated(false); // Handle error by assuming user is not authenticated
    }
  };

  useEffect(() => {
    checkUserData();
    const homeTypo = document.getElementById("home-typo");
    const handleScroll = () => {
      const boxHeight = document.getElementById("home-box")?.offsetHeight || 0;
      if (window.scrollY > boxHeight) {
        if (homeTypo) {
          homeTypo.style.transition = "opacity 0.3s ease-in";
          homeTypo.style.opacity = "1";
          homeTypo.innerHTML = '<img src="flock-logo-bel.svg" alt="Flock Logo" style="width: 150px; height: auto; margin-top: 10px;" />';
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

  const handleSignUp = () => {
    navigate("/auth/register");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handleLearnMore = () => {
    navigate("/about");
  };

  return (
    <>
      {/* Hero Section */}
      <Box id="home-box" style={styles.heroSection}>
        <div>
          <img src="/flock-logo-bel.svg" alt="FLOCK Logo" style={{ marginBottom: "20px" }} />
        </div>
        <Box style={styles.buttonGroup}>
          {isAuthenticated ? (
            <Button variant="contained" style={styles.dashboardButton} onClick={handleDashboard}>
              Dashboard
            </Button>
          ) : (
            <Button variant="contained" style={styles.signUpButton} onClick={handleSignUp}>
              Sign Up
            </Button>
          )}
          <Button variant="outlined" style={styles.learnMoreButton} onClick={handleLearnMore}>
            Learn More
          </Button>
        </Box>
      </Box>

      {/* Content Section */}
      <Box style={styles.contentContainer}>
        <Container maxWidth="md" style={styles.contentInner}>
          <Typography variant="h5" gutterBottom>
            Welcome to FLOCK
          </Typography>
          <Typography variant="body1" paragraph>
            FLOCK is a platform that makes coordinating group events and meetups as easy as possible.
            Whether you’re planning a birthday, an office lunch, or a spontaneous get-together with friends,
            we give you the tools to make it all happen — without the usual frustration of back-and-forth messaging.
          </Typography>

          <Box style={styles.infoImagesContainer}>
            <Box style={styles.infoImage}>
              <img
                src="../src/assets/PlanEvents.png"
                alt="Plan your events"
                style={styles.imgStyle}
              />
              <Typography variant="body2" align="center">
                Plan events with just a few clicks
              </Typography>
            </Box>
            <Box style={styles.infoImage}>
              <img
                src="../src/assets/InviteFriends.png"
                alt="Invite your friends"
                style={styles.imgStyle}
              />
              <Typography variant="body2" align="center">
                Invite friends and collaborate in real time
              </Typography>
            </Box>
          </Box>

          <Typography variant="body1" paragraph>
            Ready to see how it works? Scroll down or click "Learn More" to dive deeper
            into what FLOCK has in store. You can sign up immediately to start planning your next event!
          </Typography>

          <Box style={styles.spacer} />

          <Typography variant="h6" gutterBottom>
            Why FLOCK?
          </Typography>
          <Typography variant="body1" paragraph>
            - Easy scheduling with a visual overview of everyone’s availability<br />
            - Simple sign-up: create an account and begin scheduling right away<br />
            - Automatically handle confirmations and reminders<br />
            - ...and much more!
          </Typography>
        </Container>
      </Box>
    </>
  );
};

export default HomePage;

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
  buttonGroup: {
    display: "flex",
    gap: "1rem",
  },
  signUpButton: {
    backgroundColor: "#388E3C",
    color: "#fff",
  },
  dashboardButton: {
    backgroundColor: "#FFA726",
    color: "#fff",
  },
  learnMoreButton: {
    color: "#ffffff",
    borderColor: "#ffffff",
  },
  contentContainer: {
    backgroundColor: "#FAFDF9",
    padding: "2rem 0",
  },
  contentInner: {
    backgroundColor: "#ffffff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    color: "#333",
  },
  spacer: {
    height: "50px",
  },
  infoImagesContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", // Dynamic columns based on available space
    gap: "2rem",
    marginBottom: "2rem",
    justifyContent: "center",
    alignItems: "flex-start",
},
infoImage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
},
imgStyle: {
    width: "100%", // Take the full width of the container
    height: "auto", // Set a consistent height for all images
    objectFit: "cover", // Ensure the image fits without distortion
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "0.5rem",
},



};
