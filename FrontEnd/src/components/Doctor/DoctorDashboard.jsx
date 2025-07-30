import React from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Grid, Button, Card,
  CardContent, List, ListItem, ListItemText, Chip
} from "@mui/material";
import {
  PersonSearch as PersonSearchIcon,
  Science as ScienceIcon,
  Medication as MedicationIcon
} from "@mui/icons-material";

const DoctorDashboard = ({ doctor, todaysAppointments, recentActivity }) => {
  // Quick action buttons data
  const quickActions = [
    {
      title: "Find Patient",
      description: "Search and view patient records",
      icon: <PersonSearchIcon sx={{ fontSize: 40, color: "#45d27a" }} />,
      action: "patients"
    },
    {
      title: "Request Lab Test",
      description: "Order laboratory tests for patients",
      icon: <ScienceIcon sx={{ fontSize: 40, color: "#45d27a" }} />,
      action: "request-test"
    },
    {
      title: "Write Prescription",
      description: "Create new prescriptions",
      icon: <MedicationIcon sx={{ fontSize: 40, color: "#45d27a" }} />,
      action: "prescriptions"
    }
  ];

  const handleQuickAction = (action) => {
    // This would typically navigate to the respective page
    console.log(`Navigate to: ${action}`);
    // You can implement navigation logic here
    // Example: navigate(`/${action}`);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

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
        Welcome, {doctor?.name || "Dr. Name"}
      </Typography>

      {/* Today's Appointments Section */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 400 }}>
            <Typography 
              variant="h6" 
              fontWeight={600} 
              mb={3} 
              sx={{ color: "#0c3c3c" }}
            >
              Today's Appointments
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Patient Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!todaysAppointments || todaysAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: "#6c6b6b" }}>
                        No appointments scheduled for today
                      </TableCell>
                    </TableRow>
                  ) : (
                    todaysAppointments.map((appointment, index) => (
                      <TableRow key={appointment.id || index} hover>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {appointment.time}
                        </TableCell>
                        <TableCell>{appointment.patientName}</TableCell>
                        <TableCell>
                          <Chip 
                            label={appointment.status} 
                            color={getStatusColor(appointment.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
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
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Activity Section */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 400 }}>
            <Typography 
              variant="h6" 
              fontWeight={600} 
              mb={3} 
              sx={{ color: "#0c3c3c" }}
            >
              Recent Activity
            </Typography>
            <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
              {!recentActivity || recentActivity.length === 0 ? (
                <Typography sx={{ color: "#6c6b6b", textAlign: "center", py: 4 }}>
                  No recent activity
                </Typography>
              ) : (
                <List>
                  {recentActivity.map((activity, index) => (
                    <ListItem 
                      key={index} 
                      sx={{ 
                        px: 0, 
                        borderBottom: index < recentActivity.length - 1 ? "1px solid #f0f0f0" : "none" 
                      }}
                    >
                      <ListItemText
                        primary={activity.description}
                        secondary={activity.timestamp}
                        primaryTypographyProps={{
                          fontSize: "0.9rem",
                          fontWeight: 500
                        }}
                        secondaryTypographyProps={{
                          fontSize: "0.8rem",
                          color: "#6c6b6b"
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
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
    </Box>
  );
};

export default DoctorDashboard;