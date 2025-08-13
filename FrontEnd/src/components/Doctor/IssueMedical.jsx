import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Grid, Button, TextField, Alert, 
  CircularProgress, Divider, Card, CardContent
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  MedicalServices as MedicalIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as FacultyIcon,
  CalendarToday as DateIcon
} from "@mui/icons-material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { issueMedical } from "../../api/appointments";

const IssueMedical = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get patient data from navigation state
  const patientFromState = location.state?.patient;
  const currentAppointmentId = location.state?.appointmentId;
  
  const [patientData] = useState(patientFromState || null);
  const [recommendations, setRecommendations] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const getPatientAge = () => {
    const details = patientData?.patientDetails || patientData;
    if (details?.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(details.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
    return details?.age || 'N/A';
  };

  const handleSubmitMedical = async () => {
    if (!recommendations.trim()) {
      setError("Recommendations field is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const medicalData = {
        recommendations: recommendations.trim(),
        additionalNotes: additionalNotes.trim(),
        appointmentId: currentAppointmentId || null
      };

      await issueMedical(patientId, medicalData);
      setSuccess(true);
      
      // Clear form
      setRecommendations('');
      setAdditionalNotes('');
      
      // Redirect back to patient profile after a short delay
      setTimeout(() => {
        navigate(`/doctor/patients/${patientId}`, {
          state: { 
            patient: patientData,
            appointmentId: currentAppointmentId,
            medicalIssued: true
          }
        });
      }, 2000);
      
    } catch (err) {
      setError(err.message || "Failed to issue medical");
      console.error("Error issuing medical:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToProfile = () => {
    navigate(`/doctor/patients/${patientId}`, {
      state: { 
        patient: patientData,
        appointmentId: currentAppointmentId
      }
    });
  };

  if (!patientData) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Patient data not found. Please go back and try again.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/doctor/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  if (success) {
    return (
      <Box p={3}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Medical certificate has been issued successfully! Redirecting to patient profile...
        </Alert>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress size={60} sx={{ color: "#45d27a" }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={1}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToProfile}
          sx={{ mr: 2 }}
        >
          Back to Patient Profile
        </Button>
      </Box>
      
      {/* Title */}
      <Typography variant="h4" sx={{ color: "#0c3c3c", fontWeight: 700, mb: 3 }}>
        Issue Medical Certificate
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Patient Information Card */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: 'fit-content' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <PersonIcon sx={{ fontSize: 30, color: "#45d27a", mr: 1 }} />
              <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600 }}>
                Patient Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box display="flex" alignItems="center" mb={2}>
              <PersonIcon sx={{ color: "#666", mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Name</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {patientData?.name || 'N/A'}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" mb={2}>
              <EmailIcon sx={{ color: "#666", mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {patientData?.email || 'N/A'}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" mb={2}>
              <Typography sx={{ color: "#666", mr: 1 }}>Role:</Typography>
              <Typography variant="body1" fontWeight={600}>
                {patientData?.role || 'N/A'}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" mb={2}>
              <FacultyIcon sx={{ color: "#666", mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Faculty</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {patientData?.faculty || patientData?.patientDetails?.faculty || 'N/A'}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" mb={2}>
              <Typography sx={{ color: "#666", mr: 1 }}>Age:</Typography>
              <Typography variant="body1" fontWeight={600}>
                {getPatientAge()} years
              </Typography>
            </Box>

            <Box display="flex" alignItems="center">
              <DateIcon sx={{ color: "#666", mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Date</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Medical Certificate Form */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <MedicalIcon sx={{ fontSize: 30, color: "#45d27a", mr: 1 }} />
              <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600 }}>
                Medical Certificate Details
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Medical Recommendations *"
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  multiline
                  rows={6}
                  placeholder="Enter medical recommendations, rest periods, activity restrictions, etc..."
                  required
                  error={!recommendations.trim() && error}
                  helperText={!recommendations.trim() && error ? "This field is required" : ""}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  multiline
                  rows={4}
                  placeholder="Any additional notes, instructions, or follow-up requirements..."
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={handleBackToProfile}
                    disabled={loading}
                    sx={{
                      borderColor: "#666",
                      color: "#666",
                      "&:hover": {
                        borderColor: "#45d27a",
                        backgroundColor: "rgba(69, 210, 122, 0.1)"
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSubmitMedical}
                    disabled={loading || !recommendations.trim()}
                    sx={{
                      backgroundColor: "#45d27a",
                      "&:hover": { backgroundColor: "#3ab86a" },
                      "&:disabled": { backgroundColor: "#cccccc" }
                    }}
                  >
                    {loading ? "Issuing..." : "Issue Medical Certificate"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Preview Card */}
          {(recommendations.trim() || additionalNotes.trim()) && (
            <Card sx={{ mt: 3, border: '2px dashed #45d27a' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600, mb: 2 }}>
                  Medical Certificate Preview
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Patient: <strong>{patientData?.name}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Date: <strong>{new Date().toLocaleDateString()}</strong>
                </Typography>
                
                {recommendations.trim() && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Medical Recommendations:
                    </Typography>
                    <Typography variant="body2" sx={{ pl: 2, fontStyle: 'italic' }}>
                      {recommendations}
                    </Typography>
                  </Box>
                )}
                
                {additionalNotes.trim() && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Additional Notes:
                    </Typography>
                    <Typography variant="body2" sx={{ pl: 2, fontStyle: 'italic' }}>
                      {additionalNotes}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default IssueMedical;