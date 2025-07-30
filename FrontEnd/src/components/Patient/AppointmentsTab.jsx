import React, { useState } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Button, Grid
} from "@mui/material";

const AppointmentsTab = ({ appointments, onBookSuccess }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onBookSuccess) {
      onBookSuccess({ date, time, reason });
    }
    setDate("");
    setTime("");
    setReason("");
  };

  return (
    <Box>
      <Typography variant="h4" color="primary" fontWeight={700} sx={{ mb: 4, textAlign: { xs: "center", md: "left" } }}>
        Appointments
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={600} mb={2} color="primary">Book a New Appointment</Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: 'center' }}>
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                sx={{ flexGrow: 1, minWidth: 140 }}
              />
              <TextField
                label="Time"
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                sx={{ flexGrow: 1, minWidth: 120 }}
              />
              <TextField
                label="Reason for Visit"
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
                variant="outlined"
                fullWidth
              />
              <Button type="submit" variant="contained" color="secondary" sx={{ fontWeight: 600, borderRadius: 2, width: '100%' }}>
                Book Appointment
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
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
                  {appointments && appointments.length > 0 ? (
                    appointments.map(app => (
                      <TableRow key={app.id}>
                        <TableCell>{app.date}</TableCell>
                        <TableCell>{app.time}</TableCell>
                        <TableCell>{app.status}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">No upcoming appointments</TableCell>
                    </TableRow>
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

export default AppointmentsTab;
