import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Grid, TextField,
  Button, InputAdornment, CircularProgress, Alert, Chip
} from "@mui/material";
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Visibility as ViewIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";
import { useNavigate } from 'react-router-dom';
import { fetchAllPatients } from "../../api/patients";

const PatientsTab = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [allPatients, setAllPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    loadAllPatients();
  }, []);

  const loadAllPatients = async () => {
    try {
      setLoading(true);
      const patientsData = await fetchAllPatients();
      setAllPatients(patientsData);
      setFilteredPatients(patientsData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error loading patients:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search functionality
  const handleSearch = () => {
    let filtered = allPatients;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(patient =>
        (patient.name && patient.name.toLowerCase().includes(term)) ||
        (patient.registrationNumber && patient.registrationNumber.toLowerCase().includes(term))
      );
    }
    // -----------------------------------------------------------

    // Filter by faculty
    if (facultyFilter.trim()) {
      filtered = filtered.filter(patient =>
        patient.faculty && patient.faculty.toLowerCase().includes(facultyFilter.toLowerCase())
      );
    }

    setFilteredPatients(filtered);
    setSearchPerformed(true);
  };

  // Handle clear filters
  const handleClear = () => {
    setSearchTerm("");
    setFacultyFilter("");
    setFilteredPatients(allPatients);
    setSearchPerformed(false);
  };

  // Handle enter key press in search fields
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleViewPatientProfile = (patient) => {
    navigate(`/doctor/patients/${patient.id}`, {
      state: { 
        patient: patient
      }
    });
  };

  const getRoleChipColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'student':
        return 'primary';
      case 'staff':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatAge = (age) => {
    if (age === null || age === undefined) return 'N/A';
    return `${age} years`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} sx={{ color: "#45d27a" }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Back Button */}
      <Box display="flex" alignItems="center" mb={1}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/doctor/dashboard')}
          sx={{ mr: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: "#0c3c3c",
          fontWeight: 700,
          mb: { xs: 2, md: 4 },
          ml: { xs: 0, md: 2 },
          textAlign: { xs: "center", md: "left" }
        }}
      >
        Find Patients
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        {/* Search Bar */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search by name or registration number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#6c6b6b" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f8f9fa',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#45d27a',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#45d27a',
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              onClick={handleSearch}
              fullWidth
              sx={{
                backgroundColor: "#45d27a",
                color: "#fff",
                fontWeight: 600,
                py: 1.5,
                "&:hover": {
                  backgroundColor: "#3bc169",
                },
              }}
            >
              Search Patients
            </Button>
          </Grid>
        </Grid>

        {/* Search Filters */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{
              color: "#0c3c3c",
              fontWeight: 600,
              mb: 2
            }}
          >
            Search Filters
          </Typography>
          <Grid container spacing={2} alignItems="end">
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2" sx={{ mb: 1, color: "#6c6b6b" }}>
                Faculty
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter faculty name"
                value={facultyFilter}
                onChange={(e) => setFacultyFilter(e.target.value)}
                onKeyPress={handleKeyPress}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8f9fa',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#45d27a',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#45d27a',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                onClick={handleClear}
                sx={{
                  borderColor: "#6c6b6b",
                  color: "#6c6b6b",
                  fontWeight: 500,
                  height: "56px",
                  "&:hover": {
                    borderColor: "#45d27a",
                    color: "#45d27a",
                  },
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Patients Table */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <PersonIcon sx={{ fontSize: 30, color: "#45d27a", mr: 1 }} />
          <Typography variant="h6" sx={{ color: "#0c3c3c", fontWeight: 600 }}>
            {searchPerformed 
              ? `Search Results (${filteredPatients.length} found)` 
              : `All Patients (${filteredPatients.length})`
            }
          </Typography>
        </Box>

        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 700, color: "#0c3c3c" }}>
                  Name
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0c3c3c" }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0c3c3c" }}>
                  Role
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0c3c3c" }}>
                  Faculty
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0c3c3c" }}>
                  Age
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0c3c3c" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: "#6c6b6b" }}>
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: "#45d27a" }} />
                    ) : searchPerformed ? (
                      "No patients match your search criteria"
                    ) : (
                      "No patients found in the system"
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient, index) => (
                  <TableRow 
                    key={patient.id || index} 
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f8f9fa',
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {patient.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "#6c6b6b" }}>
                      <Typography variant="body2">
                        {patient.email || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={patient.role}
                        color={getRoleChipColor(patient.role)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ color: "#6c6b6b" }}>
                      <Typography variant="body2">
                        {patient.faculty || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "#6c6b6b" }}>
                      <Typography variant="body2">
                        {formatAge(patient.age)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewPatientProfile(patient)}
                        sx={{
                          backgroundColor: "#45d27a",
                          color: "#fff",
                          fontWeight: 500,
                          "&:hover": {
                            backgroundColor: "#3bc169",
                          },
                        }}
                      >
                        View Profile
                      </Button>
                    </TableCell>
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

export default PatientsTab;