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
import PeopleIcon from "@mui/icons-material/People";
import ScienceIcon from "@mui/icons-material/Science";
import MedicationIcon from "@mui/icons-material/Medication";
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import HistoryIcon from '@mui/icons-material/History';
import CampaignIcon from '@mui/icons-material/Campaign';

// Assets
import UOPLogo from './assets/UOP_logo.jpeg';
import BackgroundImg from './assets/Background.jpeg';

// API
import { getProfile } from "./api/auth";
import { fetchAppointments, createAppointment, cancelAppointment } from "./api/appointments";
import { fetchDiagnoses, fetchMedicals, fetchPrescriptions, fetchReports} from "./api/reports";

// Patient pages
import LoginPage from "./components/Patient/LoginPage";
import SignupPage from "./components/Patient/SignupPage";
import DashboardTab from "./components/Patient/DashboardTab";
import AppointmentsTab from "./components/Patient/AppointmentsTab";
import ReportsTab from "./components/Patient/ReportsTab";
import ProfilePage from "./components/Patient/ProfilePage";
import SupportPage from "./components/Patient/SupportPage";
import FAQPage from './components/Patient/FAQPage';
import MedicalForm from './components/Patient/MedicalForm';

// Pharmacy pages
import PharmacyDashboard from "./components/Pharmacy/PharmacyDashboard";
import InventoryPage from "./components/Pharmacy/Inventory";
import Prescriptions from "./components/Pharmacy/Prescriptions";
import UpdateInventory from "./components/Pharmacy/UpdateInventory";
import PrescriptionPrint from "./components/Pharmacy/PrescriptionPrint";
import Invoice from "./components/Pharmacy/Invoice";
import ViewInvoices from "./components/Pharmacy/ViewInvoices";

// Doctor pages
import DoctorDashboard from './components/Doctor/DoctorDashboard';
import PatientsTab from './components/Doctor/PatientsTab';
import PatientProfile from './components/Doctor/PatientProfile';
import RequestLabTest from './components/Doctor/RequestLabTest';
import RequestLabTestForm from './components/Doctor/RequestLabTestForm';
import PrescriptionsTab from './components/Doctor/PrescriptionsTab';
import IssueMedical from './components/Doctor/IssueMedical';
import ViewMedical from './components/Doctor/ViewMedical';
import DoctorSignatureSeal from './components/Doctor/DoctorSignatureSeal';

// Laboratory pages
import LabDashboard from './components/Laboratory/LabDashboard';
import LabRequests from './components/Laboratory/LabTests';
import LabResults from './components/Laboratory/LabResults';

// Admin pages
import UserManagement from './components/Admin/UserManagement';
import AuditLogPage from './components/Admin/AuditLogs';
import CreateAnnouncement from './components/Admin/CreateAnnouncement';
import SupportTicketsPage from './components/Admin/SupportTicketsPage';
import NotificationBell from './components/NotificationBell';

const mockLabRequests = [
  { id: 1, date: "2024-01-15", testType: "Blood Test", patientName: "John Doe", status: "Pending" },
  { id: 2, date: "2024-01-14", testType: "X-Ray", patientName: "Jane Smith", status: "Completed" }
];

const mockPrescriptionHistory = [
  { id: 1, date: "2024-01-15", time: "10:30 AM", patientName: "John Doe", status: "Dispensed" },
  { id: 2, date: "2024-01-14", time: "02:15 PM", patientName: "Jane Smith", status: "Pending" }
];

