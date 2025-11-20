import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
  Stack,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress,
  Fade,
  Card,
  CardContent,
  Zoom,
  Backdrop,
  CircularProgress,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Close as CloseIcon,
  MedicalServices as MedicalIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as FacultyIcon,
  CalendarToday as DateIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";

// ---------------- ENHANCED THEME TOKENS ----------------
const THEME = {
  primary: "#0C3C3C",
  accent: "#45D27A",
  gray: "#6C6B6B",
  light: "#F8F9FA",
  bad: "#C62828",
  warn: "#EF6C00",
  good: "#2E7D32",
  gradients: {
    primary: "linear-gradient(135deg, #0C3C3C 0%, #154545 100%)",
    accent: "linear-gradient(135deg, #45D27A 0%, #5CE084 100%)",
    card: "linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)",
    danger: "linear-gradient(135deg, #C62828 0%, #D32F2F 100%)",
  },
  shadows: {
    card: "0 2px 12px rgba(12, 60, 60, 0.08)",
    cardHover: "0 8px 32px rgba(12, 60, 60, 0.12)",
    button: "0 4px 16px rgba(69, 210, 122, 0.24)",
    focus: "0 0 0 3px rgba(69, 210, 122, 0.16)",
  },
  borderRadius: {
    small: "8px",
    medium: "12px",
    large: "16px",
    xl: "20px",
  },
};

// ---------------- ENHANCED STYLED COMPONENTS ----------------
const modernCardSx = {
  p: 2.5,
  borderRadius: THEME.borderRadius.large,
  background: THEME.gradients.card,
  border: "1px solid rgba(12, 60, 60, 0.08)",
  boxShadow: THEME.shadows.card,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    boxShadow: THEME.shadows.cardHover,
    transform: "translateY(-2px)",
    borderColor: "rgba(69, 210, 122, 0.2)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: THEME.gradients.accent,
    transform: "scaleX(0)",
    transformOrigin: "left",
    transition: "transform 0.3s ease",
  },
  "&:hover::before": {
    transform: "scaleX(1)",
  },
};

const lightCardSx = {
  p: 2.5,
  borderRadius: THEME.borderRadius.large,
  background: `linear-gradient(145deg, ${THEME.light}, #ffffff)`,
  border: "1px solid rgba(12, 60, 60, 0.06)",
  boxShadow: "0 1px 8px rgba(12, 60, 60, 0.04)",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 4px 16px rgba(12, 60, 60, 0.08)",
  },
};

const modernButtonSx = {
  borderRadius: THEME.borderRadius.medium,
  textTransform: "none",
  fontWeight: 600,
  px: 3,
  py: 1.2,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
    transition: "left 0.5s",
  },
  "&:hover::before": {
    left: "100%",
  },
};

import { getPrescriptionById } from "../../api/prescription";

