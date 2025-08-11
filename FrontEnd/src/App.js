import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Link, Navigate, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  AppBar, Box, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem,
  Divider, CircularProgress, Container
} from "@mui/material";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from '@mui/icons-material/Logout';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InventoryIcon from "@mui/icons-material/Inventory";
import EditNoteIcon from "@mui/icons-material/EditNote";

// Assets
import UOPLogo from './assets/UOP_logo.jpeg';
import BackgroundImg from './assets/Background.jpeg';

// API
import { getProfile, updateProfile } from "./api/auth";
import { fetchAppointments, createAppointment, cancelAppointment } from "./api/appointments";
import { fetchReports, fetchPrescriptions } from "./api/reports";

// Pages
import LoginPage from "./components/Patient/LoginPage";
import SignupPage from "./components/Patient/SignupPage";
import DashboardTab from "./components/Patient/DashboardTab";
import AppointmentsTab from "./components/Patient/AppointmentsTab";
import ReportsTab from "./components/Patient/ReportsTab";
import ProfilePage from "./components/Patient/ProfilePage";
import SupportPage from "./components/Patient/SupportPage";
import FAQPage from './components/Patient/FAQPage';

//Pharmacy Pages
import PharmacyDashboard from "./components/Pharmacy/PharmacyDashboard";
import InventoryPage from "./components/Pharmacy/Inventory";
import Prescriptions from "./components/Pharmacy/Prescriptions";
import UpdateInventory from "./components/Pharmacy/UpdateInventory";

// --- Role-Specific Navigation Links ---
const navLinksConfig = {
  patient: [
    { label: "Dashboard", path: "/patient/dashboard", icon: <DashboardIcon /> },
    { label: "Appointments", path: "/patient/appointments", icon: <CalendarTodayIcon /> },
    { label: "Reports", path: "/patient/reports", icon: <DescriptionIcon /> },
    { label: "Support", path: "/patient/support", icon: <ContactSupportIcon /> },
  ],
  doctor: [
    { label: "Dashboard", path: "/doctor/dashboard", icon: <DashboardIcon /> },
    { label: "My Schedule", path: "/doctor/schedule", icon: <CalendarTodayIcon /> },
    { label: "Patient Records", path: "/doctor/records", icon: <MedicalServicesIcon /> },
  ],
  pharmacist: [
    { label: "Dashboard", path: "/pharmacist/dashboard", icon: <DashboardIcon /> },
    { label: "View Prescriptions", path: "/pharmacist/view-prescriptions", icon: <ReceiptLongIcon /> },
    { label: "Inventory Search", path: "/pharmacist/inventory-search", icon: <InventoryIcon /> },
    { label: "Inventory Update", path: "/pharmacist/inventory-update", icon: <EditNoteIcon /> },
  ]
};

