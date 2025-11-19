import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Button, Avatar, Fade, Skeleton, InputAdornment, IconButton,
  Chip
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ReceiptLong as ReceiptLongIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon
} from "@mui/icons-material";

import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { getStaffInvoices } from "../../api/invoice";

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

const actionButtonSx = {
  borderRadius: "12px",
  textTransform: "none",
  fontWeight: 600,
  px: 3,
  py: 1,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  borderColor: THEME.accent,
  color: THEME.accent,
  "&:hover": {
    backgroundColor: THEME.accent,
    color: "white",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(69, 210, 122, 0.3)",
  }
};

const ViewInvoicesPage = () => {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const navigate = useNavigate();

  // Filters
  const [searchText, setSearchText] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Load invoices
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const data = await getStaffInvoices();
        const list = Array.isArray(data) ? data : [];
        // Sort by date descending (most recent first)
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setInvoices(list);
        setFilteredInvoices(list);
      } catch (error) {
        console.error("Failed to load staff invoices:", error);
        setInvoices([]);
        setFilteredInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    loadInvoices();
  }, []);

  // Filter invoices
  useEffect(() => {
    let filtered = invoices;

    // Search by staff name
    if (searchText) {
      const text = searchText.toLowerCase().trim();
      filtered = filtered.filter(invoice =>
        invoice.patientName.toLowerCase().includes(text)
      );
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(invoice => {
        const invoiceDate = dayjs(invoice.createdAt);
        return invoiceDate.isAfter(startDate.subtract(1, 'day'));
      });
    }
    if (endDate) {
      filtered = filtered.filter(invoice => {
        const invoiceDate = dayjs(invoice.createdAt);
        return invoiceDate.isBefore(endDate.add(1, 'day'));
      });
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchText, startDate, endDate]);

  const handleViewInvoice = (invoice) => {
    navigate(`/invoice/${invoice.id}`);
  };

  const clearFilters = () => {
    setSearchText("");
    setStartDate(null);
    setEndDate(null);
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format("MMM DD, YYYY hh:mm A");
  };

  if (loading) {
    return (
      <Box sx={{ px: 3, py: 5, backgroundColor: THEME.background, minHeight: "100vh" }}>
        <Skeleton variant="text" width={300} height={60} sx={{ mb: 5 }} />
        <Box display="flex" justifyContent="center" gap={2} mb={3} flexWrap="wrap">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" width={260} height={56} sx={{ borderRadius: "16px" }} />
          ))}
        </Box>
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
              <ReceiptLongIcon fontSize="large" />
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
              View Invoices
            </Typography>
          </Box>

          {/* Summary */}
          <Box display="flex" justifyContent="center" mb={4}>
            <Chip
              label={`${invoices.length} Total Invoices`}
              sx={{
                bgcolor: `${THEME.primary}15`,
                color: THEME.primary,
                fontWeight: 600,
                fontSize: "1rem",
                px: 3,
                py: 1
              }}
            />
          </Box>

          {/* Filters */}
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
                  label="Start Date"
                  value={startDate}
                  onChange={(val) => setStartDate(val)}
                  slotProps={{
                    textField: {
                      variant: "outlined",
                      sx: inputSx,
                    },
                  }}
                />

                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(val) => setEndDate(val)}
                  slotProps={{
                    textField: {
                      variant: "outlined",
                      sx: inputSx,
                    },
                  }}
                />

                <TextField
                  label="Search by Staff Name"
                  variant="outlined"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  sx={{ ...inputSx, minWidth: 300 }}
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

          {/* Table */}
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
                  Staff Invoices ({filteredInvoices.length})
                </Typography>
              </Box>

              <Table>
                <TableHead sx={{ bgcolor: "rgba(12, 60, 60, 0.04)" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: THEME.primary }}>Invoice Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: THEME.primary }}>Staff Member Name</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: THEME.primary }}>Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredInvoices.map((invoice, index) => (
                    <Fade in timeout={300 + index * 100} key={invoice.id}>
                      <TableRow sx={tableRowSx}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2, bgcolor: THEME.accent, width: 32, height: 32 }}>
                              <CalendarTodayIcon fontSize="small" />
                            </Avatar>
                            <Typography fontWeight={600}>
                              {formatDate(invoice.createdAt)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2, bgcolor: THEME.primary, width: 32, height: 32 }}>
                              <PersonIcon fontSize="small" />
                            </Avatar>
                            <Typography fontWeight={600}>{invoice.patientName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="outlined"
                            onClick={() => handleViewInvoice(invoice)}
                            startIcon={<ReceiptLongIcon />}
                            sx={actionButtonSx}
                          >
                            View Invoice
                          </Button>
                        </TableCell>
                      </TableRow>
                    </Fade>
                  ))}

                  {filteredInvoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                        <Box display="flex" flexDirection="column" alignItems="center">
                          <Avatar sx={{
                            bgcolor: `${THEME.gray}15`,
                            color: THEME.gray,
                            width: 64,
                            height: 64,
                            mb: 2
                          }}>
                            <ReceiptLongIcon fontSize="large" />
                          </Avatar>
                          <Typography variant="h6" color={THEME.gray} fontWeight={600}>
                            No invoices found
                          </Typography>
                          <Typography variant="body2" color={THEME.gray} mt={1}>
                            {searchText || startDate || endDate
                              ? "Try adjusting your filters"
                              : "No staff invoices available"
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

export default ViewInvoicesPage;