import React, { useState } from "react";
import {
  Box, Typography, Paper, TextField, Button,
  Alert, Snackbar, Grid, IconButton, Checkbox, FormControlLabel,
  Select, MenuItem, FormControl, InputLabel, Autocomplete, Chip
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon, Search as SearchIcon } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  createPrescription,
  formatPrescriptionForSubmission,
  validatePrescriptionForm
} from "../../api/prescription";
import { searchMedicines } from "../../api/medicine";

const PrescriptionsTab = ({ recentPrescriptions = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();


  const patientFromState = location.state?.patient;
  const appointmentIdFromState = location.state?.appointmentId;
  const patientIdFromState = location.state?.patientId;


  const urlParams = new URLSearchParams(location.search);
  const appointmentIdFromUrl = urlParams.get('appointmentId');

  const finalAppointmentId = appointmentIdFromState || appointmentIdFromUrl;
  const finalPatientId = patientIdFromState || patientFromState?.id;

  // Ensure each medication row has a stable unique key to avoid React reusing inputs
  const newMedication = () => ({
    rowId: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    medicine: "",
    dosage: "",
    medicineId: null,
    medicineDetails: null,
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
  });
  const [formData, setFormData] = useState({
    patientId: finalPatientId,
    patientName: patientFromState?.name || "",
    appointmentId: finalAppointmentId,
    medications: [newMedication()],
    notes: ""
  });

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [medicineSearchResults, setMedicineSearchResults] = useState({});
  const [searchLoading, setSearchLoading] = useState({});

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


  const searchMedicinesForIndex = async (index, searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setMedicineSearchResults(prev => ({
        ...prev,
        [index]: []
      }));
      return;
    }

    setSearchLoading(prev => ({ ...prev, [index]: true }));

    try {
      const response = await searchMedicines(searchTerm, "name");
      if (response && Array.isArray(response)) {
        setMedicineSearchResults(prev => ({
          ...prev,
          [index]: response || []
        }));
      } else {
        setMedicineSearchResults(prev => ({
          ...prev,
          [index]: []
        }));
      }
    } catch (error) {
      console.error("Error searching medicines:", error);
      setMedicineSearchResults(prev => ({
        ...prev,
        [index]: []
      }));
    } finally {
      setSearchLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleMedicineSelect = (index, selectedMedicine) => {
    if (selectedMedicine) {
      const updatedMedications = [...formData.medications];
      updatedMedications[index].medicine = selectedMedicine.name;
      updatedMedications[index].dosage = `${selectedMedicine.strength}${selectedMedicine.unit || ''}`;
      updatedMedications[index].medicineId = selectedMedicine.id;
      updatedMedications[index].medicineDetails = selectedMedicine;
      setFormData(prev => ({
        ...prev,
        medications: updatedMedications
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index][field] = value;
    setFormData(prev => ({
      ...prev,
      medications: updatedMedications
    }));
  };

  const handleTimingChange = (index, timing, checked) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index].timings[timing] = checked;
    setFormData(prev => ({
      ...prev,
      medications: updatedMedications
    }));
  };

  const addMedicationRow = () => {
  setFormData(prev => ({
    ...prev,
    medications: [...prev.medications, newMedication()]
  }));
};

  const removeMedicationRow = (index) => {
    if (formData.medications.length > 1) {
      const updatedMedications = formData.medications.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        medications: updatedMedications
      }));


      setMedicineSearchResults(prev => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    }
  };

  const showAlertMessage = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setShowAlert(true);
  };

  const handleSubmit = async () => {

    const validation = validatePrescriptionForm(formData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      showAlertMessage(firstError, "error");
      return;
    }


    if (!finalPatientId) {
      showAlertMessage("Patient ID is required. Please ensure you accessed this page from a patient profile.", "error");
      return;
    }

    setIsSubmitting(true);

    try {

      const submissionData = formatPrescriptionForSubmission(formData);

      console.log("Submitting prescription data:", submissionData);


      const response = await createPrescription(submissionData);

      if (response && response.id) {
        showAlertMessage("Prescription created successfully!");


        setFormData({
          patientId: finalPatientId,
          patientName: patientFromState?.name || "",
          appointmentId: finalAppointmentId,
          medications: [newMedication()],
          notes: ""
        });


        setMedicineSearchResults({});


        // Redirect to doctor's dashboard after successful prescription creation
        setTimeout(() => {
          navigate("/doctor/dashboard", {
            state: {
              successMessage: "Prescription created successfully!"
            }
          });
        }, 2000);
      } else {
        showAlertMessage(response.message || "Failed to create prescription", "error");
      }

    } catch (error) {
      console.error("Error submitting prescription:", error);
      showAlertMessage("Error submitting prescription. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <Box>
        <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: "#0c3c3c",
              fontWeight: 700,
              mb: { xs: 2, md: 4 },
              ml: { xs: 0, md: 2 },
              textAlign: { xs: "center", md: "left" }
            }}
        >
          Write Prescription
        </Typography>

        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography
              variant="h6"
              sx={{
                color: "#0c3c3c",
                fontWeight: 600,
                mb: 3
              }}
          >
            New Prescription
          </Typography>

          {!finalPatientId && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Warning: No patient ID found. Please ensure you access this page from a patient profile or appointment.
              </Alert>
          )}

          {/* Patient Information */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, color: "#0c3c3c", fontWeight: 500 }}>
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
                      backgroundColor: '#f8f9fa',
                      '& fieldset': { borderColor: '#e0e0e0' },
                      '&:hover fieldset': { borderColor: '#45d27a' },
                      '&.Mui-focused fieldset': { borderColor: '#45d27a' },
                    },
                  }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, color: "#0c3c3c", fontWeight: 500 }}>
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


          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 2, color: "#0c3c3c", fontWeight: 500 }}>
              Medications *
            </Typography>

            {formData.medications.map((medication, index) => (
                <Paper key={medication.rowId || index} elevation={1} sx={{ p: 3, mb: 2, border: '1px solid #e0e0e0' }}>
                  {/* Medication Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: "#0c3c3c", fontWeight: 600 }}>
                      Medication {index + 1}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                          size="small"
                          onClick={addMedicationRow}
                          sx={{
                            color: '#45d27a',
                            '&:hover': { backgroundColor: '#45d27a22' }
                          }}
                      >
                        <AddIcon />
                      </IconButton>
                      {formData.medications.length > 1 && (
                          <IconButton
                              size="small"
                              onClick={() => removeMedicationRow(index)}
                              sx={{
                                color: '#f44336',
                                '&:hover': { backgroundColor: '#f4433622' }
                              }}
                          >
                            <RemoveIcon />
                          </IconButton>
                      )}
                    </Box>
                  </Box>


                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" sx={{ mb: 1, color: "#0c3c3c", fontWeight: 500 }}>
                        Medicine Name *
                      </Typography>
                      <Autocomplete
                          options={medicineSearchResults[index] || []}
                          getOptionLabel={(option) => option.name || ""}
                          renderOption={(props, option) => (
                              <Box component="li" {...props}>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {option.name} - {option.strength}{option.unit || ''}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#666' }}>
                                    {option.form} • {option.brand} • {option.category} • Stock: {option.stockQuantity}
                                  </Typography>
                                </Box>
                              </Box>
                          )}
                          renderInput={(params) => (
                              <TextField
                                  {...params}
                                  size="small"
                                  placeholder="Search medicines..."
                                  value={medication.medicine}
                                  onChange={(e) => {
                                    handleMedicationChange(index, 'medicine', e.target.value);
                                    searchMedicinesForIndex(index, e.target.value);
                                  }}
                                  InputProps={{
                                    ...params.InputProps,
                                    startAdornment: <SearchIcon sx={{ color: '#666', mr: 1 }} />,
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      backgroundColor: '#f8f9fa',
                                      '& fieldset': { borderColor: '#e0e0e0' },
                                      '&:hover fieldset': { borderColor: '#45d27a' },
                                      '&.Mui-focused fieldset': { borderColor: '#45d27a' },
                                    },
                                  }}
                              />
                          )}
                          value={medicineSearchResults[index]?.find(med => med.name === medication.medicine) || null}
                          onChange={(event, newValue) => handleMedicineSelect(index, newValue)}
                          onInputChange={(event, newInputValue) => {
                            handleMedicationChange(index, 'medicine', newInputValue);
                            searchMedicinesForIndex(index, newInputValue);
                          }}
                          loading={searchLoading[index]}
                          freeSolo
                          filterOptions={(x) => x}
                      />
                      {medication.medicineDetails && (
                          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                                label={`Stock: ${medication.medicineDetails.stock}`}
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
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" sx={{ mb: 1, color: "#0c3c3c", fontWeight: 500 }}>
                        Dosage *
                      </Typography>
                      <TextField
                          fullWidth
                          size="small"
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          placeholder="e.g., 500mg"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#f8f9fa',
                              '& fieldset': { borderColor: '#e0e0e0' },
                              '&:hover fieldset': { borderColor: '#45d27a' },
                              '&.Mui-focused fieldset': { borderColor: '#45d27a' },
                            },
                          }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" sx={{ mb: 1, color: "#0c3c3c", fontWeight: 500 }}>
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
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#f8f9fa',
                              '& fieldset': { borderColor: '#e0e0e0' },
                              '&:hover fieldset': { borderColor: '#45d27a' },
                              '&.Mui-focused fieldset': { borderColor: '#45d27a' },
                            },
                          }}
                      />
                    </Grid>
                  </Grid>


                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, color: "#0c3c3c", fontWeight: 500 }}>
                      Daily Timing
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6} sm={3}>
                        <FormControlLabel
                            control={
                              <Checkbox
                                  checked={medication.timings.morning}
                                  onChange={(e) => handleTimingChange(index, 'morning', e.target.checked)}
                                  sx={{
                                    color: '#45d27a',
                                    '&.Mui-checked': { color: '#45d27a' }
                                  }}
                              />
                            }
                            label="Morning"
                            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <FormControlLabel
                            control={
                              <Checkbox
                                  checked={medication.timings.afternoon}
                                  onChange={(e) => handleTimingChange(index, 'afternoon', e.target.checked)}
                                  sx={{
                                    color: '#45d27a',
                                    '&.Mui-checked': { color: '#45d27a' }
                                  }}
                              />
                            }
                            label="Afternoon"
                            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <FormControlLabel
                            control={
                              <Checkbox
                                  checked={medication.timings.evening}
                                  onChange={(e) => handleTimingChange(index, 'evening', e.target.checked)}
                                  sx={{
                                    color: '#45d27a',
                                    '&.Mui-checked': { color: '#45d27a' }
                                  }}
                              />
                            }
                            label="Evening"
                            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <FormControlLabel
                            control={
                              <Checkbox
                                  checked={medication.timings.night}
                                  onChange={(e) => handleTimingChange(index, 'night', e.target.checked)}
                                  sx={{
                                    color: '#45d27a',
                                    '&.Mui-checked': { color: '#45d27a' }
                                  }}
                              />
                            }
                            label="Night"
                            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                        />
                      </Grid>
                    </Grid>
                  </Box>


                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" sx={{ mb: 1, color: "#0c3c3c", fontWeight: 500 }}>
                        Meal Timing
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                            value={medication.mealTiming}
                            onChange={(e) => handleMedicationChange(index, 'mealTiming', e.target.value)}
                            displayEmpty
                            sx={{
                              backgroundColor: '#f8f9fa',
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#45d27a' },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#45d27a' },
                            }}
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
                      <Typography variant="body2" sx={{ mb: 1, color: "#0c3c3c", fontWeight: 500 }}>
                        Administration Method
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                            value={medication.method}
                            onChange={(e) => handleMedicationChange(index, 'method', e.target.value)}
                            displayEmpty
                            sx={{
                              backgroundColor: '#f8f9fa',
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#45d27a' },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#45d27a' },
                            }}
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


                  <TextField
                      fullWidth
                      size="small"
                      label="Remarks"
                      value={medication.remarks}
                      onChange={(e) => handleMedicationChange(index, 'remarks', e.target.value)}
                      placeholder="Additional instructions for this medication..."
                      multiline
                      rows={2}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f8f9fa',
                          '& fieldset': { borderColor: '#e0e0e0' },
                          '&:hover fieldset': { borderColor: '#45d27a' },
                          '&.Mui-focused fieldset': { borderColor: '#45d27a' },
                        },
                      }}
                  />
                </Paper>
            ))}
          </Box>


          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, color: "#0c3c3c", fontWeight: 500 }}>
              General Notes
            </Typography>
            <TextField
                fullWidth
                multiline
                rows={4}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional general instructions for patient or pharmacy..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8f9fa',
                    '& fieldset': { borderColor: '#e0e0e0' },
                    '&:hover fieldset': { borderColor: '#45d27a' },
                    '&.Mui-focused fieldset': { borderColor: '#45d27a' },
                  },
                }}
            />
          </Box>


          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{
                  borderColor: "#666",
                  color: "#666",
                  '&:hover': { borderColor: "#45d27a", color: "#45d27a" }
                }}
            >
              Cancel
            </Button>
            <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{
                  backgroundColor: "#45d27a",
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
      </Box>
  );
};

export default PrescriptionsTab;