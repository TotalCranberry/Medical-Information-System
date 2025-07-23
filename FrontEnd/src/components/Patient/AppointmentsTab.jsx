import React, { useState } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Button, Grid
} from "@mui/material";

const AppointmentsTab = ({ appointments, onBook }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onBook({ date, time, reason });
    setDate(""); setTime(""); setReason("");
  };

  return (
    <Box>
      <Typography variant="h4" color="primary" fontWeight={700} sx={{ mb: 3, ml:10, textAlign: { xs: "center", md: "left" } }}>
        Appointments
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" fontWeight={600} mb={2} color="primary">Book a New Appointment</Typography>
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 140 }}
              />
              <TextField
                label="Time"
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 120 }}
              />
              <TextField
                label="Reason"
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
                variant="outlined"
                sx={{ minWidth: 220 }}
              />
              <Button type="submit" variant="contained" color="secondary" sx={{ fontWeight: 600, borderRadius: 2 }}>
                Book
              </Button>
            </form>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
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
      </Grid>
    </Box>
  );
};

export default AppointmentsTab;
