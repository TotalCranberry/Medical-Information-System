import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Alert
} from "@mui/material";

const UpdateInventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [mode, setMode] = useState("add");
  const [searchFilter, setSearchFilter] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, success: true, message: "" });

  const [formData, setFormData] = useState({
    name: "",
    form: "",
    strength: "",
    stock: "",
    batch: "",
    mfg: "",
    expiry: "",
    manufacturer: "",
    category: ""
  });

  // Fetch inventory
  const fetchInventory = () => {
    axios.get("http://localhost:8080/api/medicines/all")
      .then((res) => setInventory(res.data))
      .catch((err) => console.error("Inventory load failed", err));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    axios.get("http://localhost:8080/api/medicines/search", {
      params: {
        name: searchTerm,
        batch: formData.batch || ""
      }
    })
      .then((res) => {
        if (res.data) {
          setMode("update");
          setFormData(res.data);
        } else {
          setMode("add");
          setFormData({ ...formData, [searchFilter]: searchTerm });
        }
      })
      .catch((err) => {
        console.error("Search failed", err);
        setMode("add");
        setFormData({ ...formData, [searchFilter]: searchTerm });
      });
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      stock: parseInt(formData.stock)
    };

    axios.post("http://localhost:8080/api/medicines/save", payload)
      .then(() => {
        fetchInventory();
        setSnackbar({
          open: true,
          success: true,
          message: mode === "add" ? "Medicine added successfully!" : "Stock updated successfully!"
        });
        setFormData({
          name: "", form: "", strength: "", stock: "", batch: "",
          mfg: "", expiry: "", manufacturer: "", category: ""
        });
        setSearchTerm("");
        setMode("add");
      })
      .catch(() => {
        setSnackbar({ open: true, success: false, message: "Operation failed!" });
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      axios.delete(`http://localhost:8080/api/medicines/delete/${id}`)
        .then(() => {
          fetchInventory();
          setSnackbar({ open: true, success: true, message: "Medicine deleted successfully!" });
        })
        .catch(() => {
          setSnackbar({ open: true, success: false, message: "Delete failed!" });
        });
    }
  };

  const suggestions = [...new Set(inventory.map((m) => m[searchFilter]?.toString() || ""))];
  const manufacturers = [...new Set(inventory.map((m) => m.manufacturer).filter(Boolean))];

  return (
    <Box sx={{ px: { xs: 2, md: 5 }, py: { xs: 3, md: 5 } }}>
      <Typography variant="h4" sx={{ color: "#0c3c3c", fontWeight: 700, mb: 4 }}>Update Inventory</Typography>

      {/* Search Section */}
      <Paper elevation={4} sx={{ p: 4, borderLeft: "6px solid #45d27a", borderRadius: "12px", mb: 5, maxWidth: "1200px", mx: "auto" }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Search Existing Medicine</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              select fullWidth label="Search By" value={searchFilter}
              onChange={(e) => { setSearchFilter(e.target.value); setSearchTerm(""); }}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="batch">Batch</MenuItem>
              <MenuItem value="manufacturer">Manufacturer</MenuItem>
              <MenuItem value="category">Category</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={7} sx={{ position: "relative" }}>
            <TextField fullWidth label={`Search by ${searchFilter}`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            {searchTerm && suggestions.length > 0 && (
              <Paper elevation={3} sx={{ position: "absolute", top: "100%", zIndex: 10, maxHeight: 200, overflowY: "auto", borderRadius: "8px" }}>
                {suggestions
                  .filter((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((s, i) => (
                    <Box key={i} sx={{ p: 1, cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }} onClick={() => setSearchTerm(s)}>
                      {s}
                    </Box>
                  ))}
              </Paper>
            )}
          </Grid>
          <Grid item xs={12} md={2}>
            <Button variant="contained" fullWidth onClick={handleSearch}>Search</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Form Section */}
      <Paper elevation={4} sx={{ p: 4, borderLeft: "6px solid #45d27a", borderRadius: "12px", mb: 5, maxWidth: "1200px", mx: "auto" }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {mode === "update" ? "Update Stock & Dates" : "Add New Medicine"}
        </Typography>
        <Grid container spacing={2}>
          {["name", "form", "strength", "batch", "mfg", "expiry", "manufacturer", "category"].map((field) => (
            <Grid item xs={12} sm={6} key={field}>
              {field === "manufacturer" ? (
                <TextField
                  select
                  fullWidth
                  label="Manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => handleChange("manufacturer", e.target.value)}
                  disabled={mode === "update" && !["stock", "mfg", "expiry"].includes(field)}
                >
                  {manufacturers.map((m, i) => (
                    <MenuItem key={i} value={m}>{m}</MenuItem>
                  ))}
                  {!manufacturers.includes(formData.manufacturer) && formData.manufacturer && (
                    <MenuItem value={formData.manufacturer}>{formData.manufacturer}</MenuItem>
                  )}
                </TextField>
              ) : (
                <TextField
                  fullWidth
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={formData[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  disabled={mode === "update" && !["stock", "mfg", "expiry"].includes(field)}
                />
              )}
            </Grid>
          ))}
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Stock Quantity" type="number" value={formData.stock} onChange={(e) => handleChange("stock", e.target.value)} />
          </Grid>
        </Grid>
        <Box mt={3}>
          <Button variant="contained" onClick={handleSubmit}>
            {mode === "update" ? "Update Stock" : "Add Medicine"}
          </Button>
        </Box>
      </Paper>

      {/* Inventory Table */}
      <Paper elevation={4} sx={{ p: 4, borderLeft: "6px solid #45d27a", borderRadius: "12px", maxWidth: "1200px", mx: "auto" }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, textAlign: "center" }}>
          Current Inventory
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                {["Name", "Form", "Strength", "Stock", "Batch", "MFG", "Expiry", "Manufacturer", "Category", "Actions"].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map((m) => (
                <TableRow key={m.id} sx={{ backgroundColor: m.stock < 50 ? "#ffebee" : "inherit" }}>
                  <TableCell sx={{ color: m.stock < 50 ? "red" : "inherit" }}>{m.name}</TableCell>
                  <TableCell>{m.form}</TableCell>
                  <TableCell>{m.strength}</TableCell>
                  <TableCell>{m.stock}</TableCell>
                  <TableCell>{m.batch}</TableCell>
                  <TableCell>{m.mfg}</TableCell>
                  <TableCell>{m.expiry}</TableCell>
                  <TableCell>{m.manufacturer}</TableCell>
                  <TableCell>{m.category}</TableCell>
                  <TableCell>
                    <Button color="error" size="small" onClick={() => handleDelete(m.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.success ? "success" : "error"}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default UpdateInventoryPage;
