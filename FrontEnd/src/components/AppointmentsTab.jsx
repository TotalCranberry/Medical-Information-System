import React, { useState } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Button
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
    <Box sx={{ maxWidth: 700, margin: "40px auto", p: 3 }}>
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
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" mb={1}>Book New Appointment</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            type="date"
            label="Date"
            InputLabelProps={{ shrink: true }}
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            sx={{ minWidth: 140 }}
          />
          <TextField
            type="time"
            label="Time"
            InputLabelProps={{ shrink: true }}
            value={time}
            onChange={e => setTime(e.target.value)}
            required
            sx={{ minWidth: 120 }}
          />
          <TextField
            label="Reason for visit"
            value={reason}
            onChange={e => setReason(e.target.value)}
            required
            sx={{ minWidth: 220 }}
          />
          <Button type="submit" variant="contained" sx={{ minWidth: 100 }}>Submit</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AppointmentsTab;
