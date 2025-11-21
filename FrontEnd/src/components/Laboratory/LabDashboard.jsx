"use client";
import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Paper, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TextField,
  InputAdornment,
  Stack
} from "@mui/material";
import { Assignment, PlayArrow, CheckCircle, Cancel, Refresh, Search } from "@mui/icons-material";
import { getLabRequests } from '../../api/labApi';

const LabDashboard = () => {
  const [filter, setFilter] = useState("PENDING");
  const [stats, setStats] = useState({ PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0, DECLINED: 0 });
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchTestType, setSearchTestType] = useState("");

  const loadStats = async () => {
    const pending = await getLabRequests("PENDING");
    const inProgress = await getLabRequests("IN_PROGRESS");
    const completed = await getLabRequests("COMPLETED");
    const declined = await getLabRequests("DECLINED");

    setStats({
      PENDING: pending.length,
      IN_PROGRESS: inProgress.length,
      COMPLETED: completed.length,
      DECLINED: declined.length
    });
  };

  const loadRequests = async () => {
    const data = await getLabRequests(filter);
    setRequests(data);
    setFilteredRequests(data);
  };

  useEffect(() => {
    loadStats();
    loadRequests();
    // Reset search when filter changes
    setSearchName("");
    setSearchTestType("");
  }, [filter]);

  // Filter requests based on search criteria
  useEffect(() => {
    let filtered = requests;

    if (searchName) {
      filtered = filtered.filter(r => 
        (r.patientName || "")
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

  const filterButtons = [
    { key: "PENDING", label: "Lab Requests", icon: <Assignment /> },
    { key: "IN_PROGRESS", label: "In Progress", icon: <PlayArrow /> },
    { key: "COMPLETED", label: "Completed", icon: <CheckCircle /> },
    { key: "DECLINED", label: "Declined", icon: <Cancel /> },
  ];

  const handleRefresh = () => {
    loadStats();
    loadRequests();
    setSearchName("");
    setSearchTestType("");
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4, px: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Lab Dashboard</Typography>
        <Button startIcon={<Refresh />} onClick={handleRefresh}>Refresh</Button>
      </Box>

      {/* Filter Buttons */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {filterButtons.map(btn => (
          <Grid item xs={6} sm={3} key={btn.key}>
            <Card 
              onClick={() => setFilter(btn.key)} 
              sx={{ cursor: "pointer", border: filter === btn.key ? "2px solid #1976d2" : "1px solid #ccc" }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                {btn.icon}
                <Typography>{btn.label}</Typography>
                <Typography fontWeight="bold">{stats[btn.key]}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Requests Table with Search */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" mb={2}>
          {filterButtons.find(f => f.key === filter)?.label} ({filteredRequests.length})
        </Typography>

        {/* Search Filters - Only show for COMPLETED */}
        {filter === "COMPLETED" && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
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
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient Name</TableCell>
                <TableCell>Test Type</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    {requests.length === 0 ? "No requests found" : "No matching requests found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{r.patientName}</TableCell>
                    <TableCell>{r.testType}</TableCell>
                    <TableCell>{new Date(r.orderDate).toLocaleDateString()}</TableCell>
                    <TableCell>{r.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default LabDashboard;
// "use client";
// import React, { useState, useEffect } from "react";
// import { Box, Typography, Grid, Card, CardContent, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
// import { Assignment, PlayArrow, CheckCircle, Cancel, Refresh } from "@mui/icons-material";
// import { getLabRequests } from '../../api/labApi';

// const LabDashboard = () => {
//   const [filter, setFilter] = useState("PENDING");
//   const [stats, setStats] = useState({ PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0, DECLINED: 0 });
//   const [requests, setRequests] = useState([]);

//   const loadStats = async () => {
//     const pending = await getLabRequests("PENDING");
//     const inProgress = await getLabRequests("IN_PROGRESS");
//     const completed = await getLabRequests("COMPLETED");
//     const declined = await getLabRequests("DECLINED");

//     setStats({
//       PENDING: pending.length,
//       IN_PROGRESS: inProgress.length,
//       COMPLETED: completed.length,
//       DECLINED: declined.length
//     });
//   };

//   const loadRequests = async () => {
//     const data = await getLabRequests(filter);
//     setRequests(data);
//   };

//   useEffect(() => {
//     loadStats();
//     loadRequests();
//   }, [filter]);

//   const filterButtons = [
//     { key: "PENDING", label: "Lab Requests", icon: <Assignment /> },
//     { key: "IN_PROGRESS", label: "In Progress", icon: <PlayArrow /> },
//     { key: "COMPLETED", label: "Completed", icon: <CheckCircle /> },
//     { key: "DECLINED", label: "Declined", icon: <Cancel /> },
//   ];

//   return (
//     <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4, px: 2 }}>
//       <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
//         <Typography variant="h4">Lab Dashboard</Typography>
//         <Button startIcon={<Refresh />} onClick={() => { loadStats(); loadRequests(); }}>Refresh</Button>
//       </Box>

//       {/* Filter Buttons */}
//       <Grid container spacing={2} sx={{ mb: 4 }}>
//         {filterButtons.map(btn => (
//           <Grid item xs={6} sm={3} key={btn.key}>
//             <Card 
//               onClick={() => setFilter(btn.key)} 
//               sx={{ cursor: "pointer", border: filter === btn.key ? "2px solid #1976d2" : "1px solid #ccc" }}
//             >
//               <CardContent sx={{ textAlign: "center" }}>
//                 {btn.icon}
//                 <Typography>{btn.label}</Typography>
//                 <Typography fontWeight="bold">{stats[btn.key]}</Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>

//       {/* Requests Table */}
//       <Paper sx={{ p: 2 }}>
//         <Typography variant="h6" mb={2}>
//           {filterButtons.find(f => f.key === filter)?.label} ({requests.length})
//         </Typography>

//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Patient Name</TableCell>
//                 <TableCell>Test Type</TableCell>
//                 <TableCell>Order Date</TableCell>
//                 <TableCell>Status</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {requests.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={4} align="center">No requests found</TableCell>
//                 </TableRow>
//               ) : (
//                 requests.map(r => (
//                   <TableRow key={r.id}>
//                     <TableCell>{r.patientName}</TableCell>
//                     <TableCell>{r.testType}</TableCell>
//                     <TableCell>{new Date(r.orderDate).toLocaleDateString()}</TableCell>
//                     <TableCell>{r.status}</TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Paper>
//     </Box>
//   );
// };

// export default LabDashboard;

