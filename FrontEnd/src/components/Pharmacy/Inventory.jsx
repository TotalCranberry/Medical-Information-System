import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  MenuItem,
  Chip,
  Avatar,
  InputAdornment,
  IconButton,
  Card,
  CardContent
} from "@mui/material";

// Cleaned up icon imports to only use necessary ones
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  LocalPharmacy as PharmacyIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon
} from "@mui/icons-material";

// API Function
import { getAllMedicines } from "../../api/medicine";

// --- Simple Color Configuration ---
const colors = {
  primary: "#0C3C3C",    // Dark Teal
  accent: "#45D27A",     // Bright Green
  gray: "#6C6B6B",
  white: "#ffffff",
  lightGray: "#F8F9FA",
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  background: "#FAFBFC"
};

const InventoryPage = () => {
  // --- State Variables ---
  const [medicines, setMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter State
  const [searchMethod, setSearchMethod] = useState("generic");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(null);

  // --- 1. Load Data from API ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await getAllMedicines();
        
        // Safety check: ensure data is an array
        if (Array.isArray(data)) {
          setMedicines(data);
        } else {
          setMedicines([]);
        }
      } catch (error) {
        console.error("Error loading inventory:", error);
      }
      
      // Small delay to prevent flickering
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    loadData();
  }, []);

  // --- 2. Helper Functions for Status Checks ---

  // Check if a medicine is expired
  const checkExpired = (medicine) => {
    if (!medicine.expiry) return false;
    const today = new Date();
    const expiryDate = new Date(medicine.expiry);
    return expiryDate < today;
  };

  // Check if a medicine expires within 30 days
  const checkNearExpiry = (medicine) => {
    if (!medicine.expiry) return false;
    const today = new Date();
    const expiryDate = new Date(medicine.expiry);
    
    // Calculate difference in days
    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Return true if it's in the future but less than 30 days away
    return daysDiff >= 0 && daysDiff <= 30;
  };

  // Check if stock is low
  const checkLowStock = (medicine) => {
    // Use the medicine's specific threshold, or default to 50
    let threshold = 50;
    if (medicine.lowStockQuantity) {
      threshold = parseInt(medicine.lowStockQuantity);
    }
    return medicine.stock < threshold;
  };

  // Check if medicine is in good standing
  const checkNormal = (medicine) => {
    const isBad = checkExpired(medicine) || checkNearExpiry(medicine) || checkLowStock(medicine);
    return !isBad;
  };

  // Get row colors based on status
  const getRowStyle = (medicine) => {
    if (checkExpired(medicine)) {
      return { bg: "#ffebee", color: colors.error };
    }
    if (checkNearExpiry(medicine)) {
      return { bg: "#fff3e0", color: colors.warning };
    }
    if (checkLowStock(medicine)) {
      return { bg: "#fff3cd", color: "#856404" }; // Dark yellow text
    }
    // Default
    return { bg: "transparent", color: "inherit" };
  };

  // --- 3. Filtering Logic ---
  
  const filteredMedicines = medicines.filter((med) => {
    // Step 1: Check Search Term
    let matchesSearch = true;
    if (searchTerm) {
      // Get the value to search (e.g., generic name, brand name)
      const value = (med[searchMethod] || "").toString().toLowerCase();
      if (!value.includes(searchTerm.toLowerCase())) {
        matchesSearch = false;
      }
    }

    // Step 2: Check Status Filter (the boxes at the top)
    let matchesFilter = true;
    if (selectedFilter) {
      if (selectedFilter === "expired" && !checkExpired(med)) matchesFilter = false;
      else if (selectedFilter === "near-expiry" && !checkNearExpiry(med)) matchesFilter = false;
      else if (selectedFilter === "low-stock" && !checkLowStock(med)) matchesFilter = false;
      else if (selectedFilter === "normal" && !checkNormal(med)) matchesFilter = false;
    }

    return matchesSearch && matchesFilter;
  });

  // --- 4. Statistics for Cards ---
  const stats = {
    total: medicines.length,
    expired: medicines.filter(checkExpired).length,
    nearExpiry: medicines.filter(checkNearExpiry).length,
    lowStock: medicines.filter(checkLowStock).length,
    normal: medicines.filter(checkNormal).length
  };

  // Data for the top summary cards
  const statusCards = [
    { id: "expired", label: "Expired", count: stats.expired, color: colors.error, icon: ErrorIcon, bg: "#ffebee" },
    { id: "near-expiry", label: "Near Expiry", count: stats.nearExpiry, color: colors.warning, icon: WarningIcon, bg: "#fff3e0" },
    { id: "low-stock", label: "Low Stock", count: stats.lowStock, color: "#856404", icon: TrendingUpIcon, bg: "#fff3cd" },
    { id: "normal", label: "Normal Stock", count: stats.normal, color: colors.success, icon: CheckCircleIcon, bg: "#e8f5e8" },
    { id: null, label: "Show All", count: stats.total, color: colors.primary, icon: InventoryIcon, bg: "#f3f4f6" }
  ];

  const searchOptions = [
    { value: "generic", label: "Generic Name" },
    { value: "name", label: "Brand Name" },
    { value: "category", label: "Category" },
  ];

  // --- 5. Render Loading State ---
  if (isLoading) {
    return (
      <Box sx={{ padding: 4, backgroundColor: colors.background, minHeight: "100vh" }}>
        <Typography variant="h5" color={colors.gray}>Loading inventory...</Typography>
      </Box>
    );
  }

  // --- 6. Main Render ---
  return (
    <Box sx={{ padding: 4, backgroundColor: colors.background, minHeight: "100vh" }}>
      
      {/* Header */}
      <Box display="flex" alignItems="center" marginBottom={4}>
        <Avatar sx={{ bgcolor: colors.primary, marginRight: 2, width: 56, height: 56 }}>
          <InventoryIcon fontSize="large" />
        </Avatar>
        
        {/* Refactor Note: Removed linear-gradient styling. Used solid color. */}
        <Typography variant="h3" sx={{ color: colors.primary, fontWeight: 800 }}>
          Inventory Management
        </Typography>
      </Box>

      {/* Search Section */}
      {/* Refactor Note: Removed gradient background. */}
      <Paper 
        elevation={2} 
        sx={{ 
          padding: 4, 
          marginBottom: 4, 
          borderRadius: "20px",
          backgroundColor: colors.white,
          border: "1px solid rgba(0,0,0,0.05)"
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 600, color: colors.primary }}>
          Search Medicine
        </Typography>
        
        <Grid container spacing={3}>
          {/* Dropdown */}
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Search By"
              value={searchMethod}
              onChange={(e) => {
                setSearchMethod(e.target.value);
                setSearchTerm(""); // Reset search text when changing method
              }}
              variant="outlined"
            >
              {searchOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Text Input */}
          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              label="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: colors.gray }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchTerm("")}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Statistics / Filter Cards */}
      <Grid container spacing={3} marginBottom={4}>
        {statusCards.map((card) => (
          <Grid item xs={12} sm={6} md={2.4} key={card.label}>
            <Card
              sx={{
                borderRadius: "20px",
                cursor: "pointer",
                border: selectedFilter === card.id ? ("3px solid " + card.color) : "1px solid transparent",
                backgroundColor: card.bg,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
              onClick={() => {
                // Toggle filter: if clicking the same one, turn it off (show all)
                if (selectedFilter === card.id) setSelectedFilter(null);
                else setSelectedFilter(card.id);
              }}
            >
              <CardContent sx={{ textAlign: "center", padding: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: colors.white, 
                    color: card.color, 
                    width: 40, 
                    height: 40, 
                    margin: "0 auto", 
                    marginBottom: 1 
                  }}
                >
                  <card.icon fontSize="small" />
                </Avatar>
                
                <Typography variant="h4" sx={{ fontWeight: 800, color: card.color }}>
                  {card.count}
                </Typography>
                
                <Typography variant="body2" sx={{ color: colors.primary, fontWeight: 600 }}>
                  {card.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Data Table */}
      <Paper 
        elevation={4} 
        sx={{ 
          borderRadius: "24px", 
          overflow: "hidden", 
          border: "1px solid #eee",
          backgroundColor: colors.white 
        }}
      >
        <Box sx={{ padding: 3, borderBottom: "1px solid #eee" }}>
          <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600, display: "flex", alignItems: "center" }}>
            <PharmacyIcon sx={{ marginRight: 1 }} />
            Available Medicines ({filteredMedicines.length})
          </Typography>
        </Box>
        
        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 1100 }}>
            <TableHead sx={{ backgroundColor: colors.lightGray }}>
              <TableRow>
                <TableCell><b>Generic Name</b></TableCell>
                <TableCell><b>Brand Name</b></TableCell>
                <TableCell align="center"><b>Form</b></TableCell>
                <TableCell align="center"><b>Strength</b></TableCell>
                <TableCell align="center"><b>Stock</b></TableCell>
                <TableCell align="center"><b>Price (Rs.)</b></TableCell>
                <TableCell align="center"><b>Expiry Date</b></TableCell>
                <TableCell align="center"><b>Category</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredMedicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ padding: 6 }}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <Avatar sx={{ bgcolor: colors.lightGray, color: colors.gray, marginBottom: 2 }}>
                        <InventoryIcon />
                      </Avatar>
                      <Typography variant="h6" color={colors.gray}>
                        No matching medicines found
                      </Typography>
                      <Typography variant="body2" color={colors.gray}>
                        Try adjusting your search.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMedicines.map((med, index) => {
                  const style = getRowStyle(med);
                  return (
                    <TableRow 
                      key={index} 
                      sx={{ 
                        backgroundColor: style.bg,
                        "&:hover": { backgroundColor: style.bg === "transparent" ? "#f5f5f5" : style.bg }
                      }}
                    >
                      <TableCell sx={{ color: style.color, fontWeight: "bold" }}>
                        {med.generic}
                      </TableCell>
                      <TableCell sx={{ color: style.color }}>
                        {med.name}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={med.form} size="small" sx={{ bgcolor: colors.primary + "20", color: colors.primary }} />
                      </TableCell>
                      <TableCell align="center">{med.strength}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={med.stock + " units"} 
                          size="small" 
                          sx={{ 
                            bgcolor: med.stock < 50 ? colors.warning + "20" : colors.success + "20",
                            color: med.stock < 50 ? colors.warning : colors.success,
                            fontWeight: "bold"
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {med.unitPrice ? parseFloat(med.unitPrice).toFixed(2) : "-"}
                      </TableCell>
                      <TableCell align="center" sx={{ color: style.color, fontWeight: "bold" }}>
                        {med.expiry}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={med.category} size="small" sx={{ bgcolor: colors.accent + "20", color: colors.accent }} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
};

export default InventoryPage;