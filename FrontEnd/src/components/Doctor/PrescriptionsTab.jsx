import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, TextField, Button,
  Alert, Snackbar, Grid, IconButton, Checkbox, FormControlLabel, Switch,
  Select, MenuItem, FormControl, InputLabel, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress
} from "@mui/material";

// Only keeping necessary icons
import { Add as AddIcon, Remove as RemoveIcon, Search as SearchIcon, ArrowBack as ArrowBackIcon, EditNote as EditNoteIcon, Security as SecurityIcon, Image as ImageIcon } from "@mui/icons-material";

import { useNavigate, useLocation } from "react-router-dom";

// API Functions
import {
  createPrescription,
  formatPrescriptionForSubmission,
  validatePrescriptionForm
} from "../../api/prescription";
import { getAllMedicines } from "../../api/medicine";
import { getDoctorSignatureSeal } from "../../api/doctor";

// --- Simple Color Configuration ---
const colors = {
  primary: "#0C3C3C",    // Dark Teal
  accent: "#45D27A",     // Bright Green
  gray: "#6C6B6B",
  white: "#ffffff",
  lightGray: "#F8F9FA",
  background: "#FAFBFC",
  border: "rgba(12, 60, 60, 0.12)"
};

// --- Styles ---
// Refactor Note: Removed gradients. Using solid colors.
const paperStyle = {
  padding: "24px",
  borderRadius: "12px",
  backgroundColor: colors.white,
  border: "1px solid " + colors.border,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  marginBottom: "24px"
};

// Button Style for standard actions
const buttonStyle = {
  backgroundColor: colors.primary,
  color: colors.white,
  "&:hover": { backgroundColor: "#1a5656" }
};

// Helper to create a fresh medication row
const createNewMedicationRow = () => {
  // Create a unique ID for this row using date
  const uniqueId = Date.now() + "_" + Math.random().toString(36).slice(2);
  
  return {
    rowId: uniqueId,
    medicine: "",
    dosage: "",
    medicineId: null,
    medicineDetails: null,
    isExternal: false, // Track if medicine is outside inventory
    timings: {
      morning: false,
      afternoon: false,
      evening: false,
      night: false
    },
    mealTiming: "",
    method: "",
    days: "",
    remarks: ""
  };
};

