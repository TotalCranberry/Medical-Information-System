import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnnouncementDisplay from "../AnnouncementDisplay";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Grid, Alert, Chip, useTheme, Button,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
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
  const showSexReminder = isDobRequired && !user?.sex;
  const showMedicalFormReminder = user?.role === "Student" && (!user?.medicalRecord || user?.medicalRecord.length === 0);

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

  const statCards = [
    {
      label: "Appointments",
      count: appointments.filter((app) => app.status == "Scheduled").length,
      icon: CalendarTodayIcon,
      color: theme.palette.success.main, // green tone
      chipColor: "primary",
    },
    {
      label: "Medicals / Diagnoses",
      count: medicals.length + diagnoses.length,
      icon: AssignmentIcon,
      color: theme.palette.warning.main, // orange tone
      chipColor: "warning",
    },
    {
      label: "Reports",
      count: reports.length,
      icon: DescriptionIcon,
      color: theme.palette.info.main, // blue tone
      chipColor: "info",
    },
    {
      label: "Prescriptions",
      count: prescriptions.length,
      icon: ReceiptLongIcon,
      color: theme.palette.secondary.main, // purple tone
      chipColor: "secondary",
    },
  ];

  const statCardStyle = (color) => ({
    p: 3,
    borderLeft: `8px solid ${color}`,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  });

  return (
    <Box>
      <AnnouncementDisplay />

      {showDobReminder && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please complete your profile by setting your date of birth in the Profile section.
        </Alert>
      )}
      {showSexReminder && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please complete your profile by setting your sex in the Profile section.
        </Alert>
      )}
      {showMedicalFormReminder && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Please upload your medical form in the Upload Medical Form section.
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


      <Grid container spacing={4} justifyContent="center" alignItems="stretch" sx={{ mb: { xs: 3, md: 5 } }}>
        {statCards.map(({ label, count, icon: IconComponent, color }) => (
          <Grid item xs={12} sm={6} md={4} key={label}>
            <Paper elevation={3} sx={statCardStyle(color)}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, color: "text.secondary", fontSize: 18 }}
              >
                {label}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1.5,
                }}
              >
                <IconComponent sx={{ fontSize: 40, color }} />
                <Typography variant="h2" color="primary" fontWeight={800} sx={{ fontSize: 56 }}>
                  {count}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

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
                  {appointments && appointments.filter(app => app.status == "Scheduled").length > 0 ? (
                    appointments
                      .filter(app => app.status == "Scheduled")
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
