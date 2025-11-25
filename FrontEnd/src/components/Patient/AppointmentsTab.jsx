import React, { useState } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TextField,
  TableContainer, TableHead, TableRow, Button, Grid, Snackbar, Alert,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Chip
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { LocalizationProvider, DatePicker, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const AppointmentsTab = ({ appointments, onBookSuccess, onCancel }) => {
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState({ text: "", type: "" });
  const theme = useTheme();
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !time) {
      setFeedback({ text: "Please select both date and time.", type: "warning" });
      return;
    }
    // Combine date and time into one Date object
    const appointmentDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes(),
      0,
      0
    );
    if (onBookSuccess) {
      onBookSuccess({ appointmentDateTime, reason }, setFeedback);
    }
    setDate(null);
    setTime(null);
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

  const disableWeekends = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = date.getDay();
    return (
      date < today || 
      day === 0 || day === 6 
    );
  };

  const shouldDisableTime = (timeValue, view) => {
    const hour = timeValue.getHours();
    return hour < 9 || hour === 12 || hour > 15;
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box>
          <Typography
            variant="h4"
            color="primary.main"
            fontWeight={700}
            sx={{ mb: 4, textAlign: { xs: "center", md: "left" } }}
          >
            Appointments
          </Typography>
          <Grid container spacing={4} justifyContent="center" alignItems="flex-start">
            <Grid item xs={12} md={6} sx={{ minWidth: 400 }}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  mb={2}
                  color="primary.main"
                >
                  Book a New Appointment
                </Typography>
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <DatePicker
                    label="Date"
                    value={date}
                    onChange={setDate}
                    shouldDisableDate={disableWeekends}
                    slotProps={{
                      textField: {
                        helperText: "Select a weekday (Mon-Fri) for your appointment",
                        required: true,
                        sx: { flexGrow: 1, minWidth: 140 },
                      },
                    }}
                  />

                  <TimePicker
                    label="Time"
                    value={time}
                    onChange={setTime}
                    minutesStep={10}
                    ampm={false}
                    shouldDisableTime={shouldDisableTime}
                    slotProps={{
                      textField: {
                        helperText: "Select a time between 9:00 - 12:00 and 13:00 - 16:00 ",
                        required: true,
                        sx: { flexGrow: 1, minWidth: 120 },
                      },
                    }}
                  />

                  <TextField
                    label="Reason for Visit"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={2}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    sx={{
                      fontWeight: 600,
                      borderRadius: 2,
                      width: "100%",
                    }}
                  >
                    Request Appointment
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sx={{ minWidth: 700 }}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 4, width: "100%" }}>
                <Typography variant="h6" fontWeight={600} mb={2} color="primary.main">
                  My Appointments
                </Typography>
                <TableContainer sx={{ maxHeight: 300, width: "100%" }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {appointments && appointments.filter((app) => app.status == "Scheduled").length > 0 ? (
                        appointments
                          .filter((app) => app.status == "Scheduled")
                          .sort(
                            (a, b) =>
                              new Date(a.appointmentDateTime) -
                              new Date(b.appointmentDateTime)
                          )
                          .map((app) => (
                            <TableRow key={app.id} hover>
                              <TableCell>
                                {new Date(app.appointmentDateTime).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {new Date(app.appointmentDateTime).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={app.status}
                                  size="small"
                                  color={
                                    app.status.toLowerCase() === "scheduled"
                                      ? "primary"
                                      : app.status.toLowerCase() === "completed"
                                      ? "success"
                                      : "default"
                                  }
                                  onClick={() => {}} 
                                  clickable={false}
                                />
                              </TableCell>
                              <TableCell>
                                {app.status === "Scheduled" && (
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
                          <TableCell colSpan={4} align="center">
                            No appointments found
                          </TableCell>
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
        <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
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

        {/* Feedback Snackbar */}
        <Snackbar
          open={!!feedback.text}
          autoHideDuration={6000}
          onClose={() => setFeedback({ text: "", type: "" })}
        >
          <Alert
            onClose={() => setFeedback({ text: "", type: "" })}
            severity={feedback.type || "info"}
            sx={{ width: "100%" }}
          >
            {feedback.text}
          </Alert>
        </Snackbar>
      </LocalizationProvider>
    </>
  );
};

export default AppointmentsTab;
