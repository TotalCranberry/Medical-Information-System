import React, { useState } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Button, Grid, Snackbar, Alert,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from "@mui/material";

const AppointmentsTab = ({ appointments, onBookSuccess, onCancel }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState({ text: "", type: "" });
  
  // State for the confirmation dialog
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const appointmentDateTime = new Date(`${date}T${time}`);
    if (onBookSuccess) {
      onBookSuccess({ appointmentDateTime, reason }, setFeedback);
    }
    setDate("");
    setTime("");
    setReason("");
  };

  const handleOpenCancelDialog = (appointmentId) => {
    setAppointmentToCancel(appointmentId);
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setAppointmentToCancel(null);
    setOpenCancelDialog(false);
  };

  const handleConfirmCancel = () => {
    if (onCancel && appointmentToCancel) {
      onCancel(appointmentToCancel, setFeedback);
    }
    handleCloseCancelDialog();
  };

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <>  
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
                  label="Date" type="date" value={date} onChange={e => setDate(e.target.value)}
                  required variant="outlined" InputLabelProps={{ shrink: true }} sx={{ flexGrow: 1, minWidth: 140 }}
                />
                <TextField
                  label="Time" type="time" value={time} onChange={e => setTime(e.target.value)}
                  required variant="outlined" InputLabelProps={{ shrink: true }} sx={{ flexGrow: 1, minWidth: 120 }}
                />
                <TextField
                  label="Reason for Visit" value={reason} onChange={e => setReason(e.target.value)}
                  required variant="outlined" fullWidth multiline rows={2}
                />
                <Button type="submit" variant="contained" color="secondary" sx={{ fontWeight: 600, borderRadius: 2, width: '100%' }}>
                  Request Appointment
                </Button>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>My Appointments</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments && appointments.length > 0  ? (
                      [...appointments] 
                        .filter(app => app.status !== 'Cancelled')
                        .sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime))
                        .map(app => (
                          <TableRow key={app.id}>
                            <TableCell>{new Date(app.appointmentDateTime).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(app.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                            <TableCell>{app.status}</TableCell>
                            <TableCell >
                            {app.status === 'Scheduled' && (
                              <Button 
                                variant="outlined" 
                                color="error" 
                                size="small"
                                onClick={() => handleOpenCancelDialog(app.id)}
                              >
                                Cancel
                              </Button>
                            )}
                          </TableCell>
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
        </Grid>
      </Box>

      {/* Confirmation Dialog for Cancellation */}
      <Dialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
      >
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>Back</Button>
          <Button onClick={handleConfirmCancel} color="error" autoFocus>
            Confirm Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!feedback.text} autoHideDuration={6000} onClose={() => setFeedback({ text: "", type: "" })}>
        <Alert onClose={() => setFeedback({ text: "", type: "" })} severity={feedback.type || "info"} sx={{ width: '100%' }}>
          {feedback.text}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AppointmentsTab;