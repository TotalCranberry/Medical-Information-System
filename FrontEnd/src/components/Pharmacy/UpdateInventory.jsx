import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, TextField, Button, Grid,
  Table, TableHead, TableRow, TableCell, TableBody, MenuItem, Snackbar, Alert,
  Avatar, Chip, IconButton, InputAdornment, Fade, Grow
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
  CheckCircle as CheckCircleIcon
} from "@mui/icons-material";
import {
  getAllMedicines,
  saveMedicine,
  searchMedicines,
  deleteMedicine
} from "../../api/medicine";
import apiFetch from "../../api/api";

/** ---------- THEME & STYLES (matched to your other pages) ---------- */
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
  transition: "all 0.25s ease",
  "&:hover": {
    backgroundColor: rowStyle.bg === "transparent" ? "rgba(69, 210, 122, 0.04)" : rowStyle.bg,
    transform: "scale(1.01)",
    "& .MuiTableCell-root": { borderColor: "rgba(69, 210, 122, 0.2)" }
  },
  "&:nth-of-type(even)": { backgroundColor: rowStyle.bg === "transparent" ? "rgba(12, 60, 60, 0.02)" : rowStyle.bg }
});

/** ---------- COMPONENT ---------- */
const UpdateInventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [mode, setMode] = useState("add");
  const [searchFilter, setSearchFilter] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, success: true, message: "" });
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    generic: "",
    name: "",
    form: "",
    strength: "",
    stock: "",
    batch: "",
    mfg: "",
    expiry: "",
    manufacturer: "",
    category: "",
    unitPrice: ""
  });

  /** Load inventory */
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await getAllMedicines();
      setInventory(data || []);
    } catch (err) {
      console.error("Inventory load failed", err);
      setSnackbar({ open: true, success: false, message: "Failed to load inventory" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /** Search */
  const handleSearch = () => {
    if (searchFilter === "name+manufacturer") {
      const { name, manufacturer } = formData;
      if (!name || !manufacturer) {
        setSnackbar({ open: true, success: false, message: "Please enter both Brand Name and Manufacturer." });
        return;
      }
      apiFetch(`/medicines/search/by-name-and-manufacturer?name=${name}&manufacturer=${manufacturer}`, "GET", null, true)
        .then((res) => {
          if (res) {
            setMode("update");
            setFormData(res);
          } else {
            setMode("add");
          }
        })
        .catch(() => {
          setMode("add");
          setSnackbar({ open: true, success: false, message: "Medicine not found." });
        });
      return;
    }

    searchMedicines(searchTerm, searchFilter)
      .then((res) => {
        if (res && res.length > 0) {
          setMode("update");
          setFormData(res[0]);
        } else {
          setMode("add");
          setFormData(prev => ({ ...prev, [searchFilter]: searchTerm }));
        }
      })
      .catch(() => {
        setMode("add");
        setFormData(prev => ({ ...prev, [searchFilter]: searchTerm }));
        setSnackbar({ open: true, success: false, message: "Search failed." });
      });
  };

  /** Submit add/update */
  const handleSubmit = () => {
    const payload = {
      ...formData,
      stock: formData.stock === "" ? 0 : parseInt(formData.stock, 10),
      unitPrice: formData.unitPrice === "" ? 0 : parseFloat(formData.unitPrice)
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
          batch: "",
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
      batch: "",
      mfg: "",
      expiry: "",
      manufacturer: "",
      category: "",
      unitPrice: ""
    });
    setSearchTerm("");
    setMode("add");
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

  /** Suggestions (single-field search only) */
  const suggestions =
    searchFilter === "name+manufacturer"
      ? []
      : [...new Set(inventory.map((m) => m[searchFilter]?.toString() || ""))];

  const formatLabel = (field) => {
    const map = {
      generic: "Generic Name",
      name: "Brand Name",
      form: "Form",
      strength: "Strength",
      batch: "Batch Number",
      mfg: "Manufacturing Date",
      expiry: "Expiry Date",
      manufacturer: "Manufacturer",
      category: "Category",
      stock: "Stock Quantity",
      unitPrice: "Unit Price (Rs.)"
    };
    return map[field] || field;
  };

  const formFields = ["generic", "name", "form", "strength", "batch", "manufacturer", "category"];
  const dateFields = ["mfg", "expiry"];

  /** Row status coloring (near-expiry/expired/low-stock) */
  const getRowStyle = (medicine) => {
    const current = new Date();
    const expiry = medicine?.expiry ? new Date(medicine.expiry) : null;
    const days = expiry ? Math.ceil((expiry.getTime() - current.getTime()) / (1000 * 3600 * 24)) : null;

    if (expiry && days < 0)   return { bg: "#ffebee", color: "#c62828", tag: "Expired", tagColor: THEME.error };
    if (expiry && days <= 30) return { bg: "#fff3e0", color: "#f57c00", tag: "Near Expiry", tagColor: THEME.warning };
    if (medicine.stock < 50)  return { bg: "#fff3cd", color: "#856404", tag: "Low Stock", tagColor: "#856404" };
    return { bg: "transparent", color: "inherit", tag: "OK", tagColor: THEME.success };
  };

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

      {/* Search Existing Medicine */}
      <Grow in timeout={800}>
        <Paper elevation={10} sx={{ ...cardSx, mb: 4 }}>
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
                <MenuItem value="name">Brand Name</MenuItem>
                <MenuItem value="generic">Generic Name</MenuItem>
                <MenuItem value="batch">Batch Number</MenuItem>
                <MenuItem value="manufacturer">Manufacturer</MenuItem>
                <MenuItem value="category">Category</MenuItem>
                <MenuItem value="name+manufacturer">Brand Name + Manufacturer</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={6} sx={{ position: "relative" }}>
              {searchFilter === "name+manufacturer" ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Brand Name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      size="medium"
                      sx={inputSx}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PharmacyIcon sx={{ color: THEME.gray }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Manufacturer"
                      value={formData.manufacturer}
                      onChange={(e) => handleChange("manufacturer", e.target.value)}
                      size="medium"
                      sx={inputSx}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CategoryIcon sx={{ color: THEME.gray }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                </Grid>
              ) : (
                <>
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
                              "&:hover": { backgroundColor: "rgba(69,210,122,0.06)" },
                              borderBottom: i < suggestions.length - 1 ? "1px solid #eee" : "none"
                            }}
                            onClick={() => setSearchTerm(s)}
                          >
                            {s}
                          </Box>
                        ))}
                    </Paper>
                  )}
                </>
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
                Search
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grow>

      {/* Add / Update Form */}
      <Grow in timeout={900}>
        <Paper elevation={10} sx={{ ...cardSx, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: THEME.primary }}>
            {mode === "update" ? "Update Stock & Dates" : "Add New Medicine"}
          </Typography>

          <Grid container spacing={3}>
            {/* Regular fields */}
            {formFields.map((field) => (
              <Grid item xs={12} sm={6} md={4} key={field}>
                <TextField
                  fullWidth
                  label={formatLabel(field)}
                  value={formData[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  disabled={mode === "update" && !["stock", "mfg", "expiry", "unitPrice"].includes(field)}
                  size="medium"
                  sx={inputSx}
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
                />
              </Grid>
            ))}

            {/* Stock */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label={formatLabel("stock")}
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
          </Grid>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              onClick={handleSubmit}
              size="large"
              startIcon={mode === "update" ? <EditIcon /> : <AddIcon />}
              sx={actionButtonSx("primary")}
            >
              {mode === "update" ? "Update Stock" : "Add Medicine"}
            </Button>

            {mode === "update" && (
              <Button
                variant="outlined"
                onClick={handleCancel}
                size="large"
                startIcon={<ClearIcon />}
                sx={actionButtonSx("secondary")}
              >
                Cancel
              </Button>
            )}
          </Box>
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
            <Typography variant="h6" sx={{ color: THEME.primary, fontWeight: 700, display: "flex", alignItems: "center" }}>
              <PharmacyIcon sx={{ mr: 1 }} />
              Current Inventory
              <Chip
                size="small"
                label={`${inventory.length} items`}
                sx={{ ml: 2, bgcolor: `${THEME.accent}15`, color: THEME.accent, fontWeight: 700 }}
              />
            </Typography>
          </Box>

          <Box sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 1100 }}>
              <TableHead sx={{ bgcolor: "rgba(12, 60, 60, 0.04)" }}>
                <TableRow>
                  {[
                    "Generic", "Brand Name", "Form", "Strength", "Stock",
                    "Unit Price", "Batch", "MFG Date", "Expiry Date",
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
                {loading && (
                  <TableRow>
                    <TableCell colSpan={13} sx={{ textAlign: "center", py: 4, color: THEME.gray }}>
                      Loading inventory…
                    </TableCell>
                  </TableRow>
                )}

                {!loading && inventory.map((medicine, idx) => {
                  const row = getRowStyle(medicine);
                  const price =
                    medicine.unitPrice !== null && medicine.unitPrice !== undefined && !isNaN(parseFloat(medicine.unitPrice))
                      ? `Rs. ${parseFloat(medicine.unitPrice).toFixed(2)}`
                      : "-";

                  return (
                    <Fade in timeout={300 + idx * 60} key={medicine.id}>
                      <TableRow sx={tableRowSx(row)}>
                        <TableCell sx={{ fontSize: "0.95rem", color: row.color, textAlign: "center", fontWeight: 600 }}>
                          {medicine.generic || "-"}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.95rem", color: row.color, textAlign: "center", fontWeight: 600 }}>
                          {medicine.name}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          <Chip
                            label={medicine.form || "-"}
                            size="small"
                            sx={{ bgcolor: `${THEME.primary}15`, color: THEME.primary, fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.95rem", color: row.color, textAlign: "center", fontWeight: 600 }}>
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
                        <TableCell sx={{ fontSize: "0.95rem", color: row.color, textAlign: "center", fontWeight: 600 }}>
                          {price}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.95rem", color: row.color, textAlign: "center" }}>
                          {medicine.batch}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.95rem", color: row.color, textAlign: "center", whiteSpace: 'nowrap' }}>
                          {medicine.mfg}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.95rem", color: row.color, textAlign: "center", whiteSpace: 'nowrap', fontWeight: 700 }}>
                          {medicine.expiry}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.95rem", color: row.color, textAlign: "center" }}>
                          {medicine.manufacturer}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.95rem", color: row.color, textAlign: "center" }}>
                          {medicine.lastUpdate ? new Date(medicine.lastUpdate).toLocaleDateString("en-GB") : "-"}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          <Chip
                            label={medicine.category || "-"}
                            size="small"
                            sx={{ bgcolor: `${THEME.accent}15`, color: THEME.accent, fontWeight: 600 }}
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
                })}

                {!loading && inventory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={13} sx={{ textAlign: "center", py: 4, fontSize: "1rem", color: THEME.gray }}>
                      No medicines found in inventory
                    </TableCell>
                  </TableRow>
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
        <Alert severity={snackbar.success ? "success" : "error"} sx={{ fontSize: "0.95rem" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UpdateInventoryPage;
