import React from "react";
import { Box, Typography, Paper, Button } from "@mui/material";

const LabResultsTab = () => {
  const result = {
    orderNo: "APL0012",
    orderDate: "Today, 14.23",
    status: "Order not picked",
    urgency: "Routine",
    test: "Total cholesterol (mmol/l)",
    instructions: "No instructions are provided.",
    doctor: "Doctor - jake doctor"
  };

  return (
    <Box sx={{ maxWidth: 900, margin: "40px auto", p: 3 }}>
      <Typography variant="h4" mb={3}>Results</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between">
          <Typography>Order No: {result.orderNo}</Typography>
          <Typography>Order Date: {result.orderDate}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography>Status: {result.status}</Typography>
          <Typography>Urgency: {result.urgency}</Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography>Test ordered: {result.test}</Typography>
        <Typography>Instructions: {result.instructions}</Typography>
      </Paper>

      <Paper sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography>Orderer Name: {result.doctor}</Typography>
        <Box>
          <Button variant="outlined" sx={{ mr: 1 }}>Reject lab request</Button>
          <Button variant="contained">Pick lab request</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LabResultsTab;
