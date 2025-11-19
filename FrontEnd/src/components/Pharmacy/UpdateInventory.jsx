import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, TextField, Button, Grid,
  Table, TableHead, TableRow, TableCell, TableBody, MenuItem, Snackbar, Alert,
  Avatar, Chip, IconButton, InputAdornment, Fade, Grow, Skeleton, Card, CardContent,
  Collapse, Divider
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  AddCircleOutline as AddIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  LocalPharmacy as PharmacyIcon,
  Category as CategoryIcon,
  PriceChange as PriceIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon
} from "@mui/icons-material";
import {
  getAllMedicines,
  saveMedicine,
  searchMedicines,
  deleteMedicine
} from "../../api/medicine";
import apiFetch from "../../api/api";

/** ---------- THEME & STYLES ---------- */
const THEME = {
  primary: "#0C3C3C",
  accent:  "#45D27A",
  gray:    "#6C6B6B",
  white:   "#ffffff",
  light:   "#F8F9FA",
  success: "#4CAF50",
  warning: "#FF9800",
  error:   "#F44336",
  bg:      "#FAFBFC",
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "16px",
    backgroundColor: THEME.white,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 2px 8px rgba(12, 60, 60, 0.08)",
    "&:hover": {
      boxShadow: "0 4px 16px rgba(12, 60, 60, 0.12)",
      transform: "translateY(-1px)",
    },
    "&.Mui-focused": {
      boxShadow: "0 6px 20px rgba(69, 210, 122, 0.2)",
      transform: "translateY(-2px)",
    }
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(12, 60, 60, 0.2)",
    borderWidth: 1,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: THEME.primary,
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: THEME.accent,
    borderWidth: 2,
  },
  "& .MuiInputLabel-root": {
    color: THEME.gray,
    "&.Mui-focused": { color: THEME.primary },
  },
};

const cardSx = {
  p: 4,
  borderRadius: "24px",
  background: `linear-gradient(135deg, ${THEME.white} 0%, #f8fffe 100%)`,
  border: `1px solid rgba(69, 210, 122, 0.12)`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 18px 40px rgba(12, 60, 60, 0.15)",
  },
};

const actionButtonSx = (variant = "primary") => ({
  borderRadius: "14px",
  textTransform: "none",
  fontWeight: 700,
  px: 3.5,
  py: 1.2,
  letterSpacing: 0.2,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
    transition: "left 0.5s ease-in-out",
  },
  "&:hover::before": {
    left: "100%",
  },
  ...(variant === "primary" && {
    borderColor: THEME.accent,
    color: THEME.accent,
    "&:hover": {
      backgroundColor: THEME.accent,
      color: "#fff",
      transform: "translateY(-2px)",
      boxShadow: "0 10px 28px rgba(69, 210, 122, 0.35)",
    }
  }),
  ...(variant === "secondary" && {
    borderColor: THEME.primary,
    color: THEME.primary,
    "&:hover": {
      backgroundColor: THEME.primary,
      color: "#fff",
      transform: "translateY(-2px)",
      boxShadow: "0 10px 28px rgba(12, 60, 60, 0.35)",
    }
  }),
  ...(variant === "danger" && {
    borderColor: THEME.error,
    color: THEME.error,
    "&:hover": {
      backgroundColor: THEME.error,
      color: "#fff",
      transform: "translateY(-2px)",
      boxShadow: "0 10px 28px rgba(244, 67, 54, 0.35)",
    }
  })
});

const tableRowSx = (rowStyle) => ({
  backgroundColor: rowStyle.bg,
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    backgroundColor: rowStyle.bg === "transparent" ? "rgba(69, 210, 122, 0.04)" : rowStyle.bg,
    transform: "scale(1.01)",
    "& .MuiTableCell-root": { borderColor: "rgba(69, 210, 122, 0.2)" }
  },
  "&:nth-of-type(even)": { 
    backgroundColor: rowStyle.bg === "transparent" ? "rgba(12, 60, 60, 0.02)" : rowStyle.bg 
  }
});