// --- Main Layout Component ---
// This component renders the shared UI elements like the navbar and sidebar.
// The <Outlet /> component renders the active nested route.
const MainLayout = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const isPatient = user.role === 'Student' || user.role === 'Staff';
  const userRoleKey = isPatient ? 'patient' : user.role.toLowerCase();
  const navLinks = navLinksConfig[userRoleKey] || [];

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleAvatarClick = (event) => setProfileAnchor(event.currentTarget);
  const handleProfileMenuClose = () => setProfileAnchor(null);
  
  const handleProfile = () => {
    handleProfileMenuClose();
    navigate('/profile');
  };

  const drawerContent = (
    <Box sx={{ width: 250, height: "100%", bgcolor: "#0c3c3c", color: "#fff" }} role="presentation">
      <Box sx={{ display: "flex", alignItems: "center", p: 2, justifyContent: "center", mt: 2 }}>
        <Box component="img" src={UOPLogo} alt="Logo" sx={{ height: 48, width: 48, borderRadius: '50%', p: '2px', bgcolor: 'white' }} />
      </Box>
      <List sx={{ mt: 1 }}>
        {navLinks.map((link) => (
          <ListItem key={link.path} disablePadding>
            <ListItemButton component={Link} to={link.path} selected={location.pathname === link.path} onClick={() => setDrawerOpen(false)} sx={{ "&.Mui-selected": { backgroundColor: "#173d3d" }, "&:hover": { backgroundColor: "#21867a22" } }}>
              <ListItemIcon sx={{ color: "#45d27a" }}>{link.icon}</ListItemIcon>
              <ListItemText primary={link.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1, bgcolor: "#45d27a" }} />
        <ListItem disablePadding>
          <ListItemButton onClick={() => { handleProfile(); setDrawerOpen(false); }}>
            <ListItemIcon sx={{ color: "#45d27a" }}><PersonIcon /></ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={onLogout}>
            <ListItemIcon sx={{ color: "#45d27a" }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" color="primary" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Box component={Link} to={`/${userRoleKey}/dashboard`} sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <Box component="img" src={UOPLogo} alt="Logo" sx={{ height: 40, width: 40, borderRadius: '50%', p: '2px', bgcolor: 'white', mr: 2 }} />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
              University of Peradeniya MIS
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navLinks.map((link) => (
              <Button key={link.label} component={Link} to={link.path} sx={{ color: 'white' }}>
                {link.label}
              </Button>
            ))}
          </Box>
          <IconButton sx={{ ml: 2 }} onClick={handleAvatarClick}>
            <Avatar sx={{ bgcolor: "#45d27a" }}>{user?.name?.charAt(0)}</Avatar>
          </IconButton>
          <Menu anchorEl={profileAnchor} open={Boolean(profileAnchor)} onClose={handleProfileMenuClose}>
            <MenuItem onClick={handleProfile}>Profile</MenuItem>
            <MenuItem onClick={onLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer variant="temporary" open={drawerOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} PaperProps={{ sx: { backgroundColor: "#0c3c3c", color: "#fff" } }}>
        {drawerContent}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
        <Toolbar />
        <Container maxWidth="lg">
          <Outlet /> {/* Renders the matched child route */}
        </Container>
      </Box>
    </Box>
  );
};

// --- Main App Component ---
function App() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userRole");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  const fetchAllUserData = useCallback(async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const profileData = await getProfile();
      setUser(profileData);
      
      if (profileData.role === 'Student' || profileData.role === 'Staff') {
        const [appointmentsData, reportsData, prescriptionsData] = await Promise.all([
          fetchAppointments(),
          fetchReports(),
          fetchPrescriptions(),
        ]);
        setAppointments(appointmentsData);
        setReports(reportsData);
        setPrescriptions(prescriptionsData);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    fetchAllUserData();
  }, []);

  const handleProfileUpdate = (updatedUser) => {
    setUser(currentUser => ({ ...currentUser, ...updatedUser }));
  };

  const handleBookAppointment = async (newApp, setFeedback) => {
    try {
      await createAppointment(newApp);
      const updatedAppointments = await fetchAppointments();
      setAppointments(updatedAppointments);
      setFeedback({ text: "Appointment requested successfully!", type: "success" });
    } catch (error) {
      console.error("Booking failed:", error);
      setFeedback({ text: error.message || "Failed to book appointment.", type: "error" });
    }
  };
    
  const handleCancelAppointment = async (appointmentId, setFeedback) => {
    try {
      await cancelAppointment(appointmentId);
      const updatedAppointments = await fetchAppointments();
      setAppointments(updatedAppointments);
      setFeedback({ text: "Appointment cancelled successfully.", type: "success" });
    } catch (error) {
      console.error("Cancellation failed:", error);
      setFeedback({ text: error.message || "Failed to cancel appointment.", type: "error" });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      position: 'relative',
      '&::before': {
        content: '""',
        backgroundImage: `url(${BackgroundImg})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        opacity: 0.08,
        zIndex: -1,
      }
    }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage onAuth={fetchAllUserData} />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Routes: All routes within this element will have the MainLayout */}
        <Route element={user ? <MainLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}>
          
          {/* Profile Page (accessible to all authenticated users) */}
          <Route path="profile" element={<ProfilePage user={user} onProfileUpdate={handleProfileUpdate} />} />

          {/* Patient Routes */}
          <Route path="patient/dashboard" element={<DashboardTab user={user} appointments={appointments} reports={reports} prescriptions={prescriptions} />} />
          <Route path="patient/appointments" element={<AppointmentsTab appointments={appointments} onBookSuccess={handleBookAppointment} onCancel={handleCancelAppointment} />} />
          <Route path="patient/reports" element={<ReportsTab history={reports} labs={reports} prescriptions={prescriptions} />} />
          <Route path="patient/support" element={<SupportPage />} />
          <Route path="patient/faq" element={<FAQPage />} />

          {/* Pharmacist Routes */}
          <Route path="pharmacist/dashboard" element={<PharmacyDashboard />} />
          <Route path="pharmacist/view-prescriptions" element={<Prescriptions />} />
          <Route path="pharmacist/inventory-search" element={<InventoryPage />} />
          <Route path="pharmacist/inventory-update" element={<UpdateInventory />} />
          
          {/* Add Doctor routes here following the same pattern */}

        </Route>

        {/* Redirect logic for the root path and any other unhandled paths */}
        <Route 
          path="*" 
          element={
            user
              ? <Navigate to={`/${(user.role === 'Student' || user.role === 'Staff') ? 'patient' : user.role.toLowerCase()}/dashboard`} replace />
              : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </Box>
  );
}

export default App;
