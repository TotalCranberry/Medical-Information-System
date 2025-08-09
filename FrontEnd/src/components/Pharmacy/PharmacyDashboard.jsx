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

// Sample data
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

const PharmacyDashboard = () => {
  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 3, md: 5, lg: 8 },
        py: { xs: 2, sm: 3, md: 3, lg: 4 },
        maxWidth: "100%",
        mx: "auto"
      }}
    >
      {/* Heading */}
      <Typography
        variant="h4"
        sx={{
          color: "#0c3c3c",
          fontWeight: 800,
          textAlign: "left",
          mb: { xs: 3, md: 3 },
          fontSize: { xs: "1.6rem", sm: "2rem", md: "2.6rem", lg: "3rem" }
        }}
      >
        Welcome, Pharmacist
      </Typography>

      {/* Top row: two boxes side by side */}
      <Grid
        container
        spacing={8}
        justifyContent="center"
        alignItems="stretch"
        mb={6}
      >
        {/* Pending Prescriptions */}
        <Grid item>
          <Paper
            elevation={4}
            sx={{
              width: { xs: "100%", md: 500 },   // Fixed width
              height: 300,                      // Fixed height
              p: { xs: 2, sm: 3, md: 4 },
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
                fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" }
              }}
            >
              Pending Prescriptions
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.9rem", md: "1.2rem" },
                        textAlign: "center"
                      }}
                    >
                      Time
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.9rem", md: "1.2rem" },
                        textAlign: "center"
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
                        sx={{ fontSize: { xs: "1rem", md: "1.2rem" } }}
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
                        <TableCell align="center">{p.time}</TableCell>
                        <TableCell align="center">{p.patient}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Inventory Status */}
        <Grid item>
          <Paper
            elevation={4}
            sx={{
              width: { xs: "100%", md: 500 },   // Fixed width
              height: 300,                      // Fixed height
              p: { xs: 2, sm: 3, md: 4 },
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
                fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" }
              }}
            >
              Inventory Status
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.9rem", md: "1.2rem" },
                        textAlign: "center"
                      }}
                    >
                      Medicine
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.9rem", md: "1.2rem" },
                        textAlign: "center"
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
                          color: item.stock < 20 ? "red" : "inherit"
                        }}
                      >
                        {item.medicine}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: item.stock < 20 ? 700 : 500,
                          color: item.stock < 20 ? "red" : "inherit"
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
      </Grid>

      {/* Bottom row: Weekly Patient Count */}
      <Grid container justifyContent="center">
        <Grid item>
          <Paper
            elevation={4}
            sx={{
              width: { xs: "100%", md: 700 },  // Full width of top two boxes combined
              height: 400,                      // Fixed height
              p: { xs: 2, sm: 3, md: 4 },
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
                fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" }
              }}
            >
              Weekly Patient Count
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={patientData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" barSize={50}>
                  {patientData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PharmacyDashboard;
