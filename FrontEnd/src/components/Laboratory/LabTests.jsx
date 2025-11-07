"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { getLabRequests, updateLabRequestStatus } from '../../api/labApi';

const LabRequests = () => {
  const [requests, setRequests] = useState([]);

  const loadRequests = async () => {
    const data = await getLabRequests("PENDING");
    setRequests(data);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = async (requestId, status) => {
    try {
      await updateLabRequestStatus(requestId, status);
      loadRequests(); // Reload after status update
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4 }}>
      <Typography variant="h4" mb={2}>Lab Requests</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Test Type</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length > 0 ? (
              requests.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.patient?.name || r.patient}</TableCell>
                  <TableCell>{r.testType}</TableCell>
                  <TableCell>{new Date(r.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleAction(r.id, "IN_PROGRESS")}
                    >
                      <CheckCircle />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleAction(r.id, "DECLINED")}
                    >
                      <Cancel />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">No requests</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default LabRequests;
