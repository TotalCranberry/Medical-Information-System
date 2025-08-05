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
  MenuItem
} from "@mui/material";

const InventoryPage = () => {
  const [medicines] = useState([
    { name: "Paracetamol", form: "Tablet", strength: "500mg", stock: 1200, batch: "PA1234", mfg: "2023-12-01", expiry: "2025-12-01", manufacturer: "ABC Pharma", category: "Painkiller" },
    { name: "Amoxicillin", form: "Capsule", strength: "250mg", stock: 300, batch: "AM3344", mfg: "2023-06-15", expiry: "2024-08-10", manufacturer: "MediCure Ltd.", category: "Antibiotic" },
    { name: "Cetrizine", form: "Tablet", strength: "10mg", stock: 40, batch: "CE9988", mfg: "2023-03-01", expiry: "2024-04-15", manufacturer: "LifeHeal", category: "Antihistamine" },
    { name: "Metformin", form: "Tablet", strength: "500mg", stock: 900, batch: "MF7777", mfg: "2023-10-01", expiry: "2026-01-01", manufacturer: "NovoMed", category: "Diabetic" },
  ]);

  const [searchMethod, setSearchMethod] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");

  const suggestions = [...new Set(medicines.map((m) => m[searchMethod]?.toString() || ""))];

  const filtered = medicines.filter((med) => {
    const value = med[searchMethod]?.toString().toLowerCase();
    return value.includes((searchTerm || "").toLowerCase());
  });

  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 3, md: 5, lg: 8 },
        py: { xs: 2, sm: 3, md: 5, lg: 6 },
        maxWidth: "100%",
        mx: "auto",
      }}
    >
      {/* Heading */}
      <Typography
        variant="h4"
        sx={{
          color: "#0c3c3c",
          fontWeight: 700,
          textAlign: "left",
          mb: { xs: 3, md: 5 },
          fontSize: { xs: "1.4rem", sm: "1.8rem", md: "2.4rem", lg: "2.8rem" }
        }}
      >
        Inventory Management
      </Typography>

      {/* Search Section */}
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderLeft: "6px solid #45d27a",
          borderRadius: "12px",
          mb: { xs: 3, md: 5 },
          width: "100%",
          maxWidth: "1200px",
          mx: "auto"
        }}
      >
        <Grid container spacing={2}>
          {/* Search By Dropdown */}
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Search By"
              size="medium"
              value={searchMethod}
              onChange={(e) => {
                setSearchMethod(e.target.value);
                setSearchTerm("");
              }}
              sx={{
                fontSize: { xs: "0.9rem", md: "1.1rem" }
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

          {/* Search Field */}
          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              label={`Search by ${searchMethod}`}
              size="medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ fontSize: { xs: "0.9rem", md: "1.1rem" } }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Table Section */}
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderLeft: "6px solid #45d27a",
          borderRadius: "12px",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 600,
            textAlign: "center",
            fontSize: { xs: "1rem", sm: "1.3rem", md: "1.8rem", lg: "2rem" }
          }}
        >
          Available Medicines
        </Typography>

        {/* Scrollable container */}
        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                {["Name", "Form", "Strength", "Stock (units)", "Batch No.", "MFG Date", "Expiry Date", "Manufacturer", "Category"].map((header) => (
                  <TableCell
                    key={header}
                    sx={{ fontSize: { xs: "0.9rem", md: "1.2rem" }, fontWeight: 600 }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ fontSize: { xs: "1rem", md: "1.2rem" } }}>
                    No matching medicines found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((med, i) => (
                  <TableRow
                    key={i}
                    sx={{ backgroundColor: med.stock < 50 ? "#fff3cd" : "transparent" }}
                  >
                    <TableCell sx={{ fontSize: { xs: "0.9rem", md: "1.1rem" }, color: med.stock < 50 ? "red" : "inherit" }}>{med.name}</TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.9rem", md: "1.1rem" }, color: med.stock < 50 ? "red" : "inherit" }}>{med.form}</TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.9rem", md: "1.1rem" }, color: med.stock < 50 ? "red" : "inherit" }}>{med.strength}</TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.9rem", md: "1.1rem" }, color: med.stock < 50 ? "red" : "inherit" }}>{med.stock}</TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.9rem", md: "1.1rem" }, color: med.stock < 50 ? "red" : "inherit" }}>{med.batch}</TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.9rem", md: "1.1rem" }, color: med.stock < 50 ? "red" : "inherit" }}>{med.mfg}</TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.9rem", md: "1.1rem" }, color: med.stock < 50 ? "red" : "inherit" }}>{med.expiry}</TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.9rem", md: "1.1rem" }, color: med.stock < 50 ? "red" : "inherit" }}>{med.manufacturer}</TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.9rem", md: "1.1rem" }, color: med.stock < 50 ? "red" : "inherit" }}>{med.category}</TableCell>
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

export default InventoryPage;
