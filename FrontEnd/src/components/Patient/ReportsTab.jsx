import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Link, Grid, Divider, Chip, Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { getCompletedPrescriptionsForPatient } from "../../api/prescription";

const ReportsTab = ({
  diagnoses = [],
  medicals = [],
  prescriptions = [],
  labReports = [],
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [completedPrescriptions, setCompletedPrescriptions] = useState([]);

  const getStatusChipColor = (status) => {
    if (!status) return "default";
    const s = status.toLowerCase();
    if (s === "completed" || s === "dispensed") return "success";
    if (s === "pending" || s === "scheduled") return "warning";
    if (s === "cancelled") return "error";
    return "default";
  };

  // Load completed prescriptions
  useEffect(() => {
    const loadCompletedPrescriptions = async () => {
      try {
        console.log("DEBUG: ReportsTab - Loading completed prescriptions");
        const data = await getCompletedPrescriptionsForPatient();
        console.log("DEBUG: ReportsTab - Received prescriptions data:", data);
        // Sort by date (recent to past)
        const sorted = data.sort((a, b) => new Date(b.prescriptionDate || b.createdAt) - new Date(a.prescriptionDate || a.createdAt));
        console.log("DEBUG: ReportsTab - Sorted prescriptions:", sorted);
        setCompletedPrescriptions(sorted);
      } catch (error) {
        console.error("Failed to load completed prescriptions:", error);
        setCompletedPrescriptions([]);
      }
    };

    loadCompletedPrescriptions();
  }, []);

  const handleViewPrescription = (prescription) => {
    // Navigate to prescription print page instead of opening dialog
    navigate('/prescription-print', {
      state: {
        prescription: prescription,
        fromCompletedTab: true,
        readOnly: true
      }
    });
  };

  return (
    <Box>
      <Typography
        variant="h4"
        color="primary.main"
        fontWeight={700}
        mb={4}
        textAlign={{ xs: "center", md: "left" }}
      >
        Medical Reports
      </Typography>

      <Grid
        container
        spacing={4}
        justifyContent="center"
        alignItems="flex-start"
      >
        {/* Diagnosis History */}
        <Grid item xs={12} md={6} sx={{ minWidth: 400 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4, width: "100%" }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Diagnosis History
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer sx={{ maxHeight: 300, width: "100%" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Diagnosis</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {diagnoses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No diagnoses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    diagnoses.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          {new Date(item.diagnosisDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{item.diagnosis}</TableCell>
                        <TableCell>{item.notes || "N/A"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Medical Certificates */}
        <Grid item xs={12} md={6} sx={{ minWidth: 400 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4, width: "100%" }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Medical Certificates
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer sx={{ maxHeight: 300, width: "100%" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date Issued</TableCell>
                    <TableCell>Recommendations</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {medicals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No medicals found
                      </TableCell>
                    </TableRow>
                  ) : (
                    medicals.map((medical) => (
                      <TableRow key={medical.id} hover>
                        <TableCell>
                          {new Date(medical.medicalDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{medical.recommendations}</TableCell>
                        
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Completed Prescriptions */}
        <Grid item xs={12} sx={{ minWidth: 700 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4, width: "100%" }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Completed Prescriptions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer sx={{ maxHeight: 300, width: "100%" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {completedPrescriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No completed prescriptions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    completedPrescriptions.slice(0, 5).map(rx => (
                      <TableRow key={rx.id} hover>
                        <TableCell>
                          {new Date(rx.prescriptionDate || rx.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{rx.doctorName}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewPrescription(rx)}
                            sx={{
                              minWidth: "auto",
                              px: 1,
                              py: 0.5,
                              fontSize: "0.75rem",
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Lab Reports */}
        <Grid item xs={12} sx={{ minWidth: 700 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4, width: "100%" }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Lab Reports
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer sx={{ maxHeight: 300, width: "100%" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Test Type</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {labReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No lab reports found
                      </TableCell>
                    </TableRow>
                  ) : (
                    labReports.map((report) => (
                      <TableRow key={report.id} hover>
                        <TableCell>
                          {new Date(report.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{report.testType || report.test || "N/A"}</TableCell>
                        <TableCell>
                          <Chip
                            label={report.status || "Unknown"}
                            size="small"
                            color={getStatusChipColor(report.status)}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsTab;
