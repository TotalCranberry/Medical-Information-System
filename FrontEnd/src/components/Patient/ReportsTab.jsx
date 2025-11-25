import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button,
  Tabs, Tab, TextField
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getCompletedPrescriptionsForPatient } from "../../api/prescription";
import { fetchLabRequests } from "../../api/reports";

const ReportsTab = ({
  diagnoses = [],
  medicals = [],
  prescriptions = [], 
  labReports = [],
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [completedPrescriptions, setCompletedPrescriptions] = useState([]);
  const [labRequests, setLabRequests] = useState([]); // New State
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const getStatusChipColor = (status) => {
    if (!status) return "default";
    const s = status.toLowerCase();
    if (s === "completed" || s === "dispensed") return "success";
    if (s === "pending" || s === "scheduled") return "warning";
    if (s === "in_progress") return "info";
    if (s === "cancelled" || s === "declined") return "error";
    return "default";
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load Prescriptions
        const rxData = await getCompletedPrescriptionsForPatient();
        const sortedRx = rxData.sort((a, b) => new Date(b.prescriptionDate || b.createdAt) - new Date(a.prescriptionDate || a.createdAt));
        setCompletedPrescriptions(sortedRx);

        // Load Lab Requests
        const reqData = await fetchLabRequests();
        const sortedReq = reqData.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        setLabRequests(sortedReq);
      } catch (error) {
        console.error("Failed to load report data:", error);
      }
    };

    loadData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewPrescription = (prescription) => {
    navigate('/prescription-print', {
      state: {
        prescription: prescription,
        fromCompletedTab: true,
        readOnly: true
      }
    });
  };

  const filterDataByDate = (data, dateField) => {
    if (!startDate && !endDate) return data;

    return data.filter((item) => {
      if (!item) return false;
      const itemDateStr = item[dateField] || item.createdAt; 
      if (!itemDateStr) return false;
      
      const itemDate = new Date(itemDateStr);
      itemDate.setHours(0, 0, 0, 0);

      let startValid = true;
      let endValid = true;

      if (startDate) {
        const sDate = new Date(startDate);
        sDate.setHours(0, 0, 0, 0);
        startValid = itemDate >= sDate;
      }

      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(0, 0, 0, 0);
        endValid = itemDate <= eDate;
      }

      return startValid && endValid;
    });
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
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

      <Paper elevation={2} sx={{ p: 3, borderRadius: 4, width: "100%" }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Diagnosis History" />
            <Tab label="Medical Certificates" />
            <Tab label="Completed Prescriptions" />
            <Tab label="Lab Requests" /> 
          </Tabs>
        </Box>

        {/* Date Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{ textField: { size: 'small' } }}
                />
            </LocalizationProvider>
            <Button variant="outlined" onClick={clearFilters}>Clear Filters</Button>
        </Box>

        {/* 0. Diagnosis History */}
        {tabValue === 0 && (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Diagnosis</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filterDataByDate(diagnoses, 'diagnosisDate').length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No diagnoses found</TableCell>
                  </TableRow>
                ) : (
                  filterDataByDate(diagnoses, 'diagnosisDate').map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{new Date(item.diagnosisDate).toLocaleDateString()}</TableCell>
                      <TableCell>{item.diagnosis}</TableCell>
                      <TableCell>{item.notes || "N/A"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* 1. Medical Certificates */}
        {tabValue === 1 && (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date Issued</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Recommendations</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filterDataByDate(medicals, 'medicalDate').length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center">No medical certificates found</TableCell>
                  </TableRow>
                ) : (
                  filterDataByDate(medicals, 'medicalDate').map((medical) => (
                    <TableRow key={medical.id} hover>
                      <TableCell>{new Date(medical.medicalDate).toLocaleDateString()}</TableCell>
                      <TableCell>{medical.recommendations}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* 2. Completed Prescriptions */}
        {tabValue === 2 && (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Doctor</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filterDataByDate(completedPrescriptions, 'prescriptionDate').length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No completed prescriptions found</TableCell>
                  </TableRow>
                ) : (
                  filterDataByDate(completedPrescriptions, 'prescriptionDate').map((rx) => (
                    <TableRow key={rx.id} hover>
                      <TableCell>{new Date(rx.prescriptionDate || rx.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{rx.doctorName}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewPrescription(rx)}
                          sx={{ minWidth: "auto", fontSize: "0.75rem" }}
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
        )}

        {/* 3. Lab Requests (New) */}
        {tabValue === 3 && (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date Ordered</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Test Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filterDataByDate(labRequests, 'orderDate').length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No lab requests found</TableCell>
                  </TableRow>
                ) : (
                  filterDataByDate(labRequests, 'orderDate').map((req) => (
                    <TableRow key={req.id} hover>
                      <TableCell>{new Date(req.orderDate).toLocaleDateString()}</TableCell>
                      <TableCell>{req.testType}</TableCell>
                      <TableCell>
                        <Chip
                          label={req.status || "Unknown"}
                          size="small"
                          color={getStatusChipColor(req.status)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

      </Paper>
    </Box>
  );
};

export default ReportsTab;