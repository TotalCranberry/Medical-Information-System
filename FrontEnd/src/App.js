import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation
} from "react-router-dom";

import CssBaseline from "@mui/material/CssBaseline";
import { Box, AppBar, Toolbar, Button } from "@mui/material";

// Patient-related pages
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import DashboardTab from "./components/DashboardTab";
import AppointmentsTab from "./components/AppointmentsTab";
import ReportsTab from "./components/ReportsTab";
import ProfilePage from "./components/ProfilePage";
import SupportPage from "./components/SupportPage";

// Pharmacy pages
import PharmacyNavBar from "./components/Pharmacy/PharmacyNavBar";
import PharmacyDashboard from "./components/Pharmacy/PharmacyDashboard";
import PrescriptionsPage from "./components/Pharmacy/PrescriptionsPage";
import InventoryPage from "./components/Pharmacy/InventoryPage";
import UpdateInventoryPage from "./components/Pharmacy/UpdateInventoryPage"; 

const mockUser = { name: "Student Name" };
const mockAppointments = [];
const mockReports = [];
const mockPrescriptions = [];
const mockHistory = [];
const mockLabs = [];

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const location = useLocation();
  const hideNav = ["/login", "/signup"].includes(location.pathname);
  const isPharmacyPage = [
    "/pharmacy",
    "/prescriptions",
    "/inventory",
    "/update-inventory"
  ].includes(location.pathname);

  const [appointments, setAppointments] = useState(mockAppointments);

  const handleBook = (newApp) => {
    setAppointments([
      ...appointments,
      { ...newApp, id: Date.now(), status: "Pending" }
    ]);
  };

  return (
    <>
      <CssBaseline />

      {/* Conditional Navbar */}
      {isPharmacyPage ? (
        <PharmacyNavBar />
      ) : !hideNav && (
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
      )}

      {/* Page Routes */}
      <Box>
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
            element={
              <AppointmentsTab
                appointments={appointments}
                onBook={handleBook}
              />
            }
          />
          <Route
            path="/reports"
            element={
              <ReportsTab
                history={mockHistory}
                labs={mockLabs}
                prescriptions={mockPrescriptions}
              />
            }
          />
          <Route path="/profile" element={<ProfilePage user={mockUser} />} />
          <Route path="/support" element={<SupportPage />} />

          {/* Pharmacy Routes */}
          <Route path="/pharmacy" element={<PharmacyDashboard />} />
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/update-inventory" element={<UpdateInventoryPage />} /> 

          {/* Catch-All */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </>
  );
}

export default AppWrapper;