/** ---------- COMPONENT ---------- */
const UpdateInventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [mode, setMode] = useState("add");
  const [searchFilter, setSearchFilter] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, success: true, message: "" });
  const [loading, setLoading] = useState(false);
  const [formExpanded, setFormExpanded] = useState(true);
  const [originalStock, setOriginalStock] = useState(0);

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

  /** Load inventory */
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await getAllMedicines();
      setInventory(data || []);
      setTimeout(() => setLoading(false), 500);
    } catch (err) {
      console.error("Inventory load failed", err);
      setSnackbar({ open: true, success: false, message: "Failed to load inventory" });
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /** Search */
  const handleSearch = () => {
    searchMedicines(searchTerm, searchFilter)
      .then((res) => {
        if (res && res.length > 0) {
          setMode("update");
          setOriginalStock(res[0].stock);
          setFormData({ ...res[0], stock: "" });
          setFormExpanded(true);
        } else {
          setMode("add");
          setOriginalStock(0);
          setFormData(prev => ({ ...prev, [searchFilter]: searchTerm }));
          setFormExpanded(true);
        }
      })
      .catch(() => {
        setMode("add");
        setOriginalStock(0);
        setFormData(prev => ({ ...prev, [searchFilter]: searchTerm }));
        setFormExpanded(true);
        setSnackbar({ open: true, success: false, message: "Search failed." });
      });
  };

  /** Submit add/update */
  const handleSubmit = () => {
    const stockValue = formData.stock === "" ? 0 : parseInt(formData.stock, 10);
    const payload = {
      ...formData,
      stock: mode === "update" ? originalStock + stockValue : stockValue,
      unitPrice: formData.unitPrice === "" ? 0 : parseFloat(formData.unitPrice),
      lowStockQuantity: formData.lowStockQuantity === "" ? null : formData.lowStockQuantity
    };

    saveMedicine(payload)
      .then(() => {
        fetchInventory();
        setSnackbar({
          open: true,
          success: true,
          message: mode === "add" ? "Medicine added successfully!" : "Stock updated successfully!"
        });
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
          unitPrice: ""
        });
        setSearchTerm("");
        setMode("add");
      })
      .catch(() => {
        setSnackbar({ open: true, success: false, message: "Operation failed!" });
      });
  };

  /** Cancel/reset */
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
    setSnackbar({ open: true, success: true, message: "Form cleared. Ready to add new medicine!" });
  };

  /** Delete */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;
    try {
      await deleteMedicine(id);
      setInventory(prev => prev.filter(m => m.id !== id));
      setSnackbar({ open: true, success: true, message: "Medicine deleted successfully!" });
    } catch (error) {
      console.error("Delete error:", error);
      try {
        const refreshed = await getAllMedicines();
        setInventory(refreshed || []);
        const exists = (refreshed || []).some(m => m.id === id);
        setSnackbar({
          open: true,
          success: !exists,
          message: !exists ? "Medicine deleted successfully!" : "Delete failed!"
        });
      } catch {
        setSnackbar({ open: true, success: false, message: "Delete failed!" });
      }
    }
  };

  /** Suggestions */
  const suggestions = [...new Set(inventory.map((m) => m[searchFilter]?.toString() || ""))];

  const formatLabel = (field) => {
    const map = {
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
    return map[field] || field;
  };

  const formFields = ["generic", "name", "form", "strength", "manufacturer", "category"];
  const dateFields = ["mfg", "expiry"];

  /** Row status coloring */
  const getRowStyle = (medicine) => {
    const current = new Date();
    const expiry = medicine?.expiry ? new Date(medicine.expiry) : null;
    const days = expiry ? Math.ceil((expiry.getTime() - current.getTime()) / (1000 * 3600 * 24)) : null;

    // Use configurable low stock threshold, fallback to 50 if not set
    const lowStockThreshold = medicine.lowStockQuantity ? parseInt(medicine.lowStockQuantity) : 50;

    if (expiry && days < 0)   return { bg: "#ffebee", color: "#c62828", tag: "Expired", tagColor: THEME.error };
    if (expiry && days <= 30) return { bg: "#fff3e0", color: "#f57c00", tag: "Near Expiry", tagColor: THEME.warning };
    if (medicine.stock < lowStockThreshold)  return { bg: "#fff3cd", color: "#856404", tag: "Low Stock", tagColor: "#856404" };
    return { bg: "transparent", color: "inherit", tag: "OK", tagColor: THEME.success };
  };

  // Calculate statistics
  const stats = {
    total: inventory.length,
    expired: inventory.filter(med => {
      const expiry = new Date(med.expiry);
      return expiry < new Date();
    }).length,
    nearExpiry: inventory.filter(med => {
      const expiry = new Date(med.expiry);
      const days = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return days >= 0 && days <= 30;
    }).length,
    lowStock: inventory.filter(med => {
        const lowStockThreshold = med.lowStockQuantity ? parseInt(med.lowStockQuantity) : 50;
        return med.stock < lowStockThreshold;
    }).length,
  };

  const searchOptions = [
    { value: "name", label: "Brand Name", icon: PharmacyIcon },
    { value: "generic", label: "Generic Name", icon: PharmacyIcon },
    { value: "manufacturer", label: "Manufacturer", icon: BusinessIcon },
    { value: "category", label: "Category", icon: CategoryIcon },
  ];

  if (loading) {
    return (
      <Box sx={{ px: 3, py: 5, backgroundColor: THEME.bg, minHeight: "100vh" }}>
        <Skeleton variant="text" width={400} height={60} sx={{ mb: 5 }} />
        
        {/* Statistics Cards Skeleton */}
        <Grid container spacing={3} mb={4}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: "20px" }} />
            </Grid>
          ))}
        </Grid>
        
        {/* Search Section Skeleton */}
        <Paper elevation={8} sx={{ p: 4, borderRadius: "24px", mb: 4 }}>
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: "16px" }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: "16px" }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: "16px" }} />
            </Grid>
          </Grid>
        </Paper>

        {/* Form Skeleton */}
        <Paper elevation={8} sx={{ p: 4, borderRadius: "24px", mb: 4 }}>
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: "16px" }} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3, py: 5, maxWidth: "1400px", mx: "auto", backgroundColor: THEME.bg, minHeight: "100vh" }}>
      {/* Header */}
      <Fade in timeout={700}>
        <Box display="flex" alignItems="center" mb={5}>
          <Avatar sx={{
            bgcolor: THEME.primary,
            mr: 2,
            width: 56,
            height: 56,
            boxShadow: "0 8px 25px rgba(12, 60, 60, 0.3)"
          }}>
            <InventoryIcon fontSize="large" />
          </Avatar>
          <Typography
            variant="h3"
            sx={{
              color: THEME.primary,
              fontWeight: 800,
              background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.accent} 100%)`,
              backgroundClip: "text",
              textFillColor: "transparent",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.3,
              pb: "4px"
            }}
          >
            Update Inventory
          </Typography>
        </Box>
      </Fade>

      {/* Statistics Dashboard */}
      <Grid container spacing={3} mb={4}>
        {[
          { label: "Total Medicines", value: stats.total, icon: PharmacyIcon, color: THEME.primary },
          { label: "Expired", value: stats.expired, icon: WarningIcon, color: THEME.error },
          { label: "Near Expiry", value: stats.nearExpiry, icon: CalendarIcon, color: THEME.warning },
          { label: "Low Stock", value: stats.lowStock, icon: TrendingUpIcon, color: "#856404" },
        ].map((stat, index) => (
          <Grow in timeout={800 + index * 150} key={stat.label}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ ...cardSx, p: 3 }}>
                <CardContent sx={{ textAlign: "center", p: 0 }}>
                  <Avatar sx={{ 
                    bgcolor: `${stat.color}15`, 
                    color: stat.color, 
                    width: 48, 
                    height: 48,
                    mx: "auto",
                    mb: 2
                  }}>
                    <stat.icon fontSize="medium" />
                  </Avatar>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 800, 
                    color: stat.color,
                    mb: 1
                  }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: THEME.gray,
                    fontWeight: 600,
                    fontSize: "0.9rem"
                  }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grow>
        ))}
      </Grid>

      {/* Search Existing Medicine */}
      <Grow in timeout={900}>
        <Paper elevation={12} sx={{ ...cardSx, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: THEME.primary, display: "flex", alignItems: "center" }}>
            <SearchIcon sx={{ mr: 1 }} /> Search Existing Medicine
          </Typography>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Search By"
                value={searchFilter}
                onChange={(e) => { setSearchFilter(e.target.value); setSearchTerm(""); }}
                size="medium"
                sx={inputSx}
              >
                {searchOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box display="flex" alignItems="center">
                      <option.icon sx={{ mr: 1, fontSize: "1.2rem" }} />
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={6} sx={{ position: "relative" }}>
              <TextField
                fullWidth
                label={`Search by ${formatLabel(searchFilter)}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="medium"
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: THEME.gray }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchTerm("")} size="small">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {searchTerm && suggestions.length > 0 && (
                <Paper
                  elevation={12}
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    maxHeight: 220,
                    overflowY: "auto",
                    borderRadius: "14px",
                    mt: 1,
                    border: `1px solid rgba(12,60,60,0.08)`
                  }}
                >
                  {suggestions
                    .filter((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((s, i) => (
                      <Box
                        key={i}
                        sx={{
                          p: 2,
                          cursor: "pointer",
                          fontSize: "0.95rem",
                          display: "flex",
                          alignItems: "center",
                          transition: "background-color 0.2s ease",
                          "&:hover": { backgroundColor: "rgba(69,210,122,0.06)" },
                          borderBottom: i < suggestions.length - 1 ? "1px solid #eee" : "none"
                        }}
                        onClick={() => setSearchTerm(s)}
                      >
                        <PersonIcon sx={{ mr: 1, fontSize: "1.1rem", color: THEME.gray }} />
                        {s}
                      </Box>
                    ))}
                </Paper>
              )}
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleSearch}
                size="large"
                startIcon={<SearchIcon />}
                sx={actionButtonSx("primary")}
              >
                Search Medicine
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grow>

      {/* Add / Update Form */}
      <Grow in timeout={1000}>
        <Paper elevation={12} sx={{ ...cardSx, mb: 4 }}>
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between" 
            sx={{ cursor: "pointer" }}
            onClick={() => setFormExpanded(!formExpanded)}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: THEME.primary, display: "flex", alignItems: "center" }}>
              {mode === "update" ? <EditIcon sx={{ mr: 1 }} /> : <AddIcon sx={{ mr: 1 }} />}
              {mode === "update" ? "Update Stock & Details" : "Add New Medicine"}
              <Chip 
                label={mode === "update" ? "Update Mode" : "Add Mode"}
                size="small"
                sx={{ 
                  ml: 2,
                  bgcolor: mode === "update" ? `${THEME.warning}15` : `${THEME.success}15`,
                  color: mode === "update" ? THEME.warning : THEME.success,
                  fontWeight: 600
                }}
              />
            </Typography>
            <IconButton>
              {formExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Collapse in={formExpanded}>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={3}>
              {/* Regular fields */}
              {formFields.map((field) => (
                <Grid item xs={12} sm={6} md={4} key={field}>
                  <TextField
                    fullWidth
                    label={formatLabel(field)}
                    value={formData[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    disabled={mode === "update" && !["stock", "mfg", "expiry", "unitPrice", "lowStockQuantity"].includes(field)}
                    size="medium"
                    sx={{
                      ...inputSx,
                      "& .MuiOutlinedInput-root.Mui-disabled": {
                        backgroundColor: "rgba(12, 60, 60, 0.04)",
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {field === "generic" && <PharmacyIcon sx={{ color: THEME.gray }} />}
                          {field === "name" && <PharmacyIcon sx={{ color: THEME.gray }} />}
                          {field === "form" && <CategoryIcon sx={{ color: THEME.gray }} />}
                          {field === "strength" && <TrendingUpIcon sx={{ color: THEME.gray }} />}
                          {field === "manufacturer" && <BusinessIcon sx={{ color: THEME.gray }} />}
                          {field === "category" && <CategoryIcon sx={{ color: THEME.gray }} />}
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              ))}

              {/* Date fields */}
              {dateFields.map((field) => (
                <Grid item xs={12} sm={6} md={4} key={field}>
                  <TextField
                    fullWidth
                    label={formatLabel(field)}
                    type="date"
                    value={formData[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="medium"
                    sx={inputSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon sx={{ color: THEME.gray }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              ))}

              {/* Stock */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label={mode === "update" ? "Quantity to Add" : formatLabel("stock")}
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                  inputProps={{ min: 0 }}
                  size="medium"
                  sx={inputSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <InventoryIcon sx={{ color: THEME.gray }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              {/* Unit Price */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Unit Price (Rs.)"
                  type="number"
                  inputProps={{ step: "0.01", min: 0 }}
                  value={formData.unitPrice}
                  onChange={(e) => handleChange("unitPrice", e.target.value)}
                  size="medium"
                  sx={inputSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PriceIcon sx={{ color: THEME.gray }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              {/* Low Stock Quantity */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label={formatLabel("lowStockQuantity")}
                  type="number"
                  inputProps={{ min: 0 }}
                  value={formData.lowStockQuantity}
                  onChange={(e) => handleChange("lowStockQuantity", e.target.value)}
                  size="medium"
                  sx={inputSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WarningIcon sx={{ color: THEME.gray }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                onClick={handleSubmit}
                size="large"
                startIcon={mode === "update" ? <EditIcon /> : <AddIcon />}
                sx={actionButtonSx("primary")}
              >
                {mode === "update" ? "Update Medicine" : "Add Medicine"}
              </Button>

              {mode === "update" && (
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  size="large"
                  startIcon={<ClearIcon />}
                  sx={actionButtonSx("secondary")}
                >
                  Cancel Update
                </Button>
              )}
            </Box>
          </Collapse>
        </Paper>
      </Grow>

      {/* Current Inventory Table */}
      <Fade in timeout={600}>
        <Paper
          elevation={12}
          sx={{
            borderRadius: "24px",
            overflow: "hidden",
            background: `linear-gradient(135deg, ${THEME.white} 0%, #fafffe 100%)`,
            border: `1px solid rgba(12, 60, 60, 0.08)`
          }}
        >
          <Box sx={{ p: 3, borderBottom: `1px solid rgba(12, 60, 60, 0.1)` }}>
            <Typography variant="h6" sx={{ 
              color: THEME.primary, 
              fontWeight: 700, 
              display: "flex", 
              alignItems: "center" 
            }}>
              <PharmacyIcon sx={{ mr: 1 }} />
              Current Inventory
              <Chip
                size="small"
                label={`${inventory.length} items`}
                sx={{ 
                  ml: 2, 
                  bgcolor: `${THEME.accent}15`, 
                  color: THEME.accent, 
                  fontWeight: 700 
                }}
              />
            </Typography>
          </Box>

          <Box sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 1100 }}>
              <TableHead sx={{ bgcolor: "rgba(12, 60, 60, 0.04)" }}>
                <TableRow>
                  {[
                    "Generic", "Brand Name", "Form", "Strength", "Stock",
                    "Unit Price", "MFG Date", "Expiry Date",
                    "Manufacturer", "Last Updated", "Category", "Actions"
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: THEME.primary,
                        py: 2,
                        whiteSpace: 'nowrap',
                        textAlign: "center"
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {inventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} sx={{ py: 6 }}>
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Avatar sx={{ 
                          bgcolor: `${THEME.gray}15`, 
                          color: THEME.gray,
                          width: 64,
                          height: 64,
                          mb: 2
                        }}>
                          <InventoryIcon fontSize="large" />
                        </Avatar>
                        <Typography variant="h6" color={THEME.gray} fontWeight={600}>
                          No medicines found in inventory
                        </Typography>
                        <Typography variant="body2" color={THEME.gray} mt={1}>
                          Add your first medicine using the form above
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  inventory.map((medicine, idx) => {
                    const row = getRowStyle(medicine);
                    const price =
                      medicine.unitPrice !== null && medicine.unitPrice !== undefined && !isNaN(parseFloat(medicine.unitPrice))
                        ? `Rs. ${parseFloat(medicine.unitPrice).toFixed(2)}`
                        : "-";

                    return (
                      <Fade in timeout={300 + idx * 60} key={medicine.id}>
                        <TableRow sx={tableRowSx(row)}>
                          <TableCell sx={{ 
                            fontSize: "0.95rem", 
                            color: row.color, 
                            textAlign: "center", 
                            fontWeight: 600 
                          }}>
                            {medicine.generic || "-"}
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: "0.95rem", 
                            color: row.color, 
                            textAlign: "center", 
                            fontWeight: 600 
                          }}>
                            <Box display="flex" alignItems="center" justifyContent="center">
                              <Avatar sx={{ 
                                mr: 1, 
                                bgcolor: THEME.accent, 
                                width: 24, 
                                height: 24 
                              }}>
                                <PharmacyIcon sx={{ fontSize: "0.8rem" }} />
                              </Avatar>
                              {medicine.name}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            <Chip
                              label={medicine.form || "-"}
                              size="small"
                              sx={{ 
                                bgcolor: `${THEME.primary}15`, 
                                color: THEME.primary, 
                                fontWeight: 600 
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: "0.95rem", 
                            color: row.color, 
                            textAlign: "center", 
                            fontWeight: 600 
                          }}>
                            {medicine.strength}
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            <Chip
                              label={`${medicine.stock} units`}
                              size="small"
                              sx={{
                                bgcolor: medicine.stock < 50 ? `${THEME.warning}15` : `${THEME.success}15`,
                                color: medicine.stock < 50 ? THEME.warning : THEME.success,
                                fontWeight: 700
                              }}
                              icon={medicine.stock < 50 ? <WarningIcon /> : <CheckCircleIcon />}
                            />
                          </TableCell>
                          <TableCell sx={{
                            fontSize: "0.95rem",
                            color: row.color,
                            textAlign: "center",
                            fontWeight: 600
                          }}>
                            {price}
                          </TableCell>
                          <TableCell sx={{
                            fontSize: "0.95rem",
                            color: row.color,
                            textAlign: "center",
                            whiteSpace: 'nowrap'
                          }}>
                            {medicine.mfg}
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: "0.95rem", 
                            color: row.color, 
                            textAlign: "center", 
                            whiteSpace: 'nowrap', 
                            fontWeight: 700 
                          }}>
                            <Box display="flex" alignItems="center" justifyContent="center">
                              {row.tag !== "OK" && (
                                <Chip
                                  label={row.tag}
                                  size="small"
                                  sx={{
                                    bgcolor: `${row.tagColor}15`,
                                    color: row.tagColor,
                                    fontWeight: 700,
                                    mr: 1
                                  }}
                                />
                              )}
                              {medicine.expiry}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: "0.95rem", 
                            color: row.color, 
                            textAlign: "center" 
                          }}>
                            {medicine.manufacturer}
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: "0.95rem", 
                            color: row.color, 
                            textAlign: "center" 
                          }}>
                            {medicine.lastUpdate ? new Date(medicine.lastUpdate).toLocaleDateString("en-GB") : "-"}
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            <Chip
                              label={medicine.category || "-"}
                              size="small"
                              sx={{ 
                                bgcolor: `${THEME.accent}15`, 
                                color: THEME.accent, 
                                fontWeight: 600 
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDelete(medicine.id)}
                              sx={actionButtonSx("danger")}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      </Fade>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.success ? "success" : "error"} 
          sx={{ 
            fontSize: "0.95rem",
            borderRadius: "12px",
            "& .MuiAlert-icon": {
              fontSize: "1.2rem"
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UpdateInventoryPage;