// --- Role-Specific Navigation Links ---
const navLinksConfig = {
  patient: [
    { label: "Dashboard", path: "/patient/dashboard", icon: <DashboardIcon /> },
    { label: "Appointments", path: "/patient/appointments", icon: <CalendarTodayIcon /> },
    { label: "Reports", path: "/patient/reports", icon: <DescriptionIcon /> },
    { label: "Support", path: "/patient/support", icon: <ContactSupportIcon /> },
    { label: "Upload Medical Form", path: "/patient/upload-medical-form", icon: <DescriptionIcon />, roles: ['Student'] }
  ],
  doctor: [
    { label: "Dashboard", path: "/doctor/dashboard", icon: <DashboardIcon /> },
    { label: "Patients", path: "/doctor/patients", icon: <PeopleIcon /> },
    { label: "Signature & Seal", path: "/doctor/signature-seal", icon: <EditNoteIcon /> },
    { label: "Support", path: "/doctor/support", icon: <ContactSupportIcon /> },
  ],
  pharmacist: [
    { label: "Dashboard", path: "/pharmacist/dashboard", icon: <DashboardIcon /> },
    { label: "View Prescriptions", path: "/pharmacist/view-prescriptions", icon: <ReceiptLongIcon /> },
    { label: "View Invoices", path: "/pharmacist/view-invoices", icon: <ReceiptLongIcon /> },
    { label: "Inventory Search", path: "/pharmacist/inventory-search", icon: <InventoryIcon /> },
    { label: "Inventory Update", path: "/pharmacist/inventory-update", icon: <EditNoteIcon /> },
  ],
  labtechnician: [
    { label: "Dashboard", path: "/labtechnician/dashboard", icon: <DashboardIcon /> },
    { label: "Lab Requests", path: "/labtechnician/lab-requests", icon: <MedicalServicesIcon /> },
    { label: "Lab Results", path: "/labtechnician/lab-results", icon: <DescriptionIcon /> },
  ],
  admin: [
    { label: "User Management", path: "/admin/dashboard", icon: <SupervisorAccountIcon /> },
    { label: "Audit Log", path: "/admin/audit-log", icon: <HistoryIcon /> },
    { label: "Announcements", path: "/admin/announcements", icon: <CampaignIcon /> },
    { label: "Support Tickets", path: "/admin/support-tickets", icon: <ContactSupportIcon /> }
  ]
};

