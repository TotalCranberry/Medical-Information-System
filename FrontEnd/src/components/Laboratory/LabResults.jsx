"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Stack,
  LinearProgress,
} from "@mui/material";
import { getLabRequests, uploadLabResult, updateLabRequestStatus } from '../../api/labApi';

const LabResultsUpload = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const loadRequests = async () => {
    const data = await getLabRequests("IN_PROGRESS");
    setRequests(data);
  };

  useEffect(() => { loadRequests(); }, []);

  const handleUpload = async () => {
    if (!selectedRequest || files.length === 0) return;
    setUploading(true);

    for (let file of files) {
      await uploadLabResult(selectedRequest.id, file);
    }
    await updateLabRequestStatus(selectedRequest.id, "COMPLETED");

    setSelectedRequest(null);
    setFiles([]);
    await loadRequests();
    setUploading(false);
    alert("Lab result uploaded!");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles([...files, ...droppedFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 4 }}>
      <Typography variant="h4" mb={3}>Upload Lab Results</Typography>

      {/* Table of Lab Requests */}
      <Paper sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient Name</TableCell>
              <TableCell>Lab Test Type</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Select</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map(r => (
              <TableRow
                key={r.id}
                sx={{ backgroundColor: selectedRequest?.id === r.id ? "#e3f2fd" : "inherit" }}
              >
                <TableCell>{r.patientName}</TableCell>
                <TableCell>{r.testType}</TableCell>
                <TableCell>{new Date(r.orderDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant={selectedRequest?.id === r.id ? "contained" : "outlined"}
                    onClick={() => setSelectedRequest(r)}
                  >
                    Select
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Attractive File Upload Section */}
      {selectedRequest && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>Upload Files for {selectedRequest.patientName}</Typography>

          <Stack spacing={2}>
            <Box
              sx={{
                border: "2px dashed #1976d2",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                cursor: "pointer",
                bgcolor: "#f5f5f5",
                "&:hover": { bgcolor: "#e3f2fd" },
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current.click()}
            >
              <Typography variant="body1">Drag & Drop files here or click to select</Typography>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={e => setFiles([...files, ...Array.from(e.target.files)])}
              />
            </Box>

            {files.length > 0 && (
              <Box>
                <Typography>Selected Files:</Typography>
                <ul>
                  {files.map((f, i) => <li key={i}>{f.name}</li>)}
                </ul>
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
            >
              {uploading ? "Uploading..." : "Upload & Complete"}
            </Button>

            {uploading && <LinearProgress />}
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

export default LabResultsUpload;
