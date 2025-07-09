import React, { useState } from "react";
import {
  Box, Typography, Paper, Grid, Button,
  Table, TableHead, TableRow, TableCell, TableBody
} from "@mui/material";

const PrescriptionsPage = () => {
  const [tab, setTab] = useState("Requests");

  // States for prescription status tabs
  const [requests, setRequests] = useState([
    { id: 1, name: "A.B.C. Dasanayaka", age: 44, gender: "Male" },
    { id: 2, name: "B.C.D. Ekanayake", age: 22, gender: "Female" },
  ]);

  const [pending, setPending] = useState([]);
  const [fulfilled, setFulfilled] = useState([]);

  // Move to pending
  const handleViewPrescription = (patient) => {
    setRequests(prev => prev.filter(p => p.id !== patient.id));
    setPending(prev => [...prev, patient]);
  };

  // Move to fulfilled
  const handleCompletePrescription = (patient) => {
    setPending(prev => prev.filter(p => p.id !== patient.id));
    setFulfilled(prev => [...prev, patient]);
  };

  // Summary counts
  const summary = {
    Requests: requests.length,
    Pending: pending.length,
    Fulfilled: fulfilled.length,
  };

  // Tab-specific data
  const tabData = {
    Requests: requests,
    Pending: pending,
    Fulfilled: fulfilled
  };

  return (
    <Box sx={{ maxWidth: 1000, margin: "40px auto", p: 3 }}>
      <Typography variant="h4" mb={3}>Prescriptions</Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        {Object.entries(summary).map(([key, value]) => (
          <Grid item xs={12} sm={4} key={key}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6">{key}</Typography>
              <Typography variant="h5">{value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Box display="flex" justifyContent="center" mb={2} gap={2}>
        {["Requests", "Pending", "Fulfilled"].map((label) => (
          <Button
            key={label}
            variant={tab === label ? "contained" : "outlined"}
            onClick={() => setTab(label)}
          >
            {label}
          </Button>
        ))}
      </Box>

      {/* Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" mb={1}>{tab} List</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Gender</TableCell>
              {tab === "Requests" && <TableCell>Action</TableCell>}
              {tab === "Pending" && <TableCell>Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {tabData[tab].length === 0 ? (
              <TableRow>
                <TableCell colSpan={tab === "Requests" || tab === "Pending" ? 4 : 3}>
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              tabData[tab].map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.age}</TableCell>
                  <TableCell>{row.gender}</TableCell>
                  {tab === "Requests" && (
                    <TableCell>
                      <Button
                        variant="outlined"
                        onClick={() => handleViewPrescription(row)}
                      >
                        View Prescription
                      </Button>
                    </TableCell>
                  )}
                  {tab === "Pending" && (
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleCompletePrescription(row)}
                      >
                        Complete
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default PrescriptionsPage;
