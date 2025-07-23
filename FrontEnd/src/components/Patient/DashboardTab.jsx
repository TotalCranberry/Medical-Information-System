import React from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Grid
} from "@mui/material";

const DashboardTab = ({ user, appointments, reports, prescriptions }) => (
  <Box>
    <Typography
      variant="h3"
      gutterBottom
      sx={{
        color: "#0c3c3c",
        fontWeight: 700,
        mb: { xs: 2, md: 4 },
        textAlign: { xs: "center", md: "left" }
      }}
    >
      Welcome, {user.name}
    </Typography>
    <Grid
      container
      spacing={4}
      justifyContent="center"
      alignItems="flex-start"
      sx={{ mb: { xs: 2, md: 4 } }}
    >
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={2} sx={{ p: 3, borderLeft: "6px solid #45d27a", textAlign: "center" }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5, color: "#6c6b6b" }}>Appointments</Typography>
          <Typography variant="h4" color="primary" fontWeight={700}>{appointments.length}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={2} sx={{ p: 3, borderLeft: "6px solid #45d27a", textAlign: "center" }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5, color: "#6c6b6b" }}>Reports</Typography>
          <Typography variant="h4" color="primary" fontWeight={700}>{reports.length}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={2} sx={{ p: 3, borderLeft: "6px solid #45d27a", textAlign: "center" }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5, color: "#6c6b6b" }}>Prescriptions</Typography>
          <Typography variant="h4" color="primary" fontWeight={700}>{prescriptions.length}</Typography>
        </Paper>
      </Grid>
    </Grid>
    <Grid container spacing={4} justifyContent="center">
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3, minHeight: 280 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Upcoming Appointments</Typography>
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
                {appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3}>No upcoming appointments</TableCell>
                  </TableRow>
                ) : (
                  appointments.map(app => (
                    <TableRow key={app.id}>
                      <TableCell>{app.date}</TableCell>
                      <TableCell>{app.time}</TableCell>
                      <TableCell>{app.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3, minHeight: 280 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Recent Reports</Typography>
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
                    <TableCell colSpan={2}>No recent reports</TableCell>
                  </TableRow>
                ) : (
                  reports.map(rep => (
                    <TableRow key={rep.test}>
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
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3, mt: { xs: 2, md: 4 } }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Prescriptions</Typography>
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
                    <TableCell colSpan={3}>No prescriptions found</TableCell>
                  </TableRow>
                ) : (
                  prescriptions.map(rx => (
                    <TableRow key={rx.date}>
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

export default DashboardTab;
