import React from "react";
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button
} from "@mui/material";
import {
  Science as ScienceIcon,
  Medication as MedicationIcon
} from "@mui/icons-material";

const PatientProfile = ({ 
  patient, 
  onRequestLabTest, 
  onWritePrescription 
}) => {
  // Default patient data if none provided
  const patientData = patient || {
    name: "John Doe",
    age: 24,
    faculty: "Science Faculty",
    conditions: [],
    allergies: [],
    diagnoses: [],
    vitals: [],
    weightChart: []
  };

  const handleRequestLabTest = () => {
    if (onRequestLabTest) {
      onRequestLabTest(patientData);
    }
    // You can also navigate to lab test request page
    console.log("Navigate to Request Lab Test for:", patientData.name);
  };

  const handleWritePrescription = () => {
    if (onWritePrescription) {
      onWritePrescription(patientData);
    }
    // You can also navigate to prescription writing page
    console.log("Navigate to Write Prescription for:", patientData.name);
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
        Patient Profile
      </Typography>

      {/* Patient Basic Information */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            color: "#0c3c3c",
            fontWeight: 600,
            mb: 2
          }}
        >
          Patient Information
        </Typography>
        
        <Box sx={{ mb: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 500, color: "#0c3c3c" }}>
            <strong>Name:</strong> {patientData.name}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 500, color: "#0c3c3c" }}>
            <strong>Age:</strong> {patientData.age} Years
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 500, color: "#0c3c3c" }}>
            <strong>Faculty:</strong> {patientData.faculty}
          </Typography>
        </Box>
      </Paper>

      {/* Medical Information Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Conditions */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, minHeight: 200 }}>
            <Typography
              variant="h6"
              sx={{
                backgroundColor: "#e0e0e0",
                color: "#0c3c3c",
                fontWeight: 600,
                p: 1,
                mb: 2,
                textAlign: "center",
                borderRadius: 1
              }}
            >
              Conditions
            </Typography>
            <Box sx={{ minHeight: 120, backgroundColor: "#f5f5f5", p: 2, borderRadius: 1 }}>
              {patientData.conditions && patientData.conditions.length > 0 ? (
                patientData.conditions.map((condition, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                    • {condition}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: "#6c6b6b", fontStyle: "italic" }}>
                  No conditions recorded
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Allergies */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, minHeight: 200 }}>
            <Typography
              variant="h6"
              sx={{
                backgroundColor: "#e0e0e0",
                color: "#0c3c3c",
                fontWeight: 600,
                p: 1,
                mb: 2,
                textAlign: "center",
                borderRadius: 1
              }}
            >
              Allergies
            </Typography>
            <Box sx={{ minHeight: 120, backgroundColor: "#f5f5f5", p: 2, borderRadius: 1 }}>
              {patientData.allergies && patientData.allergies.length > 0 ? (
                patientData.allergies.map((allergy, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                    • {allergy}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: "#6c6b6b", fontStyle: "italic" }}>
                  No allergies recorded
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Weight Chart */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, minHeight: 200 }}>
            <Typography
              variant="h6"
              sx={{
                backgroundColor: "#e0e0e0",
                color: "#0c3c3c",
                fontWeight: 600,
                p: 1,
                mb: 2,
                textAlign: "center",
                borderRadius: 1
              }}
            >
              Weight Chart
            </Typography>
            <Box sx={{ minHeight: 120, backgroundColor: "#f5f5f5", p: 2, borderRadius: 1 }}>
              {patientData.weightChart && patientData.weightChart.length > 0 ? (
                patientData.weightChart.map((entry, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                    {entry.date}: {entry.weight} kg
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: "#6c6b6b", fontStyle: "italic" }}>
                  No weight data recorded
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Diagnoses */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, minHeight: 200 }}>
            <Typography
              variant="h6"
              sx={{
                backgroundColor: "#e0e0e0",
                color: "#0c3c3c",
                fontWeight: 600,
                p: 1,
                mb: 2,
                textAlign: "center",
                borderRadius: 1
              }}
            >
              Diagnoses
            </Typography>
            <Box sx={{ minHeight: 120, backgroundColor: "#f5f5f5", p: 2, borderRadius: 1 }}>
              {patientData.diagnoses && patientData.diagnoses.length > 0 ? (
                patientData.diagnoses.map((diagnosis, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                    • {diagnosis.date}: {diagnosis.condition}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: "#6c6b6b", fontStyle: "italic" }}>
                  No diagnoses recorded
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Vitals */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, minHeight: 200 }}>
            <Typography
              variant="h6"
              sx={{
                backgroundColor: "#e0e0e0",
                color: "#0c3c3c",
                fontWeight: 600,
                p: 1,
                mb: 2,
                textAlign: "center",
                borderRadius: 1
              }}
            >
              Vitals
            </Typography>
            <Box sx={{ minHeight: 120, backgroundColor: "#f5f5f5", p: 2, borderRadius: 1 }}>
              {patientData.vitals && patientData.vitals.length > 0 ? (
                patientData.vitals.map((vital, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                    {vital.date}: BP {vital.bloodPressure}, Temp {vital.temperature}°C
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: "#6c6b6b", fontStyle: "italic" }}>
                  No vitals recorded
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            color: "#0c3c3c",
            fontWeight: 600,
            mb: 3,
            textAlign: "center"
          }}
        >
          Quick Actions
        </Typography>
        
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              elevation={1}
              sx={{ 
                cursor: "pointer",
                transition: "all 0.3s ease",
                border: "2px solid transparent",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                  borderColor: "#45d27a"
                }
              }}
              onClick={handleRequestLabTest}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <ScienceIcon sx={{ fontSize: 40, color: "#45d27a" }} />
                </Box>
                <Typography 
                  variant="h6" 
                  fontWeight={600} 
                  sx={{ color: "#0c3c3c", mb: 1 }}
                >
                  Request Lab Test
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: "#6c6b6b" }}
                >
                  Order laboratory tests for this patient
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card 
              elevation={1}
              sx={{ 
                cursor: "pointer",
                transition: "all 0.3s ease",
                border: "2px solid transparent",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                  borderColor: "#45d27a"
                }
              }}
              onClick={handleWritePrescription}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <MedicationIcon sx={{ fontSize: 40, color: "#45d27a" }} />
                </Box>
                <Typography 
                  variant="h6" 
                  fontWeight={600} 
                  sx={{ color: "#0c3c3c", mb: 1 }}
                >
                  Write Prescription
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: "#6c6b6b" }}
                >
                  Create a new prescription for this patient
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default PatientProfile;