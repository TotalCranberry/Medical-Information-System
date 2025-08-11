import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Grid, Button, Card,
  CardContent, List, ListItem, ListItemText, Chip, Alert,
  CircularProgress, Tab, Tabs, Badge, Dialog, DialogTitle,
  DialogContent, DialogActions
} from "@mui/material";
import {
  PersonSearch as PersonSearchIcon,
  Science as ScienceIcon,
  Medication as MedicationIcon,
  Queue as QueueIcon,
  Today as TodayIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon
} from "@mui/icons-material";
import {
  fetchTodaysAppointments,
  fetchAppointmentQueue,
  fetchAllAppointments,
  completeAppointment,
  fetchDashboardStats
} from "../../api/appointments";
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = ({ doctor }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [appointmentQueue, setAppointmentQueue] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Quick action buttons data
  const quickActions = [
    {
      title: "Find Patient",
      description: "Search and view patient records",
      icon: <PersonSearchIcon sx={{ fontSize: 40, color: "#45d27a" }} />,
      action: "patients"
    }
  ];

  useEffect(() => {
    loadDashboardData();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [todayData, queueData, allData, statsData] = await Promise.all([
        fetchTodaysAppointments(),
        fetchAppointmentQueue(),
        fetchAllAppointments(),
        fetchDashboardStats()
      ]);
      
      setTodaysAppointments(todayData);
      setAppointmentQueue(queueData);
      setAllAppointments(allData);
      setDashboardStats(statsData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      await completeAppointment(appointmentId);
      // Refresh data after completion
      await loadDashboardData();
      setDialogOpen(false);
      setSelectedAppointment(null);
    } catch (err) {
      setError(err.message);
      console.error("Error completing appointment:", err);
    }
  };

  const handleQuickAction = (action) => {
    navigate(`/doctor/${action}`);
  };

  // Fixed navigation function - this is the key fix
  const handleViewPatientProfile = (appointment) => {
    console.log("Navigating to patient profile:", appointment.patient?.id);
    
    // Get patient ID from appointment
    const patientId = appointment.patient?.id;
    
    if (!patientId) {
      setError("Patient ID not found in appointment data");
      return;
    }

    // Navigate to patient profile with the correct route
    navigate(`/doctor/patients/${patientId}`, {
      state: { 
        patient: appointment.patient,
        appointment: appointment
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPatientName = (patient) => {
    if (!patient) return 'Unknown Patient';
    return patient.name || 'Unknown Patient';
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setDialogOpen(true);
  };

  const getCurrentAppointments = () => {
    switch (activeTab) {
      case 0: return todaysAppointments;
      case 1: return appointmentQueue;
      case 2: return allAppointments;
      default: return todaysAppointments;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} sx={{ color: "#45d27a" }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: "#0c3c3c",
          fontWeight: 700,
          mb: { xs: 2, md: 4 },
          ml: { xs: 0, md: 2 },
          textAlign: { xs: "center", md: "left" }
        }}
      >
        Welcome, {"Dr. " +doctor?.name}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Dashboard Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TodayIcon sx={{ fontSize: 40, color: "#45d27a", mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "#0c3c3c" }}>
                    {dashboardStats.todaysTotal || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Appointments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon sx={{ fontSize: 40, color: "#4caf50", mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "#0c3c3c" }}>
                    {dashboardStats.todaysCompleted || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Today
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <QueueIcon sx={{ fontSize: 40, color: "#ff9800", mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "#0c3c3c" }}>
                    {dashboardStats.totalScheduled || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Queue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ScheduleIcon sx={{ fontSize: 40, color: "#f44336", mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "#0c3c3c" }}>
                    {dashboardStats.todaysPending || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Pending
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Appointments Section */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab 
                  label={
                    <Badge badgeContent={todaysAppointments.length} color="primary">
                      Today's Appointments
                    </Badge>
                  } 
                />
                <Tab 
                  label={
                    <Badge badgeContent={appointmentQueue.length} color="warning">
                      Appointment Queue
                    </Badge>
                  } 
                />
                <Tab 
                  label={
                    <Badge badgeContent={allAppointments.length} color="secondary">
                      All Appointments
                    </Badge>
                  } 
                />
              </Tabs>
            </Box>

            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Patient Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getCurrentAppointments().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: "#6c6b6b" }}>
                        No appointments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    getCurrentAppointments().map((appointment, index) => (
                      <TableRow key={appointment.id || index} hover>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {activeTab === 0 ? 
                            formatTime(appointment.appointmentDateTime) : 
                            formatDateTime(appointment.appointmentDateTime)
                          }
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {getPatientName(appointment.patient)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {appointment.patient?.id || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {appointment.reason}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={appointment.status} 
                            color={getStatusColor(appointment.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleViewAppointment(appointment)}
                              sx={{ 
                                borderColor: "#45d27a",
                                color: "#45d27a",
                                "&:hover": {
                                  backgroundColor: "#45d27a",
                                  color: "#fff"
                                }
                              }}
                            >
                              View
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<PersonIcon />}
                              onClick={() => handleViewPatientProfile(appointment)}
                              sx={{ 
                                backgroundColor: "#2196f3",
                                "&:hover": {
                                  backgroundColor: "#1976d2"
                                }
                              }}
                            >
                              Patient
                            </Button>
                            {appointment.status === 'Scheduled' && (
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleCompleteAppointment(appointment.id)}
                                sx={{ 
                                  backgroundColor: "#4caf50",
                                  "&:hover": {
                                    backgroundColor: "#388e3c"
                                  }
                                }}
                              >
                                Complete
                              </Button>
                            )}
                          </Box>
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

      {/* Quick Actions Section */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography 
          variant="h6" 
          fontWeight={600} 
          mb={3} 
          sx={{ color: "#0c3c3c" }}
        >
          Quick Actions
        </Typography>
        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                elevation={1}
                sx={{ 
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  border: "2px solid transparent",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 3,
                    borderColor: "#45d27a"
                  }
                }}
                onClick={() => handleQuickAction(action.action)}
              >
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    {action.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    fontWeight={600} 
                    sx={{ color: "#0c3c3c", mb: 1 }}
                  >
                    {action.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ color: "#6c6b6b" }}
                  >
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Appointment Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Patient: {getPatientName(selectedAppointment.patient)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Date & Time:</strong> {formatDateTime(selectedAppointment.appointmentDateTime)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong> 
                <Chip 
                  label={selectedAppointment.status} 
                  color={getStatusColor(selectedAppointment.status)}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Reason:</strong>
              </Typography>
              <Typography variant="body2" sx={{ 
                backgroundColor: "#f5f5f5", 
                p: 2, 
                borderRadius: 1,
                maxHeight: 150,
                overflowY: 'auto'
              }}>
                {selectedAppointment.reason}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Created: {formatDateTime(selectedAppointment.createdAt)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => handleViewPatientProfile(selectedAppointment)}
            variant="contained"
            startIcon={<PersonIcon />}
            sx={{ 
              backgroundColor: "#2196f3",
              "&:hover": {
                backgroundColor: "#1976d2"
              }
            }}
          >
            View Patient Profile
          </Button>
          {selectedAppointment?.status === 'Scheduled' && (
            <Button 
              onClick={() => handleCompleteAppointment(selectedAppointment.id)}
              variant="contained"
              sx={{ 
                backgroundColor: "#4caf50",
                "&:hover": {
                  backgroundColor: "#388e3c"
                }
              }}
            >
              Mark as Complete
            </Button>
          )}
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorDashboard;