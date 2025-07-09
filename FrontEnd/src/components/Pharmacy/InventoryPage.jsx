import React, { useState } from "react";
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
  Autocomplete,
} from "@mui/material";

const InventoryPage = () => {
  const [medicines] = useState([
    { name: "Paracetamol", form: "Tablet", strength: "500mg", stock: 1200, batch: "PA1234", mfg: "2023-12-01", expiry: "2025-12-01", manufacturer: "ABC Pharma", category: "Painkiller" },
    { name: "Amoxicillin", form: "Capsule", strength: "250mg", stock: 300, batch: "AM3344", mfg: "2023-06-15", expiry: "2024-08-10", manufacturer: "MediCure Ltd.", category: "Antibiotic" },
    { name: "Cetrizine", form: "Tablet", strength: "10mg", stock: 180, batch: "CE9988", mfg: "2023-03-01", expiry: "2024-04-15", manufacturer: "LifeHeal", category: "Antihistamine" },
    { name: "Metformin", form: "Tablet", strength: "500mg", stock: 900, batch: "MF7777", mfg: "2023-10-01", expiry: "2026-01-01", manufacturer: "NovoMed", category: "Diabetic" },
  ]);

  const [searchMethod, setSearchMethod] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");

  const suggestions = [...new Set(medicines.map((m) => m[searchMethod]?.toString() || ''))];

  const filtered = medicines.filter((med) => {
    const value = med[searchMethod]?.toString().toLowerCase();
    return value.includes((searchTerm || "").toLowerCase());
  });

  return (
    <Box sx={{ maxWidth: 1300, margin: "40px auto", p: 3 }}>
      <Typography variant="h4" mb={3}>Inventory</Typography>

      {/* Search Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container justifyContent="center" alignItems="center" spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Search By"
              value={searchMethod}
              onChange={(e) => {
                setSearchMethod(e.target.value);
                setSearchTerm("");
              }}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="form">Form</MenuItem>
              <MenuItem value="strength">Strength</MenuItem>
              <MenuItem value="stock">Stock</MenuItem>
              <MenuItem value="batch">Batch Number</MenuItem>
              <MenuItem value="mfg">Manufacturing Date</MenuItem>
              <MenuItem value="expiry">Expiry Date</MenuItem>
              <MenuItem value="manufacturer">Manufacturer</MenuItem>
              <MenuItem value="category">Category</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              fullWidth
              freeSolo
              options={suggestions}
              inputValue={searchTerm}
              onInputChange={(event, newValue) => {
                setSearchTerm(newValue || "");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`Search by ${searchMethod}`}
                  // EXPLICIT FIX: Force the text field to take the full width
                  sx={{ width: '100%' }}
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Table Section */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" mb={2}>Available Medicines</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Form</TableCell>
                <TableCell>Strength</TableCell>
                <TableCell>Stock (units)</TableCell>
                <TableCell>Batch No.</TableCell>
                <TableCell>MFG Date</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell>Manufacturer</TableCell>
                <TableCell>Category</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">No matching medicines found</TableCell>
              </TableRow>
            ) : (
              filtered.map((med, i) => (
                <TableRow key={i}>
                  <TableCell>{med.name}</TableCell>
                  <TableCell>{med.form}</TableCell>
                  <TableCell>{med.strength}</TableCell>
                  <TableCell>{med.stock}</TableCell>
                  <TableCell>{med.batch}</TableCell>
                  <TableCell>{med.mfg}</TableCell>
                  <TableCell>{med.expiry}</TableCell>
                  <TableCell>{med.manufacturer}</TableCell>
                  <TableCell>{med.category}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default InventoryPage;