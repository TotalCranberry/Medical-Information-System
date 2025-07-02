import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import DashboardTab from "./components/DashboardTab";
import AppointmentsTab from "./components/AppointmentsTab";
import ReportsTab from "./components/ReportsTab";
import ProfilePage from "./components/ProfilePage";
import SupportPage from "./components/SupportPage";
import { Box, AppBar, Toolbar, Button } from "@mui/material";

const mockUser = { name: "Student Name" };
const mockAppointments = [];
const mockReports = [];
const mockPrescriptions = [];
const mockHistory = [];
const mockLabs = [];

function App() {
    //const location = useLocation();
    //const hideNav = ["/login","/signup"].includes(location.pathname)
    const [appointments, setAppointments] = useState(mockAppointments);

    const handleBook = (newApp) => {
        setAppointments([...appointments, { ...newApp, id: Date.now(), status: "Pending" }]);
    };

    return (
        <Router>
        <CssBaseline />
        
            <AppBar position="static">
                <Toolbar>
                    <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
                    <Button color="inherit" component={Link} to="/appointments">Appointments</Button>
                    <Button color="inherit" component={Link} to="/reports">Reports</Button>
                    <Button color="inherit" component={Link} to="/profile">Profile</Button>
                    <Button color="inherit" component={Link} to="/support">Support</Button>
                    <Button color="inherit" component={Link} to="/login">Login</Button>
                    <Button color="inherit" component={Link} to="/signup">Sign Up</Button>
                </Toolbar>
            </AppBar>
        
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
            </Routes>
        </Box>
        </Router>
    );
}

export default App;
