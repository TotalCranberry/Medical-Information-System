import React, { useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent,
  ButtonGroup, Button, Table, TableHead, TableRow, TableCell, TableBody,
  useTheme, useMediaQuery, Stack, Paper, TableContainer
} from "@mui/material";

const LabDashboard = () => {
  const [filter, setFilter] = useState("newRequests");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Sample data - replace with real data from your backend
  const stats = {
    newRequests: 8,
    inProgress: 15,
    completed: 23,
    pending: 5,
  };

  const newRequests = [
    { time: "09:30 AM", patient: "A.B.C. Dasanayaka", type: "Blood Test", urgency: "Routine" },
    { time: "10:15 AM", patient: "B.C.D. Ekanayake", type: "Urine Analysis", urgency: "Urgent" },
    { time: "11:00 AM", patient: "C.D.E. Fernando", type: "X-Ray", urgency: "Routine" },
  ];

  const uploadedResults = [
    { time: "08:45 AM", patient: "D.E.F. Silva", type: "CBC", status: "Completed" },
    { time: "09:20 AM", patient: "E.F.G. Perera", type: "Lipid Profile", status: "Uploaded" },
  ];

  const filterButtons = [
    { key: "newRequests", label: "New Requests" },
    { key: "inProgress", label: "In Progress" },
    { key: "completed", label: "Completed" },
    { key: "pending", label: "Pending Review" }
  ];

  const getCurrentData = () => {
    switch(filter) {
      case "newRequests": return newRequests;
      case "inProgress": return uploadedResults;
      case "completed": return [];
      case "pending": return [];
      default: return newRequests;
    }
  };

  return (
    <Box sx={{ 
      maxWidth: { xs: '100%', sm: '100%', md: 1000 }, 
      margin: { xs: "20px 16px", sm: "30px 24px", md: "40px auto" }, 
      p: { xs: 1, sm: 2, md: 3 } 
    }}>
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        mb={3}
        sx={{ 
          textAlign: { xs: 'center', md: 'left' },
          color: "#0c3c3c",
          fontWeight: 700
        }}
      >
        Welcome, Lab Staff
      </Typography>

      {/* Stats Cards - Responsive Grid */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard title="New Requests" value={stats.newRequests} isMobile={isMobile} color="#45d27a" />
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard title="In Progress" value={stats.inProgress} isMobile={isMobile} color="#ff9800" />
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard title="Completed" value={stats.completed} isMobile={isMobile} color="#4caf50" />
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard title="Pending Review" value={stats.pending} isMobile={isMobile} color="#f44336" />
        </Grid>
      </Grid>

      {/* Filter Buttons - Responsive Layout */}
      {isMobile ? (
        <Stack spacing={1} sx={{ mb: 3 }}>
          {filterButtons.map((btn) => (
            <Button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              variant={filter === btn.key ? "contained" : "outlined"}
              fullWidth
              size="small"
              sx={{ 
                borderColor: "#45d27a",
                color: filter === btn.key ? "white" : "#0c3c3c",
                backgroundColor: filter === btn.key ? "#45d27a" : "transparent"
              }}
            >
              {btn.label}
            </Button>
          ))}
        </Stack>
      ) : (
        <ButtonGroup 
          variant="outlined" 
          sx={{ 
            mb: 3,
            flexWrap: 'wrap',
            '& .MuiButtonGroup-grouped': {
              minWidth: { xs: '120px', sm: '140px' },
              borderColor: "#45d27a",
              '&:hover': {
                backgroundColor: "#45d27a",
                color: "white"
              }
            }
          }}
        >
          {filterButtons.map((btn) => (
            <Button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              variant={filter === btn.key ? "contained" : "outlined"}
              size={isTablet ? "small" : "medium"}
              sx={{
                backgroundColor: filter === btn.key ? "#45d27a" : "transparent",
                color: filter === btn.key ? "white" : "#0c3c3c",
                borderColor: "#45d27a"
              }}
            >
              {btn.label}
            </Button>
          ))}
        </ButtonGroup>
      )}

      {/* Main Content Table */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2} sx={{ color: "#0c3c3c" }}>
          {filterButtons.find(btn => btn.key === filter)?.label || "Lab Records"}
        </Typography>
        
        <Box sx={{ 
          overflowX: 'auto',
          '& .MuiTable-root': {
            minWidth: { xs: 500, sm: 600 }
          }
        }}>
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f7fa" }}>
                <TableCell sx={{ fontWeight: 'bold', color: "#0c3c3c" }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: "#0c3c3c" }}>Patient Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: "#0c3c3c" }}>Test Type</TableCell>
                {filter === "newRequests" && (
                  <TableCell sx={{ fontWeight: 'bold', color: "#0c3c3c" }}>Urgency</TableCell>
                )}
                {filter === "inProgress" && (
                  <TableCell sx={{ fontWeight: 'bold', color: "#0c3c3c" }}>Status</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {getCurrentData().length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={filter === "newRequests" || filter === "inProgress" ? 4 : 3} 
                    align="center"
                    sx={{ py: 4, color: "#6c6b6b", fontStyle: "italic" }}
                  >
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                getCurrentData().map((item, i) => (
                  <TableRow key={i} sx={{ '&:hover': { backgroundColor: "#f9f9f9" } }}>
                    <TableCell sx={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}>
                      {item.time}
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      maxWidth: { xs: '150px', sm: 'none' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.patient}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {item.type}
                    </TableCell>
                    {item.urgency && (
                      <TableCell>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            backgroundColor: item.urgency === "Urgent" ? "#ffebee" : "#e8f5e8",
                            color: item.urgency === "Urgent" ? "#d32f2f" : "#2e7d32",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontWeight: 600
                          }}
                        >
                          {item.urgency}
                        </Typography>
                      </TableCell>
                    )}
                    {item.status && (
                      <TableCell>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            backgroundColor: "#e8f5e8",
                            color: "#2e7d32",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontWeight: 600
                          }}
                        >
                          {item.status}
                        </Typography>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
};

const StatCard = ({ title, value, isMobile, color }) => (
  <Card sx={{ 
    height: '100%',
    minHeight: { xs: '100px', sm: '120px' },
    borderLeft: `6px solid ${color}`,
    '&:hover': {
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)',
      transition: 'all 0.3s ease'
    }
  }}>
    <CardContent sx={{ 
      p: { xs: 2, sm: 3 },
      '&:last-child': { pb: { xs: 2, sm: 3 } },
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      height: '100%'
    }}>
      <Typography 
        variant={isMobile ? "subtitle2" : "subtitle1"}
        sx={{ 
          fontSize: { xs: '0.85rem', sm: '1rem' },
          lineHeight: 1.2,
          mb: 1,
          color: "#6c6b6b"
        }}
      >
        {title}
      </Typography>
      <Typography 
        variant={isMobile ? "h4" : "h3"}
        sx={{ 
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          fontWeight: 800,
          color: color
        }}
      >
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export default LabDashboard;



