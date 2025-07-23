import React, { useState } from "react";
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import LoginPage from "./components/Patient/LoginPage";
import SignupPage from "./components/Patient/SignupPage";
import DashboardTab from "./components/Patient/DashboardTab";
import AppointmentsTab from "./components/Patient/AppointmentsTab";
import ReportsTab from "./components/Patient/ReportsTab";
import ProfilePage from "./components/Patient/ProfilePage";
import SupportPage from "./components/Patient/SupportPage";
import {
  Box, AppBar, Toolbar, Button, Container, Avatar, Typography, IconButton,
  Menu, MenuItem
} from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";

const mockUser = { name: "Student Name", avatar: "" };
const mockAppointments = [];
const mockReports = [];
const mockPrescriptions = [];
const mockHistory = [];
const mockLabs = [];

function App() {
  const location = useLocation();
  const hideNav = ["/login", "/signup"].includes(location.pathname);
  const [appointments, setAppointments] = useState(mockAppointments);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleBook = (newApp) => {
    setAppointments([...appointments, { ...newApp, id: Date.now(), status: "Pending" }]);
  };

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleProfile = () => {
    handleMenuClose();
    navigate("/profile");
  };
  const handleLogout = () => {
    handleMenuClose();
    // insert logout logic, e.g., clear auth token, redirect to login
    navigate("/login");
  };

  return (
    <>
      <CssBaseline />
      {!hideNav && (
        <AppBar position="static" color="primary" elevation={0} sx={{ boxShadow: "0 3px 7px rgba(12,60,60,0.08)" }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
              <MedicalServicesIcon fontSize="large" />
            </IconButton>
            <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
              University of Peradeniya MIS
            </Typography>
            <Button component={Link} to="/dashboard" color="inherit" sx={{ mx: 1 }}>Dashboard</Button>
            <Button component={Link} to="/appointments" color="inherit" sx={{ mx: 1 }}>Appointments</Button>
            <Button component={Link} to="/reports" color="inherit" sx={{ mx: 1 }}>Reports</Button>
            <Button component={Link} to="/support" color="inherit" sx={{ mx: 1, color: "#fff" }}>Support</Button>
            <IconButton sx={{ ml: 1 }} onClick={handleAvatarClick}>
              <Avatar src={mockUser.avatar} alt={mockUser.name} sx={{ bgcolor: "#45d27a" }}>
                {mockUser.name.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
      )}
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 5, lg: 7 } }}>
        <Box>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={
              <DashboardTab user={mockUser}
                appointments={appointments}
                reports={mockReports}
                prescriptions={mockPrescriptions}
              />
            }/>
            <Route path="/appointments" element={
              <AppointmentsTab appointments={appointments} onBook={handleBook} />
            } />
            <Route path="/reports" element={
              <ReportsTab history={mockHistory} labs={mockLabs} prescriptions={mockPrescriptions} />
            } />
            <Route path="/profile" element={<ProfilePage user={mockUser} />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Box>
      </Container>
    </>
  );
}

export default App;
