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
    MenuItem
} from "@mui/material";
import { getAllMedicines } from "../../api/medicine";

const InventoryPage = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchMethod, setSearchMethod] = useState("generic");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        getAllMedicines()
            .then(data => setMedicines(data))
            .catch(err => console.error("Error fetching medicines:", err))
            .finally(() => setLoading(false));
    }, []);

    const getRowColor = (medicine) => {
        const currentDate = new Date();
        const expiryDate = new Date(medicine.expiry);
        const timeDifference = expiryDate.getTime() - currentDate.getTime();
        const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

        if (daysDifference < 0) {
            return { bg: "#ffebee", color: "#c62828" };
        } else if (daysDifference <= 30) {
            return { bg: "#fff3e0", color: "#f57c00" };
        } else if (medicine.stock < 50) {
            return { bg: "#fff3cd", color: "#856404" };
        }
        return { bg: "transparent", color: "inherit" };
    };

    const filtered = medicines.filter((med) => {
        const value = med[searchMethod]?.toString().toLowerCase();
        return value?.includes((searchTerm || "").toLowerCase());
    });

    return (
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3, md: 4 }, maxWidth: "100%" }}>
            <Typography variant="h5" sx={{ color: "#0c3c3c", fontWeight: 600, textAlign: "left", mb: { xs: 3, md: 4 }, fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" }, pl: 1 }}>
                Inventory Management
            </Typography>

            <Paper elevation={3} sx={{ p: { xs: 3, sm: 4, md: 5 }, borderLeft: "6px solid #4caf50", borderRadius: "16px", mb: { xs: 4, md: 6 }, width: "100%", maxWidth: "1400px", mx: "auto", backgroundColor: "#ffffff" }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "#0c3c3c", fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" } }}>
                    Search Medicine
                </Typography>
                <Grid container spacing={3}>
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
                                "& .MuiInputLabel-root": { fontSize: { xs: "1rem", md: "1.1rem" } },
                                "& .MuiSelect-select": { fontSize: { xs: "1rem", md: "1.1rem" } }
                            }}
                        >
                            <MenuItem value="generic">Generic Name</MenuItem>
                            <MenuItem value="name">Brand Name</MenuItem>
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
                    <Grid item xs={12} md={9}>
                        <TextField
                            fullWidth
                            label={`Search by ${searchMethod}`}
                            size="medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                "& .MuiInputLabel-root": { fontSize: { xs: "1rem", md: "1.1rem" } },
                                "& .MuiInputBase-input": { fontSize: { xs: "1rem", md: "1.1rem" } }
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <Paper elevation={3} sx={{ p: { xs: 3, sm: 4, md: 5 }, borderLeft: "6px solid #4caf50", borderRadius: "16px", backgroundColor: "#ffffff" }}>
                <Typography variant="h5" sx={{ mb: 4, fontWeight: 600, textAlign: "center", color: "#0c3c3c", fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" } }}>
                    {loading ? "Loading medicines..." : `Available Medicines (${filtered.length} items)`}
                </Typography>

                <Paper elevation={2} sx={{ mb: 4, p: 3, borderRadius: "12px", backgroundColor: "#f8f9fa", border: "2px solid #e0e0e0" }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, textAlign: "center", color: "#000000", fontSize: { xs: "1.1rem", md: "1.3rem" } }}>
                        Status Legend
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 2, md: 4 }, justifyContent: "center", alignItems: "center" }}>
                        {[
                            { color: "#ffebee", border: "#c62828", label: "Expired", textColor: "#c62828" },
                            { color: "#fff3e0", border: "#f57c00", label: "Near Expiry (≤30 days)", textColor: "#f57c00" },
                            { color: "#fff3cd", border: "#856404", label: "Low Stock (<50 units)", textColor: "#856404" },
                            { color: "#e8f5e8", border: "#4caf50", label: "Normal Stock", textColor: "#2e7d32" }
                        ].map((status, i) => (
                            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Box sx={{ width: { xs: 20, md: 24 }, height: { xs: 20, md: 24 }, backgroundColor: status.color, border: `2px solid ${status.border}`, borderRadius: "4px" }} />
                                <Typography sx={{ fontSize: { xs: "1rem", md: "1.1rem" }, color: status.textColor, fontWeight: 600 }}>
                                    {status.label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>

                <Box sx={{ overflowX: "auto" }}>
                    <Table sx={{ minWidth: 1100 }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                {["Generic Name", "Brand Name", "Form", "Strength", "Stock (units)", "Unit Price (Rs.)", "Batch No.", "MFG Date", "Expiry Date", "Manufacturer", "Category"].map((header) => (
                                    <TableCell
                                        key={header}
                                        sx={{
                                            fontSize: { xs: "1rem", md: "1.2rem" },
                                            fontWeight: 700,
                                            color: "#2c5aa0",
                                            textAlign: "center",
                                            py: 2,
                                            whiteSpace: 'nowrap',
                                            width: header === "Brand Name" ? 150 : (header === "MFG Date" || header === "Expiry Date") ? 140 : 'auto',
                                        }}
                                    >
                                        {header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={11} align="center">Loading...</TableCell></TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={11} align="center">No matching medicines found</TableCell></TableRow>
                            ) : (
                                filtered.map((med, i) => {
                                    const rowStyle = getRowColor(med);
                                    return (
                                        <TableRow key={i} sx={{ backgroundColor: rowStyle.bg, "&:hover": { backgroundColor: rowStyle.bg === "transparent" ? "#f8f9fa" : rowStyle.bg } }}>
                                            <TableCell sx={{ fontSize: { xs: "1rem", md: "1.1rem" }, color: rowStyle.color, textAlign: "center", fontWeight: 500, py: 2 }}>
                                                {med.generic}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: { xs: "1rem", md: "1.1rem" }, color: rowStyle.color, textAlign: "center", fontWeight: 500, py: 2, whiteSpace: 'nowrap', width: 140 }}>
                                                {med.name}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: { xs: "1rem", md: "1.1rem" }, color: rowStyle.color, textAlign: "center", py: 2 }}>
                                                {med.form}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: { xs: "1rem", md: "1.1rem" }, color: rowStyle.color, textAlign: "center", py: 2 }}>
                                                {med.strength}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: { xs: "1rem", md: "1.1rem" }, color: rowStyle.color, textAlign: "center", fontWeight: 600, py: 2 }}>
                                                {med.stock}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: { xs: "1rem", md: "1.1rem" }, color: rowStyle.color, textAlign: "center", py: 2 }}>
                                                {med.unitPrice !== null && med.unitPrice !== undefined ? `Rs. ${parseFloat(med.unitPrice).toFixed(2)}` : "-"}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: { xs: "1rem", md: "1.1rem" }, color: rowStyle.color, textAlign: "center", py: 2 }}>
                                                {med.batch}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: { xs: "1rem", md: "1.1rem" }, color: rowStyle.color, textAlign: "center", py: 2, whiteSpace: 'nowrap', width: 140 }}>
                                                {med.mfg}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: { xs: "1rem", md: "1.1rem" }, color: rowStyle.color, textAlign: "center", fontWeight: 600, py: 2, whiteSpace: 'nowrap', width: 140 }}>
                                                {med.expiry}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: { xs: "1rem", md: "1.1rem" }, color: rowStyle.color, textAlign: "center", py: 2 }}>
                                                {med.manufacturer}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: { xs: "1rem", md: "1.1rem" }, color: rowStyle.color, textAlign: "center", py: 2 }}>
                                                {med.category}
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