// --- Main Layout Component ---
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
      <Box sx={{ display: "flex", alignItems: "center", p: 2, justifyContent: "center", mt: 2 }} />
      <List sx={{ mt: 1 }}>
        {navLinks.filter(link => !link.roles || link.roles.includes(user.role)).map((link) => (
          <ListItem key={link.path} disablePadding>
            <ListItemButton
              component={Link}
              to={link.path}
              selected={location.pathname === link.path}
              onClick={() => setDrawerOpen(false)}
              sx={{ "&.Mui-selected": { backgroundColor: "#173d3d" }, "&:hover": { backgroundColor: "#21867a22" } }}
            >
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
      <AppBar position="fixed" color="primary" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 , borderRadius: '0'}}>
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
            {navLinks.filter(link => !link.roles || link.roles.includes(user.role)).map((link) => (
              <Button key={link.label} component={Link} to={link.path} sx={{ color: 'white' }}>
                {link.label}
              </Button>
            ))}
          </Box>
          <NotificationBell />
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
  const [diagnoses, setDiagnoses] = useState([]);
  const [medicals, setMedicals] = useState([]);
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

      // Load patient data if Student/Staff
      if (profileData.role === 'Student' || profileData.role === 'Staff') {
        const [appointmentsData, diagnosesData, medicalsData, reportsData, prescriptionsData] = await Promise.all([
          fetchAppointments(),
          fetchDiagnoses(),
          fetchMedicals(),
          fetchPrescriptions(),
          fetchReports()
        ]);
        setAppointments(appointmentsData);
        setDiagnoses(diagnosesData);
        setMedicals(medicalsData);
        setPrescriptions(prescriptionsData);
        setReports(reportsData); 
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
      setFeedback?.({ text: "Appointment requested successfully!", type: "success" });
    } catch (error) {
      console.error("Booking failed:", error);
      setFeedback?.({ text: error.message || "Failed to book appointment.", type: "error" });
    }
  };

  const handleCancelAppointment = async (appointmentId, setFeedback) => {
    try {
      await cancelAppointment(appointmentId);
      const updatedAppointments = await fetchAppointments();
      setAppointments(updatedAppointments);
      setFeedback?.({ text: "Appointment cancelled successfully.", type: "success" });
    } catch (error) {
      console.error("Cancellation failed:", error);
      setFeedback?.({ text: error.message || "Failed to cancel appointment.", type: "error" });
    }
  };

  // Doctor actions (stubbed; replace with API calls later)
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
        <Route path="/login" element={<LoginPage onAuth={fetchAllUserData} />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Shared layout after login */}
        <Route element={user ? <MainLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}>
          {/* Profile (common) */}
          <Route path="profile" element={<ProfilePage user={user} onProfileUpdate={handleProfileUpdate} />} />

          {/* Shared Routes */}
          <Route path="prescription-print" element={<PrescriptionPrint user={user} />} />

          {/* Patient Routes */}
          <Route path="patient/dashboard" element={<DashboardTab user={user} appointments={appointments} medicals={medicals} diagnoses={diagnoses} reports={reports} prescriptions={prescriptions} />} />
          <Route path="patient/appointments" element={<AppointmentsTab appointments={appointments} onBookSuccess={handleBookAppointment} onCancel={handleCancelAppointment} />} />
          <Route path="patient/reports" element={<ReportsTab diagnoses={diagnoses} medicals={medicals} prescriptions={prescriptions} />} />
          <Route path="patient/view-medical/:medicalId" element={<ViewMedical />} />
          <Route path="patient/support" element={<SupportPage />} />
          <Route path="patient/faq" element={<FAQPage />} />
          <Route path="patient/upload-medical-form" element={<MedicalForm user={user} onProfileUpdate={fetchAllUserData} />} />

          {/* Pharmacist Routes */}
          <Route path="pharmacist/dashboard" element={<PharmacyDashboard user={user} />} />
          <Route path="pharmacist/view-prescriptions" element={<Prescriptions />} />
          <Route path="pharmacist/view-invoices" element={<ViewInvoices />} />
          <Route path="pharmacist/inventory-search" element={<InventoryPage />} />
          <Route path="pharmacist/inventory-update" element={<UpdateInventory />} />
          <Route path="pharmacist/prescription-print" element={<PrescriptionPrint user={user} />} />
          <Route path="invoice/:id" element={<Invoice />} />

          {/* Doctor Routes  */}
           <Route path="doctor/dashboard" element={<DoctorDashboard doctor={user} />} />
           <Route path="doctor/patients" element={<PatientsTab />} />
           <Route path="doctor/patients/:patientId" element={<PatientProfile />} />
           <Route path="doctor/issue-medical/:patientId" element={<IssueMedical />} />
           <Route path="doctor/view-medical/:medicalId" element={<ViewMedical />} />
           <Route path="doctor/signature-seal" element={<DoctorSignatureSeal />} />
           <Route path="doctor/request-test" element={<RequestLabTest pendingRequests={mockLabRequests} onSubmit={handleLabTestRequest} />} />
           <Route path="doctor/request-lab-test/:patientId" element={<RequestLabTestForm />} />
           <Route path="doctor/prescriptions" element={<PrescriptionsTab recentPrescriptions={mockPrescriptionHistory} onSubmit={handlePrescriptionSubmit} />} />
           <Route path="doctor/support" element={<SupportPage />} />

          {/* Laboratory Routes */}
          <Route path="labtechnician/dashboard" element={<LabDashboard />} />
          <Route path="labtechnician/lab-requests" element={<LabRequests requests={mockLabRequests} />} />
          <Route path="labtechnician/lab-results" element={<LabResults results={mockLabRequests} />} />
          <Route path="labtechnician/support" element={<SupportPage />} />

          {/* Admin Routes */}
          <Route path="admin/dashboard" element={<UserManagement user={user} />} />
          <Route path="admin/audit-log" element={<AuditLogPage />} />
          <Route path="admin/announcements" element={<CreateAnnouncement />} />
          <Route path="admin/support-tickets" element={<SupportTicketsPage />} />
        </Route>

        {/* Fallback redirect */}
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