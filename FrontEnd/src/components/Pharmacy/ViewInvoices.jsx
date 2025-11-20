import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  Avatar,
  InputAdornment,
  IconButton,
  Chip
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ReceiptLong as ReceiptLongIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon
} from "@mui/icons-material";

// Date management
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

// API function
import { getStaffInvoices } from "../../api/invoice";

// --- Simple Color Configuration ---
const colors = {
  primary: "#0C3C3C",    // Dark Teal
  accent: "#45D27A",     // Bright Green
  gray: "#6C6B6B",
  white: "#ffffff",
  lightGray: "#F8F9FA",
  success: "#4CAF50",
  warning: "#FF9800",
  background: "#FAFBFC"
};

const ViewInvoicesPage = () => {
  const navigate = useNavigate();

  // --- State Variables ---
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // --- 1. Load Data ---
  useEffect(() => {
    const loadInvoices = async () => {
      setIsLoading(true);
      try {
        const data = await getStaffInvoices();
        
        // Make sure data is an array
        let list = [];
        if (Array.isArray(data)) {
          list = data;
        }

        // Sort by date (newest first)
        list.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA;
        });

        setInvoices(list);
        setFilteredInvoices(list);
      } catch (error) {
        console.error("Failed to load invoices:", error);
        setInvoices([]);
        setFilteredInvoices([]);
      }
      
      // Small delay to prevent flickering
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    loadInvoices();
  }, []);

  // --- 2. Filter Logic ---
  // Runs whenever text, dates, or invoice list changes
  useEffect(() => {
    let result = invoices;

    // Filter by Name
    if (searchText) {
      const text = searchText.toLowerCase().trim();
      result = result.filter((invoice) => {
        const name = invoice.patientName || "";
        return name.toLowerCase().includes(text);
      });
    }

    // Filter by Start Date
    if (startDate) {
      result = result.filter((invoice) => {
        const invoiceDate = dayjs(invoice.createdAt);
        // Check if invoice is after or on the start date
        return invoiceDate.isAfter(startDate.subtract(1, 'day'));
      });
    }

    // Filter by End Date
    if (endDate) {
      result = result.filter((invoice) => {
        const invoiceDate = dayjs(invoice.createdAt);
        // Check if invoice is before or on the end date
        return invoiceDate.isBefore(endDate.add(1, 'day'));
      });
    }

    setFilteredInvoices(result);
  }, [invoices, searchText, startDate, endDate]);

  // --- 3. Helpers ---

  const handleViewInvoice = (invoice) => {
    navigate("/invoice/" + invoice.id);
  };

  const handleClearFilters = () => {
    setSearchText("");
    setStartDate(null);
    setEndDate(null);
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format("MMM DD, YYYY hh:mm A");
  };

  // --- 4. Render Loading State ---
  if (isLoading) {
    return (
      <Box sx={{ padding: 4, backgroundColor: colors.background, minHeight: "100vh" }}>
        <Typography variant="h5" sx={{ color: colors.gray }}>Loading invoices...</Typography>
      </Box>
    );
  }

  // --- 5. Main Render ---
  return (
    <Box sx={{ padding: 4, backgroundColor: colors.background, minHeight: "100vh" }}>
      
      {/* Header Section */}
      <Box display="flex" alignItems="center" marginBottom={5}>
        <Avatar 
          sx={{
            bgcolor: colors.primary,
            marginRight: 2,
            width: 56,
            height: 56,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          <ReceiptLongIcon fontSize="large" />
        </Avatar>
        
        {/* Refactor Note: Removed linear-gradient styling from Typography */}
        <Typography
          variant="h3"
          sx={{
            color: colors.primary,
            fontWeight: 800
          }}
        >
          View Invoices
        </Typography>
      </Box>

      {/* Total Count Badge */}
      <Box display="flex" justifyContent="center" marginBottom={4}>
        <Chip
          label={invoices.length + " Total Invoices"}
          sx={{
            backgroundColor: colors.primary + "20", // Approx 12% opacity
            color: colors.primary,
            fontWeight: 600,
            fontSize: "1rem",
            padding: 1
          }}
        />
      </Box>

      {/* Filters Section */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/* Refactor Note: Removed gradient background from Paper */}
        <Paper
          elevation={4}
          sx={{
            padding: 4,
            marginBottom: 4,
            borderRadius: "24px",
            backgroundColor: colors.white, 
            border: "1px solid rgba(0,0,0,0.05)"
          }}
        >
          <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600, marginBottom: 3 }}>
            Filter & Search
          </Typography>
          
          <Box display="flex" justifyContent="center" alignItems="center" gap={3} flexWrap="wrap">
            
            {/* Start Date Picker */}
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(val) => setStartDate(val)}
              slotProps={{ textField: { variant: "outlined", sx: { minWidth: 260 } } }}
            />

            {/* End Date Picker */}
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(val) => setEndDate(val)}
              slotProps={{ textField: { variant: "outlined", sx: { minWidth: 260 } } }}
            />

            {/* Search Box */}
            <TextField
              label="Search by Staff Name"
              variant="outlined"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: colors.gray }} />
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

            {/* Clear Button */}
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              startIcon={<ClearIcon />}
              sx={{
                borderColor: colors.primary,
                color: colors.primary,
                borderRadius: "16px",
                padding: "10px 30px",
                fontWeight: 600,
                textTransform: "none"
              }}
            >
              Clear All
            </Button>
          </Box>
        </Paper>
      </LocalizationProvider>

      {/* Table Section */}
      {/* Refactor Note: Removed gradient background from Paper */}
      <Paper
        elevation={4}
        sx={{
          borderRadius: "24px",
          overflow: "hidden",
          backgroundColor: colors.white,
          border: "1px solid rgba(0,0,0,0.05)"
        }}
      >
        <Box sx={{ padding: 3, borderBottom: "1px solid #eee" }}>
          <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
            Staff Invoices ({filteredInvoices.length})
          </Typography>
        </Box>

        <Table>
          <TableHead sx={{ backgroundColor: colors.lightGray }}>
            <TableRow>
              <TableCell><b>Invoice Date</b></TableCell>
              <TableCell><b>Staff Member Name</b></TableCell>
              <TableCell align="right"><b>Action</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow 
                key={invoice.id} 
                hover
                sx={{ "&:nth-of-type(even)": { backgroundColor: "#fcfcfc" } }}
              >
                
                {/* Date Column */}
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      sx={{ 
                        marginRight: 2, 
                        bgcolor: colors.accent, 
                        width: 32, 
                        height: 32 
                      }}
                    >
                      <CalendarTodayIcon fontSize="small" />
                    </Avatar>
                    <Typography fontWeight={600}>
                      {formatDate(invoice.createdAt)}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Name Column */}
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      sx={{ 
                        marginRight: 2, 
                        bgcolor: colors.primary, 
                        width: 32, 
                        height: 32 
                      }}
                    >
                      <PersonIcon fontSize="small" />
                    </Avatar>
                    <Typography fontWeight={600}>
                      {invoice.patientName}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Action Column */}
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    onClick={() => handleViewInvoice(invoice)}
                    startIcon={<ReceiptLongIcon />}
                    sx={{
                      borderColor: colors.accent,
                      color: colors.accent,
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 600
                    }}
                  >
                    View Invoice
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {/* Empty State */}
            {filteredInvoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ padding: 6 }}>
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <Avatar 
                      sx={{ 
                        bgcolor: colors.lightGray, 
                        color: colors.gray, 
                        width: 64, 
                        height: 64, 
                        marginBottom: 2 
                      }}
                    >
                      <ReceiptLongIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h6" color={colors.gray}>
                      No invoices found
                    </Typography>
                    <Typography variant="body2" color={colors.gray} marginTop={1}>
                      {(searchText || startDate || endDate)
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

    </Box>
  );
};

export default ViewInvoicesPage;