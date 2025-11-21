"use client";
import React, { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  IconButton,
  TextField,
  InputAdornment,
  Stack
} from "@mui/material";
import { CheckCircle, Cancel, Search } from "@mui/icons-material";
import { getLabRequests, updateLabRequestStatus } from '../../api/labApi';

const LabRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchTestType, setSearchTestType] = useState("");

  const loadRequests = async () => {
    const data = await getLabRequests("PENDING");
    setRequests(data);
    setFilteredRequests(data);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Filter requests based on search criteria
  useEffect(() => {
    let filtered = requests;

    if (searchName) {
      filtered = filtered.filter(r => 
        (r.patientName || r.patient?.name || r.patient || "")
          .toLowerCase()
          .includes(searchName.toLowerCase())
      );
    }

    if (searchTestType) {
      filtered = filtered.filter(r =>
        (r.testType || "")
          .toLowerCase()
          .includes(searchTestType.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [searchName, searchTestType, requests]);

  const handleAction = async (requestId, status) => {
    try {
      await updateLabRequestStatus(requestId, status);
      loadRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4 }}>
      <Typography variant="h4" mb={3}>Lab Requests</Typography>
      
      {/* Search Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Search by Patient Name"
            variant="outlined"
            fullWidth
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Search by Test Type"
            variant="outlined"
            fullWidth
            value={searchTestType}
            onChange={(e) => setSearchTestType(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Paper>

      {/* Results Table */}
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
            {filteredRequests.length > 0 ? (
              filteredRequests.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.patientName || r.patient?.name || r.patient}</TableCell>
                  <TableCell>{r.testType}</TableCell>
                  <TableCell>{new Date(r.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleAction(r.id, "IN_PROGRESS")}
                      title="Accept Request"
                    >
                      <CheckCircle />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleAction(r.id, "DECLINED")}
                      title="Decline Request"
                    >
                      <Cancel />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {requests.length === 0 ? "No requests" : "No matching requests found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default LabRequests;
/*
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
*/
