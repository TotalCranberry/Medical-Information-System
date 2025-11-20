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
    Fade,
    Grow,
    Skeleton,
    Card,
    CardContent
} from "@mui/material";
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
import { getAllMedicines } from "../../api/medicine";

const THEME = {
    primary: "#0C3C3C",
    accent: "#45D27A",
    gray: "#6C6B6B",
    white: "#ffffff",
    lightGray: "#F8F9FA",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    background: "#FAFBFC"
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
        "&.Mui-focused": {
            color: THEME.primary,
        },
    },
};

const cardSx = {
    borderRadius: "20px",
    background: `linear-gradient(135deg, ${THEME.white} 0%, #f8fffe 100%)`,
    border: `1px solid rgba(69, 210, 122, 0.1)`,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 12px 35px rgba(12, 60, 60, 0.15)",
    },
};

const tableRowSx = (rowStyle) => ({
    backgroundColor: rowStyle.bg,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
        backgroundColor: rowStyle.bg === "transparent" ? "rgba(69, 210, 122, 0.04)" : rowStyle.bg,
        transform: "scale(1.01)",
        "& .MuiTableCell-root": {
            borderColor: "rgba(69, 210, 122, 0.2)",
        }
    },
});

const InventoryPage = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchMethod, setSearchMethod] = useState("generic");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilter, setSelectedFilter] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await getAllMedicines();
                setMedicines(data);
                // Small delay for smooth animation
                setTimeout(() => setLoading(false), 500);
            } catch (err) {
                console.error("Error fetching medicines:", err);
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const getRowColor = (medicine) => {
        const currentDate = new Date();
        const expiryDate = new Date(medicine.expiry);
        const timeDifference = expiryDate.getTime() - currentDate.getTime();
        const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

        // Use configurable low stock threshold, fallback to 50 if not set
        const lowStockThreshold = medicine.lowStockQuantity ? parseInt(medicine.lowStockQuantity) : 50;

        if (daysDifference < 0) {
            return { bg: "#ffebee", color: "#c62828", status: "expired" };
        } else if (daysDifference <= 30) {
            return { bg: "#fff3e0", color: "#f57c00", status: "near-expiry" };
        } else if (medicine.stock < lowStockThreshold) {
            return { bg: "#fff3cd", color: "#856404", status: "low-stock" };
        }
        return { bg: "transparent", color: "inherit", status: "normal" };
    };

    // Status checking functions for filtering (allow multiple statuses)
    const isExpired = (medicine) => {
        const currentDate = new Date();
        const expiryDate = new Date(medicine.expiry);
        return expiryDate < currentDate;
    };

    const isNearExpiry = (medicine) => {
        const currentDate = new Date();
        const expiryDate = new Date(medicine.expiry);
        const timeDifference = expiryDate.getTime() - currentDate.getTime();
        const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
        return daysDifference >= 0 && daysDifference <= 30;
    };

    const isLowStock = (medicine) => {
        const lowStockThreshold = medicine.lowStockQuantity ? parseInt(medicine.lowStockQuantity) : 50;
        return medicine.stock < lowStockThreshold;
    };

    const isNormal = (medicine) => {
        return !isExpired(medicine) && !isNearExpiry(medicine) && !isLowStock(medicine);
    };

    const filtered = medicines.filter((med) => {
        const value = med[searchMethod]?.toString().toLowerCase();
        const matchesSearch = value?.includes((searchTerm || "").toLowerCase());
        if (!matchesSearch) return false;
        if (!selectedFilter) return true;

        // Check if medicine matches the selected filter status
        switch (selectedFilter) {
            case "expired":
                return isExpired(med);
            case "near-expiry":
                return isNearExpiry(med);
            case "low-stock":
                return isLowStock(med);
            case "normal":
                return isNormal(med);
            default:
                return true;
        }
    });

    // Calculate statistics
    const stats = {
        total: medicines.length,
        expired: medicines.filter(med => isExpired(med)).length,
        nearExpiry: medicines.filter(med => isNearExpiry(med)).length,
        lowStock: medicines.filter(med => isLowStock(med)).length,
    };

    const clearSearch = () => {
        setSearchTerm("");
    };

    const statusLegend = [
        {
            status: "expired",
            color: "#ffebee",
            border: "#c62828",
            label: "Expired",
            textColor: "#c62828",
            icon: ErrorIcon,
            count: stats.expired
        },
        {
            status: "near-expiry",
            color: "#fff3e0",
            border: "#f57c00",
            label: "Near Expiry (≤30 days)",
            textColor: "#f57c00",
            icon: WarningIcon,
            count: stats.nearExpiry
        },
        {
            status: "low-stock",
            color: "#fff3cd",
            border: "#856404",
            label: "Low Stock (below threshold)",
            textColor: "#856404",
            icon: TrendingUpIcon,
            count: stats.lowStock
        },
        {
            status: "normal",
            color: "#e8f5e8",
            border: "#4caf50",
            label: "Normal Stock",
            textColor: "#2e7d32",
            icon: CheckCircleIcon,
            count: medicines.filter(med => isNormal(med)).length
        },
        {
            status: null,
            color: "#f3f4f6",
            border: THEME.primary,
            label: "Show All",
            textColor: THEME.primary,
            icon: InventoryIcon,
            count: stats.total
        }
    ];

    const searchOptions = [
        { value: "generic", label: "Generic Name", icon: PharmacyIcon },
        { value: "name", label: "Brand Name", icon: PharmacyIcon },
        { value: "form", label: "Form", icon: CategoryIcon },
        { value: "strength", label: "Strength", icon: TrendingUpIcon },
        { value: "stock", label: "Stock", icon: InventoryIcon },
        { value: "mfg", label: "Manufacturing Date", icon: CategoryIcon },
        { value: "expiry", label: "Expiry Date", icon: WarningIcon },
        { value: "manufacturer", label: "Manufacturer", icon: CategoryIcon },
        { value: "category", label: "Category", icon: CategoryIcon },
    ];

    if (loading) {
        return (
            <Box sx={{ px: 3, py: 5, backgroundColor: THEME.background, minHeight: "100vh" }}>
                <Skeleton variant="text" width={400} height={60} sx={{ mb: 5 }} />
                
                {/* Search Section Skeleton */}
                <Paper elevation={8} sx={{ p: 4, borderRadius: "24px", mb: 4 }}>
                    <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: "16px" }} />
                        </Grid>
                        <Grid item xs={12} md={9}>
                            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: "16px" }} />
                        </Grid>
                    </Grid>
                </Paper>

                {/* Statistics Cards Skeleton */}
                <Grid container spacing={3} mb={4}>
                    {[1, 2, 3, 4].map((i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: "20px" }} />
                        </Grid>
                    ))}
                </Grid>

                {/* Table Skeleton */}
                <Paper elevation={8} sx={{ p: 4, borderRadius: "24px" }}>
                    <Skeleton variant="text" width={300} height={40} sx={{ mb: 3 }} />
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: "8px" }} />
                    ))}
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ px: 3, py: 5, backgroundColor: THEME.background, minHeight: "100vh" }}>
            <Fade in timeout={800}>
                <Box>
                    {/* Header */}
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
                                paddingBottom: "4px"
                            }}
                        >
                            Inventory Management
                        </Typography>
                    </Box>

                    {/* Search Section */}
                    <Paper elevation={8} sx={{ ...cardSx, p: 4, mb: 4 }}>
                        <Typography variant="h6" sx={{ 
                            mb: 3, 
                            fontWeight: 600, 
                            color: THEME.primary,
                            display: "flex",
                            alignItems: "center"
                        }}>
                            <SearchIcon sx={{ mr: 1 }} />
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
                            <Grid item xs={12} md={9}>
                                <TextField
                                    fullWidth
                                    label={`Search by ${searchOptions.find(opt => opt.value === searchMethod)?.label || searchMethod}`}
                                    size="medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    sx={inputSx}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: THEME.gray }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchTerm && (
                                            <InputAdornment position="end">
                                                <IconButton onClick={clearSearch} size="small">
                                                    <ClearIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Statistics Cards */}
                    <Grid container spacing={3} mb={4}>
                        {statusLegend.map((stat, index) => (
                            <Grow in timeout={1000 + index * 200} key={stat.label}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card
                                        sx={{
                                            ...cardSx,
                                            cursor: "pointer",
                                            ...(selectedFilter === stat.status && {
                                                border: `3px solid ${stat.border}`,
                                                boxShadow: `0 0 20px ${stat.color}`
                                            })
                                        }}
                                        onClick={() => setSelectedFilter(selectedFilter === stat.status ? null : stat.status)}
                                    >
                                        <CardContent sx={{ textAlign: "center", p: 3 }}>
                                            <Avatar sx={{ 
                                                bgcolor: `${stat.textColor}15`, 
                                                color: stat.textColor, 
                                                width: 48, 
                                                height: 48,
                                                mx: "auto",
                                                mb: 2
                                            }}>
                                                <stat.icon fontSize="medium" />
                                            </Avatar>
                                            <Typography variant="h4" sx={{ 
                                                fontWeight: 800, 
                                                color: stat.textColor,
                                                mb: 1
                                            }}>
                                                {stat.count}
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

                    {/* Status Legend */}
                    <Paper elevation={8} sx={{ ...cardSx, p: 3, mb: 4 }}>
                        <Typography variant="h6" sx={{ 
                            mb: 3, 
                            fontWeight: 600, 
                            textAlign: "center", 
                            color: THEME.primary
                        }}>
                            Status Legend
                        </Typography>
                        <Box sx={{ 
                            display: "flex", 
                            flexWrap: "wrap", 
                            gap: 3, 
                            justifyContent: "center", 
                            alignItems: "center" 
                        }}>
                            {statusLegend.map((status, i) => (
                                <Fade in timeout={500 + i * 100} key={status.label}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Avatar sx={{ 
                                            width: 24, 
                                            height: 24, 
                                            backgroundColor: status.color, 
                                            border: `2px solid ${status.border}`,
                                            borderRadius: "6px"
                                        }}>
                                            <status.icon sx={{ fontSize: "0.8rem", color: status.textColor }} />
                                        </Avatar>
                                        <Typography sx={{ 
                                            fontSize: "1rem", 
                                            color: status.textColor, 
                                            fontWeight: 600 
                                        }}>
                                            {status.label} ({status.count})
                                        </Typography>
                                    </Box>
                                </Fade>
                            ))}
                        </Box>
                    </Paper>

                    {/* Medicine Table */}
                    <Fade in timeout={600}>
                        <Paper elevation={12} sx={{ 
                            borderRadius: "24px",
                            overflow: "hidden",
                            background: `linear-gradient(135deg, ${THEME.white} 0%, #fafffe 100%)`,
                            border: `1px solid rgba(12, 60, 60, 0.08)`
                        }}>
                            <Box sx={{ p: 3, borderBottom: `1px solid rgba(12, 60, 60, 0.1)` }}>
                                <Typography variant="h6" sx={{ 
                                    color: THEME.primary, 
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center"
                                }}>
                                    <PharmacyIcon sx={{ mr: 1 }} />
                                    Available Medicines ({filtered.length} items)
                                </Typography>
                            </Box>
                            
                            <Box sx={{ overflowX: "auto" }}>
                                <Table sx={{ minWidth: 1100 }}>
                                    <TableHead sx={{ bgcolor: "rgba(12, 60, 60, 0.04)" }}>
                                        <TableRow>
                                            {[
                                                "Generic Name", "Brand Name", "Form", "Strength",
                                                "Stock (units)", "Unit Price (Rs.)",
                                                "MFG Date", "Expiry Date", "Manufacturer", "Category"
                                            ].map((header) => (
                                                <TableCell
                                                    key={header}
                                                    sx={{
                                                        fontSize: "1rem",
                                                        fontWeight: 700,
                                                        color: THEME.primary,
                                                        textAlign: "center",
                                                        py: 2,
                                                        whiteSpace: 'nowrap',
                                                        width: header === "Brand Name" ? 150 : 
                                                               (header === "MFG Date" || header === "Expiry Date") ? 140 : 
                                                               'auto',
                                                    }}
                                                >
                                                    {header}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {filtered.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
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
                                                            No matching medicines found
                                                        </Typography>
                                                        <Typography variant="body2" color={THEME.gray} mt={1}>
                                                            {searchTerm 
                                                                ? "Try adjusting your search criteria"
                                                                : "No medicines available in inventory"
                                                            }
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filtered.map((med, i) => {
                                                const rowStyle = getRowColor(med);
                                                return (
                                                    <Fade in timeout={300 + i * 50} key={i}>
                                                        <TableRow sx={tableRowSx(rowStyle)}>
                                                            <TableCell sx={{ 
                                                                fontSize: "1rem", 
                                                                color: rowStyle.color, 
                                                                textAlign: "center", 
                                                                fontWeight: 600,
                                                                py: 2 
                                                            }}>
                                                                {med.generic}
                                                            </TableCell>
                                                            <TableCell sx={{ 
                                                                fontSize: "1rem", 
                                                                color: rowStyle.color, 
                                                                textAlign: "center", 
                                                                fontWeight: 500,
                                                                py: 2, 
                                                                whiteSpace: 'nowrap', 
                                                                width: 140 
                                                            }}>
                                                                {med.name}
                                                            </TableCell>
                                                            <TableCell sx={{ 
                                                                fontSize: "1rem", 
                                                                color: rowStyle.color, 
                                                                textAlign: "center", 
                                                                py: 2 
                                                            }}>
                                                                <Chip 
                                                                    label={med.form}
                                                                    size="small"
                                                                    sx={{ 
                                                                        bgcolor: `${THEME.primary}15`,
                                                                        color: THEME.primary,
                                                                        fontWeight: 600
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell sx={{ 
                                                                fontSize: "1rem", 
                                                                color: rowStyle.color, 
                                                                textAlign: "center", 
                                                                fontWeight: 600,
                                                                py: 2 
                                                            }}>
                                                                {med.strength}
                                                            </TableCell>
                                                            <TableCell sx={{ 
                                                                fontSize: "1rem", 
                                                                color: rowStyle.color, 
                                                                textAlign: "center", 
                                                                fontWeight: 700,
                                                                py: 2 
                                                            }}>
                                                                <Chip 
                                                                    label={`${med.stock} units`}
                                                                    size="small"
                                                                    sx={{ 
                                                                        bgcolor: med.stock < 50 ? `${THEME.warning}15` : `${THEME.success}15`,
                                                                        color: med.stock < 50 ? THEME.warning : THEME.success,
                                                                        fontWeight: 700
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell sx={{
                                                                fontSize: "1rem",
                                                                color: rowStyle.color,
                                                                textAlign: "center",
                                                                fontWeight: 600,
                                                                py: 2
                                                            }}>
                                                                {med.unitPrice !== null && med.unitPrice !== undefined
                                                                    ? `Rs. ${parseFloat(med.unitPrice).toFixed(2)}`
                                                                    : "-"}
                                                            </TableCell>
                                                            <TableCell sx={{
                                                                fontSize: "1rem",
                                                                color: rowStyle.color,
                                                                textAlign: "center",
                                                                py: 2,
                                                                whiteSpace: 'nowrap',
                                                                width: 140
                                                            }}>
                                                                {med.mfg}
                                                            </TableCell>
                                                            <TableCell sx={{ 
                                                                fontSize: "1rem", 
                                                                color: rowStyle.color, 
                                                                textAlign: "center", 
                                                                fontWeight: 700,
                                                                py: 2, 
                                                                whiteSpace: 'nowrap', 
                                                                width: 140 
                                                            }}>
                                                                {med.expiry}
                                                            </TableCell>
                                                            <TableCell sx={{ 
                                                                fontSize: "1rem", 
                                                                color: rowStyle.color, 
                                                                textAlign: "center", 
                                                                py: 2 
                                                            }}>
                                                                {med.manufacturer}
                                                            </TableCell>
                                                            <TableCell sx={{ 
                                                                fontSize: "1rem", 
                                                                color: rowStyle.color, 
                                                                textAlign: "center", 
                                                                py: 2 
                                                            }}>
                                                                <Chip 
                                                                    label={med.category}
                                                                    size="small"
                                                                    sx={{ 
                                                                        bgcolor: `${THEME.accent}15`,
                                                                        color: THEME.accent,
                                                                        fontWeight: 600
                                                                    }}
                                                                />
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
                </Box>
            </Fade>
        </Box>
    );
};

export default InventoryPage;