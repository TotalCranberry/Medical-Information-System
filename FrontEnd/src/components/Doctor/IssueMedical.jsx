import React, { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Button, TextField, Alert,
  CircularProgress, Divider, Card, CardContent, Container
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  MedicalServices as MedicalIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as FacultyIcon,
  CalendarToday as DateIcon,
  Image as ImageIcon,
  Security as SecurityIcon,
  VpnKey as PasswordIcon,
  EditNote as EditNoteIcon
} from "@mui/icons-material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { issueMedical } from "../../api/appointments";
import { getDoctorSignatureSeal } from "../../api/doctor";

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
  const [password, setPassword] = useState('');
  const [storedSignature, setStoredSignature] = useState(null);
  const [storedSeal, setStoredSeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingSignature, setFetchingSignature] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchStoredSignatureSeal();
  }, []);

  const fetchStoredSignatureSeal = async () => {
    try {
      setFetchingSignature(true);
      const response = await getDoctorSignatureSeal();
      setStoredSignature(response.doctorSignature || null);
      setStoredSeal(response.doctorSeal || null);
    } catch (err) {
      console.error("Error fetching signature and seal:", err);
    } finally {
      setFetchingSignature(false);
    }
  };

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

    if (!password.trim()) {
      setError("Password is required for authentication");
      return;
    }

    if (!storedSignature || !storedSeal) {
      setError("You must upload your signature and seal first. Please go to your profile settings.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('recommendations', recommendations.trim());
      if (additionalNotes.trim()) {
        formData.append('additionalNotes', additionalNotes.trim());
      }
      if (currentAppointmentId) {
        formData.append('appointmentId', currentAppointmentId);
      }
      formData.append('password', password.trim());

      await issueMedical(patientId, formData);
      setSuccess(true);

      // Clear form
      setRecommendations('');
      setAdditionalNotes('');
      setPassword('');

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
            Issue Medical Certificate
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

          {/* Medical Details */}
          <Grid item xs={12} lg={8}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <MedicalIcon sx={{ fontSize: 28, color: "#45d27a", mr: 1.5 }} />
                  <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600 }}>
                    Medical Details
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
                      rows={10}
                      placeholder="Enter detailed medical recommendations, rest periods, activity restrictions, medication instructions, etc..."
                      required
                      error={!recommendations.trim() && error}
                      helperText={!recommendations.trim() && error ? "This field is required" : ""}
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

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Additional Notes"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      multiline
                      rows={8}
                      placeholder="Any additional observations, follow-up instructions, special considerations, or supplementary information..."
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

          {/* Doctor Authentication Section */}
          <Grid item xs={12}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <SecurityIcon sx={{ fontSize: 28, color: "#45d27a", mr: 1.5 }} />
                  <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600 }}>
                    Doctor Authentication
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Your stored signature and seal will be automatically attached to this medical certificate. Please enter your password to confirm your identity.
                </Typography>

                {fetchingSignature ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress size={40} sx={{ color: "#45d27a" }} />
                  </Box>
                ) : (
                  <Grid container spacing={4}>
                    {/* Doctor Signature Display */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{
                        height: '100%',
                        border: storedSignature ? '2px solid #45d27a' : '2px solid #ddd',
                        backgroundColor: storedSignature ? 'rgba(69, 210, 122, 0.05)' : '#f5f5f5',
                        borderRadius: 2
                      }}>
                        <CardContent sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="h6" sx={{ mb: 2, color: "#0c3c3c", fontWeight: 600 }}>
                            Your Signature
                          </Typography>
                          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            {storedSignature ? (
                              <Box sx={{
                                border: '2px solid #45d27a',
                                borderRadius: 2,
                                p: 2,
                                backgroundColor: '#f9f9f9'
                              }}>
                                <img
                                  src={storedSignature}
                                  alt="Stored Signature"
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '120px',
                                    objectFit: 'contain',
                                    borderRadius: '4px'
                                  }}
                                />
                              </Box>
                            ) : (
                              <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                                <ImageIcon sx={{ fontSize: 48, mb: 1, color: '#ccc' }} />
                                <Typography variant="body2">
                                  No signature uploaded
                                </Typography>
                                <Button
                                  variant="outlined"
                                  startIcon={<EditNoteIcon />}
                                  onClick={() => navigate('/doctor/signature-seal')}
                                  sx={{
                                    mt: 1,
                                    color: '#45d27a',
                                    borderColor: '#45d27a',
                                    '&:hover': {
                                      borderColor: '#3ab86a',
                                      backgroundColor: 'rgba(69, 210, 122, 0.1)'
                                    }
                                  }}
                                >
                                  Upload Signature & Seal
                                </Button>
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Doctor Seal Display */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{
                        height: '100%',
                        border: storedSeal ? '2px solid #45d27a' : '2px solid #ddd',
                        backgroundColor: storedSeal ? 'rgba(69, 210, 122, 0.05)' : '#f5f5f5',
                        borderRadius: 2
                      }}>
                        <CardContent sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="h6" sx={{ mb: 2, color: "#0c3c3c", fontWeight: 600 }}>
                            Your Seal
                          </Typography>
                          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            {storedSeal ? (
                              <Box sx={{
                                border: '2px solid #45d27a',
                                borderRadius: 2,
                                p: 2,
                                backgroundColor: '#f9f9f9'
                              }}>
                                <img
                                  src={storedSeal}
                                  alt="Stored Seal"
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '120px',
                                    objectFit: 'contain',
                                    borderRadius: '4px'
                                  }}
                                />
                              </Box>
                            ) : (
                              <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                                <ImageIcon sx={{ fontSize: 48, mb: 1, color: '#ccc' }} />
                                <Typography variant="body2">
                                  No seal uploaded
                                </Typography>
                                <Button
                                  variant="outlined"
                                  startIcon={<EditNoteIcon />}
                                  onClick={() => navigate('/doctor/signature-seal')}
                                  sx={{
                                    mt: 1,
                                    color: '#45d27a',
                                    borderColor: '#45d27a',
                                    '&:hover': {
                                      borderColor: '#3ab86a',
                                      backgroundColor: 'rgba(69, 210, 122, 0.1)'
                                    }
                                  }}
                                >
                                  Upload Signature & Seal
                                </Button>
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Password Input */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{
                        height: '100%',
                        border: '2px solid #ddd',
                        borderRadius: 2
                      }}>
                        <CardContent sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="h6" sx={{ mb: 2, color: "#0c3c3c", fontWeight: 600 }}>
                            Confirm Identity
                          </Typography>
                          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <TextField
                              fullWidth
                              type="password"
                              label="Enter Password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              error={!password.trim() && error && error.includes("Password")}
                              helperText={!password.trim() && error && error.includes("Password") ? "Password is required" : ""}
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
                              InputProps={{
                                startAdornment: <PasswordIcon sx={{ color: 'action.active', mr: 1 }} />
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                              Your login password is required to issue medical certificates
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Issue Medical Button */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                onClick={handleSubmitMedical}
                variant="contained"
                disabled={loading || !recommendations.trim() || !password.trim() || !storedSignature || !storedSeal}
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
                {loading ? <CircularProgress size={28} sx={{ color: 'white' }} /> : "Issue Medical Certificate"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default IssueMedical;