const PrescriptionsTab = ({ recentPrescriptions = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Extract Data from Navigation State ---
  const stateData = location.state || {};
  const patientFromState = stateData.patient;
  const appointmentIdFromState = stateData.appointmentId;
  const patientIdFromState = stateData.patientId;

  // Check URL params as fallback
  const urlParams = new URLSearchParams(location.search);
  const appointmentIdFromUrl = urlParams.get('appointmentId');

  // Determine final IDs
  const finalAppointmentId = appointmentIdFromState || appointmentIdFromUrl;
  const finalPatientId = patientIdFromState || (patientFromState && patientFromState.id);

  // --- State Variables ---
  
  // Form Data
  const [formData, setFormData] = useState({
    patientId: finalPatientId,
    patientName: (patientFromState && patientFromState.name) || "",
    appointmentId: finalAppointmentId,
    medications: [createNewMedicationRow()],
    notes: ""
  });

  // UI State
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Doctor Signature/Seal State
  const [doctorSignature, setDoctorSignature] = useState(null);
  const [doctorSeal, setDoctorSeal] = useState(null);
  const [password, setPassword] = useState("");
  const [signatureSealLoading, setSignatureSealLoading] = useState(true);

  // Medicine Browser Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTargetIndex, setModalTargetIndex] = useState(null);
  const [allMedicines, setAllMedicines] = useState([]);
  const [modalSearchTerm, setModalSearchTerm] = useState("");

  // Dropdown Options
  const drugMethods = [
    "Oral", "Injection", "Inhale", "Topical", "Sublingual",
    "Rectal", "Nasal", "Eye Drops", "Ear Drops"
  ];

  const mealTimingOptions = [
    { value: "before", label: "Before Meal" },
    { value: "after", label: "After Meal" },
    { value: "with", label: "With Meal" },
    { value: "empty_stomach", label: "Empty Stomach" }
  ];

  // --- 1. Load Medicines ---
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await getAllMedicines();
        if (response) {
          setAllMedicines(response);
        } else {
          setAllMedicines([]);
        }
      } catch (error) {
        console.error("Failed to fetch medicines:", error);
        showAlertMessage("Could not load medicine inventory.", "error");
      }
    };
    fetchMedicines();
  }, []);

  // --- 1b. Load Doctor Signature and Seal ---
  useEffect(() => {
    const fetchSignatureSeal = async () => {
      try {
        setSignatureSealLoading(true);
        const response = await getDoctorSignatureSeal();
        if (response.doctorSignature) {
          setDoctorSignature(response.doctorSignature);
        }
        if (response.doctorSeal) {
          setDoctorSeal(response.doctorSeal);
        }
      } catch (error) {
        console.error("Failed to fetch signature and seal:", error);
      } finally {
        setSignatureSealLoading(false);
      }
    };
    fetchSignatureSeal();
  }, []);

  // --- 2. Helper Functions ---

  const showAlertMessage = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setShowAlert(true);
  };

  const handleBackToProfile = () => {
    if (finalPatientId) {
      navigate("/doctor/patients/" + finalPatientId, {
        state: {
          patient: patientFromState,
          appointmentId: finalAppointmentId
        }
      });
    } else {
      navigate("/doctor/patients");
    }
  };

  // --- 3. Modal Handlers ---

  const openMedicineModal = (index) => {
    setModalTargetIndex(index);
    setIsModalOpen(true);
  };

  const closeMedicineModal = () => {
    setIsModalOpen(false);
    setModalTargetIndex(null);
    setModalSearchTerm(""); // Reset search
  };

  const handleMedicineSelect = (index, selectedMedicine) => {
    // Create a copy of the medications array
    const updatedMedications = [...formData.medications];
    
    if (selectedMedicine) {
      const medName = selectedMedicine.name;
      const medStrength = selectedMedicine.strength || "";
      const medUnit = selectedMedicine.unit || "";
      
      updatedMedications[index].medicine = medName;
      updatedMedications[index].dosage = medStrength + medUnit;
      updatedMedications[index].medicineId = selectedMedicine.id;
      updatedMedications[index].medicineDetails = selectedMedicine;
    }
    
    // Update form state
    const newFormData = { ...formData };
    newFormData.medications = updatedMedications;
    setFormData(newFormData);
    
    closeMedicineModal();
  };

  // --- 4. Form Handlers ---

  const handleInputChange = (field, value) => {
    const newFormData = { ...formData };
    newFormData[field] = value;
    setFormData(newFormData);
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index][field] = value;
    
    const newFormData = { ...formData };
    newFormData.medications = updatedMedications;
    setFormData(newFormData);
  };

  const handleExternalSwitch = (index, isChecked) => {
    const updatedMedications = [...formData.medications];
    const medication = updatedMedications[index];

    medication.isExternal = isChecked;

    // Clear inventory data if switching to external (manual entry)
    if (isChecked) {
      medication.medicine = "";
      medication.dosage = "";
      medication.medicineId = null;
      medication.medicineDetails = null;
    }

    const newFormData = { ...formData };
    newFormData.medications = updatedMedications;
    setFormData(newFormData);
  };

  const handleTimingChange = (index, timing, checked) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index].timings[timing] = checked;
    
    const newFormData = { ...formData };
    newFormData.medications = updatedMedications;
    setFormData(newFormData);
  };

  const addMedicationRow = () => {
    const newRow = createNewMedicationRow();
    const newFormData = { ...formData };
    newFormData.medications = [...formData.medications, newRow];
    setFormData(newFormData);
  };

  const removeMedicationRow = (index) => {
    if (formData.medications.length > 1) {
      const updatedMedications = formData.medications.filter((_, i) => i !== index);
      
      const newFormData = { ...formData };
      newFormData.medications = updatedMedications;
      setFormData(newFormData);
    }
  };

  // --- 5. Submission ---

  const handleSubmit = async () => {
    // 1. Validate
    const validation = validatePrescriptionForm(formData);
    if (!validation.isValid) {
      // Get the first error message
      const errors = Object.values(validation.errors);
      if (errors.length > 0) {
        showAlertMessage(errors[0], "error");
      }
      return;
    }

    if (!finalPatientId) {
      showAlertMessage("Patient ID is required.", "error");
      return;
    }

    if (!password.trim()) {
      showAlertMessage("Password is required for authentication.", "error");
      return;
    }

    if (!doctorSignature || !doctorSeal) {
      showAlertMessage("Doctor signature and seal must be uploaded first. Please upload them in your profile.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Format Data
      const submissionData = formatPrescriptionForSubmission(formData);

      // 3. Send to API with password
      const response = await createPrescription(submissionData, password.trim());

      if (response && response.id) {
        showAlertMessage("Prescription created successfully!");

        // Reset Form
        setFormData({
          patientId: finalPatientId,
          patientName: (patientFromState && patientFromState.name) || "",
          appointmentId: finalAppointmentId,
          medications: [createNewMedicationRow()],
          notes: ""
        });
        setPassword("");

        // Redirect after delay
        setTimeout(() => {
          navigate("/doctor/dashboard", {
            state: {
              successMessage: "Prescription created successfully!"
            }
          });
        }, 2000);
      } else {
        const msg = response.message || "Failed to create prescription";
        showAlertMessage(msg, "error");
      }
    } catch (error) {
      console.error("Error submitting prescription:", error);
      showAlertMessage(error.message || "Error submitting prescription. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 6. Render ---

  return (
    <Box>
      {/* Top Section */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToProfile}
          sx={{
            mb: 2,
            color: colors.primary,
            '&:hover': { backgroundColor: 'rgba(12, 60, 60, 0.1)' }
          }}
        >
          Back to Patient Profile
        </Button>
        
        {/* Refactor Note: Removed gradient styling from Typography */}
        <Typography
          variant="h4"
          sx={{
            color: colors.primary,
            fontWeight: 700,
            textAlign: { xs: "center", md: "left" }
          }}
        >
          Write Prescription
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ ...paperStyle }}>
        <Typography
          variant="h6"
          sx={{
            color: colors.primary,
            fontWeight: 600,
            mb: 3
          }}
        >
          New Prescription
        </Typography>

        {!finalPatientId && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Warning: No patient ID found. Please ensure you access this page from a patient profile.
          </Alert>
        )}

        {/* Patient Info Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1, color: colors.primary, fontWeight: 500 }}>
              Patient Name *
            </Typography>
            <TextField
              fullWidth
              value={formData.patientName}
              onChange={(e) => handleInputChange('patientName', e.target.value)}
              placeholder="Enter patient name"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: colors.lightGray,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1, color: colors.primary, fontWeight: 500 }}>
              Patient ID
            </Typography>
            <TextField
              fullWidth
              value={finalPatientId || "Not available"}
              disabled
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f0f0f0',
                },
              }}
            />
          </Grid>
        </Grid>

        {/* Medications Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 2, color: colors.primary, fontWeight: 500 }}>
            Medications *
          </Typography>

          {formData.medications.map((medication, index) => (
            <Paper 
              key={medication.rowId || index} 
              elevation={1} 
              sx={{ 
                p: 3, 
                mb: 2, 
                border: '1px solid #e0e0e0',
                borderRadius: "8px" 
              }}
            >
              {/* Medication Row Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: colors.primary, fontWeight: 600 }}>
                  Medication {index + 1}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={addMedicationRow}
                    sx={{
                      color: colors.accent,
                      '&:hover': { backgroundColor: colors.accent + "22" }
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                  
                  {formData.medications.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => removeMedicationRow(index)}
                      sx={{
                        color: '#f44336', // Red
                        '&:hover': { backgroundColor: '#f4433622' }
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>

              {/* Medication Inputs */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mb: 1, color: colors.primary, fontWeight: 500 }}>
                    Medicine Name *
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={medication.isExternal}
                        onChange={(e) => handleExternalSwitch(index, e.target.checked)}
                        size="small"
                      />
                    }
                    label="Prescribe Externally"
                    sx={{ mb: 1, color: '#666', '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
                  />

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {medication.isExternal ? (
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter medicine name manually"
                        value={medication.medicine}
                        onChange={(e) => handleMedicationChange(index, 'medicine', e.target.value)}
                      />
                    ) : (
                      <>
                        <TextField
                          fullWidth
                          size="small"
                          readOnly
                          value={medication.medicine || "No medicine selected"}
                          sx={{ '& .MuiInputBase-root': { backgroundColor: '#f0f0f0' } }}
                        />
                        <Button
                          variant="contained"
                          onClick={() => openMedicineModal(index)}
                          startIcon={<SearchIcon />}
                          sx={{ ...buttonStyle, flexShrink: 0 }}
                        >
                          Browse
                        </Button>
                      </>
                    )}
                  </Box>

                  {medication.medicineDetails && (
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={"Stock: " + medication.medicineDetails.stock}
                        size="small"
                        color={medication.medicineDetails.stock > 50 ? "success" :
                             medication.medicineDetails.stock > 10 ? "warning" : "error"}
                        variant="outlined"
                      />
                      <Chip
                        label={medication.medicineDetails.category}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  )}
                </Grid>
              </Grid>

              {/* Dosage & Duration */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ mb: 1, color: colors.primary, fontWeight: 500 }}>
                    Dosage *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={medication.dosage}
                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    placeholder="e.g., 500mg"
                    sx={{
                      '& .MuiOutlinedInput-root': { backgroundColor: colors.lightGray }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ mb: 1, color: colors.primary, fontWeight: 500 }}>
                    Duration (Days) *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={medication.days}
                    onChange={(e) => handleMedicationChange(index, 'days', e.target.value)}
                    placeholder="e.g., 7"
                    type="number"
                    sx={{
                      '& .MuiOutlinedInput-root': { backgroundColor: colors.lightGray }
                    }}
                  />
                </Grid>
              </Grid>

              {/* Timings */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, color: colors.primary, fontWeight: 500 }}>
                  Daily Timing
                </Typography>
                <Grid container spacing={1}>
                  {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
                    <Grid item xs={6} sm={3} key={time}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={medication.timings[time.toLowerCase()]}
                            onChange={(e) => handleTimingChange(index, time.toLowerCase(), e.target.checked)}
                            sx={{
                              color: colors.accent,
                              '&.Mui-checked': { color: colors.accent }
                            }}
                          />
                        }
                        label={time}
                        sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Meal & Method */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ mb: 1, color: colors.primary, fontWeight: 500 }}>
                    Meal Timing
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={medication.mealTiming}
                      onChange={(e) => handleMedicationChange(index, 'mealTiming', e.target.value)}
                      displayEmpty
                      sx={{ backgroundColor: colors.lightGray }}
                    >
                      <MenuItem value="" disabled>
                        <em>Select meal timing</em>
                      </MenuItem>
                      {mealTimingOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ mb: 1, color: colors.primary, fontWeight: 500 }}>
                    Administration Method
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={medication.method}
                      onChange={(e) => handleMedicationChange(index, 'method', e.target.value)}
                      displayEmpty
                      sx={{ backgroundColor: colors.lightGray }}
                    >
                      <MenuItem value="" disabled>
                        <em>Select method</em>
                      </MenuItem>
                      {drugMethods.map((method) => (
                        <MenuItem key={method} value={method.toLowerCase()}>
                          {method}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Remarks */}
              <TextField
                fullWidth
                size="small"
                label="Remarks"
                value={medication.remarks}
                onChange={(e) => handleMedicationChange(index, 'remarks', e.target.value)}
                placeholder="Additional instructions..."
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-root': { backgroundColor: colors.lightGray }
                }}
              />
            </Paper>
          ))}
        </Box>

        {/* General Notes */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, color: colors.primary, fontWeight: 500 }}>
            General Notes
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Additional general instructions..."
            sx={{
              '& .MuiOutlinedInput-root': { backgroundColor: colors.lightGray }
            }}
          />
        </Box>

        {/* Doctor Authentication Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 2, color: colors.primary, fontWeight: 500 }}>
            Doctor Authentication
          </Typography>

          {signatureSealLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={40} sx={{ color: colors.accent }} />
            </Box>
          ) : (
            <>
              {/* Signature and Seal Display */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, color: colors.primary, fontWeight: 500 }}>
                      Your Signature
                    </Typography>
                    <Box sx={{
                      height: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f9f9f9',
                      borderRadius: 1
                    }}>
                      {doctorSignature ? (
                        <img
                          src={doctorSignature}
                          alt="Doctor Signature"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      ) : (
                        <Box sx={{ textAlign: 'center' }}>
                          <ImageIcon sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            No signature uploaded
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, color: colors.primary, fontWeight: 500 }}>
                      Your Seal
                    </Typography>
                    <Box sx={{
                      height: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f9f9f9',
                      borderRadius: 1
                    }}>
                      {doctorSeal ? (
                        <img
                          src={doctorSeal}
                          alt="Doctor Seal"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      ) : (
                        <Box sx={{ textAlign: 'center' }}>
                          <ImageIcon sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            No seal uploaded
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Upload Button */}
              {(!doctorSignature || !doctorSeal) && (
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditNoteIcon />}
                    onClick={() => navigate('/doctor/signature-seal')}
                    sx={{
                      borderColor: colors.accent,
                      color: colors.accent,
                      '&:hover': { borderColor: '#3bc169', backgroundColor: colors.accent + '11' }
                    }}
                  >
                    Upload Signature & Seal
                  </Button>
                </Box>
              )}

              {/* Password Input */}
              <TextField
                fullWidth
                type="password"
                label="Enter your password to authenticate"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': { backgroundColor: colors.lightGray }
                }}
                InputProps={{
                  startAdornment: <SecurityIcon sx={{ color: '#666', mr: 1 }} />,
                }}
              />
            </>
          )}
        </Box>

        {/* Form Actions */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{
              borderColor: "#666",
              color: "#666",
              '&:hover': { borderColor: colors.accent, color: colors.accent }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting || !doctorSignature || !doctorSeal || !password.trim()}
            sx={{
              backgroundColor: colors.accent,
              color: "#fff",
              fontWeight: 600,
              px: 4,
              py: 1.5,
              "&:hover": { backgroundColor: "#3bc169" },
              "&:disabled": { backgroundColor: "#cccccc" },
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit Prescription"}
          </Button>
        </Box>
      </Paper>

      {/* Notifications */}
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowAlert(false)}
          severity={alertSeverity}
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>

      {/* Medicine Browser Modal */}
      <Dialog open={isModalOpen} onClose={closeMedicineModal} fullWidth maxWidth="md">
        <DialogTitle sx={{ backgroundColor: colors.primary, color: '#fff' }}>
          Browse Medicine Inventory
        </DialogTitle>
        <DialogContent sx={{ p: 2, mt: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name"
            value={modalSearchTerm}
            onChange={(e) => setModalSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#666', mr: 1 }} />,
            }}
            sx={{ mb: 2 }}
          />
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Strength</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Form</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Stock</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allMedicines
                  .filter(med => {
                    const term = modalSearchTerm.toLowerCase();
                    const nameMatch = med.name ? med.name.toLowerCase().includes(term) : false;
                    const brandMatch = med.brand ? med.brand.toLowerCase().includes(term) : false;
                    const categoryMatch = med.category ? med.category.toLowerCase().includes(term) : false;
                    return nameMatch || brandMatch || categoryMatch;
                  })
                  .map(med => (
                    <TableRow key={med.id} hover>
                      <TableCell>{med.name}</TableCell>
                      <TableCell>{med.strength}{med.unit}</TableCell>
                      <TableCell>{med.form}</TableCell>
                      <TableCell>
                        <Chip
                          label={med.stock}
                          size="small"
                          color={med.stock > (med.lowStockQuantity || 50) ? "success" : med.stock > 10 ? "warning" : "error"}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleMedicineSelect(modalTargetIndex, med)}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMedicineModal}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PrescriptionsTab;