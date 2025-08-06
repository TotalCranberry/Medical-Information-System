import React, { useState } from "react";
import { 
  Box, Typography, Paper, Button, Grid, Card, CardContent,
  Chip, Divider, useTheme, useMediaQuery, Stack
} from "@mui/material";

const LabResults = () => {
  const [selectedResult, setSelectedResult] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Sample data - replace with real data from your backend
  const results = [
    {
      id: 1,
      orderNo: "APL0012",
      orderDate: "Today, 14:23",
      status: "Order not picked",
      urgency: "Routine",
      test: "Total cholesterol (mmol/l)",
      instructions: "No instructions are provided.",
      doctor: "Dr. Jake Thompson",
      patient: "A.B.C. Dasanayaka",
      age: 44,
      gender: "Male"
    },
    {
      id: 2,
      orderNo: "APL0013",
      orderDate: "Today, 15:45",
      status: "In Progress",
      urgency: "Urgent",
      test: "Complete Blood Count (CBC)",
      instructions: "Patient is fasting. Handle with priority.",
      doctor: "Dr. Sarah Wilson",
      patient: "B.C.D. Ekanayake",
      age: 22,
      gender: "Female"
    },
    {
      id: 3,
      orderNo: "APL0014",
      orderDate: "Yesterday, 16:30",
      status: "Ready for Review",
      urgency: "Routine",
      test: "Liver Function Test",
      instructions: "Follow standard protocol.",
      doctor: "Dr. Michael Brown",
      patient: "C.D.E. Fernando",
      age: 35,
      gender: "Male"
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case "Order not picked": return { bg: "#ffebee", color: "#d32f2f" };
      case "In Progress": return { bg: "#fff3e0", color: "#f57c00" };
      case "Ready for Review": return { bg: "#e8f5e8", color: "#2e7d32" };
      default: return { bg: "#f5f5f5", color: "#666" };
    }
  };

  const getUrgencyColor = (urgency) => {
    return urgency === "Urgent" 
      ? { bg: "#ffebee", color: "#d32f2f" }
      : { bg: "#e3f2fd", color: "#1976d2" };
  };

  return (
    <Box sx={{ 
      maxWidth: { xs: '100%', sm: '100%', md: 1200 }, 
      margin: { xs: "20px 16px", sm: "30px 24px", md: "40px auto" }, 
      p: { xs: 1, sm: 2, md: 3 } 
    }}>
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        mb={3}
        sx={{ 
          textAlign: { xs: 'center', md: 'left' },
          color: "#0c3c3c",
          fontWeight: 700
        }}
      >
        Lab Results Management
      </Typography>

      <Grid container spacing={3}>
        {/* Results List */}
        <Grid item xs={12} md={selectedResult ? 6 : 12}>
          <Paper elevation={2} sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" fontWeight={600} mb={2} sx={{ color: "#0c3c3c" }}>
              Test Orders ({results.length})
            </Typography>
            
            <Stack spacing={2}>
              {results.map((result) => (
                <Card 
                  key={result.id}
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedResult?.id === result.id ? '2px solid #45d27a' : '1px solid #e0e0e0',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transform: 'translateY(-1px)',
                      transition: 'all 0.2s ease'
                    }
                  }}
                  onClick={() => setSelectedResult(result)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                        {result.orderNo}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#666" }}>
                        {result.orderDate}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 1, color: "#333" }}>
                      <strong>Patient:</strong> {result.patient}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
                      {result.test}
                    </Typography>
                    
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip 
                        label={result.status}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(result.status).bg,
                          color: getStatusColor(result.status).color,
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      />
                      <Chip 
                        label={result.urgency}
                        size="small"
                        sx={{
                          backgroundColor: getUrgencyColor(result.urgency).bg,
                          color: getUrgencyColor(result.urgency).color,
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Result Details */}
        {selectedResult && (
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" fontWeight={600} mb={2} sx={{ color: "#0c3c3c" }}>
                Order Details
              </Typography>
              
              {/* Order Information */}
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Order No</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedResult.orderNo}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Order Date</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedResult.orderDate}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Status</Typography>
                    <Chip 
                      label={selectedResult.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(selectedResult.status).bg,
                        color: getStatusColor(selectedResult.status).color,
                        fontWeight: 600,
                        mt: 0.5
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Urgency</Typography>
                    <Chip 
                      label={selectedResult.urgency}
                      size="small"
                      sx={{
                        backgroundColor: getUrgencyColor(selectedResult.urgency).bg,
                        color: getUrgencyColor(selectedResult.urgency).color,
                        fontWeight: 600,
                        mt: 0.5
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Patient Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={1} sx={{ color: "#0c3c3c" }}>
                  Patient Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Name</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedResult.patient}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Age</Typography>
                    <Typography variant="body1">{selectedResult.age} years</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Gender</Typography>
                    <Typography variant="body1">{selectedResult.gender}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Test Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={1} sx={{ color: "#0c3c3c" }}>
                  Test Details
                </Typography>
                <Typography variant="body2" color="textSecondary">Test Ordered</Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
                  {selectedResult.test}
                </Typography>
                
                <Typography variant="body2" color="textSecondary">Instructions</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedResult.instructions}
                </Typography>

                <Typography variant="body2" color="textSecondary">Ordering Doctor</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedResult.doctor}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {selectedResult.status === "Order not picked" && (
                  <>
                    <Button 
                      variant="outlined" 
                      color="error"
                      sx={{ 
                        flex: isMobile ? '1 1 100%' : '1 1 45%',
                        fontWeight: 600
                      }}
                    >
                      Reject Request
                    </Button>
                    <Button 
                      variant="contained"
                      sx={{ 
                        flex: isMobile ? '1 1 100%' : '1 1 45%',
                        backgroundColor: "#45d27a",
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: "#3bc46a"
                        }
                      }}
                    >
                      Pick Request
                    </Button>
                  </>
                )}
                
                {selectedResult.status === "In Progress" && (
                  <Button 
                    variant="contained"
                    fullWidth
                    sx={{ 
                      backgroundColor: "#45d27a",
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: "#3bc46a"
                      }
                    }}
                  >
                    Upload Results
                  </Button>
                )}

                {selectedResult.status === "Ready for Review" && (
                  <Button 
                    variant="contained"
                    fullWidth
                    sx={{ 
                      backgroundColor: "#2196f3",
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: "#1976d2"
                      }
                    }}
                  >
                    Send to Doctor
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default LabResults;
