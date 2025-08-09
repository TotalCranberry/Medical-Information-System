import React, { useState } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Grid, TextField,
  Button, InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const PatientsTab = ({ patients = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [filteredPatients, setFilteredPatients] = useState(patients);

  // Handle search functionality
  const handleSearch = () => {
    let filtered = patients;

    // Filter by search term (name)
    if (searchTerm.trim()) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by age
    if (ageFilter.trim()) {
      filtered = filtered.filter(patient =>
        patient.age.toString().includes(ageFilter)
      );
    }

    // Filter by faculty
    if (facultyFilter.trim()) {
      filtered = filtered.filter(patient =>
        patient.faculty.toLowerCase().includes(facultyFilter.toLowerCase())
      );
    }

    setFilteredPatients(filtered);
  };

  // Handle clear filters
  const handleClear = () => {
    setSearchTerm("");
    setAgeFilter("");
    setFacultyFilter("");
    setFilteredPatients(patients);
  };

  // Handle enter key press in search fields
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box>
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
        Patients
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        {/* Search Bar */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search Patient name"
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
              sx={{
                backgroundColor: "#45d27a",
                color: "#fff",
                fontWeight: 600,
                px: 4,
                py: 1.5,
                "&:hover": {
                  backgroundColor: "#3bc169",
                },
              }}
            >
              Search
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
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ mb: 1, color: "#6c6b6b" }}>
                Age
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter age"
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                onKeyPress={handleKeyPress}
                type="number"
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
              <Typography variant="body2" sx={{ mb: 1, color: "#6c6b6b" }}>
                Faculty
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter faculty"
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
              <Box sx={{ mt: { xs: 1, md: 3.5 } }}>
                <Button
                  variant="outlined"
                  onClick={handleClear}
                  sx={{
                    borderColor: "#6c6b6b",
                    color: "#6c6b6b",
                    fontWeight: 500,
                    "&:hover": {
                      borderColor: "#45d27a",
                      color: "#45d27a",
                    },
                  }}
                >
                  Clear Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Patients Table */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 700, color: "#0c3c3c" }}>
                  Name
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
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: "#6c6b6b" }}>
                    {patients.length === 0 ? "No patients found" : "No patients match your search criteria"}
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
                      {patient.name}
                    </TableCell>
                    <TableCell sx={{ color: "#6c6b6b" }}>
                      {patient.faculty}
                    </TableCell>
                    <TableCell sx={{ color: "#6c6b6b" }}>
                      {patient.age}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          // Handle view patient details
                          console.log("View patient:", patient);
                        }}
                        sx={{
                          backgroundColor: "#45d27a",
                          color: "#fff",
                          fontWeight: 500,
                          minWidth: "80px",
                          "&:hover": {
                            backgroundColor: "#3bc169",
                          },
                        }}
                      >
                        View
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