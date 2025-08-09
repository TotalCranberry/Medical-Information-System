import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Link, Navigate, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  AppBar, Box, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, useTheme,
  useMediaQuery, Divider, CircularProgress, Container
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
import PeopleIcon from "@mui/icons-material/People";
import ScienceIcon from "@mui/icons-material/Science";
import MedicationIcon from "@mui/icons-material/Medication";

// Assets
import UOPLogo from './assets/UOP_logo.jpeg';
import BackgroundImg from './assets/Background.jpeg';

// API
import { getProfile } from "./api/auth";
import { fetchAppointments, createAppointment } from "./api/appointments";
import { fetchReports, fetchPrescriptions } from "./api/reports";

// Patient/Student Pages
import LoginPage from "./components/Patient/LoginPage";
import SignupPage from "./components/Patient/SignupPage";
import DashboardTab from "./components/Patient/DashboardTab";
import AppointmentsTab from "./components/Patient/AppointmentsTab";
import ReportsTab from "./components/Patient/ReportsTab";
import ProfilePage from "./components/Patient/ProfilePage";
import SupportPage from "./components/Patient/SupportPage";

// Doctor Components
import DoctorDashboard from './components/Doctor/DoctorDashboard';
import PatientsTab from './components/Doctor/PatientsTab';
import PatientProfile from './components/Doctor/PatientProfile';
import RequestLabTest from './components/Doctor/RequestLabTest';
import PrescriptionsTab from './components/Doctor/PrescriptionsTab';

// --- Role-Specific Navigation Links ---
const studentNavLinks = [
  { label: "Dashboard", path: "/student/dashboard", icon: <DashboardIcon /> },
  { label: "Appointments", path: "/student/appointments", icon: <CalendarTodayIcon /> },
  { label: "Reports", path: "/student/reports", icon: <DescriptionIcon /> },
  { label: "Support", path: "/student/support", icon: <ContactSupportIcon /> },
];

const doctorNavLinks = [
  { label: "Dashboard", path: "/doctor/dashboard", icon: <DashboardIcon /> },
  { label: "Patients", path: "/doctor/patients", icon: <PeopleIcon /> },
  { label: "Request Test", path: "/doctor/request-test", icon: <ScienceIcon /> },
  { label: "Prescriptions", path: "/doctor/prescriptions", icon: <MedicationIcon /> },
  { label: "Support", path: "/doctor/support", icon: <ContactSupportIcon /> },
];

// Mock data for doctor functionality (as provided in your code)
const mockPatients = [
  { id: 1, name: "John Doe", faculty: "Engineering", age: 22 },
  { id: 2, name: "Jane Smith", faculty: "Medicine", age: 24 },
  { id: 3, name: "Mike Johnson", faculty: "Science", age: 23 },
  { id: 4, name: "Sarah Wilson", faculty: "Arts", age: 21 },
  { id: 5, name: "David Brown", faculty: "Engineering", age: 25 }
];

const mockPatientDetails = {
  id: 1,
  name: "John Doe",
  age: 24,
  faculty: "Science Faculty",
  conditions: ["Hypertension", "Diabetes Type 2"],
  allergies: ["Penicillin", "Shellfish"],
  diagnoses: [
    { date: "2024-01-15", condition: "Common Cold" },
    { date: "2024-01-10", condition: "Routine Checkup" }
  ],
  vitals: [
    { date: "2024-01-15", bloodPressure: "120/80", temperature: "98.6" },
    { date: "2024-01-10", bloodPressure: "118/78", temperature: "98.4" }
  ],
  weightChart: [
    { date: "2024-01-15", weight: 75 },
    { date: "2024-01-10", weight: 74.5 }
  ],
  medicalHistory: [
    { type: "Diagnosis", date: "2024-01-15", description: "Common Cold" },
    { type: "Prescription", date: "2024-01-12", description: "Amoxicillin" },
    { type: "Lab Test", date: "2024-01-10", description: "CBC Test" },
  ]
};

const mockTodaysAppointments = [
  { id: 1, time: "09:00 AM", patientName: "John Doe", status: "Confirmed" },
  { id: 2, time: "10:30 AM", patientName: "Jane Smith", status: "Pending" },
  { id: 3, time: "02:00 PM", patientName: "Mike Johnson", status: "Confirmed" }
];

const mockRecentActivity = [
  { description: "Prescription written for John Doe", timestamp: "2 hours ago" },
  { description: "Lab test requested for Jane Smith", timestamp: "4 hours ago" },
  { description: "Patient consultation completed", timestamp: "1 day ago" },
  { description: "Medical report reviewed", timestamp: "2 days ago" }
];

const mockLabRequests = [
  { id: 1, date: "2024-01-15", testType: "Blood Test", patientName: "John Doe", status: "Pending" },
  { id: 2, date: "2024-01-14", testType: "X-Ray", patientName: "Jane Smith", status: "Completed" }
];

const mockPrescriptionHistory = [
  { id: 1, date: "2024-01-15", time: "10:30 AM", patientName: "John Doe", status: "Dispensed" },
  { id: 2, date: "2024-01-14", time: "02:15 PM", patientName: "Jane Smith", status: "Pending" }
];

