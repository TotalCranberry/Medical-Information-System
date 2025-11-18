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
} from "@mui/material";
import {
  Close as CloseIcon,
  MedicalServices as MedicalIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as FacultyIcon,
  CalendarToday as DateIcon,
  Image as ImageIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";
import { fetchMedical as fetchDoctorMedical, sendMedicalToCourseUnit } from "../../api/appointments";

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

const LoadingButton = ({ loading, children, startIcon, ...props }) => (
  <Button
    {...props}
    startIcon={loading ? <CircularProgress size={16} /> : startIcon}
    disabled={loading || props.disabled}
    sx={{
      ...modernButtonSx,
      ...props.sx,
    }}
  >
    {loading ? "Loading..." : children}
  </Button>
);

export default function ViewMedicalDialog({ open, onClose, medicalId, onMedicalUpdate }) {
  const [medical, setMedical] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);
  const [sealImage, setSealImage] = useState(null);
  const [snack, setSnack] = useState({ open: false, severity: "success", msg: "" });

  // ---------- Load medical data ----------
  useEffect(() => {
    if (open && medicalId) {
      loadMedical();
    } else if (!open) {
      // Reset state when dialog closes
      setMedical(null);
      setSignatureImage(null);
      setSealImage(null);
      setSnack({ open: false, severity: "success", msg: "" });
    }
  }, [open, medicalId]);

  const loadMedical = async () => {
    try {
      setLoading(true);
      const medicalData = await fetchDoctorMedical(medicalId);
      setMedical(medicalData);

      // Process images if they exist
      if (medicalData.doctorSignature) {
        setSignatureImage(medicalData.doctorSignature);
      }
      if (medicalData.doctorSeal) {
        setSealImage(medicalData.doctorSeal);
      }
    } catch (err) {
      console.error("Error loading medical:", err);
      setSnack({
        open: true,
        severity: "error",
        msg: err.message || "Failed to load medical certificate",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendToCourseUnit = async () => {
    try {
      setSending(true);
      await sendMedicalToCourseUnit(medicalId);
      setSnack({
        open: true,
        severity: "success",
        msg: "Medical certificate sent to course unit successfully!",
      });
      // Reload medical data to update status
      await loadMedical();
      // Notify parent component
      onMedicalUpdate?.();
    } catch (err) {
      setSnack({
        open: true,
        severity: "error",
        msg: err.message || "Failed to send medical to course unit",
      });
      console.error("Error sending medical:", err);
    } finally {
      setSending(false);
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

  if (!medical && !loading) return null;

  const headerDate = medical ? new Date(medical.medicalDate || medical.createdAt || Date.now()).toLocaleString() : "";

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
                  Medical Certificate — {medical?.patientName || "Loading..."}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip
                    size="small"
                    icon={<MedicalIcon />}
                    label={`Dr. ${medical?.doctorName || "N/A"}`}
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
                    Loading Medical Certificate...
                  </Typography>
                </Stack>
              </Fade>
            </Box>
          ) : medical ? (
            <Box>
              {/* University Header */}
              <Fade in timeout={300}>
                <Card sx={{ ...lightCardSx, mb: 3, textAlign: "center" }}>
                  <CardContent sx={{ py: 3 }}>
                    <Typography variant="h4" sx={{ color: THEME.primary, fontWeight: 800, mb: 1 }}>
                      UNIVERSITY OF PERADENIYA
                    </Typography>
                    <Typography variant="h6" sx={{ color: THEME.accent, fontWeight: 600, mb: 1 }}>
                      MEDICAL CERTIFICATE
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
                          <strong>Name:</strong> {medical.patientName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Role:</strong> {medical.patientRole}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Age:</strong> {medical.patientAge ? `${medical.patientAge} years` : "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Faculty:</strong> {medical.patientFaculty || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Email:</strong> {medical.patientEmail}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Fade>

              {/* Medical Recommendations */}
              <Fade in timeout={500}>
                <Card sx={{ ...modernCardSx, mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: THEME.primary, mb: 2 }}>
                      Medical Recommendations
                    </Typography>
                    <Paper elevation={1} sx={{
                      p: 3,
                      bgcolor: `${THEME.light}50`,
                      borderRadius: THEME.borderRadius.medium,
                      border: "1px solid rgba(12, 60, 60, 0.1)",
                    }}>
                      <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: THEME.primary }}>
                        {medical.recommendations}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>
              </Fade>

              {/* Additional Notes */}
              {medical.additionalNotes && (
                <Fade in timeout={600}>
                  <Card sx={{ ...modernCardSx, mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: THEME.primary, mb: 2 }}>
                        Additional Notes
                      </Typography>
                      <Paper elevation={1} sx={{
                        p: 3,
                        bgcolor: `${THEME.light}50`,
                        borderRadius: THEME.borderRadius.medium,
                        border: "1px solid rgba(12, 60, 60, 0.1)",
                      }}>
                        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: THEME.primary }}>
                          {medical.additionalNotes}
                        </Typography>
                      </Paper>
                    </CardContent>
                  </Card>
                </Fade>
              )}

              {/* Certificate Details */}
              <Fade in timeout={700}>
                <Card sx={{ ...lightCardSx, mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: THEME.primary, mb: 2 }}>
                      Certificate Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Date of Issue:</strong> {formatDate(medical.medicalDate)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Certificate ID:</strong> {medical.id}
                        </Typography>
                      </Grid>
                      {medical.appointment && (
                        <Grid item xs={12}>
                          <Typography variant="body1" gutterBottom>
                            <strong>Appointment Date:</strong> {formatDate(medical.appointment.appointmentDateTime)}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Fade>

              {/* Doctor Authentication */}
              {(signatureImage || sealImage) && (
                <Fade in timeout={800}>
                  <Card sx={{ ...modernCardSx, mb: 3 }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                        <Box sx={{
                          width: 32,
                          height: 32,
                          borderRadius: THEME.borderRadius.small,
                          background: THEME.gradients.accent,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <ImageIcon fontSize="small" sx={{ color: "#fff" }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: THEME.primary }}>
                          Doctor Authentication
                        </Typography>
                      </Stack>

                      <Grid container spacing={3}>
                        {signatureImage && (
                          <Grid item xs={12} md={6}>
                            <Box textAlign="center">
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: THEME.primary }}>
                                Doctor Signature
                              </Typography>
                              <Paper elevation={1} sx={{
                                p: 3,
                                bgcolor: "#f9f9f9",
                                borderRadius: THEME.borderRadius.medium,
                                border: "1px solid rgba(12, 60, 60, 0.1)",
                              }}>
                                <img
                                  src={signatureImage}
                                  alt="Doctor Signature"
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '200px',
                                    objectFit: 'contain',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                  }}
                                  onError={(e) => {
                                    console.error("Signature image failed to load:", signatureImage);
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </Paper>
                            </Box>
                          </Grid>
                        )}
                        {sealImage && (
                          <Grid item xs={12} md={6}>
                            <Box textAlign="center">
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: THEME.primary }}>
                                Doctor Seal
                              </Typography>
                              <Paper elevation={1} sx={{
                                p: 3,
                                bgcolor: "#f9f9f9",
                                borderRadius: THEME.borderRadius.medium,
                                border: "1px solid rgba(12, 60, 60, 0.1)",
                              }}>
                                <img
                                  src={sealImage}
                                  alt="Doctor Seal"
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '200px',
                                    objectFit: 'contain',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                  }}
                                  onError={(e) => {
                                    console.error("Seal image failed to load:", sealImage);
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </Paper>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Fade>
              )}

              {/* Status Information */}
              <Fade in timeout={900}>
                <Card sx={{ ...lightCardSx, borderLeft: `4px solid ${THEME.accent}` }}>
                  <CardContent>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <InfoIcon sx={{ color: THEME.accent }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: THEME.primary, mb: 1 }}>
                          Certificate Status
                        </Typography>
                        <Chip
                          size="small"
                          label={medical.isSentToCourseUnit ? "Sent to Course Unit" : "Not Sent"}
                          color={medical.isSentToCourseUnit ? "success" : "default"}
                          variant={medical.isSentToCourseUnit ? "filled" : "outlined"}
                          sx={{ mr: 2 }}
                        />
                        {medical.isSentToCourseUnit && medical.sentToCourseUnitAt && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            Sent on: {formatDate(medical.sentToCourseUnitAt)}
                          </Typography>
                        )}
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
              {medical && (
                <Chip
                  size="medium"
                  icon={<MedicalIcon />}
                  label={`Certificate ID: ${medical.id}`}
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

              {medical && !medical.isSentToCourseUnit && (
                <LoadingButton
                  onClick={handleSendToCourseUnit}
                  variant="contained"
                  size="large"
                  loading={sending}
                  startIcon={<SendIcon />}
                  sx={{
                    background: THEME.gradients.accent,
                    boxShadow: THEME.shadows.button,
                    "&:hover": {
                      boxShadow: "0 6px 20px rgba(69, 210, 122, 0.3)",
                      transform: "translateY(-2px)",
                    },
                    "&:disabled": {
                      background: `${THEME.gray}40`,
                      color: "#fff",
                    },
                    ...modernButtonSx,
                    minWidth: 200,
                  }}
                >
                  Send to Course Unit
                </LoadingButton>
              )}
            </Stack>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Enhanced SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={Fade}
        TransitionProps={{ direction: "up" }}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
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
          {snack.msg}
        </Alert>
      </Snackbar>

      {/* Loading backdrop */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: "blur(8px)",
          background: "rgba(12, 60, 60, 0.1)",
        }}
        open={sending}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress
            size={48}
            sx={{
              color: THEME.accent,
              "& .MuiCircularProgress-circle": {
                strokeLinecap: "round",
              },
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Sending to Course Unit...
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Please wait while we process your request
          </Typography>
        </Stack>
      </Backdrop>
    </>
  );
}