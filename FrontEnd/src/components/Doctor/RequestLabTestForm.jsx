import React, { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Button, TextField, Alert,
  CircularProgress, Divider, Card, CardContent, Container,
  FormControl, InputLabel, Select, MenuItem, Chip
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Science as ScienceIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as FacultyIcon,
  CalendarToday as DateIcon
} from "@mui/icons-material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { createLabRequest } from "../../api/labApi";

const RequestLabTestForm = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get patient data from navigation state
  const patientFromState = location.state?.patient;
  const currentAppointmentId = location.state?.appointmentId;

  const [patientData] = useState(patientFromState || null);
  const [testType, setTestType] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [urgency, setUrgency] = useState('ROUTINE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const testTypes = [
    "Blood Test - Complete Blood Count (CBC)",
    "Blood Test - Lipid Profile",
    "Blood Test - Blood Sugar (Fasting)",
    "Blood Test - Blood Sugar (Random)",
    "Blood Test - Liver Function Test (LFT)",
    "Blood Test - Kidney Function Test (KFT)",
    "Blood Test - Thyroid Function Test",
    "Blood Test - Vitamin D",
    "Blood Test - Vitamin B12",
    "Blood Test - Iron Studies",
    "Urine Test - Routine",
    "Urine Test - Culture & Sensitivity",
    "Urine Test - Microalbumin",
    "Stool Test - Routine",
    "Stool Test - Occult Blood",
    "X-Ray - Chest PA View",
    "X-Ray - Abdomen",
    "X-Ray - Pelvis",
    "X-Ray - Spine",
    "X-Ray - Limbs",
    "ECG - 12 Lead",
    "ECG - Exercise Stress Test",
    "Ultrasound - Abdomen",
    "Ultrasound - Pelvis",
    "Ultrasound - Thyroid",
    "Ultrasound - Breast",
    "Ultrasound - Scrotal",
    "CT Scan - Brain",
    "CT Scan - Chest",
    "CT Scan - Abdomen",
    "MRI - Brain",
    "MRI - Spine",
    "MRI - Joints",
    "Other"
  ];

  const urgencyLevels = [
    { value: 'ROUTINE', label: 'Routine', color: 'default' },
    { value: 'URGENT', label: 'Urgent', color: 'warning' },
    { value: 'EMERGENCY', label: 'Emergency', color: 'error' }
  ];

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

  const handleSubmitLabRequest = async () => {
    if (!testType.trim()) {
      setError("Test type is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData = {
        patientId: patientId,
        testType: testType.trim(),
        clinicalNotes: clinicalNotes.trim(),
        urgency: urgency
      };

      await createLabRequest(patientId, testType.trim());
      setSuccess(true);

      // Clear form
      setTestType('');
      setClinicalNotes('');
      setUrgency('ROUTINE');

      // Redirect back to patient profile after a short delay
      setTimeout(() => {
        navigate(`/doctor/patients/${patientId}`, {
          state: {
            patient: patientData,
            appointmentId: currentAppointmentId,
            labRequestCreated: true
          }
        });
      }, 2000);

    } catch (err) {
      setError(err.message || "Failed to create lab request");
      console.error("Error creating lab request:", err);
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
          Lab test request has been created successfully! Redirecting to patient profile...
        </Alert>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress size={60} sx={{ color: "#45d27a" }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToProfile}
            sx={{
              mb: 2,
              color: '#0c3c3c',
              '&:hover': { backgroundColor: 'rgba(12, 60, 60, 0.1)' }
            }}
          >
            Back to Patient Profile
          </Button>
          <Typography variant="h4" sx={{ color: "#0c3c3c", fontWeight: 700 }}>
            Request Laboratory Test
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Patient Information */}
          <Grid item xs={12} lg={4}>
            <Card elevation={3} sx={{ borderRadius: 3, height: 'fit-content' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <PersonIcon sx={{ fontSize: 28, color: "#45d27a", mr: 1.5 }} />
                  <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600 }}>
                    Patient Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                      Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {patientData?.name || 'N/A'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {patientData?.email || 'N/A'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                      Role
                    </Typography>
                    <Typography variant="body1">
                      {patientData?.role || 'N/A'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                      Faculty
                    </Typography>
                    <Typography variant="body1">
                      {patientData?.faculty || patientData?.patientDetails?.faculty || 'N/A'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                      Age
                    </Typography>
                    <Typography variant="body1">
                      {getPatientAge()} years
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                      Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Lab Request Details */}
          <Grid item xs={12} lg={8}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <ScienceIcon sx={{ fontSize: 28, color: "#45d27a", mr: 1.5 }} />
                  <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600 }}>
                    Laboratory Test Request
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth required error={!testType.trim() && error}>
                      <InputLabel>Test Type *</InputLabel>
                      <Select
                        value={testType}
                        onChange={(e) => setTestType(e.target.value)}
                        label="Test Type *"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fafafa',
                            '&:hover': {
                              backgroundColor: '#f5f5f5'
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#fff'
                            }
                          }
                        }}
                      >
                        {testTypes.map((test, index) => (
                          <MenuItem key={index} value={test}>
                            {test}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Urgency Level</InputLabel>
                      <Select
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value)}
                        label="Urgency Level"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fafafa',
                            '&:hover': {
                              backgroundColor: '#f5f5f5'
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#fff'
                            }
                          }
                        }}
                      >
                        {urgencyLevels.map((level) => (
                          <MenuItem key={level.value} value={level.value}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip
                                label={level.label}
                                size="small"
                                color={level.color}
                                variant="outlined"
                              />
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Clinical Notes & Indications"
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      multiline
                      rows={6}
                      placeholder="Provide clinical indications, symptoms, relevant medical history, and any specific instructions for the laboratory..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#fafafa',
                          '&:hover': {
                            backgroundColor: '#f5f5f5'
                          },
                          '&.Mui-focused': {
                            backgroundColor: '#fff'
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                onClick={handleSubmitLabRequest}
                variant="contained"
                disabled={loading || !testType.trim()}
                sx={{
                  backgroundColor: "#45d27a",
                  "&:hover": { backgroundColor: "#3ab86a" },
                  px: 8,
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(69, 210, 122, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(69, 210, 122, 0.4)'
                  }
                }}
              >
                {loading ? <CircularProgress size={28} sx={{ color: 'white' }} /> : "Submit Lab Request"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default RequestLabTestForm;