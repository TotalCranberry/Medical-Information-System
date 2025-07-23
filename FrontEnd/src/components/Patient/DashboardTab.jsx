import React from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Grid
} from "@mui/material";

const DashboardTab = ({ user, appointments, reports, prescriptions }) => (
  <Box>
    <Typography
      variant="h4"
      gutterBottom
      sx={{
        color: "#0c3c3c",
        fontWeight: 700,
        mb: { xs: 2, md: 4 },
        ml: { xs: 0, md: 7 },
        textAlign: { xs: "center", md: "left" }
      }}
    >
      Welcome, {user.name}
    </Typography>
    {/* BIGGER Stat Cards */}
    <Grid
      container
      spacing={4}
      justifyContent="center"
      alignItems="stretch"
      sx={{ mb: { xs: 2, md: 5 } }}
    >
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={3} sx={{
          p: 3,
          borderLeft: "8px solid #45d27a",
          textAlign: "center",
          height: { xs: 150, sm: 160, md: 170 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <Typography variant="subtitle1" sx={{ mb: 1, color: "#6c6b6b", fontSize: 18 }}>Appointments</Typography>
          <Typography variant="h2" color="primary" fontWeight={800} sx={{ fontSize: 56 }}>
            {appointments.length}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={3} sx={{
          p: 3,
          borderLeft: "8px solid #45d27a",
          textAlign: "center",
          height: { xs: 150, sm: 160, md: 170 },
          width: { xs: 150, sm: 160, md: 170 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <Typography variant="subtitle1" sx={{ mb: 1, color: "#6c6b6b", fontSize: 18 }}>Reports</Typography>
          <Typography variant="h2" color="primary" fontWeight={800} sx={{ fontSize: 56 }}>
            {reports.length}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={3} sx={{
          p: 3,
          borderLeft: "8px solid #45d27a",
          textAlign: "center",
          height: { xs: 150, sm: 160, md: 170 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <Typography variant="subtitle1" sx={{ mb: 1, color: "#6c6b6b", fontSize: 18 }}>Prescriptions</Typography>
          <Typography variant="h2" color="primary" fontWeight={800} sx={{ fontSize: 56 }}>
            {prescriptions.length}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
    {/* TABLES: 3 side-by-side at md+, stacked on smaller screens */}
    <Grid container spacing={4} justifyContent="center" alignItems="flex-start">
      <Grid item xs={12} md={4}>
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
                {appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No upcoming appointments</TableCell>
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
      <Grid item xs={12} md={4}>
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
      <Grid item xs={12} md={4}>
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