export default function ViewPrescriptionDialog({ open, onClose, prescriptionId }) {
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---------- Load prescription data ----------
  useEffect(() => {
    if (open && prescriptionId) {
      loadPrescription();
    } else if (!open) {
      setPrescription(null);
      setError(null);
    }
  }, [open, prescriptionId]);

  const loadPrescription = async () => {
    try {
      setLoading(true);
      const data = await getPrescriptionById(prescriptionId);
      setPrescription(data);
    } catch (err) {
      setError(err.message);
      console.error("Error loading prescription:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  if (!prescription && !loading) return null;

  const headerDate = prescription ? new Date(prescription.prescriptionDate || Date.now()).toLocaleString() : "";

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Zoom}
        TransitionProps={{ timeout: 300 }}
        PaperProps={{
          sx: {
            borderRadius: THEME.borderRadius.xl,
            overflow: "hidden",
            maxHeight: "90vh",
            zIndex: 1300,
          }
        }}
        sx={{ zIndex: 1300 }}
      >
        {/* Enhanced Top gradient accent */}
        <Box
          sx={{
            height: 8,
            width: "100%",
            background: THEME.gradients.accent,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "1px",
              background: "rgba(69, 210, 122, 0.3)",
            }
          }}
        />

        <DialogTitle sx={{ pb: 2, background: THEME.gradients.card }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: THEME.borderRadius.medium,
                background: THEME.gradients.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: "1.2rem",
                boxShadow: THEME.shadows.card,
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  borderRadius: THEME.borderRadius.medium,
                  padding: "2px",
                  background: THEME.gradients.accent,
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "subtract",
                },
              }}>
                <MedicalIcon sx={{ fontSize: "1.5rem" }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: THEME.primary, mb: 0.5 }}>
                  Prescription — {prescription?.patientName || "Loading..."}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip
                    size="small"
                    icon={<MedicalIcon />}
                    label={`Dr. ${prescription?.doctorName || "N/A"}`}
                    sx={{
                      bgcolor: `${THEME.primary}10`,
                      color: THEME.primary,
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    size="small"
                    icon={<DateIcon />}
                    label={headerDate}
                    sx={{
                      bgcolor: `${THEME.accent}10`,
                      color: THEME.primary,
                      fontWeight: 600,
                    }}
                  />
                </Stack>
              </Box>
            </Stack>
            <IconButton
              onClick={onClose}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2, pb: 1, background: "#fafbfc" }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <Fade in>
                <Stack alignItems="center" spacing={2}>
                  <CircularProgress size={48} sx={{ color: THEME.accent }} />
                  <Typography variant="h6" sx={{ color: THEME.primary }}>
                    Loading Prescription...
                  </Typography>
                </Stack>
              </Fade>
            </Box>
          ) : prescription ? (
            <Box>
              {/* University Header */}
              <Fade in timeout={300}>
                <Card sx={{ ...lightCardSx, mb: 3, textAlign: "center" }}>
                  <CardContent sx={{ py: 3 }}>
                    <Typography variant="h4" sx={{ color: THEME.primary, fontWeight: 800, mb: 1 }}>
                      UNIVERSITY OF PERADENIYA
                    </Typography>
                    <Typography variant="h6" sx={{ color: THEME.accent, fontWeight: 600, mb: 1 }}>
                      MEDICAL PRESCRIPTION
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Medical Information System
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>

              <Divider sx={{ mb: 3, borderColor: "rgba(12, 60, 60, 0.08)" }} />

              {/* Patient Information */}
              <Fade in timeout={400}>
                <Card sx={{ ...modernCardSx, mb: 3 }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                      <Box sx={{
                        width: 32,
                        height: 32,
                        borderRadius: THEME.borderRadius.small,
                        background: THEME.gradients.accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <PersonIcon fontSize="small" sx={{ color: "#fff" }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: THEME.primary }}>
                        Patient Information
                      </Typography>
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Name:</strong> {prescription.patientName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Age:</strong> {prescription.patientAge ? `${prescription.patientAge} years` : "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Gender:</strong> {prescription.patientGender || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Patient ID:</strong> {prescription.patientId}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Fade>

              {/* Prescribed Medications */}
              <Fade in timeout={500}>
                <Card sx={{ ...modernCardSx, mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: THEME.primary, mb: 2 }}>
                      Prescribed Medications
                    </Typography>
                    {prescription.medications && prescription.medications.length > 0 ? (
                      <List>
                        {prescription.medications.map((item, index) => (
                          <ListItem key={item.id || index} divider={index < prescription.medications.length - 1}>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: THEME.primary }}>
                                  {item.medicineName}
                                </Typography>
                              }
                              secondary={
                                <Box sx={{ mt: 1 }}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                      <Typography variant="body2" color="text.secondary">
                                        <strong>Dosage:</strong> {item.dosage || "N/A"}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <Typography variant="body2" color="text.secondary">
                                        <strong>Frequency:</strong> {item.timesPerDay || "N/A"} times per day
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <Typography variant="body2" color="text.secondary">
                                        <strong>Duration:</strong> {item.durationDays || "N/A"} days
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <Typography variant="body2" color="text.secondary">
                                        <strong>Route:</strong> {item.route || "N/A"}
                                      </Typography>
                                    </Grid>
                                    {item.instructions && (
                                      <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">
                                          <strong>Instructions:</strong> {item.instructions}
                                        </Typography>
                                      </Grid>
                                    )}
                                    <Grid item xs={12} sm={6}>
                                      <Typography variant="body2" color="text.secondary">
                                        <strong>Required Quantity:</strong> {item.requiredQuantity || "N/A"}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <Typography variant="body2" color="text.secondary">
                                        <strong>Dispensed Quantity:</strong> {item.dispensedQuantity || "0"}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                      <Chip
                                        size="small"
                                        label={item.dispensedStatus === 1 ? "Dispensed" : item.dispensedStatus === 0 ? "Not Dispensed" : "Partial"}
                                        color={item.dispensedStatus === 1 ? "success" : item.dispensedStatus === 0 ? "default" : "warning"}
                                        variant="outlined"
                                      />
                                    </Grid>
                                  </Grid>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No medications prescribed.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Fade>

              {/* General Notes */}
              {prescription.generalNotes && (
                <Fade in timeout={600}>
                  <Card sx={{ ...modernCardSx, mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: THEME.primary, mb: 2 }}>
                        General Notes
                      </Typography>
                      <Paper elevation={1} sx={{
                        p: 3,
                        bgcolor: `${THEME.light}50`,
                        borderRadius: THEME.borderRadius.medium,
                        border: "1px solid rgba(12, 60, 60, 0.1)",
                      }}>
                        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: THEME.primary }}>
                          {prescription.generalNotes}
                        </Typography>
                      </Paper>
                    </CardContent>
                  </Card>
                </Fade>
              )}

              {/* Prescription Details */}
              <Fade in timeout={700}>
                <Card sx={{ ...lightCardSx, mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: THEME.primary, mb: 2 }}>
                      Prescription Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Date of Issue:</strong> {formatDate(prescription.prescriptionDate)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Prescription ID:</strong> {prescription.id}
                        </Typography>
                      </Grid>
                      {prescription.appointmentId && (
                        <Grid item xs={12}>
                          <Typography variant="body1" gutterBottom>
                            <strong>Appointment ID:</strong> {prescription.appointmentId}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Fade>

              {/* Status Information */}
              <Fade in timeout={800}>
                <Card sx={{ ...lightCardSx, borderLeft: `4px solid ${THEME.accent}` }}>
                  <CardContent>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <InfoIcon sx={{ color: THEME.accent }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: THEME.primary, mb: 1 }}>
                          Prescription Status
                        </Typography>
                        <Chip
                          size="small"
                          label={prescription.isActive ? "Active" : "Completed"}
                          color={prescription.isActive ? "success" : "default"}
                          variant={prescription.isActive ? "filled" : "outlined"}
                          sx={{ mr: 2 }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            </Box>
          ) : null}
        </DialogContent>

        {/* Enhanced sticky footer actions */}
        <DialogActions sx={{
          position: "sticky",
          bottom: 0,
          bgcolor: "#fff",
          borderTop: "1px solid rgba(12, 60, 60, 0.08)",
          p: 2.5,
          background: THEME.gradients.card,
        }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems="center"
            spacing={2}
            sx={{ width: "100%" }}
          >
            <Box sx={{ flex: 1 }}>
              {prescription && (
                <Chip
                  size="medium"
                  icon={<MedicalIcon />}
                  label={`Prescription ID: ${prescription.id}`}
                  sx={{
                    bgcolor: `${THEME.primary}15`,
                    color: THEME.primary,
                    fontWeight: 700,
                    height: 36,
                    borderRadius: THEME.borderRadius.medium,
                    border: `1px solid ${THEME.primary}30`,
                  }}
                />
              )}
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                onClick={onClose}
                variant="outlined"
                size="large"
                sx={{
                  borderColor: THEME.primary,
                  color: THEME.primary,
                  "&:hover": {
                    bgcolor: "rgba(12, 60, 60, 0.08)",
                    borderColor: THEME.primary,
                    transform: "translateY(-1px)",
                  },
                  ...modernButtonSx,
                  minWidth: 100,
                }}
              >
                Close
              </Button>
            </Stack>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Enhanced SNACKBAR */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={Fade}
        TransitionProps={{ direction: "up" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: THEME.borderRadius.medium,
            fontWeight: 600,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            "& .MuiAlert-icon": {
              fontSize: "1.2rem",
            },
            "& .MuiAlert-message": {
              fontSize: "0.9rem",
            },
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}