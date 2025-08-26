import React from "react";
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Grid
} from "@mui/material";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Cell
} from "recharts";


const prescriptions = [
    { time: "10:30 AM", patient: "John Doe" },
    { time: "11:00 AM", patient: "Jane Smith" },
    { time: "11:30 AM", patient: "David Lee" }
];

const inventory = [
    { medicine: "Paracetamol 500mg", stock: 150 },
    { medicine: "Amoxicillin 250mg", stock: 80 },
    { medicine: "Cough Syrup 100ml", stock: 15 }
];

const patientData = [
    { day: "Mon", count: 12 },
    { day: "Tue", count: 18 },
    { day: "Wed", count: 10 },
    { day: "Thu", count: 22 },
    { day: "Fri", count: 15 },
    { day: "Sat", count: 8 },
    { day: "Sun", count: 14 }
];

const colors = [
    "#FF6B6B",
    "#FFD93D",
    "#6BCB77",
    "#4D96FF",
    "#F08A5D",
    "#C77DFF",
    "#3AB4F2"
];

const PharmacyDashboard = ({ user }) => {

    const pharmacistName = user?.name || user?.username || user?.firstName || 'Pharmacist';

    return (
        <Box
            sx={{
                px: { xs: 2, sm: 3, md: 4, lg: 6 },
                py: { xs: 2, sm: 3, md: 3, lg: 4 },
                maxWidth: "1400px",
                mx: "auto"
            }}
        >

            <Typography
                variant="h4"
                sx={{
                    color: "#0c3c3c",
                    fontWeight: 800,
                    textAlign: "left",
                    mb: { xs: 3, md: 4 },
                    fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.8rem", lg: "3.2rem" },
                    pl: { xs: 1, md: 2 } // Left padding to align with boxes
                }}
            >
                Welcome, {pharmacistName}
            </Typography>

            <Grid
                container
                spacing={{ xs: 2, md: 3, lg: 4 }}
                justifyContent="flex-start"
                alignItems="stretch"
                mb={4}
            >

                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={4}
                        sx={{
                            height: 320,
                            p: { xs: 2, sm: 2.5, md: 3 },
                            borderLeft: "6px solid #45d27a",
                            borderRadius: "12px",
                            display: "flex",
                            flexDirection: "column"
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 2,
                                fontWeight: 800,
                                textAlign: "center",
                                fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" }
                            }}
                        >
                            Pending Prescriptions
                        </Typography>
                        <TableContainer sx={{ flexGrow: 1 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: { xs: "0.85rem", md: "0.95rem" },
                                                textAlign: "center",
                                                py: 1
                                            }}
                                        >
                                            Time
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: { xs: "0.85rem", md: "0.95rem" },
                                                textAlign: "center",
                                                py: 1
                                            }}
                                        >
                                            Patient Name
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {prescriptions.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={2}
                                                align="center"
                                                sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, py: 2 }}
                                            >
                                                No pending prescriptions
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        prescriptions.map((p, index) => (
                                            <TableRow
                                                key={index}
                                                sx={{ "&:hover": { backgroundColor: "#f5f7fa" } }}
                                            >
                                                <TableCell align="center" sx={{ py: 1.5, fontSize: { xs: "0.85rem", md: "0.9rem" } }}>
                                                    {p.time}
                                                </TableCell>
                                                <TableCell align="center" sx={{ py: 1.5, fontSize: { xs: "0.85rem", md: "0.9rem" } }}>
                                                    {p.patient}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>


                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={4}
                        sx={{
                            height: 320,
                            p: { xs: 2, sm: 2.5, md: 3 },
                            borderLeft: "6px solid #45d27a",
                            borderRadius: "12px",
                            display: "flex",
                            flexDirection: "column"
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 2,
                                fontWeight: 800,
                                textAlign: "center",
                                fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" }
                            }}
                        >
                            Inventory Status
                        </Typography>
                        <TableContainer sx={{ flexGrow: 1 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: { xs: "0.85rem", md: "0.95rem" },
                                                textAlign: "center",
                                                py: 1
                                            }}
                                        >
                                            Medicine
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: { xs: "0.85rem", md: "0.95rem" },
                                                textAlign: "center",
                                                py: 1
                                            }}
                                        >
                                            Stock
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {inventory.map((item, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{
                                                backgroundColor:
                                                    item.stock < 20 ? "#fff3cd" : "transparent"
                                            }}
                                        >
                                            <TableCell
                                                align="center"
                                                sx={{
                                                    fontWeight: item.stock < 20 ? 700 : 500,
                                                    color: item.stock < 20 ? "red" : "inherit",
                                                    py: 1.5,
                                                    fontSize: { xs: "0.8rem", md: "0.85rem" }
                                                }}
                                            >
                                                {item.medicine}
                                            </TableCell>
                                            <TableCell
                                                align="center"
                                                sx={{
                                                    fontWeight: item.stock < 20 ? 700 : 500,
                                                    color: item.stock < 20 ? "red" : "inherit",
                                                    py: 1.5,
                                                    fontSize: { xs: "0.85rem", md: "0.9rem" }
                                                }}
                                            >
                                                {item.stock}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>


                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={4}
                        sx={{
                            height: 320,
                            p: { xs: 2, sm: 2.5, md: 3 },
                            borderLeft: "6px solid #45d27a",
                            borderRadius: "12px",
                            display: "flex",
                            flexDirection: "column"
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 2,
                                fontWeight: 800,
                                textAlign: "center",
                                fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" }
                            }}
                        >
                            Weekly Patient Count
                        </Typography>
                        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={patientData}
                                    margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="day"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip />
                                    <Bar dataKey="count" barSize={25}>
                                        {patientData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={colors[index % colors.length]}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PharmacyDashboard;