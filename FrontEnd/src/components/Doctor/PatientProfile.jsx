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
  LocalHospital as VitalsIcon,
  MedicalServices as MedicalIcon,
  Visibility as ViewIcon,
  Send as SendIcon
} from "@mui/icons-material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  fetchPatientProfile,
  fetchPatientVitals,
  savePatientVitals,
  saveDiagnosis,
  fetchPatientMedicals,
  completeAppointment
} from "../../api/appointments";

// Import API and Component for Medical Record
import { getMedicalRecord } from '../../api/patient';
import ViewPatientMedicalRecord from './ViewPatientMedicalRecord';
import ViewMedicalDialog from './ViewMedicalDialog';

// Import for Prescriptions
import { fetchPatientPrescriptions } from '../../api/prescription';
import ViewPrescriptionDialog from './ViewPrescriptionDialog';

// Import for Lab Requests
import { getLabRequestsForPatient } from '../../api/labApi';
import ViewLabRequestDialog from './ViewLabRequestDialog';

// Import for Send to Course Unit
import SendToCourseUnitDialog from './SendToCourseUnitDialog';

const PatientProfile = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const patientFromState = location.state?.patient;
  const currentAppointmentId =
    location.state?.appointmentId ||
    new URLSearchParams(location.search).get("appointmentId");
  const medicalIssued = location.state?.medicalIssued;
  const labRequestCreated = location.state?.labRequestCreated;

  const [patientData, setPatientData] = useState(patientFromState || null);
  const [vitals, setVitals] = useState([]);
  const [medicals, setMedicals] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labRequests, setLabRequests] = useState([]);
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
  const [loadingMedicals, setLoadingMedicals] = useState(false);
  const [error, setError] = useState(null);
  const [editingVitals, setEditingVitals] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [diagnosisSaved, setDiagnosisSaved] = useState(false);

  // Medical Dialog State
  const [medicalDialogOpen, setMedicalDialogOpen] = useState(false);
  const [selectedMedicalId, setSelectedMedicalId] = useState(null);

  // Prescription Dialog State
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null);

  // Lab Request Dialog State
  const [labRequestDialogOpen, setLabRequestDialogOpen] = useState(false);
  const [selectedLabRequestId, setSelectedLabRequestId] = useState(null);

  // Send to Course Unit Dialog State
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedMedicalForSend, setSelectedMedicalForSend] = useState(null);

  // --- Medical Record State ---
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [recordStatus, setRecordStatus] = useState('loading'); // 'loading', 'found', 'not_found', 'error'

  // Helper function to safely get patient information
  const getPatientInfo = (field) => {
    if (!patientData) return 'N/A';
    if (patientData[field] !== undefined && patientData[field] !== null) return patientData[field];
    if (patientData.patientDetails && patientData.patientDetails[field] !== undefined && patientData.patientDetails[field] !== null) return patientData.patientDetails[field];
    if (patientData.user && patientData.user[field] !== undefined && patientData.user[field] !== null) return patientData.user[field];
    if (field === 'faculty') return patientData.Faculty || patientData.department || patientData.patientDetails?.Faculty || patientData.patientDetails?.department || 'N/A';
    if (field === 'age') {
      const age = getPatientAge();
      return age !== null ? age : 'N/A';
    }
    return 'N/A';
  };

  useEffect(() => {
    if (!patientFromState) {
      loadPatientData();
    } else {
      loadAdditionalData();
    }
  }, [patientId, patientFromState]);

  useEffect(() => {
    if (medicalIssued) {
      window.history.replaceState({}, document.title);
    }
  }, [medicalIssued]);

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
      
      await loadMedicals();
      await loadPrescriptions();
      await loadLabRequests();
      await fetchMedicalRecordData(); // Fetch the medical form
      
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

      const mergedPatientData = {
        ...patientData, 
        ...profileData.patient, 
        ...profileData, 
      };
      
      setPatientData(mergedPatientData);
      setVitals(vitalsData);
      setRecentDiagnoses(profileData.recentDiagnoses || []);
      
      await loadMedicals();
      await loadPrescriptions();
      await loadLabRequests();
      await fetchMedicalRecordData(); // Fetch the medical form
      
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

  const fetchMedicalRecordData = async () => {
    try {
      setRecordStatus('loading');
      if (patientData?.role === 'Staff') {
          setMedicalRecord(null);
          setRecordStatus('not_found');
          return;
      }
      const recordData = await getMedicalRecord(patientId);
      setMedicalRecord(recordData);
      setRecordStatus('found');
    } catch (recordError) {
      // If 404, it just means the patient hasn't uploaded one yet.
      if (recordError.message && (recordError.message.includes('404') || recordError.message.includes('Not Found'))) {
        setMedicalRecord(null);
        setRecordStatus('not_found');
      } else {
        // Any other error (500, network, etc.) is a real problem.
        console.error("Failed to fetch medical record:", recordError);
        setRecordStatus('error');
        // Append this error to the main error state so the user sees it
        setError(prev => prev ? `${prev} | Medical Record Error: ${recordError.message}` : `Medical Record Error: ${recordError.message}`);
      }
    }
  };

  const loadMedicals = async () => {
    try {
      setLoadingMedicals(true);
      const medicalsData = await fetchPatientMedicals(patientId);
      setMedicals(medicalsData || []);
    } catch (err) {
      console.error("Error loading medicals:", err);
      if (!err.message.includes('404') && !err.message.includes('Not Found')) {
        console.error("Failed to load medicals:", err.message);
      }
    } finally {
      setLoadingMedicals(false);
    }
  };

  const loadPrescriptions = async () => {
    try {
      const prescriptionsData = await fetchPatientPrescriptions(patientId);
      setPrescriptions(prescriptionsData || []);
    } catch (err) {
      console.error("Error loading prescriptions:", err);
    }
  };

  const loadLabRequests = async () => {
    try {
      const labRequestsData = await getLabRequestsForPatient(patientId);
      setLabRequests(labRequestsData || []);
    } catch (err) {
      console.error("Error loading lab requests:", err);
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
      setDiagnosisSaved(true);
      await loadAdditionalData();
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error saving diagnosis:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteAppointment = async () => {
    if (!currentAppointmentId) {
      setError("No appointment to complete");
      return;
    }
    try {
      setSaving(true);
      await completeAppointment(currentAppointmentId);
      setError(null);
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.message);
      console.error("Error completing appointment:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleWritePrescription = () => {
    const apptId = currentAppointmentId;
    navigate(`/doctor/prescriptions${apptId ? `?appointmentId=${apptId}` : ''}`, {
      state: {
        appointmentId: apptId,
        patient: patientData,
        patientId,
        patientName: patientData?.name || "Unknown Patient"
      }
    });
  };

  const handleRequestLabTest = () => {
    navigate(`/doctor/request-lab-test/${patientId}`, {
      state: {
        patient: patientData,
        appointmentId: currentAppointmentId
      }
    });
  };

  const handleIssueMedical = () => {
    navigate(`/doctor/issue-medical/${patientId}`, { 
      state: { 
        patient: patientData,
        appointmentId: currentAppointmentId
      }
    });
  };

  const handleViewMedical = (medicalId) => {
    setSelectedMedicalId(medicalId);
    setMedicalDialogOpen(true);
  };

  const handleCloseMedicalDialog = () => {
    setMedicalDialogOpen(false);
    setSelectedMedicalId(null);
  };

  const handleMedicalUpdate = () => {
    // Reload medicals list when a medical is updated (e.g., sent to course unit)
    loadMedicals();
  };

  const handleViewPrescription = (prescriptionId) => {
    setSelectedPrescriptionId(prescriptionId);
    setPrescriptionDialogOpen(true);
  };

  const handleClosePrescriptionDialog = () => {
    setPrescriptionDialogOpen(false);
    setSelectedPrescriptionId(null);
  };

  const handleViewLabRequest = (labRequestId) => {
    setSelectedLabRequestId(labRequestId);
    setLabRequestDialogOpen(true);
  };

  const handleCloseLabRequestDialog = () => {
    setLabRequestDialogOpen(false);
    setSelectedLabRequestId(null);
  };

  const handleSendToCourseUnit = (medicalId) => {
    setSelectedMedicalForSend(medicalId);
    setSendDialogOpen(true);
  };

  const handleCloseSendDialog = () => {
    setSendDialogOpen(false);
    setSelectedMedicalForSend(null);
  };

  const getPatientAge = () => {
    if (!patientData) return null;
    const directAge = patientData.age || patientData.patientDetails?.age || patientData.user?.age;
    if (directAge !== undefined && directAge !== null) {
      return directAge;
    }
    const dob = patientData.dateOfBirth || patientData.patientDetails?.dateOfBirth || patientData.user?.dateOfBirth;
    if (dob) {
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
    return null;
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

  const normalRanges = {
    temperatureC: { min: 36.5, max: 37.5 },
    heartRate: { min: 60, max: 100 },
    systolicBp: { min: 90, max: 120 },
    diastolicBp: { min: 60, max: 80 },
    respiratoryRate: { min: 12, max: 20 },
    oxygenSaturation: { min: 95, max: 100 }
  };

  const isNormal = (field, value) => {
    if (!normalRanges[field] || value == null) return true;
    const range = normalRanges[field];
    return value >= range.min && value <= range.max;
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
      <Box display="flex" alignItems="center" mb={1}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/doctor/dashboard')}
          sx={{ mr: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
      
      <Typography variant="h4" sx={{ color: "#0c3c3c", fontWeight: 700, mb: 3 }}>
        Patient Profile
      </Typography>

      {/* General Error Alert */}
      {error && (
        <Alert severity={apiAvailable ? "error" : "warning"} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {medicalIssued && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Medical certificate has been issued successfully!
        </Alert>
      )}

      {labRequestCreated && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Laboratory test request has been created successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Patient Information */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: 'fit-content' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <PersonIcon sx={{ fontSize: 30, color: "#45d27a", mr: 1 }} />
              <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600 }}>
                Patient Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body1" gutterBottom>
              <strong>Name:</strong> {getPatientInfo('name')}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Email:</strong> {getPatientInfo('email')}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Role:</strong> {getPatientInfo('role')}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Faculty:</strong> {getPatientInfo('faculty')}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Age:</strong> {getPatientInfo('age')}
            </Typography>
            {getPatientInfo('role') === 'Student' && (
                <>
                    <Typography variant="body1" gutterBottom>
                        <strong>Hostel:</strong> {getPatientInfo('hostel') || 'N/A'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Room No:</strong> {getPatientInfo('roomNumber') || 'N/A'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Phone:</strong> {getPatientInfo('phoneNumber') || 'N/A'}
                    </Typography>
                </>
            )}
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Quick Actions */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600, mb: 2 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
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
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ScienceIcon />}
                  onClick={handleRequestLabTest}
                  sx={{
                    borderColor: "#2196F3",
                    color: "#2196F3",
                    "&:hover": {
                      backgroundColor: "#2196F3",
                      color: "#fff"
                    }
                  }}
                >
                  Request Lab Test
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<MedicalIcon />}
                  onClick={handleIssueMedical}
                  sx={{
                    backgroundColor: "#2196F3",
                    "&:hover": { backgroundColor: "#1976D2" }
                  }}
                >
                  Issue Medical
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Medical Record Section */}
          {recordStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Could not load the patient's medical record form. (Status: Server Error)
            </Alert>
          )}
          
          {recordStatus === 'found' && medicalRecord && (
            <ViewPatientMedicalRecord record={medicalRecord} />
          )}

          {recordStatus === 'not_found' && (
            <Alert severity="info" sx={{ mb: 3 }}>
              This patient has not submitted a medical form.
            </Alert>
          )}

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

          {/* Last Vitals Display */}
          {vitals.length > 0 && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600, mb: 2 }}>
                Last Vitals Recorded on {formatDate(vitals[0].recordedAt)}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1 }}>
                <Typography variant="body2">
                  Height: <span style={{ color: 'black' }}>{vitals[0].heightCm || 'N/A'} cm</span>
                </Typography>
                <Typography variant="body2">
                  Weight: <span style={{ color: 'black' }}>{vitals[0].weightKg || 'N/A'} kg</span>
                </Typography>
                <Typography variant="body2">
                  Temperature: <span style={{ color: isNormal('temperatureC', vitals[0].temperatureC) ? 'green' : 'red' }}>{vitals[0].temperatureC || 'N/A'} °C</span>
                </Typography>
                <Typography variant="body2">
                  Heart Rate: <span style={{ color: isNormal('heartRate', vitals[0].heartRate) ? 'green' : 'red' }}>{vitals[0].heartRate || 'N/A'} bpm</span>
                </Typography>
                <Typography variant="body2">
                  Systolic BP: <span style={{ color: isNormal('systolicBp', vitals[0].systolicBp) ? 'green' : 'red' }}>{vitals[0].systolicBp || 'N/A'} mmHg</span>
                </Typography>
                <Typography variant="body2">
                  Diastolic BP: <span style={{ color: isNormal('diastolicBp', vitals[0].diastolicBp) ? 'green' : 'red' }}>{vitals[0].diastolicBp || 'N/A'} mmHg</span>
                </Typography>
                <Typography variant="body2">
                  Respiratory Rate: <span style={{ color: isNormal('respiratoryRate', vitals[0].respiratoryRate) ? 'green' : 'red' }}>{vitals[0].respiratoryRate || 'N/A'} /min</span>
                </Typography>
                <Typography variant="body2">
                  Oxygen Saturation: <span style={{ color: isNormal('oxygenSaturation', vitals[0].oxygenSaturation) ? 'green' : 'red' }}>{vitals[0].oxygenSaturation || 'N/A'}%</span>
                </Typography>
                {vitals[0].notes && (
                  <Typography variant="body2" sx={{ gridColumn: '1 / -1' }}>
                    Notes: <span style={{ color: 'black' }}>{vitals[0].notes}</span>
                  </Typography>
                )}
              </Box>
            </Paper>
          )}

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

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                  fullWidth
                  label="Diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  multiline
                  rows={8}
                  placeholder="Enter diagnosis for today's consultation..."
                  disabled={!apiAvailable}
              />
              <TextField
                  fullWidth
                  label="Additional Notes"
                  value={diagnosisNotes}
                  onChange={(e) => setDiagnosisNotes(e.target.value)}
                  multiline
                  rows={6}
                  placeholder="Additional notes or recommendations..."
                  disabled={!apiAvailable}
              />
              <Button
                  onClick={handleSaveDiagnosis}
                  variant="contained"
                  disabled={saving || !diagnosis.trim() || !apiAvailable}
                  sx={{ backgroundColor: "#45d27a", "&:hover": { backgroundColor: "#3ab86a" } }}
              >
                Save Diagnosis
              </Button>
              {diagnosisSaved && currentAppointmentId && (
                <Button
                    onClick={handleCompleteAppointment}
                    variant="contained"
                    disabled={saving}
                    sx={{
                      backgroundColor: "#1976D2",
                      "&:hover": { backgroundColor: "#1565C0" },
                      mt: 1
                    }}
                >
                  Complete Appointment
                </Button>
              )}
            </Box>
          </Paper>

          {/* Recent Diagnoses */}
          {apiAvailable && recentDiagnoses && recentDiagnoses.length > 0 && (
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
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

          {/* Medical Certificates Section */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center">
                <MedicalIcon sx={{ fontSize: 30, color: "#45d27a", mr: 1 }} />
                <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600 }}>
                  Medical Certificates
                </Typography>
              </Box>
              {loadingMedicals && (
                <CircularProgress size={24} sx={{ color: "#45d27a" }} />
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />

            {medicals && medicals.length > 0 ? (
              <List>
                {medicals.map((medical, index) => (
                  <ListItem 
                    key={medical.id} 
                    divider={index < medicals.length - 1}
                    sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1, 
                      mb: 1,
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Medical Certificate
                          </Typography>
                          <Chip
                            size="small"
                            label={medical.isSentToCourseUnit ? "Sent to Course Unit" : "Not Sent"}
                            color={medical.isSentToCourseUnit ? "success" : "default"}
                            variant={medical.isSentToCourseUnit ? "filled" : "outlined"}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Date:</strong> {formatDate(medical.medicalDate)}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            <strong>Recommendations:</strong> {medical.recommendations}
                          </Typography>
                          {medical.additionalNotes && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ 
                                mt: 0.5,
                                maxWidth: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              <strong>Notes:</strong> {medical.additionalNotes}
                            </Typography>
                          )}
                          <Box display="flex" gap={1} mt={2}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ViewIcon />}
                              onClick={() => {
                                console.log("View button clicked for medical:", medical);
                                handleViewMedical(medical.id);
                              }}
                              sx={{
                                borderColor: "#45d27a",
                                color: "#45d27a",
                                "&:hover": {
                                  backgroundColor: "#45d27a",
                                  color: "#fff"
                                }
                              }}
                            >
                              View
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<SendIcon />}
                              disabled={medical.isSentToCourseUnit}
                              onClick={() => handleSendToCourseUnit(medical.id)}
                              sx={{
                                borderColor: medical.isSentToCourseUnit ? "#ccc" : "#2196F3",
                                color: medical.isSentToCourseUnit ? "#ccc" : "#2196F3",
                                "&:hover": !medical.isSentToCourseUnit ? {
                                  backgroundColor: "#2196F3",
                                  color: "#fff"
                                } : {}
                              }}
                            >
                              {medical.isSentToCourseUnit ? "Sent" : "Send to Course Unit"}
                            </Button>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : !loadingMedicals ? (
              <Alert severity="info">
                No medical certificates have been issued for this patient yet.
              </Alert>
            ) : null}
          </Paper>

          {/* Issued Prescriptions Section */}
          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center">
                <MedicationIcon sx={{ fontSize: 30, color: "#45d27a", mr: 1 }} />
                <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600 }}>
                  Issued Prescriptions
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {prescriptions && prescriptions.length > 0 ? (
              <List>
                {prescriptions.map((prescription, index) => (
                  <ListItem
                    key={prescription.id}
                    divider={index < prescriptions.length - 1}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Prescription
                          </Typography>
                          <Chip
                            size="small"
                            label={prescription.isActive ? "Active" : "Completed"}
                            color={prescription.isActive ? "success" : "default"}
                            variant={prescription.isActive ? "filled" : "outlined"}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Date:</strong> {formatDate(prescription.createdAt)}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            <strong>Doctor:</strong> {prescription.doctorName}
                          </Typography>
                          <Box display="flex" gap={1} mt={2}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ViewIcon />}
                              onClick={() => handleViewPrescription(prescription.id)}
                              sx={{
                                borderColor: "#45d27a",
                                color: "#45d27a",
                                "&:hover": {
                                  backgroundColor: "#45d27a",
                                  color: "#fff"
                                }
                              }}
                            >
                              View
                            </Button>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                No prescriptions have been issued for this patient yet.
              </Alert>
            )}
          </Paper>

          {/* Lab Requests Section */}
          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center">
                <ScienceIcon sx={{ fontSize: 30, color: "#2196F3", mr: 1 }} />
                <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600 }}>
                  Laboratory Requests
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {labRequests && labRequests.length > 0 ? (
              <List>
                {labRequests.map((labRequest, index) => (
                  <ListItem
                    key={labRequest.id}
                    divider={index < labRequests.length - 1}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Lab Request
                          </Typography>
                          <Chip
                            size="small"
                            label={labRequest.status}
                            color={
                              labRequest.status === 'COMPLETED' ? 'success' :
                              labRequest.status === 'IN_PROGRESS' ? 'warning' :
                              labRequest.status === 'PENDING' ? 'default' : 'error'
                            }
                            variant={labRequest.status === 'COMPLETED' ? 'filled' : 'outlined'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Date:</strong> {formatDate(labRequest.orderDate)}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            <strong>Test Type:</strong> {labRequest.testType}
                          </Typography>
                          <Box display="flex" gap={1} mt={2}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ViewIcon />}
                              onClick={() => handleViewLabRequest(labRequest.id)}
                              sx={{
                                borderColor: "#2196F3",
                                color: "#2196F3",
                                "&:hover": {
                                  backgroundColor: "#2196F3",
                                  color: "#fff"
                                }
                              }}
                            >
                              View
                            </Button>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                No laboratory tests have been requested for this patient yet.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Medical Certificate Dialog */}
      <ViewMedicalDialog
        open={medicalDialogOpen}
        onClose={handleCloseMedicalDialog}
        medicalId={selectedMedicalId}
        onMedicalUpdate={handleMedicalUpdate}
      />

      {/* Prescription Dialog */}
      <ViewPrescriptionDialog
        open={prescriptionDialogOpen}
        onClose={handleClosePrescriptionDialog}
        prescriptionId={selectedPrescriptionId}
      />

      {/* Lab Request Dialog */}
      <ViewLabRequestDialog
        open={labRequestDialogOpen}
        onClose={handleCloseLabRequestDialog}
        labRequestId={selectedLabRequestId}
      />

      {/* Send to Course Unit Dialog */}
      <SendToCourseUnitDialog
        open={sendDialogOpen}
        onClose={handleCloseSendDialog}
        medicalId={selectedMedicalForSend}
        onMedicalUpdate={() => {
          // Reload medicals list when a medical is sent to course unit
          loadMedicals();
        }}
      />
    </Box>
  );
};

export default PatientProfile;