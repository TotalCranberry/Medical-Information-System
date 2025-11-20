import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, Typography, Paper, Grid, Button,
  Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Select, MenuItem, Chip, Avatar, Fade, Grow, Skeleton,
  InputAdornment, IconButton
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  LocalPharmacy as PharmacyIcon
} from "@mui/icons-material";

import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import {
  getPrescriptionsForPharmacy,
  getCompletedPrescriptionsForPharmacy,
  getPrescriptionById,
  formatPrescriptionDate,
} from "../../api/prescription";
import { getInvoice } from "../../api/invoice";
import ViewPrescriptionDialog from "./ViewprescriptionDialog";

const THEME = {
  primary: "#0C3C3C",
  accent: "#45D27A",
  gray: "#6C6B6B",
  white: "#ffffff",
  lightGray: "#F8F9FA",
  success: "#4CAF50",
  warning: "#FF9800",
  background: "#FAFBFC"
};

const inputSx = {
  minWidth: 260,
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

const buttonTabSx = (active) => ({
  backgroundColor: active ? THEME.primary : "transparent",
  color: active ? "#fff" : THEME.primary,
  borderColor: active ? THEME.primary : "rgba(12, 60, 60, 0.3)",
  borderWidth: 2,
  "&:hover": { 
    backgroundColor: active ? "#0a3030" : "rgba(12, 60, 60, 0.04)",
    borderColor: THEME.primary,
    transform: "translateY(-2px)",
    boxShadow: active 
      ? "0 8px 25px rgba(12, 60, 60, 0.3)" 
      : "0 4px 15px rgba(12, 60, 60, 0.15)"
  },
  fontWeight: 600,
  px: 4,
  py: 1.5,
  borderRadius: "16px",
  textTransform: "none",
  fontSize: "1rem",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
    transition: "left 0.5s ease-in-out",
  },
  "&:hover::before": {
    left: "100%",
  }
});

const cardSx = {
  p: 4,
  textAlign: "center",
  borderLeft: `6px solid ${THEME.accent}`,
  borderRadius: "20px",
  height: 200,
  width: 280,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${THEME.white} 0%, #f8fffe 100%)`,
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: "0 20px 40px rgba(12, 60, 60, 0.15)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: `linear-gradient(90deg, ${THEME.accent}, ${THEME.primary})`,
  }
};

const tableRowSx = {
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    backgroundColor: "rgba(69, 210, 122, 0.04)",
    transform: "scale(1.01)",
    "& .MuiTableCell-root": {
      borderColor: "rgba(69, 210, 122, 0.2)",
    }
  },
  "&:nth-of-type(even)": {
    backgroundColor: "rgba(12, 60, 60, 0.02)",
  }
};

const actionButtonSx = (variant = "primary") => ({
  borderRadius: "12px",
  textTransform: "none",
  fontWeight: 600,
  px: 3,
  py: 1,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  ...(variant === "primary" && {
    borderColor: THEME.accent,
    color: THEME.accent,
    "&:hover": {
      backgroundColor: THEME.accent,
      color: "white",
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(69, 210, 122, 0.3)",
    }
  }),
  ...(variant === "secondary" && {
    borderColor: THEME.primary,
    color: THEME.primary,
    "&:hover": {
      backgroundColor: THEME.primary,
      color: "white",
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(12, 60, 60, 0.3)",
    }
  })
});

