import React, { useState } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import LoginPage from "./components/Patient/LoginPage";
import SignupPage from "./components/Patient/SignupPage";
import DashboardTab from "./components/Patient/DashboardTab";
import AppointmentsTab from "./components/Patient/AppointmentsTab";
import ReportsTab from "./components/Patient/ReportsTab";
import ProfilePage from "./components/Patient/ProfilePage";
import SupportPage from "./components/Patient/SupportPage";
import { Box, AppBar, Toolbar, Button } from "@mui/material";

const mockUser = { name: "Student Name" };
const mockAppointments = [];
const mockReports = [];
const mockPrescriptions = [];
const mockHistory = [];
const mockLabs = [];

function App() {
  const location = useLocation();
  const hideNav = ["/login", "/signup"].includes(location.pathname);

  const [appointments, setAppointments] = useState(mockAppointments);

  const handleBook = (newApp) => {
    setAppointments([...appointments, { ...newApp, id: Date.now(), status: "Pending" }]);
  };

  return (
    <>
      <CssBaseline />
      {!hideNav && (
        <AppBar position="static">
          <Toolbar>
            <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
            <Button color="inherit" component={Link} to="/appointments">Appointments</Button>
            <Button color="inherit" component={Link} to="/reports">Reports</Button>
            <Button color="inherit" component={Link} to="/profile">Profile</Button>
            <Button color="inherit" component={Link} to="/support">Support</Button>
          </Toolbar>
        </AppBar>
      )}
      <Box>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={
            <DashboardTab
              user={mockUser}
              appointments={appointments}
              reports={mockReports}
              prescriptions={mockPrescriptions}
            />
          } />
          <Route path="/appointments" element={
            <AppointmentsTab
              appointments={appointments}
              onBook={handleBook}
            />
          } />
          <Route path="/reports" element={
            <ReportsTab
              history={mockHistory}
              labs={mockLabs}
              prescriptions={mockPrescriptions}
            />
          } />
          <Route path="/profile" element={<ProfilePage user={mockUser} />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Box>
    </>
  );
}

export default App;