// --- Main Layout Component (Now Role-Aware) ---
const MainLayout = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const navLinks = user.role === 'Student' ? studentNavLinks : doctorNavLinks;
  const basePath = `/${user.role.toLowerCase()}`;

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleAvatarClick = (event) => setProfileAnchor(event.currentTarget);
  const handleProfileMenuClose = () => setProfileAnchor(null);
  const handleProfile = () => { 
    handleProfileMenuClose(); 
    navigate(`${basePath}/profile`); 
  };

  const drawerContent = (
    <Box sx={{ width: 250, height: "100%", bgcolor: "#0c3c3c", color: "#fff" }} role="presentation">
      <Toolbar />
      <Box sx={{ display: "flex", alignItems: "center", p: 2, justifyContent: "center" }}>
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
      <AppBar position="fixed" color="primary" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, borderRadius: 0 }}>
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          
          <Box component={Link} to={`${basePath}/dashboard`} sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <Box component="img" src={UOPLogo} alt="Logo" sx={{ height: 40, width: 40, borderRadius: '50%', p: '2px', bgcolor: 'white', mr: 2 }} />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
              University MIS
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
          <Outlet /> 
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
    const userRole = localStorage.getItem("userRole"); // Assuming role is also stored
    if (!token || !userRole) {
      setUser(null); // Explicitly set user to null
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // If a token exists, fetch profile data
      const profileData = await getProfile();
      setUser(profileData);
      
      if (profileData.role === 'Student') {
        const [appointmentsData, reportsData, prescriptionsData] = await Promise.all([
          fetchAppointments(),
          fetchReports(),
          fetchPrescriptions(),
        ]);
        setAppointments(appointmentsData);
        setReports(reportsData);
        setPrescriptions(prescriptionsData);
      }
      // NOTE: For the doctor's part, we are using mock data, so no API calls are needed here.
      // If a doctor API existed, you would fetch data here as well.
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    fetchAllUserData();
  }, [fetchAllUserData]);

  const handleBookAppointment = async (newApp) => {
    try {
      await createAppointment(newApp);
      const updatedAppointments = await fetchAppointments();
      setAppointments(updatedAppointments);
    } catch (error) {
      console.error("Booking failed:", error);
    }
  };

  // Doctor functionality handlers
  const handleLabTestRequest = (testData) => {
    console.log("Lab test request submitted:", testData);
    return Promise.resolve({ success: true, message: "Lab test request submitted successfully!" });
  };

  const handlePrescriptionSubmit = (prescriptionData) => {
    console.log("Prescription submitted:", prescriptionData);
    return Promise.resolve({ success: true, message: "Prescription submitted successfully!" });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Define a wrapper for PatientProfile to pass the correct patient data
  const PatientProfileRouteWrapper = ({ patients, patientDetails, onRequestLabTest, onWritePrescription }) => {
    const location = useLocation();
    const currentPatientId = parseInt(location.pathname.split('/').pop());
    const selectedPatient = patients.find(p => p.id === currentPatientId) || patientDetails;
    
    return (
      <PatientProfile
        patient={selectedPatient}
        onRequestLabTest={onRequestLabTest}
        onWritePrescription={onWritePrescription}
      />
    );
  };

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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.08,
        zIndex: -1,
      }
    }}>
      <Routes>
        <Route path="/login" element={<LoginPage onAuth={fetchAllUserData} />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Student Routes */}
        <Route 
          path="/student/*"
          element={user && user.role === 'Student' ? <MainLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        >
          <Route path="dashboard" element={<DashboardTab user={user} appointments={appointments} reports={reports} prescriptions={prescriptions} />} />
          <Route path="appointments" element={<AppointmentsTab appointments={appointments} onBookSuccess={handleBookAppointment} />} />
          <Route path="reports" element={<ReportsTab history={reports} labs={reports} prescriptions={prescriptions} />} />
          <Route path="profile" element={<ProfilePage user={user} />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="*" element={<Navigate to="dashboard" />} />
        </Route>

        {/* Doctor Routes */}
        <Route 
          path="/doctor/*"
          element={user && user.role === 'Doctor' ? <MainLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        >
          <Route path="dashboard" element={<DoctorDashboard doctor={user} todaysAppointments={mockTodaysAppointments} recentActivity={mockRecentActivity} />} />
          <Route path="patients" element={<PatientsTab patients={mockPatients} />} />
          <Route path="patients/:patientId" element={
            <PatientProfileRouteWrapper 
              patients={mockPatients} 
              patientDetails={mockPatientDetails} 
              onRequestLabTest={(patient) => navigate('/doctor/request-test', { state: { patient } })}
              onWritePrescription={(patient) => navigate('/doctor/prescriptions', { state: { patient } })}
            />
          } />
          <Route path="request-test" element={<RequestLabTest pendingRequests={mockLabRequests} onSubmit={handleLabTestRequest} />} />
          <Route path="prescriptions" element={<PrescriptionsTab recentPrescriptions={mockPrescriptionHistory} onSubmit={handlePrescriptionSubmit} />} />
          <Route path="profile" element={<ProfilePage user={user} />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="*" element={<Navigate to="dashboard" />} />
        </Route>

        {/* Catch-all route to redirect based on user status */}
        <Route 
          path="*" 
          element={
            <Navigate to={user ? `/${user.role.toLowerCase()}/dashboard` : "/login"} />
          } 
        />
      </Routes>
    </Box>
  );
}

export default App;