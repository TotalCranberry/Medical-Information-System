import React from "react";
import {
  Box, Typography, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";

const LabDashboardTab = () => {
  const newRequests = [];
  const uploadedResults = [];

  const renderTable = (title, data) => (
    <Paper sx={{ mb: 4, p: 2 }}>
      <Typography variant="h6" mb={1}>{title}</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Patient Name</TableCell>
              <TableCell>Test Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>No records</TableCell>
              </TableRow>
            ) : (
              data.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.time}</TableCell>
                  <TableCell>{item.patient}</TableCell>
                  <TableCell>{item.type}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  return (
    <Box sx={{ maxWidth: 900, margin: "40px auto", p: 3 }}>
      <Typography variant="h4" mb={3}>Welcome, Lab Staff</Typography>
      {renderTable("New Test Requests", newRequests)}
      {renderTable("Recently Uploaded Results", uploadedResults)}
    </Box>
  );
};

export default LabDashboardTab;


