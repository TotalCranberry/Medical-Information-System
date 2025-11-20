import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  Snackbar,
  Alert,
  Avatar,
  Chip,
  IconButton,
  InputAdornment,
  Skeleton,
  Card,
  CardContent,
  Collapse,
  Divider
} from "@mui/material";

// Only keeping essential icons for functionality
import {
  Inventory as InventoryIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  AddCircleOutline as AddIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from "@mui/icons-material";

// API Functions
import {
  getAllMedicines,
  saveMedicine,
  searchMedicines,
  deleteMedicine
} from "../../api/medicine";

// --- Simple Color Configuration ---
const colors = {
  primary: "#0C3C3C",    // Dark Teal
  accent: "#45D27A",     // Bright Green
  gray: "#6C6B6B",
  white: "#ffffff",
  light: "#F8F9FA",
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  background: "#FAFBFC",
  border: "rgba(12, 60, 60, 0.12)"
};

// --- Styles ---
// Refactor Note: Removed linear-gradient backgrounds. Used solid white.
const cardStyle = {
  padding: "32px", // p: 4
  borderRadius: "24px",
  backgroundColor: colors.white,
  border: "1px solid " + colors.border,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
};

const UpdateInventoryPage = () => {
  // --- State Variables ---
  const [inventory, setInventory] = useState([]);
  const [mode, setMode] = useState("add"); // 'add' or 'update'
  
  // Search State
  const [searchFilter, setSearchFilter] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  
  // UI State
  const [snackbar, setSnackbar] = useState({ open: false, success: true, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(true);
  
  // Helper for tracking stock changes
  const [originalStock, setOriginalStock] = useState(0);

  // Form Data State
  const [formData, setFormData] = useState({
    generic: "",
    name: "",
    form: "",
    strength: "",
    stock: "",
    mfg: "",
    expiry: "",
    manufacturer: "",
    category: "",
    unitPrice: "",
    lowStockQuantity: ""
  });

  // --- 1. Load Inventory ---
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const data = await getAllMedicines();
      // Ensure we set an array
      if (Array.isArray(data)) {
        setInventory(data);
      } else {
        setInventory([]);
      }
    } catch (error) {
      console.error("Inventory load failed", error);
      setSnackbar({ open: true, success: false, message: "Failed to load inventory" });
    }
    // Small delay for smooth UX
    setTimeout(() => setIsLoading(false), 500);
  };

  // Load data on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // --- 2. Handlers ---

  const handleInputChange = (field, value) => {
    // Create a copy of the current form data and update the specific field
    const newFormData = { ...formData };
    newFormData[field] = value;
    setFormData(newFormData);
  };

  const handleSearch = async () => {
    try {
      // Refactor Note: Switched from .then() to async/await for clarity
      const results = await searchMedicines(searchTerm, searchFilter);

      if (results && results.length > 0) {
        // Found item: Switch to Update Mode
        setMode("update");
        const foundItem = results[0];
        
        setOriginalStock(foundItem.stock);
        
        // Fill form with found data, but clear stock input so user enters NEW quantity to add
        setFormData({ ...foundItem, stock: "" });
        setIsFormExpanded(true);
      } else {
        // Not found: Switch to Add Mode
        setMode("add");
        setOriginalStock(0);
        
        // Pre-fill the search term into the correct field
        const newForm = { ...formData };
        newForm[searchFilter] = searchTerm;
        setFormData(newForm);
        
        setIsFormExpanded(true);
      }
    } catch (error) {
      // Handle error case same as "Not Found"
      setMode("add");
      setOriginalStock(0);
      setIsFormExpanded(true);
      setSnackbar({ open: true, success: false, message: "Search failed or item not found." });
    }
  };

  const handleSubmit = async () => {
    // 1. Prepare Data
    let stockValue = 0;
    if (formData.stock !== "") {
      stockValue = parseInt(formData.stock, 10);
    }

    // Calculate final stock
    let finalStock = stockValue;
    if (mode === "update") {
      finalStock = originalStock + stockValue;
    }

    const payload = {
      ...formData,
      stock: finalStock,
      unitPrice: formData.unitPrice === "" ? 0 : parseFloat(formData.unitPrice),
      lowStockQuantity: formData.lowStockQuantity === "" ? null : formData.lowStockQuantity
    };

    // 2. Send to API
    try {
      await saveMedicine(payload);
      
      // 3. Success Actions
      fetchInventory();
      setSnackbar({
        open: true,
        success: true,
        message: mode === "add" ? "Medicine added successfully!" : "Stock updated successfully!"
      });
      
      // Reset Form
      handleCancel(); // Re-use cancel logic to clear form
      
    } catch (error) {
      setSnackbar({ open: true, success: false, message: "Operation failed!" });
    }
  };

  const handleCancel = () => {
    setFormData({
      generic: "",
      name: "",
      form: "",
      strength: "",
      stock: "",
      mfg: "",
      expiry: "",
      manufacturer: "",
      category: "",
      unitPrice: "",
      lowStockQuantity: ""
    });
    setSearchTerm("");
    setMode("add");
    setOriginalStock(0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;

    try {
      await deleteMedicine(id);
      // Update list locally to avoid full reload
      setInventory(prevList => prevList.filter(m => m.id !== id));
      setSnackbar({ open: true, success: true, message: "Medicine deleted successfully!" });
    } catch (error) {
      console.error("Delete error:", error);
      setSnackbar({ open: true, success: false, message: "Delete failed!" });
      fetchInventory(); // Reload from server to be safe
    }
  };

  // --- 3. Helpers ---

  const getStatusColor = (medicine) => {
    const current = new Date();
    
    // Check if medicine has expiry
    let expiryDate = null;
    if (medicine && medicine.expiry) {
      expiryDate = new Date(medicine.expiry);
    }

    // Calculate days until expiry
    let daysUntilExpiry = null;
    if (expiryDate) {
      const timeDiff = expiryDate.getTime() - current.getTime();
      daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    // Determine Low Stock Threshold
    let threshold = 50;
    if (medicine.lowStockQuantity) {
      threshold = parseInt(medicine.lowStockQuantity);
    }

    // Determine Status
    if (daysUntilExpiry !== null && daysUntilExpiry < 0) {
      return { bg: "#ffebee", color: "#c62828", tag: "Expired", tagColor: colors.error };
    }
    if (daysUntilExpiry !== null && daysUntilExpiry <= 30) {
      return { bg: "#fff3e0", color: "#f57c00", tag: "Near Expiry", tagColor: colors.warning };
    }
    if (medicine.stock < threshold) {
      return { bg: "#fff3cd", color: "#856404", tag: "Low Stock", tagColor: "#856404" };
    }

    // Default
    return { bg: "transparent", color: "inherit", tag: "OK", tagColor: colors.success };
  };

  // Labels for the form fields
  const getFieldLabel = (key) => {
    const labels = {
      generic: "Generic Name",
      name: "Brand Name",
      form: "Form",
      strength: "Strength",
      mfg: "Manufacturing Date",
      expiry: "Expiry Date",
      manufacturer: "Manufacturer",
      category: "Category",
      stock: "Stock Quantity",
      unitPrice: "Unit Price (Rs.)",
      lowStockQuantity: "Low Stock Threshold"
    };
    return labels[key] || key;
  };

  // Lists of fields to render
  const textFields = ["generic", "name", "form", "strength", "manufacturer", "category"];
  const dateFields = ["mfg", "expiry"];

  // --- 4. Render Loading State ---
  if (isLoading) {
    return (
      <Box sx={{ padding: 4, backgroundColor: colors.background, minHeight: "100vh" }}>
        <Skeleton variant="text" width={300} height={60} sx={{ marginBottom: 4 }} />
        <Paper elevation={2} sx={{ padding: 4, borderRadius: "24px" }}>
           <Skeleton variant="rectangular" height={300} />
        </Paper>
      </Box>
    );
  }

  // --- 5. Main Render ---
  return (
    <Box sx={{ padding: 4, maxWidth: "1400px", margin: "0 auto", backgroundColor: colors.background, minHeight: "100vh" }}>
      
      {/* Header */}
      <Box display="flex" alignItems="center" marginBottom={5}>
        <Avatar sx={{ bgcolor: colors.primary, marginRight: 2, width: 56, height: 56 }}>
          <InventoryIcon fontSize="large" />
        </Avatar>
        {/* Refactor Note: Removed gradient styling from typography */}
        <Typography variant="h3" sx={{ color: colors.primary, fontWeight: 800 }}>
          Update Inventory
        </Typography>
      </Box>

      {/* Add / Update Form Section */}
      <Paper elevation={2} sx={{ ...cardStyle, marginBottom: 4 }}>
        
        {/* Card Title / Toggle */}
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between" 
          sx={{ cursor: "pointer" }}
          onClick={() => setIsFormExpanded(!isFormExpanded)}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary, display: "flex", alignItems: "center" }}>
            {mode === "update" ? <EditIcon sx={{ marginRight: 1 }} /> : <AddIcon sx={{ marginRight: 1 }} />}
            {mode === "update" ? "Update Stock & Details" : "Add New Medicine"}
            
            <Chip 
              label={mode === "update" ? "Update Mode" : "Add Mode"}
              size="small"
              sx={{ 
                marginLeft: 2,
                bgcolor: mode === "update" ? colors.warning + "22" : colors.success + "22",
                color: mode === "update" ? colors.warning : colors.success,
                fontWeight: "bold"
              }}
            />
          </Typography>
          <IconButton>
            {isFormExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        <Collapse in={isFormExpanded}>
          <Divider sx={{ marginY: 3 }} />
          
          {/* Search within Form */}
          <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 4 }}>
             <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Search By"
                  value={searchFilter}
                  onChange={(e) => { setSearchFilter(e.target.value); setSearchTerm(""); }}
                >
                   <MenuItem value="name">Brand Name</MenuItem>
                   <MenuItem value="generic">Generic Name</MenuItem>
                   <MenuItem value="manufacturer">Manufacturer</MenuItem>
                </TextField>
             </Grid>
             <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Search Medicine"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={() => handleSearch()}>
                        <SearchIcon />
                      </IconButton>
                    )
                  }}
                />
             </Grid>
             <Grid item xs={12} md={3}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={handleSearch}
                  sx={{ backgroundColor: colors.accent, color: "#fff", height: "56px" }}
                >
                  Search
                </Button>
             </Grid>
          </Grid>

          <Divider sx={{ marginY: 3 }} />

          {/* Form Fields */}
          <Grid container spacing={3}>
            
            {/* Text Fields */}
            {textFields.map((field) => (
              <Grid item xs={12} sm={6} md={4} key={field}>
                <TextField
                  fullWidth
                  label={getFieldLabel(field)}
                  value={formData[field]}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  // In Update mode, disable fields that shouldn't change easily, except for specific ones
                  disabled={mode === "update"}
                  sx={{
                    "& .Mui-disabled": { backgroundColor: "rgba(0,0,0,0.04)" }
                  }}
                />
              </Grid>
            ))}

            {/* Date Fields */}
            {dateFields.map((field) => (
              <Grid item xs={12} sm={6} md={4} key={field}>
                <TextField
                  fullWidth
                  label={getFieldLabel(field)}
                  type="date"
                  value={formData[field]}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            ))}

            {/* Stock & Price */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label={mode === "update" ? "Quantity to Add" : "Stock Quantity"}
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Unit Price (Rs.)"
                type="number"
                inputProps={{ step: "0.01", min: 0 }}
                value={formData.unitPrice}
                onChange={(e) => handleInputChange("unitPrice", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Low Stock Threshold"
                type="number"
                inputProps={{ min: 0 }}
                value={formData.lowStockQuantity}
                onChange={(e) => handleInputChange("lowStockQuantity", e.target.value)}
              />
            </Grid>

          </Grid>

          {/* Action Buttons */}
          <Box sx={{ marginTop: 4, display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              size="large"
              startIcon={mode === "update" ? <EditIcon /> : <AddIcon />}
              sx={{ backgroundColor: colors.primary, color: "#fff", paddingX: 4 }}
            >
              {mode === "update" ? "Update Medicine" : "Add Medicine"}
            </Button>

            <Button
              variant="outlined"
              onClick={handleCancel}
              size="large"
              startIcon={<ClearIcon />}
              sx={{ borderColor: colors.gray, color: colors.gray, paddingX: 4 }}
            >
              Clear Form
            </Button>
          </Box>

        </Collapse>
      </Paper>

      {/* Inventory Table Section */}
      <Paper elevation={4} sx={{ borderRadius: "24px", overflow: "hidden" }}>
        <Box sx={{ padding: 3, borderBottom: "1px solid #eee" }}>
          <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 700 }}>
             Current Inventory ({inventory.length} items)
          </Typography>
        </Box>

        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead sx={{ backgroundColor: colors.light }}>
              <TableRow>
                <TableCell><b>Generic</b></TableCell>
                <TableCell><b>Brand Name</b></TableCell>
                <TableCell><b>Form</b></TableCell>
                <TableCell><b>Strength</b></TableCell>
                <TableCell align="center"><b>Stock</b></TableCell>
                <TableCell><b>Price</b></TableCell>
                <TableCell><b>Expiry</b></TableCell>
                <TableCell align="center"><b>Action</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {inventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ padding: 6 }}>
                    <Typography color={colors.gray}>No medicines found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                inventory.map((medicine) => {
                  const status = getStatusColor(medicine);
                  const price = medicine.unitPrice ? `Rs. ${parseFloat(medicine.unitPrice).toFixed(2)}` : "-";

                  return (
                    <TableRow 
                      key={medicine.id} 
                      sx={{ backgroundColor: status.bg, "&:hover": { backgroundColor: status.bg === "transparent" ? "#f9f9f9" : status.bg } }}
                    >
                      <TableCell sx={{ color: status.color, fontWeight: "bold" }}>{medicine.generic || "-"}</TableCell>
                      <TableCell sx={{ color: status.color }}>{medicine.name}</TableCell>
                      <TableCell>{medicine.form}</TableCell>
                      <TableCell>{medicine.strength}</TableCell>
                      
                      <TableCell align="center">
                         <Chip 
                           label={`${medicine.stock} units`} 
                           size="small"
                           sx={{ 
                             bgcolor: medicine.stock < 50 ? colors.warning + "22" : colors.success + "22",
                             color: medicine.stock < 50 ? colors.warning : colors.success,
                             fontWeight: "bold"
                           }}
                         />
                      </TableCell>
                      
                      <TableCell>{price}</TableCell>
                      
                      <TableCell>
                        <Box display="flex" alignItems="center">
                           {status.tag !== "OK" && (
                             <Chip 
                               label={status.tag} 
                               size="small" 
                               sx={{ marginRight: 1, bgcolor: status.tagColor + "22", color: status.tagColor, fontWeight: "bold" }} 
                             />
                           )}
                           {medicine.expiry}
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(medicine.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.success ? "success" : "error"} 
          sx={{ borderRadius: "12px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default UpdateInventoryPage;