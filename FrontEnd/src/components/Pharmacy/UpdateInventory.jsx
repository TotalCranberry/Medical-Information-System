import React, { useState, useEffect } from "react";
import {
    Box, Typography, Paper, TextField, Button, Grid,
    Table, TableHead, TableRow, TableCell, TableBody, MenuItem, Snackbar, Alert
} from "@mui/material";
import {
    getAllMedicines,
    saveMedicine,
    searchMedicines,
    deleteMedicine
} from "../../api/medicine";
import apiFetch from "../../api/api";

const UpdateInventoryPage = () => {
    const [inventory, setInventory] = useState([]);
    const [mode, setMode] = useState("add");
    const [searchFilter, setSearchFilter] = useState("name");
    const [searchTerm, setSearchTerm] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, success: true, message: "" });

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


    const fetchInventory = async () => {
        try {
            const data = await getAllMedicines();
            setInventory(data);
        } catch (err) {
            console.error("Inventory load failed", err);
            setSnackbar({ open: true, success: false, message: "Failed to load inventory" });
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

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
                        setFormData({ ...formData });
                    }
                })
                .catch(() => {
                    setMode("add");
                    setSnackbar({ open: true, success: false, message: "Medicine not found." });
                });

        } else {
            searchMedicines(searchTerm, searchFilter)
                .then((res) => {
                    if (res.length > 0) {
                        setMode("update");
                        setFormData(res[0]);
                    } else {
                        setMode("add");
                        setFormData({ ...formData, [searchFilter]: searchTerm });
                    }
                })
                .catch(() => {
                    setMode("add");
                    setFormData({ ...formData, [searchFilter]: searchTerm });
                    setSnackbar({ open: true, success: false, message: "Search failed." });
                });
        }
    };

    const handleSubmit = () => {
        const payload = {
            ...formData,
            stock: parseInt(formData.stock),
            unitPrice: parseFloat(formData.unitPrice)
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
        setSnackbar({
            open: true,
            success: true,
            message: "Form cleared. Ready to add new medicine!"
        });
    };


    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this medicine?")) {
            try {

                await deleteMedicine(id);


                setInventory(prevInventory => prevInventory.filter(medicine => medicine.id !== id));


                setSnackbar({ open: true, success: true, message: "Medicine deleted successfully!" });

            } catch (error) {
                console.error("Delete error:", error);

                try {
                    const refreshedData = await getAllMedicines();
                    setInventory(refreshedData);


                    const itemStillExists = refreshedData.some(medicine => medicine.id === id);
                    if (!itemStillExists) {

                        setSnackbar({ open: true, success: true, message: "Medicine deleted successfully!" });
                    } else {

                        setSnackbar({ open: true, success: false, message: "Delete failed!" });
                    }
                } catch (refreshError) {

                    setSnackbar({ open: true, success: false, message: "Delete failed!" });
                }
            }
        }
    };

    const suggestions = [...new Set(inventory.map((m) => m[searchFilter]?.toString() || ""))];


    const formatLabel = (field) => {
        const labelMap = {
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
            unitPrice: "Unit Price "
        };
        return labelMap[field] || field.charAt(0).toUpperCase() + field.slice(1);
    };


    const formFields = ["generic", "name", "form", "strength", "batch", "manufacturer", "category"];
    const dateFields = ["mfg", "expiry"];

    return (
        <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: "1400px", mx: "auto" }}>
            <Typography
                variant="h4"
                sx={{
                    color: "#0c3c3c",
                    fontWeight: 700,
                    mb: 4,
                    textAlign: "left",
                    fontSize: { xs: "1.8rem", md: "2.125rem" }
                }}
            >
                Update Inventory
            </Typography>


            <Paper
                elevation={4}
                sx={{
                    p: { xs: 3, md: 4 },
                    borderLeft: "6px solid #45d27a",
                    borderRadius: "12px",
                    mb: 4,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        mb: 3,
                        fontWeight: 600,
                        color: "#0c3c3c",
                        fontSize: { xs: "1.1rem", md: "1.25rem" }
                    }}
                >
                    Search Existing Medicine
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
                            sx={{
                                "& .MuiInputLabel-root": { fontSize: "0.95rem" },
                                "& .MuiInputBase-input": { fontSize: "0.95rem" }
                            }}
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
                                        sx={{
                                            "& .MuiInputLabel-root": { fontSize: "0.95rem" },
                                            "& .MuiInputBase-input": { fontSize: "0.95rem" }
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
                                        sx={{
                                            "& .MuiInputLabel-root": { fontSize: "0.95rem" },
                                            "& .MuiInputBase-input": { fontSize: "0.95rem" }
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
                                    sx={{
                                        "& .MuiInputLabel-root": { fontSize: "0.95rem" },
                                        "& .MuiInputBase-input": { fontSize: "0.95rem" }
                                    }}
                                />
                                {searchTerm && suggestions.length > 0 && (
                                    <Paper
                                        elevation={8}
                                        sx={{
                                            position: "absolute",
                                            top: "100%",
                                            left: 0,
                                            right: 0,
                                            zIndex: 10,
                                            maxHeight: 200,
                                            overflowY: "auto",
                                            borderRadius: "8px",
                                            mt: 1
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
                                                        "&:hover": { backgroundColor: "#f0f8f0" },
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
                            variant="contained"
                            fullWidth
                            onClick={handleSearch}
                            size="large"
                            sx={{
                                py: 1.5,
                                fontSize: "0.95rem",
                                fontWeight: 600,
                                backgroundColor: "#45d27a",
                                "&:hover": { backgroundColor: "#3bc46a" }
                            }}
                        >
                            Search
                        </Button>
                    </Grid>
                </Grid>
            </Paper>


            <Paper
                elevation={4}
                sx={{
                    p: { xs: 3, md: 4 },
                    borderLeft: "6px solid #45d27a",
                    borderRadius: "12px",
                    mb: 4,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        mb: 3,
                        fontWeight: 600,
                        color: "#0c3c3c",
                        fontSize: { xs: "1.1rem", md: "1.25rem" }
                    }}
                >
                    {mode === "update" ? "Update Stock & Dates" : "Add New Medicine"}
                </Typography>

                <Grid container spacing={3}>
                    {/* Regular form fields */}
                    {formFields.map((field) => (
                        <Grid item xs={12} sm={6} md={4} key={field}>
                            <TextField
                                fullWidth
                                label={formatLabel(field)}
                                value={formData[field]}
                                onChange={(e) => handleChange(field, e.target.value)}
                                disabled={mode === "update" && !["stock", "mfg", "expiry","unitPrice"].includes(field)}
                                size="medium"
                                sx={{
                                    "& .MuiInputLabel-root": { fontSize: "0.95rem" },
                                    "& .MuiInputBase-input": { fontSize: "0.95rem" },
                                    "& .MuiInputBase-root": { minHeight: "56px" }
                                }}
                            />
                        </Grid>
                    ))}


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
                                sx={{
                                    "& .MuiInputLabel-root": { fontSize: "0.95rem" },
                                    "& .MuiInputBase-input": { fontSize: "0.95rem" },
                                    "& .MuiInputBase-root": { minHeight: "56px" }
                                }}
                            />
                        </Grid>
                    ))}


                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            label={formatLabel("stock")}
                            type="number"
                            value={formData.stock}
                            onChange={(e) => handleChange("stock", e.target.value)}
                            inputProps={{ min: 0 }}
                            size="medium"
                            sx={{
                                "& .MuiInputLabel-root": { fontSize: "0.95rem" },
                                "& .MuiInputBase-input": { fontSize: "0.95rem" },
                                "& .MuiInputBase-root": { minHeight: "56px" }
                            }}
                        />
                    </Grid>
                    {/* Unit Price */}
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            label="Unit Price in Rs: xx.xx"
                            type="number"
                            inputProps={{ step: "0.01", min: 0 }}
                            value={formData.unitPrice}
                            onChange={(e) => handleChange("unitPrice", e.target.value)}
                            disabled={mode === "update" ? false : false}
                            size="medium"
                            sx={{
                                "& .MuiInputLabel-root": { fontSize: "0.95rem" },
                                "& .MuiInputBase-input": { fontSize: "0.95rem" },
                                "& .MuiInputBase-root": { minHeight: "56px" }
                            }}
                        />
                    </Grid>

                </Grid>

                <Box sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        size="large"
                        sx={{
                            px: 6,
                            py: 1.5,
                            fontSize: "1rem",
                            fontWeight: 600,
                            backgroundColor: "#45d27a",
                            "&:hover": { backgroundColor: "#3bc46a" },
                            borderRadius: "8px"
                        }}
                    >
                        {mode === "update" ? "Update Stock" : "Add Medicine"}
                    </Button>

                    {mode === "update" && (
                        <Button
                            variant="outlined"
                            onClick={handleCancel}
                            size="large"
                            sx={{
                                px: 6,
                                py: 1.5,
                                fontSize: "1rem",
                                fontWeight: 600,
                                borderColor: "#45d27a",
                                color: "#45d27a",
                                "&:hover": {
                                    borderColor: "#3bc46a",
                                    color: "#3bc46a",
                                    backgroundColor: "rgba(69, 210, 122, 0.04)"
                                },
                                borderRadius: "8px"
                            }}
                        >
                            Cancel
                        </Button>
                    )}
                </Box>
            </Paper>


            <Paper
                elevation={4}
                sx={{
                    p: { xs: 3, md: 4 },
                    borderLeft: "6px solid #45d27a",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        mb: 3,
                        fontWeight: 600,
                        textAlign: "center",
                        color: "#0c3c3c",
                        fontSize: { xs: "1.1rem", md: "1.25rem" }
                    }}
                >
                    Current Inventory
                </Typography>
                <Box sx={{ overflowX: "auto" }}>
                    <Table sx={{ minWidth: 1000 }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                                {["Generic", "Brand Name", "Form", "Strength", "Stock", "Unit Price", "Batch", "MFG Date", "Expiry Date", "Manufacturer","Last Updated", "Category", "Actions"].map((header) => (
                                    <TableCell
                                        key={header}
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: "0.9rem",
                                            color: "#0c3c3c",
                                            py: 2,
                                            whiteSpace: 'nowrap',
                                            width: header === "Brand Name" ? 150 : (header === "MFG Date" || header === "Expiry Date") ? 190 : 'auto',
                                        }}
                                    >
                                        {header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {inventory.map((medicine) => (
                                <TableRow
                                    key={medicine.id}
                                    sx={{
                                        backgroundColor: medicine.stock < 50 ? "#ffebee" : "inherit",
                                        "&:hover": { backgroundColor: medicine.stock < 50 ? "#ffcdd2" : "#f5f5f5" },
                                        transition: "background-color 0.2s"
                                    }}
                                >
                                    <TableCell sx={{ fontSize: "0.9rem", color: medicine.stock < 50 ? "#d32f2f" : "inherit" }}>
                                        {medicine.generic || "-"}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "0.9rem", color: medicine.stock < 50 ? "#d32f2f" : "inherit", fontWeight: medicine.stock < 50 ? 600 : 400 }}>
                                        {medicine.name}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "0.9rem" }}>{medicine.form}</TableCell>
                                    <TableCell sx={{ fontSize: "0.9rem" }}>{medicine.strength}</TableCell>
                                    <TableCell sx={{ fontSize: "0.9rem", fontWeight: medicine.stock < 50 ? 700 : 400, color: medicine.stock < 50 ? "#d32f2f" : "inherit" }}>
                                        {medicine.stock}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "0.9rem" }}>
                                        {medicine.unitPrice ? `Rs. ${medicine.unitPrice.toFixed(2)}` : "-"}
                                    </TableCell>

                                    <TableCell sx={{ fontSize: "0.9rem" }}>{medicine.batch}</TableCell>
                                    <TableCell sx={{ fontSize: "0.9rem" ,whiteSpace: 'nowrap', width: 150 }}>{medicine.mfg}</TableCell>
                                    <TableCell sx={{ fontSize: "0.9rem",whiteSpace: 'nowrap', width: 150 }}>{medicine.expiry}</TableCell>
                                    <TableCell sx={{ fontSize: "0.9rem" }}>{medicine.manufacturer}</TableCell>
                                    <TableCell sx={{ fontSize: "0.9rem" }}>
                                        {medicine.lastUpdate ? new Date(medicine.lastUpdate).toLocaleDateString("en-GB") : "-"}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "0.9rem" }}>{medicine.category}</TableCell>


                                    <TableCell>
                                        <Button
                                            color="error"
                                            size="small"
                                            onClick={() => handleDelete(medicine.id)}
                                            sx={{
                                                fontSize: "0.8rem",
                                                fontWeight: 600,
                                                px: 2,
                                                "&:hover": { backgroundColor: "#ffebee" }
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {inventory.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={11} sx={{ textAlign: "center", py: 4, fontSize: "1rem", color: "#666" }}>
                                        No medicines found in inventory
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Box>
            </Paper>


            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity={snackbar.success ? "success" : "error"}
                    sx={{ fontSize: "0.95rem" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UpdateInventoryPage;