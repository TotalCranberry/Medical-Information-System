import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnnouncementDisplay from "../AnnouncementDisplay";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Grid, Alert, Chip, useTheme, Button,
} from "@mui/material";
// Import new icons for patient details
import PersonIcon from "@mui/icons-material/Person";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BadgeIcon from "@mui/icons-material/Badge";
import CakeIcon from "@mui/icons-material/Cake";
import WcIcon from "@mui/icons-material/Wc";
import SchoolIcon from "@mui/icons-material/School";
// Keep VisibilityIcon for prescriptions table
import VisibilityIcon from "@mui/icons-material/Visibility";
import { getCompletedPrescriptionsForPatient } from "../../api/prescription";

const DashboardTab = ({ user, appointments, medicals, diagnoses, reports, prescriptions }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [completedPrescriptions, setCompletedPrescriptions] = useState([]);

  // Check if DOB is required but not set
  const isDobRequired = user?.role === "Student" || user?.role === "Staff";
  const isDobSet = user?.dateOfBirth !== null && user?.dateOfBirth !== undefined;
  const showDobReminder = isDobRequired && !isDobSet;
  
  // This correctly checks for the 'gender' field to show the reminder.
  const isGenderSet = user?.gender !== null && user?.gender !== undefined;
  const showGenderReminder = isDobRequired && !isGenderSet;
  
  // Check if medical form is set
  const isMedicalFormSet = user?.medicalRecordSet === true;
  const showMedicalFormReminder = user?.role === "Student" && !isMedicalFormSet;

  // Load completed prescriptions
  useEffect(() => {
    const loadCompletedPrescriptions = async () => {
      try {
        console.log("DEBUG: Frontend - Loading completed prescriptions");
        const data = await getCompletedPrescriptionsForPatient();
        console.log("DEBUG: Frontend - Received prescriptions data:", data);
        // Sort by date (recent to past)
        const sorted = data.sort((a, b) => new Date(b.prescriptionDate || b.createdAt) - new Date(a.prescriptionDate || a.createdAt));
        console.log("DEBUG: Frontend - Sorted prescriptions:", sorted);
        setCompletedPrescriptions(sorted);
      } catch (error) {
        console.error("Failed to load completed prescriptions:", error);
        setCompletedPrescriptions([]);
      }
    };

    loadCompletedPrescriptions();
  }, []);

  const handleViewPrescription = (prescription) => {
    // Navigate to prescription print page instead of opening dialog
    navigate('/prescription-print', {
      state: {
        prescription: prescription,
        fromCompletedTab: true,
        readOnly: true
      }
    });
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

      {/* --- Patient Details Card  --- */}
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: { xs: 3, md: 5 } }}>
        <Typography variant="h5" fontWeight={600} mb={3} color="primary.main">
          Patient Details
        </Typography>
        
        {/* Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <PersonIcon color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary">Name</Typography>
            <Typography variant="body1" fontWeight={500}>{user?.name || "Not set"}</Typography>
          </Box>
        </Box>
        
        {/* Faculty (New) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <ApartmentIcon color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary">Faculty</Typography>
            <Typography variant="body1" fontWeight={500}>{user?.faculty || "Not set"}</Typography>
          </Box>
        </Box>

        {/* Role */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <SchoolIcon color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary">Role</Typography>
            <Typography variant="body1" fontWeight={500}>{user?.role || "Not set"}</Typography>
          </Box>
        </Box>

        {/* University ID (Show only if available) */}
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

        {/* Date of Birth */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <CakeIcon color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
            <Typography variant="body1" fontWeight={500}>
              {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Not set"}
            </Typography>
          </Box>
        </Box>

        {/* Gender (no mb on the last item) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WcIcon color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary">Gender</Typography>
            <Typography variant="body1" fontWeight={500}>{user?.gender || "Not set"}</Typography>
          </Box>
        </Box>
      </Paper>
      {/* --- End of Patient Details Card --- */}


      <Grid container spacing={4} justifyContent="center" alignItems="flex-start">
        {/* Appointments Table */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 300 }}>
            <Typography variant="h6" fontWeight={600} mb={2} textAlign="center">
              Upcoming Appointments
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader>
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
                              color={
                                app.status.toLowerCase() === "scheduled"
                                  ? "primary"
                                  : app.status.toLowerCase() === "completed"
                                  ? "success"
                                  : "default"
                              }
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

        {/* Reports Table */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 300 }}>
            <Typography variant="h6" fontWeight={600} mb={2} textAlign="center">
              Recent Lab Reports
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Test</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        No recent reports
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map(rep => (
                      <TableRow key={rep.id || rep.test} hover>
                        <TableCell>{rep.date}</TableCell>
                        <TableCell>{rep.test}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Prescriptions Table */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 300 }}>
            <Typography variant="h6" fontWeight={600} mb={2} textAlign="center">
              Recent Prescriptions
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader>
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
                            sx={{
                              minWidth: "auto",
                              px: 1,
                              py: 0.5,
                              fontSize: "0.75rem",
                            }}
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