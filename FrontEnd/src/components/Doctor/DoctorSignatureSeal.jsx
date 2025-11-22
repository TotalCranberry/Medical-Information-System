import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, Alert, Card, CardContent, Container,
  CircularProgress, Grid
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon
} from "@mui/icons-material";
import { uploadDoctorSignatureSeal, getDoctorSignatureSeal } from "../../api/doctor";

const DoctorSignatureSeal = () => {
  const [doctorSignature, setDoctorSignature] = useState(null);
  const [doctorSeal, setDoctorSeal] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [sealPreview, setSealPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchExistingSignatureSeal();
  }, []);

  const fetchExistingSignatureSeal = async () => {
    try {
      setFetching(true);
      const response = await getDoctorSignatureSeal();
      if (response.doctorSignature) {
        setSignaturePreview(response.doctorSignature);
      }
      if (response.doctorSeal) {
        setSealPreview(response.doctorSeal);
      }
    } catch (err) {
      console.error("Error fetching signature and seal:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleSignatureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        alert("Doctor signature image must be less than 1MB. Please select a smaller file.");
        event.target.value = '';
        return;
      }
      setDoctorSignature(file);
      const reader = new FileReader();
      reader.onload = (e) => setSignaturePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSealChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        alert("Doctor seal image must be less than 1MB. Please select a smaller file.");
        event.target.value = '';
        return;
      }
      setDoctorSeal(file);
      const reader = new FileReader();
      reader.onload = (e) => setSealPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!doctorSignature && !doctorSeal) {
      setError("Please select at least one image to upload");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (doctorSignature) {
        formData.append('doctorSignature', doctorSignature);
      }
      if (doctorSeal) {
        formData.append('doctorSeal', doctorSeal);
      }

      await uploadDoctorSignatureSeal(formData);
      setSuccess(true);

      // Clear form
      setDoctorSignature(null);
      setDoctorSeal(null);

      // Refresh existing images
      setTimeout(() => {
        fetchExistingSignatureSeal();
        setSuccess(false);
      }, 2000);

    } catch (err) {
      setError(err.message || "Failed to upload signature and seal");
      console.error("Error uploading:", err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box p={3} display="flex" justifyContent="center">
        <CircularProgress size={60} sx={{ color: "#45d27a" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 3 }}>
      <Container maxWidth="md">
        <Box mb={3}>
          <Typography variant="h4" sx={{ color: "#0c3c3c", fontWeight: 700 }}>
            Doctor Signature & Seal
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Upload your signature and seal images. These will be automatically used when issuing medical certificates.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            Signature and seal uploaded successfully!
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Current Signature Display */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: "#0c3c3c", fontWeight: 600 }}>
                  Current Signature
                </Typography>
                <Box sx={{
                  height: '200px',
                  border: '2px solid #e0e0e0',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fafafa'
                }}>
                  {signaturePreview ? (
                    <img
                      src={signaturePreview}
                      alt="Current Signature"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <Box textAlign="center">
                      <ImageIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No signature uploaded
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Current Seal Display */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: "#0c3c3c", fontWeight: 600 }}>
                  Current Seal
                </Typography>
                <Box sx={{
                  height: '200px',
                  border: '2px solid #e0e0e0',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fafafa'
                }}>
                  {sealPreview ? (
                    <img
                      src={sealPreview}
                      alt="Current Seal"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <Box textAlign="center">
                      <ImageIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No seal uploaded
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Upload Section */}
          <Grid item xs={12}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, color: "#0c3c3c", fontWeight: 600 }}>
                  Upload New Images
                </Typography>

                <Grid container spacing={4}>
                  {/* Signature Upload */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{
                      height: '100%',
                      border: doctorSignature ? '2px solid #45d27a' : '2px dashed #ddd',
                      backgroundColor: doctorSignature ? 'rgba(69, 210, 122, 0.05)' : 'transparent',
                      borderRadius: 2
                    }}>
                      <CardContent sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" sx={{ mb: 2, color: "#0c3c3c", fontWeight: 600 }}>
                          New Signature
                        </Typography>
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          {!doctorSignature ? (
                            <Button
                              variant="outlined"
                              component="label"
                              startIcon={<UploadIcon />}
                              sx={{
                                height: '120px',
                                border: '2px dashed #45d27a',
                                borderRadius: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textTransform: 'none',
                                color: '#45d27a',
                                '&:hover': {
                                  borderColor: '#3ab86a',
                                  backgroundColor: 'rgba(69, 210, 122, 0.1)'
                                }
                              }}
                            >
                              <ImageIcon sx={{ fontSize: 36, mb: 1 }} />
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Upload New Signature
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                PNG, JPG, JPEG • Max 1MB
                              </Typography>
                              <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleSignatureChange}
                              />
                            </Button>
                          ) : (
                            <Box>
                              <CheckCircleIcon sx={{ fontSize: 48, color: '#45d27a', mb: 2 }} />
                              <Typography variant="body2" sx={{ color: '#45d27a', fontWeight: 500 }}>
                                Signature selected
                              </Typography>
                              <Button
                                variant="outlined"
                                component="label"
                                size="small"
                                sx={{ mt: 1, color: '#45d27a', borderColor: '#45d27a' }}
                              >
                                Change
                                <input
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  onChange={handleSignatureChange}
                                />
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Seal Upload */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{
                      height: '100%',
                      border: doctorSeal ? '2px solid #45d27a' : '2px dashed #ddd',
                      backgroundColor: doctorSeal ? 'rgba(69, 210, 122, 0.05)' : 'transparent',
                      borderRadius: 2
                    }}>
                      <CardContent sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" sx={{ mb: 2, color: "#0c3c3c", fontWeight: 600 }}>
                          New Seal
                        </Typography>
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          {!doctorSeal ? (
                            <Button
                              variant="outlined"
                              component="label"
                              startIcon={<UploadIcon />}
                              sx={{
                                height: '120px',
                                border: '2px dashed #45d27a',
                                borderRadius: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textTransform: 'none',
                                color: '#45d27a',
                                '&:hover': {
                                  borderColor: '#3ab86a',
                                  backgroundColor: 'rgba(69, 210, 122, 0.1)'
                                }
                              }}
                            >
                              <ImageIcon sx={{ fontSize: 36, mb: 1 }} />
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Upload New Seal
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                PNG, JPG, JPEG • Max 1MB
                              </Typography>
                              <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleSealChange}
                              />
                            </Button>
                          ) : (
                            <Box>
                              <CheckCircleIcon sx={{ fontSize: 48, color: '#45d27a', mb: 2 }} />
                              <Typography variant="body2" sx={{ color: '#45d27a', fontWeight: 500 }}>
                                Seal selected
                              </Typography>
                              <Button
                                variant="outlined"
                                component="label"
                                size="small"
                                sx={{ mt: 1, color: '#45d27a', borderColor: '#45d27a' }}
                              >
                                Change
                                <input
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  onChange={handleSealChange}
                                />
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Submit Button */}
                <Box display="flex" justifyContent="center" mt={4}>
                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || (!doctorSignature && !doctorSeal)}
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    sx={{
                      backgroundColor: "#45d27a",
                      "&:hover": { backgroundColor: "#3ab86a" },
                      px: 6,
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      boxShadow: '0 4px 12px rgba(69, 210, 122, 0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(69, 210, 122, 0.4)'
                      }
                    }}
                  >
                    {loading ? "Uploading..." : "Upload Images"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DoctorSignatureSeal;