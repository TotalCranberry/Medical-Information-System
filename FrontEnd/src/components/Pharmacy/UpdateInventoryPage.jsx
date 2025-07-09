import React, { useState } from "react";
import {
  Box, Typography, Paper, TextField, Button, Grid, Table,
  TableHead, TableRow, TableCell, TableBody, Autocomplete
} from "@mui/material";

const initialMedicines = [
  {
    name: "Paracetamol",
    form: "Tablet",
    strength: "500mg",
    stock: 1200,
    batch: "PA1234",
    mfg: "2023-12-01",
    expiry: "2025-12-01",
    manufacturer: "ABC Pharma",
    category: "Painkiller"
  },
  {
    name: "Amoxicillin",
    form: "Capsule",
    strength: "250mg",
    stock: 300,
    batch: "AM3344",
    mfg: "2023-06-15",
    expiry: "2024-08-10",
    manufacturer: "MediCure Ltd.",
    category: "Antibiotic"
  }
];

const UpdateInventoryPage = () => {
  const [inventory, setInventory] = useState(initialMedicines);
  const [searchName, setSearchName] = useState("");
  const [searchBatch, setSearchBatch] = useState("");
  const [mode, setMode] = useState("add");

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

  const medicineNames = [...new Set(inventory.map(m => m.name))];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    const found = inventory.find(
      m => m.name.toLowerCase() === searchName.toLowerCase() && m.batch === searchBatch
    );
    if (found) {
      setMode("update");
      setFormData(found);
    } else {
      setMode("add");
      setFormData({
        name: searchName,
        form: "",
        strength: "",
        stock: "",
        batch: searchBatch,
        mfg: "",
        expiry: "",
        manufacturer: "",
        category: ""
      });
    }
  };

  const handleSubmit = () => {
    if (mode === "update") {
      setInventory(prev =>
        prev.map(m =>
          m.name === formData.name && m.batch === formData.batch
            ? { ...m, stock: parseInt(formData.stock) }
            : m
        )
      );
    } else {
      setInventory(prev => [...prev, { ...formData, stock: parseInt(formData.stock) }]);
    }

    setSearchName("");
    setSearchBatch("");
    setFormData({
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
    setMode("add");
  };

  return (
    <Box sx={{ maxWidth: 1000, margin: "40px auto", p: 3 }}>
      <Typography variant="h4" mb={3}>Update Inventory</Typography>

      {/* Search Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Search Existing Medicine</Typography>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} sm={5}>
            <Box sx={{ width: '100%' }}>
              <Autocomplete
                fullWidth
                freeSolo
                options={medicineNames}
                inputValue={searchName}
                onInputChange={(e, value) => setSearchName(value)}
                renderInput={(params) => (
                  <TextField {...params} label="Medicine Name" fullWidth />
                )}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Batch Number"
              value={searchBatch}
              onChange={e => setSearchBatch(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="contained" fullWidth onClick={handleSearch}>
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Form Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" mb={2}>
          {mode === "update" ? "Update Stock of Existing Medicine" : "Add New Medicine"}
        </Typography>

        <Grid container spacing={2}>
          {["name", "form", "strength", "batch", "mfg", "expiry", "manufacturer", "category"].map(field => (
            <Grid item xs={12} sm={6} key={field}>
              <TextField
                fullWidth
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                value={formData[field]}
                onChange={e => handleChange(field, e.target.value)}
                disabled={mode === "update" && field !== "stock"}
              />
            </Grid>
          ))}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Stock Quantity"
              type="number"
              value={formData.stock}
              onChange={e => handleChange("stock", e.target.value)}
            />
          </Grid>
        </Grid>

        <Box mt={3}>
          <Button variant="contained" onClick={handleSubmit}>
            {mode === "update" ? "Update Stock" : "Add Medicine"}
          </Button>
        </Box>
      </Paper>

      {/* Inventory Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" mb={1}>Current Inventory</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Form</TableCell>
              <TableCell>Strength</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Batch</TableCell>
              <TableCell>MFG</TableCell>
              <TableCell>Expiry</TableCell>
              <TableCell>Manufacturer</TableCell>
              <TableCell>Category</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((m, i) => (
              <TableRow key={i}>
                <TableCell>{m.name}</TableCell>
                <TableCell>{m.form}</TableCell>
                <TableCell>{m.strength}</TableCell>
                <TableCell>{m.stock}</TableCell>
                <TableCell>{m.batch}</TableCell>
                <TableCell>{m.mfg}</TableCell>
                <TableCell>{m.expiry}</TableCell>
                <TableCell>{m.manufacturer}</TableCell>
                <TableCell>{m.category}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default UpdateInventoryPage;
