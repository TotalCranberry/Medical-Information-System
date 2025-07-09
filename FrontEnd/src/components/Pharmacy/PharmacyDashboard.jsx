import React from "react";
import {
  Box, Typography, Paper,
  Table, TableHead, TableRow, TableCell, TableBody
} from "@mui/material";

const PharmacyDashboard = () => {
  const prescriptions = []; // Replace with real data later
  const inventory = [];     // Replace with real data later

  return (
    <Box sx={{ maxWidth: 900, margin: "40px auto", p: 3 }}>
      <Typography variant="h4" mb={3}>Welcome, Name</Typography>

      <Paper sx={{ mb: 4, p: 2 }}>
        <Typography variant="h6" mb={1}>Pending Prescriptions</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Patient Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prescriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2}>No pending prescriptions</TableCell>
              </TableRow>
            ) : (
              prescriptions.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>{p.time}</TableCell>
                  <TableCell>{p.patient}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" mb={1}>Inventory Status</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Medicine</TableCell>
              <TableCell>Available Stocks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2}>No inventory data available</TableCell>
              </TableRow>
            ) : (
              inventory.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default PharmacyDashboard;
