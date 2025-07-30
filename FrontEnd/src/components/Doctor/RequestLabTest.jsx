import React, { useState } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Button,
  Alert, Snackbar, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const RequestLabTest = ({ pendingRequests = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const patientFromState = location.state?.patient;

  const [formData, setFormData] = useState({
    patientName: patientFromState?.name || "",
    testType: "",
    notes: ""
  });

  const [showAlert, setShowAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common lab test types
  const testTypes = [
    "Blood Test - Complete Blood Count (CBC)",
    "Blood Test - Lipid Profile",
    "Blood Test - Blood Sugar",
    "Urine Test - Routine",
    "Urine Test - Culture",
    "X-Ray - Chest",
    "X-Ray - Abdomen",
    "ECG",
    "Ultrasound",
    "CT Scan",
    "MRI",
    "Other"
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.patientName.trim()) {
      alert("Please enter patient name");
      return;
    }
    if (!formData.testType.trim()) {
      alert("Please select test type");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call to laboratory system
      const labRequest = {
        id: Date.now(),
        patientName: formData.patientName,
        testType: formData.testType,
        notes: formData.notes,
        requestDate: new Date().toISOString().split('T')[0],
        requestTime: new Date().toLocaleTimeString(),
        status: "Pending",
        doctorId: "current_doctor_id", // Replace with actual doctor ID
        submittedAt: new Date().toISOString()
      };

      // Here you would send to your backend/laboratory system
      console.log("Sending lab request to laboratory system:", labRequest);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success alert
      setShowAlert(true);

      // Reset form
      setFormData({
        patientName: patientFromState?.name || "",
        testType: "",
        notes: ""
      });

      // Navigate back to patient profile after 2 seconds if patient context exists
      if (patientFromState) {
        setTimeout(() => {
          navigate(`/doctor/patients/${patientFromState.id}`, {
            state: { 
              patient: patientFromState,
              successMessage: "Lab test request submitted successfully!"
            }
          });
        }, 2000);
      }

    } catch (error) {
      console.error("Error submitting lab request:", error);
      alert("Error submitting request. Please try again.");
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
        Request Lab Test
      </Typography>

      {/* Pending Requests Table */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            color: "#0c3c3c",
            fontWeight: 600,
            mb: 2
          }}
        >
          Pending Requests
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                <TableCell sx={{ fontWeight: 700, color: "#0c3c3c" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0c3c3c" }}>Test Type</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0c3c3c" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4, color: "#6c6b6b" }}>
                    No pending lab test requests
                  </TableCell>
                </TableRow>
              ) : (
                pendingRequests.map((request, index) => (
                  <TableRow key={request.id || index} hover>
                    <TableCell>{request.date}</TableCell>
                    <TableCell>{request.testType}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: request.status === 'Pending' ? '#ff9800' : 
                                request.status === 'Completed' ? '#4caf50' : '#f44336',
                          fontWeight: 500
                        }}
                      >
                        {request.status}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* New Request Form */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            color: "#0c3c3c",
            fontWeight: 600,
            mb: 3
          }}
        >
          New Request
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

        {/* Test Type */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, color: "#0c3c3c", fontWeight: 500 }}>
            Test Type
          </Typography>
          <FormControl fullWidth>
            <Select
              value={formData.testType}
              onChange={(e) => handleInputChange('testType', e.target.value)}
              displayEmpty
              sx={{
                backgroundColor: '#f8f9fa',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#45d27a',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#45d27a',
                },
              }}
            >
              <MenuItem value="" disabled>
                <em>Select test type</em>
              </MenuItem>
              {testTypes.map((test, index) => (
                <MenuItem key={index} value={test}>
                  {test}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
            placeholder="Additional notes or special instructions..."
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
          Lab test request submitted successfully! Redirecting to patient profile...
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RequestLabTest;