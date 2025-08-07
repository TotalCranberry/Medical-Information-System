import React, { useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent,
  ButtonGroup, Button, Table, TableHead, TableRow, TableCell, TableBody,
  useTheme, useMediaQuery, Stack, Paper, Chip, IconButton
} from "@mui/material";
import { Visibility, Download, Edit } from "@mui/icons-material";

const LabTests = () => {
  const [filter, setFilter] = useState("ordered");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const stats = {
    ordered: 12,
    inProgress: 10,
    completed: 2,
    declined: 1,
  };

  // Enhanced patient data with more details
  const allPatients = {
    ordered: [
      { 
        id: 1,
        name: "A.B.C. Dasanayaka", 
        age: 44, 
        gender: "Male", 
        testType: "Blood Test",
        orderDate: "2024-01-15",
        urgency: "Routine",
        total: 1 
      },
      { 
        id: 2,
        name: "B.C.D. Ekanayake", 
        age: 22, 
        gender: "Female", 
        testType: "Urine Analysis",
        orderDate: "2024-01-15",
        urgency: "Urgent",
        total: 2 
      },
      { 
        id: 3,
        name: "C.D.E. Fernando", 
        age: 35, 
        gender: "Male", 
        testType: "X-Ray",
        orderDate: "2024-01-14",
        urgency: "Routine",
        total: 1 
      }
    ],
    inProgress: [
      { 
        id: 4,
        name: "D.E.F. Silva", 
        age: 28, 
        gender: "Female", 
        testType: "CBC",
        orderDate: "2024-01-14",
        progress: "Sample Processing",
        total: 1 
      },
      { 
        id: 5,
        name: "E.F.G. Perera", 
        age: 55, 
        gender: "Male", 
        testType: "Lipid Profile",
        orderDate: "2024-01-13",
        progress: "Analysis Complete",
        total: 3 
      }
    ],
    completed: [
      { 
        id: 6,
        name: "F.G.H. Rajapaksa", 
        age: 40, 
        gender: "Male", 
        testType: "Liver Function",
        orderDate: "2024-01-12",
        completedDate: "2024-01-13",
        total: 1 
      }
    ],
    declined: [
      { 
        id: 7,
        name: "G.H.I. Wickramasinghe", 
        age: 33, 
        gender: "Female", 
        testType: "Thyroid Panel",
        orderDate: "2024-01-11",
        reason: "Insufficient Sample",
        total: 1 
      }
    ]
  };

  const filterButtons = [
    { key: "ordered", label: "Test Ordered", color: "#2196f3" },
    { key: "inProgress", label: "In Progress", color: "#ff9800" },
    { key: "completed", label: "Completed", color: "#4caf50" },
    { key: "declined", label: "Declined Tests", color: "#f44336" }
  ];

  const getCurrentPatients = () => allPatients[filter] || [];

  const getUrgencyColor = (urgency) => {
    return urgency === "Urgent" 
      ? { bg: "#ffebee", color: "#d32f2f" }
      : { bg: "#e3f2fd", color: "#1976d2" };
  };

  const getProgressColor = (progress) => {
    switch(progress) {
      case "Sample Processing": return { bg: "#fff3e0", color: "#f57c00" };
      case "Analysis Complete": return { bg: "#e8f5e8", color: "#2e7d32" };
      default: return { bg: "#f5f5f5", color: "#666" };
    }
  };

  return (
    <Box sx={{ 
      maxWidth: { xs: '100%', sm: '100%', md: 1100 }, 
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
        Lab Tests Management
      </Typography>

      {/* Stats Cards - Responsive Grid */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard 
            title="Test Ordered" 
            value={stats.ordered} 
            isMobile={isMobile} 
            color="#2196f3"
            isActive={filter === "ordered"}
            onClick={() => setFilter("ordered")}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard 
            title="In Progress" 
            value={stats.inProgress} 
            isMobile={isMobile} 
            color="#ff9800"
            isActive={filter === "inProgress"}
            onClick={() => setFilter("inProgress")}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard 
            title="Completed" 
            value={stats.completed} 
            isMobile={isMobile} 
            color="#4caf50"
            isActive={filter === "completed"}
            onClick={() => setFilter("completed")}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={3}>
          <StatCard 
            title="Declined" 
            value={stats.declined} 
            isMobile={isMobile} 
            color="#f44336"
            isActive={filter === "declined"}
            onClick={() => setFilter("declined")}
          />
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
                borderColor: btn.color,
                color: filter === btn.key ? "white" : btn.color,
                backgroundColor: filter === btn.key ? btn.color : "transparent",
                '&:hover': {
                  backgroundColor: filter === btn.key ? btn.color : `${btn.color}10`
                }
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
              minWidth: { xs: '120px', sm: '140px' }
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
                borderColor: btn.color,
                color: filter === btn.key ? "white" : btn.color,
                backgroundColor: filter === btn.key ? btn.color : "transparent",
                '&:hover': {
                  backgroundColor: filter === btn.key ? btn.color : `${btn.color}10`
                }
              }}
            >
              {btn.label}
            </Button>
          ))}
        </ButtonGroup>
      )}

      {/* Enhanced Table */}
      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 3, backgroundColor: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
          <Typography variant="h6" fontWeight={600} sx={{ color: "#0c3c3c" }}>
            {filterButtons.find(btn => btn.key === filter)?.label} ({getCurrentPatients().length})
          </Typography>
        </Box>
        
        <Box sx={{ 
          overflowX: 'auto',
          '& .MuiTable-root': {
            minWidth: { xs: 600, sm: 800 }
          }
        }}>
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f7fa" }}>
                <TableCell sx={{ fontWeight: 'bold', color: "#0c3c3c" }}>Patient</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: "#0c3c3c" }}>Age/Gender</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: "#0c3c3c" }}>Test Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: "#0c3c3c" }}>Order Date</TableCell>
                {filter === "ordered" && (
                  <TableCell sx={{ fontWeight: 'bold', color: "#0c3c3c" }}>Urgency</TableCell>
                )}
                {filter === "inProgress" && (
                  <TableCell sx={{ fontWeight: 'bold', color: "#0c3c3c" }}>Progress</TableCell>
                )}
                {filter === "completed" && (
                  <TableCell sx={{ fontWeight: 'bold', color: "#0c3c3c" }}>Completed</TableCell>
                )}
                {filter === "declined" && (
                  <TableCell sx={{ fontWeight: 'bold', color: "#0c3c3c" }}>Reason</TableCell>
                )}
                <TableCell sx={{ fontWeight: 'bold', color: "#0c3c3c" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getCurrentPatients().length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={7} 
                    align="center"
                    sx={{ py: 6, color: "#6c6b6b", fontStyle: "italic" }}
                  >
                    No records found for {filterButtons.find(btn => btn.key === filter)?.label.toLowerCase()}
                  </TableCell>
                </TableRow>
              ) : (
                getCurrentPatients().map((patient) => (
                  <TableRow key={patient.id} sx={{ '&:hover': { backgroundColor: "#f9f9f9" } }}>
                    <TableCell sx={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      maxWidth: { xs: '150px', sm: 'none' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: 600
                    }}>
                      {patient.name}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      <Box>
                        <Typography variant="body2">{patient.age} yrs</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {patient.gender}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {patient.testType}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {patient.orderDate}
                    </TableCell>
                    
                    {/* Conditional columns based on filter */}
                    {filter === "ordered" && patient.urgency && (
                      <TableCell>
                        <Chip 
                          label={patient.urgency}
                          size="small"
                          sx={{
                            backgroundColor: getUrgencyColor(patient.urgency).bg,
                            color: getUrgencyColor(patient.urgency).color,
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                    )}
                    
                    {filter === "inProgress" && patient.progress && (
                      <TableCell>
                        <Chip 
                          label={patient.progress}
                          size="small"
                          sx={{
                            backgroundColor: getProgressColor(patient.progress).bg,
                            color: getProgressColor(patient.progress).color,
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                    )}
                    
                    {filter === "completed" && patient.completedDate && (
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {patient.completedDate}
                      </TableCell>
                    )}
                    
                    {filter === "declined" && patient.reason && (
                      <TableCell>
                        <Chip 
                          label={patient.reason}
                          size="small"
                          sx={{
                            backgroundColor: "#ffebee",
                            color: "#d32f2f",
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                    )}
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton 
                          size="small" 
                          sx={{ color: "#2196f3" }}
                          title="View Details"
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        {filter === "completed" && (
                          <IconButton 
                            size="small" 
                            sx={{ color: "#4caf50" }}
                            title="Download Report"
                          >
                            <Download fontSize="small" />
                          </IconButton>
                        )}
                        {filter === "ordered" && (
                          <IconButton 
                            size="small" 
                            sx={{ color: "#ff9800" }}
                            title="Edit Order"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
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

const StatCard = ({ title, value, isMobile, color, isActive, onClick }) => (
  <Card sx={{ 
    height: '100%',
    minHeight: { xs: '100px', sm: '120px' },
    borderLeft: `6px solid ${color}`,
    cursor: 'pointer',
    border: isActive ? `2px solid ${color}` : '1px solid #e0e0e0',
    backgroundColor: isActive ? `${color}08` : 'white',
    '&:hover': {
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)',
      transition: 'all 0.3s ease',
      backgroundColor: `${color}05`
    }
  }}
  onClick={onClick}
  >
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
          color: "#6c6b6b",
          fontWeight: 600
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

export default LabTests;