const PrescriptionsPage = () => {
  const [tab, setTab] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Queues
  const [pending, setPending] = useState([]);
  const [completed, setCompleted] = useState([]);

  // Dialog
  const [selectedRx, setSelectedRx] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Invoice map: { [prescriptionId]: boolean }
  const [invoiceExists, setInvoiceExists] = useState({});

  // Filters
  const [dateFilter, setDateFilter] = useState(dayjs());
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchText, setSearchText] = useState("");

  // ---- Loaders ----
  const loadPending = async () => {
    try {
      const data = await getPrescriptionsForPharmacy();
      const list = Array.isArray(data) ? [...data] : [];
      list.sort((a, b) => {
        const ta = new Date(a.createdAt || a.prescriptionDate || 0).getTime();
        const tb = new Date(b.createdAt || b.prescriptionDate || 0).getTime();
        return ta - tb;
      });
      setPending(list);
    } catch (e) {
      console.error("Failed to load pending prescriptions:", e);
      setPending([]);
    }
  };

  const loadCompleted = async () => {
    try {
      const data = await getCompletedPrescriptionsForPharmacy();
      const list = Array.isArray(data) ? [...data] : [];
      setCompleted(list);
    } catch (e) {
      console.error("Failed to load completed prescriptions:", e);
      setCompleted([]);
    }
  };

  // Initial loads
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadPending(), loadCompleted()]);
      setTimeout(() => setLoading(false), 500); // Small delay for smooth animation
    };
    loadData();
  }, []);

  // Read activeTab from navigation state
  useEffect(() => {
    if (location.state?.activeTab) {
      setTab(location.state.activeTab);
    }
  }, [location.state]);

  // Keep tab in sync when Status filter changes
  useEffect(() => {
    if (statusFilter === "Pending") setTab("Pending");
    else if (statusFilter === "Completed") setTab("Completed");
  }, [statusFilter]);

  // Build invoice existence map whenever 'completed' changes
  useEffect(() => {
    const run = async () => {
      try {
        const entries = await Promise.all(
          completed.map(async (item) => {
            if (item?.patient?.role === "Staff") {
              const exists = await checkInvoiceExists(item.id);
              return [item.id, exists];
            }
            return [item.id, false];
          })
        );
        const map = {};
        for (const [id, exists] of entries) map[id] = exists;
        setInvoiceExists(map);
      } catch (err) {
        console.error("Failed to check invoice existence:", err);
        setInvoiceExists({});
      }
    };
    if (completed.length) run();
    else setInvoiceExists({});
  }, [completed]);

  // ---- Actions ----
  const handleView = async (row) => {
    try {
      const rx = await getPrescriptionById(row.id);
      setSelectedRx(rx);
      setDialogOpen(true);
    } catch (e) {
      console.error("Failed to fetch prescription:", e);
    }
  };

  const handleViewCompleted = (row) => {
    navigate("/pharmacist/prescription-print", {
      state: {
        prescription: row,
        dispenseResults: [],
        fromCompletedTab: true,
      },
    });
  };

  const handleViewInvoice = (row) => {
    navigate(`/invoice/${row.id}`, {
      state: { fromTab: tab },
    });
  };

  const checkInvoiceExists = async (prescriptionId) => {
    try {
      await getInvoice(prescriptionId);
      return true;
    } catch {
      return false;
    }
  };

  // ---- Filtering helpers ----
  const matchesSearch = (item) => {
    if (!searchText) return true;
    const text = String(searchText).toLowerCase().trim();
    const name = String(item.patientName || "").toLowerCase();
    const idStr = String(item.id || "");
    return name.includes(text) || idStr.includes(text);
  };

  const matchesDate = (item) => {
    if (!dateFilter) return true;
    const raw = item.createdAt || item.prescriptionDate || item.issuedAt || item.date;
    if (!raw) return false;
    const d = dayjs(raw);
    return d.isValid() && d.isSame(dateFilter, "day");
  };

  const statusAllows = (target) => statusFilter === "All" || statusFilter === target;

  const filteredPending = pending.filter(
    (item) => matchesSearch(item) && matchesDate(item) && statusAllows("Pending")
  );

  const filteredCompleted = completed.filter(
    (item) => matchesSearch(item) && matchesDate(item) && statusAllows("Completed")
  );

  const tableRows = tab === "Pending" ? filteredPending : filteredCompleted;

  // ---- Summary ----
  const summary = {
    Pending: { count: filteredPending.length, icon: PendingIcon, color: THEME.warning },
    Completed: { count: filteredCompleted.length, icon: CheckCircleIcon, color: THEME.success },
  };

  const clearFilters = () => {
    setDateFilter(null);
    setStatusFilter("All");
    setSearchText("");
  };

  if (loading) {
    return (
      <Box sx={{ px: 3, py: 5, backgroundColor: THEME.background, minHeight: "100vh" }}>
        <Skeleton variant="text" width={300} height={60} sx={{ mb: 5 }} />
        <Grid container spacing={4} justifyContent="center" mb={5}>
          {[1, 2].map((i) => (
            <Grid item key={i}>
              <Skeleton variant="rectangular" width={280} height={200} sx={{ borderRadius: "20px" }} />
            </Grid>
          ))}
        </Grid>
        <Box display="flex" justifyContent="center" gap={2} mb={3} flexWrap="wrap">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" width={260} height={56} sx={{ borderRadius: "16px" }} />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3, py: 5, backgroundColor: THEME.background, minHeight: "100vh" }}>
      <ViewPrescriptionDialog
        open={dialogOpen}
        onClose={async (result) => {
          const rxCopy = selectedRx;
          setDialogOpen(false);

          if (result?.results) {
            navigate("/pharmacist/prescription-print", {
              state: { prescription: rxCopy, dispenseResults: result.results },
            });
          }

          setSelectedRx(null);
          await loadPending();
        }}
        rx={selectedRx}
      />

      <Fade in timeout={800}>
        <Box>
          {/* Header with icon */}
          <Box display="flex" alignItems="center" mb={5}>
            <Avatar sx={{ 
              bgcolor: THEME.primary, 
              mr: 2, 
              width: 56, 
              height: 56,
              boxShadow: "0 8px 25px rgba(12, 60, 60, 0.3)"
            }}>
              <PharmacyIcon fontSize="large" />
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
              Prescriptions Management
            </Typography>
          </Box>

          {/* Enhanced Summary cards */}
          <Grid container spacing={4} justifyContent="center" mb={6}>
            {Object.entries(summary).map(([key, { count, icon: Icon, color }], index) => (
              <Grow in timeout={1000 + index * 200} key={key}>
                <Grid item>
                  <Paper elevation={12} sx={cardSx}>
                    <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                      <Avatar sx={{ 
                        bgcolor: `${color}15`, 
                        color: color, 
                        width: 48, 
                        height: 48,
                        mr: 2
                      }}>
                        <Icon fontSize="medium" />
                      </Avatar>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: THEME.primary }}
                      >
                        {key}
                      </Typography>
                    </Box>
                    <Typography
                      variant="h3"
                      sx={{ 
                        fontWeight: 800, 
                        color: color,
                        textShadow: "0 2px 4px rgba(0,0,0,0.1)"
                      }}
                    >
                      {count}
                    </Typography>
                    <Chip 
                      label={`${count} total`}
                      size="small"
                      sx={{ 
                        mt: 2,
                        bgcolor: `${color}15`,
                        color: color,
                        fontWeight: 600
                      }}
                    />
                  </Paper>
                </Grid>
              </Grow>
            ))}
          </Grid>

          {/* Enhanced Filters */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Paper 
              elevation={8} 
              sx={{ 
                p: 4, 
                mb: 4, 
                borderRadius: "24px",
                background: `linear-gradient(135deg, ${THEME.white} 0%, #f8fffe 100%)`,
                border: `1px solid rgba(69, 210, 122, 0.1)`
              }}
            >
              <Typography variant="h6" sx={{ color: THEME.primary, fontWeight: 600, mb: 3 }}>
                Filter & Search
              </Typography>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                gap={3}
                flexWrap="wrap"
              >
                <DatePicker
                  label="Filter by Date"
                  value={dateFilter}
                  onChange={(val) => setDateFilter(val)}
                  slotProps={{
                    textField: {
                      variant: "outlined",
                      sx: inputSx,
                    },
                  }}
                />

                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  displayEmpty
                  sx={{ ...inputSx, minWidth: 200 }}
                >
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>

                <TextField
                  label="Search by Patient Name or ID"
                  variant="outlined"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  sx={{ ...inputSx, minWidth: 340 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: THEME.gray }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchText && (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setSearchText("")} size="small">
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  startIcon={<ClearIcon />}
                  sx={{
                    borderColor: THEME.primary,
                    color: THEME.primary,
                    borderRadius: "16px",
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: THEME.primary,
                      color: "white",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(12, 60, 60, 0.3)",
                    }
                  }}
                >
                  Clear All
                </Button>
              </Box>
            </Paper>
          </LocalizationProvider>

          {/* Enhanced Tabs */}
          <Box display="flex" justifyContent="center" mb={4} gap={3}>
            {["Pending", "Completed"].map((label) => (
              <Button
                key={label}
                variant={tab === label ? "contained" : "outlined"}
                onClick={() => setTab(label)}
                sx={buttonTabSx(tab === label)}
                startIcon={label === "Pending" ? <PendingIcon /> : <CheckCircleIcon />}
              >
                {label} ({summary[label].count})
              </Button>
            ))}
          </Box>

          {/* Enhanced Table */}
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
                <Typography variant="h6" sx={{ color: THEME.primary, fontWeight: 600 }}>
                  {tab} Prescriptions ({tableRows.length})
                </Typography>
              </Box>
              
              <Table>
                <TableHead sx={{ bgcolor: "rgba(12, 60, 60, 0.04)" }}>
                  <TableRow>
                    {tab === "Pending" ? (
                      <>
                        <TableCell sx={{ fontWeight: 600, color: THEME.primary }}>Patient</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: THEME.primary }}>Doctor</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: THEME.primary }}>Items</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: THEME.primary }}>Date & Time</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: THEME.primary }}>Action</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell sx={{ fontWeight: 600, color: THEME.primary }}>Patient Name</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: THEME.primary }}>Doctor's Name</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: THEME.primary }}>Issued Date & Time</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: THEME.primary }}>Action</TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {tab === "Pending" &&
                    tableRows.map((row, index) => (
                      <Fade in timeout={300 + index * 100} key={row.id}>
                        <TableRow sx={tableRowSx}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ mr: 2, bgcolor: THEME.accent, width: 32, height: 32 }}>
                                <PersonIcon fontSize="small" />
                              </Avatar>
                              <Typography fontWeight={600}>{row.patientName}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{row.doctorName}</TableCell>
                          <TableCell>
                            <Chip 
                              label={`${row.itemCount} items`}
                              size="small"
                              sx={{ 
                                bgcolor: `${THEME.primary}15`,
                                color: THEME.primary,
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {formatPrescriptionDate(row.createdAt || row.prescriptionDate)}
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant="outlined"
                              onClick={() => handleView(row)}
                              startIcon={<AssignmentIcon />}
                              sx={actionButtonSx("primary")}
                            >
                              View Prescription
                            </Button>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    ))}

                  {tab === "Completed" &&
                    tableRows.map((row, index) => (
                      <Fade in timeout={300 + index * 100} key={row.id}>
                        <TableRow sx={tableRowSx}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ mr: 2, bgcolor: THEME.success, width: 32, height: 32 }}>
                                <PersonIcon fontSize="small" />
                              </Avatar>
                              <Typography fontWeight={600}>{row.patientName}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{row.doctorName}</TableCell>
                          <TableCell>
                            {formatPrescriptionDate(row.prescriptionDate || row.issuedAt)}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                              <Button
                                variant="outlined"
                                onClick={() => handleViewCompleted(row)}
                                startIcon={<AssignmentIcon />}
                                sx={actionButtonSx("primary")}
                              >
                                View Prescription
                              </Button>

                              {row.patient?.role === "Staff" && invoiceExists[row.id] && (
                                <Button
                                  variant="outlined"
                                  onClick={() => handleViewInvoice(row)}
                                  startIcon={<ReceiptIcon />}
                                  sx={actionButtonSx("secondary")}
                                >
                                  View Invoice
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    ))}

                  {tableRows.length === 0 && (
                    <TableRow>
                      <TableCell 
                        colSpan={tab === "Pending" ? 5 : 4} 
                        align="center"
                        sx={{ py: 6 }}
                      >
                        <Box display="flex" flexDirection="column" alignItems="center">
                          <Avatar sx={{ 
                            bgcolor: `${THEME.gray}15`, 
                            color: THEME.gray,
                            width: 64,
                            height: 64,
                            mb: 2
                          }}>
                            <AssignmentIcon fontSize="large" />
                          </Avatar>
                          <Typography variant="h6" color={THEME.gray} fontWeight={600}>
                            No {tab.toLowerCase()} prescriptions found
                          </Typography>
                          <Typography variant="body2" color={THEME.gray} mt={1}>
                            {searchText || dateFilter || statusFilter !== "All" 
                              ? "Try adjusting your filters"
                              : `No ${tab.toLowerCase()} prescriptions available`
                            }
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Fade>
        </Box>
      </Fade>
    </Box>
  );
};

export default PrescriptionsPage;