import React, { useState } from "react";
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar, Box, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, useTheme,
  useMediaQuery, Divider
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import PersonIcon from "@mui/icons-material/Person";

import UOPLogo from './assets/UOP_logo.jpeg';

// Use the local background image
import BackgroundImg from './assets/Background.jpeg';

import LoginPage from "./components/Patient/LoginPage";
import SignupPage from "./components/Patient/SignupPage";
import DashboardTab from "./components/Patient/DashboardTab";
import AppointmentsTab from "./components/Patient/AppointmentsTab";
import ReportsTab from "./components/Patient/ReportsTab";
import ProfilePage from "./components/Patient/ProfilePage";
import SupportPage from "./components/Patient/SupportPage";

const navLinks = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { label: "Appointments", path: "/appointments", icon: <CalendarTodayIcon /> },
  { label: "Reports", path: "/reports", icon: <DescriptionIcon /> },
  { label: "Support", path: "/support", icon: <ContactSupportIcon /> },
];

const mockUser = { name: "Student Name", avatar: "" };
const mockAppointments = [];
const mockReports = [];
const mockPrescriptions = [];
const mockHistory = [];
const mockLabs = [];

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideNav = ["/login", "/signup"].includes(location.pathname);

  const [appointments, setAppointments] = useState(mockAppointments);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleAvatarClick = (event) => setProfileAnchor(event.currentTarget);
  const handleProfileMenuClose = () => setProfileAnchor(null);
  const handleProfile = () => { handleProfileMenuClose(); navigate("/profile"); };
  const handleLogout = () => { handleProfileMenuClose(); navigate("/login"); };
  const handleBook = (newApp) => { setAppointments([...appointments, { ...newApp, id: Date.now(), status: "Pending" }]); };

  const drawer = (
    <Box sx={{ width: 250, height: "100%", bgcolor: "#0c3c3c", color: "#fff" }} role="presentation" onClick={handleDrawerToggle} onKeyDown={handleDrawerToggle}>
      <Box sx={{ display: "flex", alignItems: "center", mr: 2, mt:2, mb: 2, justifyContent: "center" }}>
        <Box
          sx={{
            height: 48,
            width: 48,
            borderRadius: "50%",
            bgcolor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            boxShadow: 1
          }}
        >
          <img
            src={UOPLogo}
            alt="University of Peradeniya Logo"
            style={{ height: 42, width: 42, objectFit: "contain" }}
          />
        </Box>
      </Box>
      <List sx={{ mt: 1 }}>
        {navLinks.map((link) => (
          <ListItem key={link.path} disablePadding>
            <ListItemButton
              component={Link}
              to={link.path}
              sx={{
                color: "#fff",
                fontWeight: location.pathname === link.path ? 700 : 500,
                backgroundColor: location.pathname === link.path ? "#21867a22" : "transparent",
                "&:hover": {
                  fontWeight: 700,
                  backgroundColor: "#173d3d"
                }
              }}
            >
              <ListItemIcon sx={{ color: "#45d27a" }}>{link.icon}</ListItemIcon>
              <ListItemText primary={link.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1, bgcolor: "#45d27a" }} />
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => { setDrawerOpen(false); handleProfile(); }}
            sx={{
              color: "#fff",
              "&:hover": {
                fontWeight: 700,
                backgroundColor: "#173d3d"
              }
            }}
          >
            <ListItemIcon>
              <PersonIcon sx={{ color: "#45d27a" }} />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => { setDrawerOpen(false); handleLogout(); }}
            sx={{
              color: "#fff",
              "&:hover": {
                fontWeight: 700,
                backgroundColor: "#173d3d"
              }
            }}
          >
            <ListItemIcon>
              <Avatar sx={{ width: 24, height: 24, bgcolor: "#45d27a", fontSize: 16 }}>
                {mockUser.name.charAt(0)}
              </Avatar>
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {!hideNav && (
        <AppBar position="static" color="primary" elevation={0} sx={{ boxShadow: "0 3px 7px rgba(12,60,60,0.08)" }}>
          <Toolbar>
            <Box
              sx={{
                mr: 2,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Box
                sx={{
                  bgcolor: "#fff",
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  boxShadow: 1
                }}
              >
                <img
                  src={UOPLogo}
                  alt="University of Peradeniya Logo"
                  style={{ width: 42, height: 42, objectFit: "contain" }}
                />
              </Box>
            </Box>
            <Typography variant="h6" component="div" ml={2} sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
              University of Peradeniya MIS
            </Typography>
            {!isMobile && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {navLinks.filter(link => link.label !== "Support").map((link) => (
                  <Button
                    key={link.path}
                    component={Link}
                    to={link.path}
                    color="inherit"
                    sx={{
                      mx: 1,
                      fontWeight: 500,
                      fontSize: "1rem",
                      "&.active": { fontWeight: 700 },
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
                <Button
                  component={Link}
                  to="/support"
                  color="primary"
                  sx={{ mx: 1, color: "#fff" }}
                >
                  Support
                </Button>
              </Box>
            )}
            {isMobile && (
              <IconButton
                edge="end"
                onClick={handleDrawerToggle}
                sx={{
                  color: "#0c3c3c",
                  backgroundColor: "#fff",
                  "&:hover": {
                    backgroundColor: "#0c3c3c",
                    color: "#fff",
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            {!isMobile && (
              <>
                <IconButton sx={{ ml: 1 }} onClick={handleAvatarClick}>
                  <Avatar sx={{ bgcolor: "#45d27a" }}>
                    {mockUser.name.charAt(0)}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={profileAnchor}
                  open={Boolean(profileAnchor)}
                  onClose={handleProfileMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  PaperProps={{
                    sx: {
                      backgroundColor: "#0c3c3c",
                      color: "#fff",
                    }
                  }}
                >
                  <MenuItem onClick={handleProfile} sx={{ color: "#fff" }}>Profile</MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ color: "#fff" }}>Logout</MenuItem>
                </Menu>
              </>
            )}
          </Toolbar>
        </AppBar>
      )}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            backgroundColor: "#0c3c3c",
            color: "#fff"
          }
        }}
      >
        {drawer}
      </Drawer>
      <Box sx={{
        minHeight: "90vh",
        bgcolor: "#f5f7fa",
        px: { xs: 1, sm: 2, md: 4 },
        py: { xs: 2, md: 5, lg: 7 },
        position: "relative",
        "&::before": {
          content: '""',
          backgroundImage: `url(${BackgroundImg})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          position: "absolute",
          zIndex: 0,
          top: 0, left: 0, right: 0, bottom: 0,
          opacity: 0.08,
          pointerEvents: "none"
        }
      }}>
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/dashboard"
              element={
                <DashboardTab
                  user={mockUser}
                  appointments={appointments}
                  reports={mockReports}
                  prescriptions={mockPrescriptions}
                />
              }
            />
            <Route
              path="/appointments"
              element={<AppointmentsTab appointments={appointments} onBook={handleBook} />}
            />
            <Route
              path="/reports"
              element={<ReportsTab history={mockHistory} labs={mockLabs} prescriptions={mockPrescriptions} />}
            />
            <Route path="/profile" element={<ProfilePage user={mockUser} />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Box>
      </Box>
    </>
  );
}

export default App;
