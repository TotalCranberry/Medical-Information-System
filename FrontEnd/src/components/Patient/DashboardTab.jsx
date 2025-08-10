import React from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Grid, Alert
} from "@mui/material";

const DashboardTab = ({ user, appointments, reports, prescriptions }) => {
  // Check if DOB is required but not set
  const isDobRequired = (user?.role === "Student" || user?.role === "Staff");
  const isDobSet = user?.dateOfBirth !== null && user?.dateOfBirth !== undefined;
  const showDobReminder = isDobRequired && !isDobSet;

  return (
    <Box>
      {showDobReminder && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please complete your profile by setting your date of birth in the Profile section.
        </Alert>
      )}
      
      <Typography
      variant="h4"
      gutterBottom
      sx={{
        color: "primary.main",
        fontWeight: 700,
        mb: { xs: 3, md: 4 },
        textAlign: { xs: "center", md: "left" }
      }}
    >
      Welcome, {user?.name || 'User'}
    </Typography>
    
    <Grid container spacing={4} justifyContent="center" alignItems="stretch" sx={{ mb: { xs: 3, md: 5 } }}>
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={3} sx={{ p: 3, borderLeft: "8px solid #45d27a", textAlign: "center", height: '100%', display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Typography variant="subtitle1" sx={{ mb: 1, color: "text.secondary", fontSize: 18 }}>Appointments</Typography>
          <Typography variant="h2" color="primary" fontWeight={800} sx={{ fontSize: 56 }}>
            {appointments.filter(app => app.status !== 'Cancelled').length}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={3} sx={{ p: 3, borderLeft: "8px solid #45d27a", textAlign: "center", height: '100%', display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Typography variant="subtitle1" sx={{ mb: 1, color: "text.secondary", fontSize: 18 }}>Reports</Typography>
          <Typography variant="h2" color="primary" fontWeight={800} sx={{ fontSize: 56 }}>
            {reports.length}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={3} sx={{ p: 3, borderLeft: "8px solid #45d27a", textAlign: "center", height: '100%', display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Typography variant="subtitle1" sx={{ mb: 1, color: "text.secondary", fontSize: 18 }}>Prescriptions</Typography>
          <Typography variant="h2" color="primary" fontWeight={800} sx={{ fontSize: 56 }}>
            {prescriptions.length}
          </Typography>
        </Paper>
      </Grid>
    </Grid>

    <Grid container spacing={4} justifyContent="center" alignItems="flex-start">
      <Grid item xs={12} lg={4}>
        <Paper elevation={2} sx={{ p: 3, minHeight: 300 }}>
          <Typography variant="h6" fontWeight={600} mb={2} textAlign="center">Upcoming Appointments</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments && [...appointments].filter(app => app.status !== 'Cancelled').length > 0 ? (
                  [...appointments]
                    .filter(app => app.status !== 'Cancelled')
                    .sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime))
                    .slice(0, 4)
                    .map(app => (
                      <TableRow key={app.id}>
                        <TableCell>{new Date(app.appointmentDateTime).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(app.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                        <TableCell>{app.status}</TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No appointments found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
      <Grid item xs={12} lg={4}>
        <Paper elevation={2} sx={{ p: 3, minHeight: 300 }}>
          <Typography variant="h6" fontWeight={600} mb={2} textAlign="center">Recent Reports</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Test</TableCell>
                  <TableCell>Result</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center">No recent reports</TableCell>
                  </TableRow>
                ) : (
                  reports.map(rep => (
                    <TableRow key={rep.id || rep.test}>
                      <TableCell>{rep.test}</TableCell>
                      <TableCell>{rep.result}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
      <Grid item xs={12} lg={4}>
        <Paper elevation={2} sx={{ p: 3, minHeight: 300 }}>
          <Typography variant="h6" fontWeight={600} mb={2} textAlign="center">Prescriptions</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Medicine</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prescriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No prescriptions found</TableCell>
                  </TableRow>
                ) : (
                  prescriptions.map(rx => (
                    <TableRow key={rx.id || rx.date}>
                      <TableCell>{rx.date}</TableCell>
                      <TableCell>{rx.medicine}</TableCell>
                      <TableCell>{rx.status}</TableCell>
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
