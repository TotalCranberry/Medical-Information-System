import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Grid, Button, Card, CardContent,
  TextField, Alert, CircularProgress, Divider, List, ListItem,
  ListItemText, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, InputAdornment
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Medication as MedicationIcon,
  Science as ScienceIcon,
  Person as PersonIcon,
  LocalHospital as VitalsIcon
} from "@mui/icons-material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  fetchPatientProfile,
  fetchPatientVitals,
  savePatientVitals,
  saveDiagnosis
} from "../../api/appointments";

const PatientProfile = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();


  const patientFromState = location.state?.patient;
  const currentAppointmentId =
      location.state?.appointmentId ||
      new URLSearchParams(location.search).get("appointmentId");

  const [patientData, setPatientData] = useState(patientFromState || null);
  const [vitals, setVitals] = useState([]);
  const [currentVitals, setCurrentVitals] = useState({
    heightCm: "",
    weightKg: "",
    temperatureC: "",
    systolicBp: "",
    diastolicBp: "",
    heartRate: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    notes: ""
  });
  const [diagnosis, setDiagnosis] = useState("");
  const [diagnosisNotes, setDiagnosisNotes] = useState("");
  const [recentDiagnoses, setRecentDiagnoses] = useState([]);
  const [loading, setLoading] = useState(!patientFromState);
  const [error, setError] = useState(null);
  const [editingVitals, setEditingVitals] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);

  useEffect(() => {
    if (!patientFromState) {
      loadPatientData();
    } else {
      loadAdditionalData();
    }
  }, [patientId, patientFromState]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const [profileData, vitalsData] = await Promise.all([
        fetchPatientProfile(patientId),
        fetchPatientVitals(patientId)
      ]);

      setPatientData(profileData.patient || profileData);
      setVitals(vitalsData);
      setRecentDiagnoses(profileData.recentDiagnoses || []);

      if (profileData.latestVitals) {
        setCurrentVitals({
          heightCm: profileData.latestVitals.heightCm || "",
          weightKg: profileData.latestVitals.weightKg || "",
          temperatureC: profileData.latestVitals.temperatureC || "",
          systolicBp: profileData.latestVitals.systolicBp || "",
          diastolicBp: profileData.latestVitals.diastolicBp || "",
          heartRate: profileData.latestVitals.heartRate || "",
          respiratoryRate: profileData.latestVitals.respiratoryRate || "",
          oxygenSaturation: profileData.latestVitals.oxygenSaturation || "",
          notes: profileData.latestVitals.notes || ""
        });
      }

      setError(null);
      setApiAvailable(true);
    } catch (err) {
      console.error("Error loading patient data:", err);
      if (err.message.includes("404") || err.message.includes("Not Found")) {
        setApiAvailable(false);
        setError("Patient data API endpoints are not yet implemented. Using basic patient information.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAdditionalData = async () => {
    try {
      const [profileData, vitalsData] = await Promise.all([
        fetchPatientProfile(patientId),
        fetchPatientVitals(patientId)
      ]);

      setVitals(vitalsData);
      setRecentDiagnoses(profileData.recentDiagnoses || []);

      if (vitalsData.length > 0) {
        const latestVitals = vitalsData[0];
        setCurrentVitals({
          heightCm: latestVitals.heightCm || "",
          weightKg: latestVitals.weightKg || "",
          temperatureC: latestVitals.temperatureC || "",
          systolicBp: latestVitals.systolicBp || "",
          diastolicBp: latestVitals.diastolicBp || "",
          heartRate: latestVitals.heartRate || "",
          respiratoryRate: latestVitals.respiratoryRate || "",
          oxygenSaturation: latestVitals.oxygenSaturation || "",
          notes: latestVitals.notes || ""
        });
      }
      setApiAvailable(true);
    } catch (err) {
      console.error("Error loading additional patient data:", err);
      if (err.message.includes("404") || err.message.includes("Not Found")) {
        setApiAvailable(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVitalsChange = (field, value) => {
    setCurrentVitals(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveVitals = async () => {
    if (!apiAvailable) {
      setError("Vitals API endpoint is not yet implemented.");
      return;
    }

    try {
      setSaving(true);

      const vitalsToSave = {};
      Object.keys(currentVitals).forEach(key => {
        const value = currentVitals[key];
        if (value !== "" && value !== null && value !== undefined) {
          if (key === "notes") {
            vitalsToSave[key] = value;
          } else {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              vitalsToSave[key] = numValue;
            }
          }
        }
      });

      await savePatientVitals(patientId, vitalsToSave);
      await loadAdditionalData();
      setEditingVitals(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error saving vitals:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDiagnosis = async () => {
    if (!diagnosis.trim()) {
      setError("Diagnosis cannot be empty");
      return;
    }

    if (!apiAvailable) {
      setError("Diagnosis API endpoint is not yet implemented.");
      return;
    }

    try {
      setSaving(true);
      const diagnosisData = {
        diagnosis: diagnosis.trim(),
        notes: diagnosisNotes.trim()
      };

      if (currentAppointmentId) {
        diagnosisData.appointmentId = currentAppointmentId;
      }

      await saveDiagnosis(patientId, diagnosisData);

      setDiagnosis("");
      setDiagnosisNotes("");
      await loadAdditionalData();
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error saving diagnosis:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleWritePrescription = () => {
    const apptId = currentAppointmentId;
    if (!apptId) {
      alert("No appointment selected. Open this profile from an appointment, or include ?appointmentId=...");
      return;
    }
    navigate(`/doctor/prescriptions?appointmentId=${apptId}`, {
      state: {
        appointmentId: apptId,
        patient: patientData,
        patientId,
        patientName: patientData?.name || "Unknown Patient"
      }
    });
  };

  const handleRequestLabTest = () => {
    navigate(`/doctor/request-test`, {
      state: {
        patient: patientData,
        patientId,
        patientName: patientData?.name || "Unknown Patient"
      }
    });
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
    return details?.age || null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
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

  if (!patientData) {
    return (
        <Box p={3}>
          <Alert severity="error">
            Patient data not found. Please go back and try again.
          </Alert>
          <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/doctor/dashboard")}
              sx={{ mt: 2 }}
          >
            Back to Dashboard
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
              onClick={() => navigate("/doctor/dashboard")}
              sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>

        {/* Title */}
        <Typography variant="h4" sx={{ color: "#0c3c3c", fontWeight: 700, mb: 3 }}>
          Patient Profile
        </Typography>

        {error && (
            <Alert severity={apiAvailable ? "error" : "warning"} sx={{ mb: 3 }}>
              {error}
            </Alert>
        )}

        <Grid container spacing={3}>
          {/* Patient Information */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: "fit-content" }}>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon sx={{ fontSize: 30, color: "#45d27a", mr: 1 }} />
                <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600 }}>
                  Patient Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {patientData?.name || "N/A"}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Email:</strong> {patientData?.email || "N/A"}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Role:</strong> {patientData?.role || "N/A"}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Faculty:</strong> {patientData?.faculty || patientData?.patientDetails?.faculty || "N/A"}
              </Typography>
              {getPatientAge() && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Age:</strong> {getPatientAge()} years
                  </Typography>
              )}
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Action Buttons */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                      fullWidth
                      variant="contained"
                      startIcon={<MedicationIcon />}
                      onClick={handleWritePrescription}
                      sx={{
                        backgroundColor: "#45d27a",
                        "&:hover": { backgroundColor: "#3ab86a" }
                      }}
                  >
                    Write Prescription
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ScienceIcon />}
                      onClick={handleRequestLabTest}
                      sx={{
                        borderColor: "#45d27a",
                        color: "#45d27a",
                        "&:hover": {
                          backgroundColor: "#45d27a",
                          color: "#fff"
                        }
                      }}
                  >
                    Request Lab Test
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Vitals Section */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <VitalsIcon sx={{ fontSize: 30, color: "#45d27a", mr: 1 }} />
                  <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600 }}>
                    Current Vitals
                  </Typography>
                </Box>
                {apiAvailable && (
                    !editingVitals ? (
                        <Button
                            startIcon={<EditIcon />}
                            onClick={() => setEditingVitals(true)}
                            variant="outlined"
                            size="small"
                        >
                          Edit Vitals
                        </Button>
                    ) : (
                        <Box>
                          <Button
                              startIcon={<SaveIcon />}
                              onClick={handleSaveVitals}
                              variant="contained"
                              size="small"
                              disabled={saving}
                              sx={{ mr: 1 }}
                          >
                            Save
                          </Button>
                          <Button
                              startIcon={<CancelIcon />}
                              onClick={() => setEditingVitals(false)}
                              variant="outlined"
                              size="small"
                          >
                            Cancel
                          </Button>
                        </Box>
                    )
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />

              {!apiAvailable && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Vitals functionality will be available once the backend API endpoints are implemented.
                  </Alert>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                      fullWidth
                      label="Height"
                      value={currentVitals.heightCm}
                      onChange={(e) => handleVitalsChange("heightCm", e.target.value)}
                      disabled={!editingVitals || !apiAvailable}
                      type="number"
                      InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                      fullWidth
                      label="Weight"
                      value={currentVitals.weightKg}
                      onChange={(e) => handleVitalsChange("weightKg", e.target.value)}
                      disabled={!editingVitals || !apiAvailable}
                      type="number"
                      InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                      fullWidth
                      label="Temperature"
                      value={currentVitals.temperatureC}
                      onChange={(e) => handleVitalsChange("temperatureC", e.target.value)}
                      disabled={!editingVitals || !apiAvailable}
                      type="number"
                      step="0.1"
                      InputProps={{ endAdornment: <InputAdornment position="end">°C</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                      fullWidth
                      label="Heart Rate"
                      value={currentVitals.heartRate}
                      onChange={(e) => handleVitalsChange("heartRate", e.target.value)}
                      disabled={!editingVitals || !apiAvailable}
                      type="number"
                      InputProps={{ endAdornment: <InputAdornment position="end">bpm</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                      fullWidth
                      label="Systolic BP"
                      value={currentVitals.systolicBp}
                      onChange={(e) => handleVitalsChange("systolicBp", e.target.value)}
                      disabled={!editingVitals || !apiAvailable}
                      type="number"
                      InputProps={{ endAdornment: <InputAdornment position="end">mmHg</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                      fullWidth
                      label="Diastolic BP"
                      value={currentVitals.diastolicBp}
                      onChange={(e) => handleVitalsChange("diastolicBp", e.target.value)}
                      disabled={!editingVitals || !apiAvailable}
                      type="number"
                      InputProps={{ endAdornment: <InputAdornment position="end">mmHg</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                      fullWidth
                      label="Respiratory Rate"
                      value={currentVitals.respiratoryRate}
                      onChange={(e) => handleVitalsChange("respiratoryRate", e.target.value)}
                      disabled={!editingVitals || !apiAvailable}
                      type="number"
                      InputProps={{ endAdornment: <InputAdornment position="end">/min</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                      fullWidth
                      label="Oxygen Saturation"
                      value={currentVitals.oxygenSaturation}
                      onChange={(e) => handleVitalsChange("oxygenSaturation", e.target.value)}
                      disabled={!editingVitals || !apiAvailable}
                      type="number"
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                      fullWidth
                      label="Notes"
                      value={currentVitals.notes}
                      onChange={(e) => handleVitalsChange("notes", e.target.value)}
                      disabled={!editingVitals || !apiAvailable}
                      multiline
                      rows={2}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Diagnosis Section */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600, mb: 2 }}>
                Today's Diagnosis
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {!apiAvailable && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Diagnosis functionality will be available once the backend API endpoints are implemented.
                  </Alert>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                      fullWidth
                      label="Diagnosis"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      multiline
                      rows={3}
                      placeholder="Enter diagnosis for today's consultation..."
                      disabled={!apiAvailable}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                      fullWidth
                      label="Additional Notes"
                      value={diagnosisNotes}
                      onChange={(e) => setDiagnosisNotes(e.target.value)}
                      multiline
                      rows={2}
                      placeholder="Additional notes or recommendations..."
                      disabled={!apiAvailable}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                      onClick={handleSaveDiagnosis}
                      variant="contained"
                      disabled={saving || !diagnosis.trim() || !apiAvailable}
                      sx={{ backgroundColor: "#45d27a", "&:hover": { backgroundColor: "#3ab86a" } }}
                  >
                    Save Diagnosis
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Recent Diagnoses */}
            {apiAvailable && recentDiagnoses && recentDiagnoses.length > 0 && (
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600, mb: 2 }}>
                    Recent Diagnoses
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <List>
                    {recentDiagnoses.map((diag, index) => (
                        <ListItem key={index} divider={index < recentDiagnoses.length - 1}>
                          <ListItemText
                              primary={
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {diag.diagnosis}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Date:</strong> {formatDate(diag.diagnosisDate)}
                                  </Typography>
                                  {diag.notes && (
                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        <strong>Notes:</strong> {diag.notes}
                                      </Typography>
                                  )}
                                  {diag.appointment && (
                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        <strong>Appointment:</strong> {formatDate(diag.appointment.appointmentDateTime)}
                                      </Typography>
                                  )}
                                </Box>
                              }
                          />
                        </ListItem>
                    ))}
                  </List>
                </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
  );
};

export default PatientProfile;
