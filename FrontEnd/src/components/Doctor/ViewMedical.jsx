import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Grid, Button, Card, CardContent,
  Divider, Alert, CircularProgress, Chip
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  MedicalServices as MedicalIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as FacultyIcon,
  CalendarToday as DateIcon,
  Image as ImageIcon
} from "@mui/icons-material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchMedical as fetchDoctorMedical, sendMedicalToCourseUnit } from "../../api/appointments";
import { fetchPatientMedical } from "../../api/reports";

const ViewMedical = () => {
  const { medicalId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [medical, setMedical] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [signatureImage, setSignatureImage] = useState(null);
  const [sealImage, setSealImage] = useState(null);

  const role = localStorage.getItem("userRole");

  useEffect(() => {
    loadMedical();
  }, [medicalId]);


  const loadMedical = async () => {
    try {
      setLoading(true);

      let medicalData;
      if (role === "Student" || role === "Staff") {
        medicalData = await fetchPatientMedical(medicalId);
      } else {
        medicalData = await fetchDoctorMedical(medicalId);
      }

      setMedical(medicalData);

      // Process images if they exist (now returned as base64 data URLs)
      if (medicalData.doctorSignature) {
        setSignatureImage(medicalData.doctorSignature);
      }

      if (medicalData.doctorSeal) {
        setSealImage(medicalData.doctorSeal);
      }

      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load medical certificate");
      console.error("Error loading medical:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToCourseUnit = async () => {
    try {
      setSending(true);
      await sendMedicalToCourseUnit(medicalId);
      setSuccess("Medical certificate sent to course unit successfully!");
      await loadMedical();
    } catch (err) {
      setError(err.message || "Failed to send medical to course unit");
      console.error("Error sending medical:", err);
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    if (role === "Student" || role === "Staff") {
      navigate("/patient/reports");
    } else if (medical?.patient?.id) {
      navigate(`/doctor/patients/${medical.patient.id}`, { state: { patient: medical.patient } });
    } else {
      navigate("/doctor/dashboard");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} sx={{ color: "#45d27a" }} />
      </Box>
    );
  }

  if (!medical) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Medical certificate not found. Please go back and try again.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={1}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
      </Box>

      {/* Title */}
      <Typography variant="h4" sx={{ color: "#0c3c3c", fontWeight: 700, mb: 3 }}>
        Medical Certificate
      </Typography>

      {/* Error & Success */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Medical Certificate Details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 4 }}>
            <Box textAlign="center" mb={4}>
              <Typography variant="h5" sx={{ color: "#0c3c3c", fontWeight: 700, mb: 1 }}>
                UNIVERSITY OF PERADENIYA
              </Typography>
              <Typography variant="h6" sx={{ color: "#45d27a", fontWeight: 600, mb: 1 }}>
                MEDICAL CERTIFICATE
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Medical Information System
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Patient Information */}
            <Box mb={4}>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon sx={{ fontSize: 24, color: "#45d27a", mr: 1 }} />
                <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600 }}>
                  Patient Information
                </Typography>
              </Box>
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
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Medical Recommendations */}
            <Box mb={4}>
              <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600, mb: 2 }}>
                Medical Recommendations
              </Typography>
              <Paper elevation={1} sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                  {medical.recommendations}
                </Typography>
              </Paper>
            </Box>

            {/* Additional Notes */}
            {medical.additionalNotes && (
              <Box mb={4}>
                <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600, mb: 2 }}>
                  Additional Notes
                </Typography>
                <Paper elevation={1} sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                    {medical.additionalNotes}
                  </Typography>
                </Paper>
              </Box>
            )}

            <Divider sx={{ mb: 4 }} />

            {/* Dates */}
            <Box mb={4}>
              <Typography variant="body1" gutterBottom>
                <strong>Date of Issue:</strong> {formatDate(medical.medicalDate)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Certificate ID:</strong> {medical.id}
              </Typography>
              {medical.appointment && (
                <Typography variant="body1" gutterBottom>
                  <strong>Appointment Date:</strong> {formatDate(medical.appointment.appointmentDateTime)}
                </Typography>
              )}
            </Box>

            {/* Doctor Signature and Seal */}
            {(signatureImage || sealImage) && (
              <>
                <Divider sx={{ mb: 4 }} />
                <Box>
                  <Box display="flex" alignItems="center" mb={3}>
                    <ImageIcon sx={{ fontSize: 24, color: "#45d27a", mr: 1 }} />
                    <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600 }}>
                      Doctor Authentication
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    {signatureImage && (
                      <Grid item xs={12} md={6}>
                        <Box textAlign="center">
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                            Doctor Signature
                          </Typography>
                          <Paper elevation={1} sx={{ p: 3, bgcolor: "#f9f9f9" }}>
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
                            {!signatureImage && (
                              <Typography variant="body2" color="error">
                                Signature image failed to load
                              </Typography>
                            )}
                          </Paper>
                        </Box>
                      </Grid>
                    )}
                    {sealImage && (
                      <Grid item xs={12} md={6}>
                        <Box textAlign="center">
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                            Doctor Seal
                          </Typography>
                          <Paper elevation={1} sx={{ p: 3, bgcolor: "#f9f9f9" }}>
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
                            {!sealImage && (
                              <Typography variant="body2" color="error">
                                Seal image failed to load
                              </Typography>
                            )}
                          </Paper>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Doctor Actions */}
        {role !== "Student" && role !== "Staff" && (
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <MedicalIcon sx={{ fontSize: 24, color: "#45d27a", mr: 1 }} />
                <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600 }}>
                  Certificate Actions
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Box mb={3}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Status:
                </Typography>
                <Chip
                  size="small"
                  label={medical.isSentToCourseUnit ? "Sent to Course Unit" : "Not Sent"}
                  color={medical.isSentToCourseUnit ? "success" : "default"}
                  variant={medical.isSentToCourseUnit ? "filled" : "outlined"}
                />
                {medical.isSentToCourseUnit && medical.sentToCourseUnitAt && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Sent on: {formatDate(medical.sentToCourseUnitAt)}
                  </Typography>
                )}
              </Box>

              {!medical.isSentToCourseUnit && (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  onClick={handleSendToCourseUnit}
                  disabled={sending}
                  sx={{
                    backgroundColor: "#45d27a",
                    "&:hover": { backgroundColor: "#3ab86a" },
                    "&:disabled": { backgroundColor: "#cccccc" }
                  }}
                >
                  {sending ? "Sending..." : "Send to Course Unit"}
                </Button>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ViewMedical;
