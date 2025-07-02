import React from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow
} from "@mui/material";

const DashboardTab = ({ user, appointments, reports, prescriptions }) => (
  <Box sx={{ maxWidth: 900, margin: "40px auto", p: 3 }}>
    <Typography variant="h4" mb={3}>Welcome, {user.name}</Typography>
    <Paper sx={{ mb: 4, p: 2 }}>
      <Typography variant="h6" mb={1}>Upcoming Appointments</Typography>
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
    <Paper sx={{ mb: 4, p: 2 }}>
      <Typography variant="h6" mb={1}>Recent Reports</Typography>
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
                <TableRow key={rep.id}>
                  <TableCell>{rep.test}</TableCell>
                  <TableCell>{rep.result}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" mb={1}>Recent Prescriptions</Typography>
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
                <TableRow key={rx.id}>
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
  </Box>
);

export default DashboardTab;
