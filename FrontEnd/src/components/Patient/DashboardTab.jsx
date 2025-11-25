import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnnouncementDisplay from "../AnnouncementDisplay";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Grid, Alert, Chip, useTheme, Button,
  IconButton,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BadgeIcon from "@mui/icons-material/Badge";
import CakeIcon from "@mui/icons-material/Cake";
import WcIcon from "@mui/icons-material/Wc";
import SchoolIcon from "@mui/icons-material/School";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { getCompletedPrescriptionsForPatient } from "../../api/prescription";
import { fetchLabRequests } from "../../api/reports";

const DashboardTab = ({ user, appointments, medicals, diagnoses, reports, prescriptions }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [completedPrescriptions, setCompletedPrescriptions] = useState([]);
  const [labRequests, setLabRequests] = useState([]);

  const isDobRequired = user?.role === "Student" || user?.role === "Staff";
  const isDobSet = user?.dateOfBirth !== null && user?.dateOfBirth !== undefined;
  const showDobReminder = isDobRequired && !isDobSet;
  
  const isGenderSet = user?.gender !== null && user?.gender !== undefined;
  const showGenderReminder = isDobRequired && !isGenderSet;
  
  const isMedicalFormSet = user?.medicalRecordSet === true;
  const showMedicalFormReminder = user?.role === "Student" && !isMedicalFormSet;

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load Prescriptions
        const pxData = await getCompletedPrescriptionsForPatient();
        const sortedPx = pxData.sort((a, b) => new Date(b.prescriptionDate || b.createdAt) - new Date(a.prescriptionDate || a.createdAt));
        setCompletedPrescriptions(sortedPx);

        // Load Lab Requests
        const requestsData = await fetchLabRequests();
        const sortedRequests = requestsData.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        setLabRequests(sortedRequests);

      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    };

    loadData();
  }, []);

  const handleViewPrescription = (prescription) => {
    navigate('/prescription-print', {
      state: {
        prescription: prescription,
        fromCompletedTab: true,
        readOnly: true
      }
    });
  };

  const getStatusChipColor = (status) => {
    if (!status) return "default";
    const s = status.toLowerCase();
    if (s === "completed") return "success";
    if (s === "pending") return "warning";
    if (s === "in_progress") return "info";
    if (s === "declined") return "error";
    return "default";
  };

  return (
    <Box>
      <AnnouncementDisplay />

      {showDobReminder && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please complete your profile by setting your date of birth in the Profile section.
        </Alert>
      )}
      {showGenderReminder && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please complete your profile by setting your gender in the Profile section.
        </Alert>
      )}

      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: "primary.main",
          fontWeight: 700,
          mb: { xs: 3, md: 4 },
          textAlign: { xs: "center", md: "left" },
        }}
      >
        Welcome, {user?.name || "User"}
      </Typography>
      {/* --- Patient Details Card--- */}
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: { xs: 3, md: 5 } }}>
        <Typography variant="h5" fontWeight={600} mb={3} color="primary.main">
          Patient Details
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <PersonIcon color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary">Name</Typography>
            <Typography variant="body1" fontWeight={500}>{user?.name || "Not set"}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <ApartmentIcon color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary">Faculty</Typography>
            <Typography variant="body1" fontWeight={500}>{user?.faculty || "Not set"}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <SchoolIcon color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary">Role</Typography>
            <Typography variant="body1" fontWeight={500}>{user?.role || "Not set"}</Typography>
          </Box>
        </Box>
        {user?.universityId && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <BadgeIcon color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary">
                {user?.role === "Student" ? "Student ID" : "Staff ID"}
              </Typography>
              <Typography variant="body1" fontWeight={500}>{user.universityId}</Typography>
            </Box>
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <CakeIcon color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
            <Typography variant="body1" fontWeight={500}>
              {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Not set"}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WcIcon color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary">Gender</Typography>
            <Typography variant="body1" fontWeight={500}>{user?.gender || "Not set"}</Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={4} justifyContent="center" alignItems="flex-start">
        {/* Appointments Table */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 350 }}>
            <Typography variant="h6" fontWeight={600} mb={2} textAlign="center">
              Upcoming Appointments
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments && appointments.filter(app => app.status === "Scheduled").length > 0 ? (
                    appointments
                      .filter(app => app.status === "Scheduled")
                      .sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime))
                      .slice(0, 4)
                      .map(app => (
                        <TableRow key={app.id} hover>
                          <TableCell>{new Date(app.appointmentDateTime).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(app.appointmentDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</TableCell>
                          <TableCell>
                            <Chip
                              label={app.status}
                              size="small"
                              color="primary"
                              onClick={() => {}} 
                              clickable={false}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No appointments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Lab Requests Table */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 350 }}>
            <Typography variant="h6" fontWeight={600} mb={2} textAlign="center">
              Recent Lab Requests
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Test</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {labRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No lab requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    labRequests.slice(0, 5).map(req => (
                      <TableRow key={req.id} hover>
                        <TableCell>{new Date(req.orderDate).toLocaleDateString()}</TableCell>
                        <TableCell>{req.testType}</TableCell>
                        <TableCell>
                          <Chip
                            label={req.status || "Unknown"}
                            size="small"
                            color={getStatusChipColor(req.status)}
                            onClick={() => {}} 
                            clickable={false}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        
        {/* Prescriptions Table */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 350 }}>
            <Typography variant="h6" fontWeight={600} mb={2} textAlign="center">
              Recent Prescriptions
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {completedPrescriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No prescriptions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    completedPrescriptions.slice(0, 5).map(rx => (
                      <TableRow key={rx.id} hover>
                        <TableCell>
                          {new Date(rx.prescriptionDate || rx.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{rx.doctorName}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewPrescription(rx)}
                            sx={{ minWidth: "auto", padding: 0.5 }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardTab;