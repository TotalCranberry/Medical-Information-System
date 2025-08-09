import React, { useState } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Button,
  Alert, Snackbar, Grid, IconButton
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const PrescriptionsTab = ({ recentPrescriptions = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const patientFromState = location.state?.patient;

  const [formData, setFormData] = useState({
    patientName: patientFromState?.name || "",
    medications: [{ medicine: "", dosage: "", qty: "" }],
    notes: ""
  });

  const [showAlert, setShowAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const addMedicationRow = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { medicine: "", dosage: "", qty: "" }]
    }));
  };

  const removeMedicationRow = (index) => {
    if (formData.medications.length > 1) {
      const updatedMedications = formData.medications.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        medications: updatedMedications
      }));
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.patientName.trim()) {
      alert("Please enter patient name");
      return;
    }

    // Check if at least one medication is filled
    const hasValidMedication = formData.medications.some(med => 
      med.medicine.trim() && med.dosage.trim() && med.qty.trim()
    );

    if (!hasValidMedication) {
      alert("Please add at least one complete medication entry");
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty medication rows
      const validMedications = formData.medications.filter(med => 
        med.medicine.trim() && med.dosage.trim() && med.qty.trim()
      );

      const prescription = {
        id: Date.now(),
        patientName: formData.patientName,
        medications: validMedications,
        notes: formData.notes,
        prescriptionDate: new Date().toISOString().split('T')[0],
        prescriptionTime: new Date().toLocaleTimeString(),
        status: "Pending",
        doctorId: "current_doctor_id", // Replace with actual doctor ID
        submittedAt: new Date().toISOString()
      };

      // Here you would send to your backend/pharmacy system
      console.log("Sending prescription to pharmacy system:", prescription);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success alert
      setShowAlert(true);

      // Reset form
      setFormData({
        patientName: patientFromState?.name || "",
        medications: [{ medicine: "", dosage: "", qty: "" }],
        notes: ""
      });

      // Navigate back to patient profile after 2 seconds if patient context exists
      if (patientFromState) {
        setTimeout(() => {
          navigate(`/doctor/patients/${patientFromState.id}`, {
            state: { 
              patient: patientFromState,
              successMessage: "Prescription submitted successfully!"
            }
          });
        }, 2000);
      }

    } catch (error) {
      console.error("Error submitting prescription:", error);
      alert("Error submitting prescription. Please try again.");
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
        Prescriptions
      </Typography>

      {/* Recent Prescriptions Table */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            color: "#0c3c3c",
            fontWeight: 600,
            mb: 2
          }}
        >
          Recent Prescriptions
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                <TableCell sx={{ fontWeight: 700, color: "#0c3c3c" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0c3c3c" }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0c3c3c" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentPrescriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4, color: "#6c6b6b" }}>
                    No recent prescriptions
                  </TableCell>
                </TableRow>
              ) : (
                recentPrescriptions.map((prescription, index) => (
                  <TableRow key={prescription.id || index} hover>
                    <TableCell>{prescription.date}</TableCell>
                    <TableCell>{prescription.time}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: prescription.status === 'Pending' ? '#ff9800' : 
                                prescription.status === 'Completed' ? '#4caf50' : '#f44336',
                          fontWeight: 500
                        }}
                      >
                        {prescription.status}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* New Prescription Form */}
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

        {/* Patient Name */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, color: "#0c3c3c", fontWeight: 500 }}>
            Patient Name
          </Typography>
          <TextField
            fullWidth
            value={formData.patientName}
            onChange={(e) => handleInputChange('patientName', e.target.value)}
            placeholder="Enter patient name"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f8f9fa',
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#45d27a',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#45d27a',
                },
              },
            }}
          />
        </Box>

        {/* Medications Table */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 2, color: "#0c3c3c", fontWeight: 500 }}>
            Medications
          </Typography>
          
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                  <TableCell sx={{ fontWeight: 700, color: "#0c3c3c" }}>Medicine</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0c3c3c" }}>Dosage</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0c3c3c" }}>Qty</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0c3c3c", width: '80px' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.medications.map((medication, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={medication.medicine}
                        onChange={(e) => handleMedicationChange(index, 'medicine', e.target.value)}
                        placeholder="Enter medicine name"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#f8f9fa',
                            '& fieldset': {
                              borderColor: '#e0e0e0',
                            },
                            '&:hover fieldset': {
                              borderColor: '#45d27a',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#45d27a',
                            },
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={medication.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        placeholder="e.g., 500mg"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#f8f9fa',
                            '& fieldset': {
                              borderColor: '#e0e0e0',
                            },
                            '&:hover fieldset': {
                              borderColor: '#45d27a',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#45d27a',
                            },
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={medication.qty}
                        onChange={(e) => handleMedicationChange(index, 'qty', e.target.value)}
                        placeholder="e.g., 2x daily"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#f8f9fa',
                            '& fieldset': {
                              borderColor: '#e0e0e0',
                            },
                            '&:hover fieldset': {
                              borderColor: '#45d27a',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#45d27a',
                            },
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Notes */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, color: "#0c3c3c", fontWeight: 500 }}>
            Notes
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Additional instructions for patient or pharmacy..."
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f8f9fa',
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#45d27a',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#45d27a',
                },
              },
            }}
          />
        </Box>

        {/* Submit Button */}
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
            "&:hover": {
              backgroundColor: "#3bc169",
            },
            "&:disabled": {
              backgroundColor: "#cccccc",
            },
          }}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </Paper>

      {/* Success Alert */}
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowAlert(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Prescription submitted successfully! Redirecting to patient profile...
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PrescriptionsTab;