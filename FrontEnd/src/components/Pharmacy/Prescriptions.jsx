import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Material UI Components
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Skeleton,
  InputAdornment,
  IconButton
} from "@mui/material";

// Material UI Icons
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

// Date utilities
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

// API Functions
import {
  getPrescriptionsForPharmacy,
  getCompletedPrescriptionsForPharmacy,
  getPrescriptionById,
  formatPrescriptionDate,
} from "../../api/prescription";
import { getInvoice } from "../../api/invoice";

// Custom Dialog Component
import ViewPrescriptionDialog from "./ViewprescriptionDialog";

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

const PrescriptionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- State Variables ---
  
  // Controls which tab is active: "Pending" or "Completed"
  const [tab, setTab] = useState("Pending");
  
  // Loading state for the page
  const [loading, setLoading] = useState(true);

  // Data Lists
  const [pendingList, setPendingList] = useState([]);
  const [completedList, setCompletedList] = useState([]);

  // Popup Dialog State
  const [selectedRx, setSelectedRx] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Logic for "View Invoice" button visibility
  // Stores result as: { "prescriptionId": true/false }
  const [invoiceExistsMap, setInvoiceExistsMap] = useState({});

  // Filters
  const [dateFilter, setDateFilter] = useState(dayjs()); // Defaults to today
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchText, setSearchText] = useState("");

  // --- 1. Fetch Data from API ---
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load Pending Prescriptions
        const pendingData = await getPrescriptionsForPharmacy();
        
        // Convert to array if necessary and sort by date
        let pList = [];
        if (Array.isArray(pendingData)) {
          pList = pendingData;
        }
        
        // Sort: Oldest first (simple logic)
        pList.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.prescriptionDate || 0);
          const dateB = new Date(b.createdAt || b.prescriptionDate || 0);
          return dateA - dateB;
        });
        
        setPendingList(pList);

        // Load Completed Prescriptions
        const completedData = await getCompletedPrescriptionsForPharmacy();
        let cList = [];
        if (Array.isArray(completedData)) {
          cList = completedData;
        }
        setCompletedList(cList);

      } catch (error) {
        console.error("Error loading data:", error);
      }
      
      // Small delay to prevent flickering
      setTimeout(() => {
        setLoading(false);
      }, 500);
    };

    loadData();
  }, []);

  // --- 2. Logic to Check for Invoices ---
  // This runs whenever the 'completedList' updates.
  // We need to know if an invoice exists so we can show the "View Invoice" button.
  useEffect(() => {
    const checkAllInvoices = async () => {
      // If there are no completed items, do nothing
      if (completedList.length === 0) {
        setInvoiceExistsMap({});
        return;
      }

      const tempMap = {};

      // Loop through every completed prescription
      for (let i = 0; i < completedList.length; i++) {
        const item = completedList[i];
        
        // We only check invoice if the patient is "Staff"
        // (This preserves the original business logic)
        if (item.patient && item.patient.role === "Staff") {
          try {
            // Try to fetch the invoice
            await getInvoice(item.id);
            // If successful, it exists
            tempMap[item.id] = true;
          } catch (error) {
            // If error (like 404), it does not exist
            tempMap[item.id] = false;
          }
        } else {
          // Default for non-staff
          tempMap[item.id] = false;
        }
      }

      // Update the state map
      setInvoiceExistsMap(tempMap);
    };

    checkAllInvoices();
  }, [completedList]);

  // --- 3. Handle Navigation & Tabs ---

  // Check if we navigated here from another page with a specific tab requested
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setTab(location.state.activeTab);
    }
  }, [location.state]);

  // If the user changes the "Status Filter" dropdown, switch the tab automatically
  useEffect(() => {
    if (statusFilter === "Pending") {
      setTab("Pending");
    } else if (statusFilter === "Completed") {
      setTab("Completed");
    }
  }, [statusFilter]);

  // --- 4. Event Handlers ---

  const handleView = async (row) => {
    try {
      // Fetch full details for the dialog
      const fullData = await getPrescriptionById(row.id);
      setSelectedRx(fullData);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error fetching prescription details:", error);
    }
  };

  const handleViewCompleted = (row) => {
    // Navigate to print page
    navigate("/pharmacist/prescription-print", {
      state: {
        prescription: row,
        dispenseResults: [],
        fromCompletedTab: true,
      },
    });
  };

  const handleViewInvoice = (row) => {
    // Navigate to invoice page using string concatenation
    navigate("/invoice/" + row.id, {
      state: { fromTab: tab },
    });
  };

  const handleDialogClose = async (result) => {
    // Close the dialog
    setDialogOpen(false);
    
    // Store the currently selected prescription before clearing it
    const currentRx = selectedRx;
    setSelectedRx(null);

    // If the user successfully dispensed items (result exists)
    if (result && result.results) {
      // Go to print page
      navigate("/pharmacist/prescription-print", {
        state: { 
          prescription: currentRx, 
          dispenseResults: result.results 
        },
      });
      // Reload the pending list to refresh data
      // (In a real app we might re-fetch, but here we preserve logic)
      window.location.reload(); 
    }
  };

  const handleClearFilters = () => {
    setDateFilter(null);
    setStatusFilter("All");
    setSearchText("");
  };

  // --- 5. Filtering Logic ---

  const filterItem = (item) => {
    // 1. Search Text Filter
    let matchesSearch = true;
    if (searchText) {
      const text = searchText.toLowerCase().trim();
      const name = (item.patientName || "").toLowerCase();
      const idStr = String(item.id || "");
      
      if (!name.includes(text) && !idStr.includes(text)) {
        matchesSearch = false;
      }
    }

    // 2. Date Filter
    let matchesDate = true;
    if (dateFilter) {
      // Check various date fields
      const itemDateStr = item.createdAt || item.prescriptionDate || item.issuedAt || item.date;
      if (itemDateStr) {
        const itemDate = dayjs(itemDateStr);
        if (!itemDate.isValid() || !itemDate.isSame(dateFilter, "day")) {
          matchesDate = false;
        }
      } else {
        matchesDate = false;
      }
    }

    // 3. Status Filter (Dropdown)
    let matchesStatus = true;
    if (statusFilter !== "All") {
      if (statusFilter === "Pending" && tab !== "Pending") matchesStatus = false;
      if (statusFilter === "Completed" && tab !== "Completed") matchesStatus = false;
    }

    return matchesSearch && matchesDate && matchesStatus;
  };

  // Get the rows for the current tab
  const currentList = tab === "Pending" ? pendingList : completedList;
  
  // Apply filters
  const tableRows = currentList.filter(filterItem);

  // Calculate summary counts
  const pendingCount = pendingList.filter(filterItem).length;
  const completedCount = completedList.filter(filterItem).length;

  // --- 6. Loading View ---
  if (loading) {
    return (
      <Box sx={{ padding: 4, backgroundColor: colors.background, minHeight: "100vh" }}>
        <Skeleton variant="text" width={300} height={60} sx={{ marginBottom: 4 }} />
        <Grid container spacing={4} justifyContent="center" mb={4}>
          <Grid item><Skeleton variant="rectangular" width={280} height={200} /></Grid>
          <Grid item><Skeleton variant="rectangular" width={280} height={200} /></Grid>
        </Grid>
      </Box>
    );
  }

  // --- 7. Main Render ---
  return (
    <Box sx={{ padding: 4, backgroundColor: colors.background, minHeight: "100vh" }}>
      
      {/* Dialog Popup */}
      <ViewPrescriptionDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        rx={selectedRx}
      />

      {/* --- Header Section --- */}
      <Box display="flex" alignItems="center" marginBottom={4}>
        <Avatar sx={{ bgcolor: colors.primary, marginRight: 2, width: 56, height: 56 }}>
          <PharmacyIcon fontSize="large" />
        </Avatar>
        {/* Refactor Note: Removed linear-gradient styling here. 
          Replaced with simple solid color: colors.primary 
        */}
        <Typography
          variant="h3"
          sx={{ 
            color: colors.primary, 
            fontWeight: 800 
          }}
        >
          Prescriptions Management
        </Typography>
      </Box>

      {/* --- Summary Cards Section --- */}
      <Grid container spacing={4} justifyContent="center" marginBottom={6}>
        {/* Pending Card */}
        <Grid item>
          <Paper 
            elevation={4} 
            sx={{ 
              padding: 4, 
              textAlign: "center", 
              borderRadius: "20px", 
              width: 280,
              borderLeft: "6px solid " + colors.accent
            }}
          >
            <Box display="flex" justifyContent="center" marginBottom={2}>
              <Avatar sx={{ bgcolor: colors.warning + "20", color: colors.warning }}>
                <PendingIcon />
              </Avatar>
            </Box>
            <Typography variant="h5" fontWeight="bold" color={colors.primary}>
              Pending
            </Typography>
            <Typography variant="h3" fontWeight="800" color={colors.warning}>
              {pendingCount}
            </Typography>
            <Chip label={pendingCount + " total"} size="small" sx={{ marginTop: 2 }} />
          </Paper>
        </Grid>

        {/* Completed Card */}
        <Grid item>
          <Paper 
            elevation={4} 
            sx={{ 
              padding: 4, 
              textAlign: "center", 
              borderRadius: "20px", 
              width: 280,
              borderLeft: "6px solid " + colors.accent
            }}
          >
            <Box display="flex" justifyContent="center" marginBottom={2}>
              <Avatar sx={{ bgcolor: colors.success + "20", color: colors.success }}>
                <CheckCircleIcon />
              </Avatar>
            </Box>
            <Typography variant="h5" fontWeight="bold" color={colors.primary}>
              Completed
            </Typography>
            <Typography variant="h3" fontWeight="800" color={colors.success}>
              {completedCount}
            </Typography>
            <Chip label={completedCount + " total"} size="small" sx={{ marginTop: 2 }} />
          </Paper>
        </Grid>
      </Grid>

      {/* --- Filters Section --- */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Paper elevation={2} sx={{ padding: 4, marginBottom: 4, borderRadius: "20px" }}>
          <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600, marginBottom: 3 }}>
            Filter & Search
          </Typography>
          
          <Box display="flex" gap={3} flexWrap="wrap" alignItems="center" justifyContent="center">
            {/* Date Picker */}
            <DatePicker
              label="Filter by Date"
              value={dateFilter}
              onChange={(newValue) => setDateFilter(newValue)}
              slotProps={{ textField: { variant: "outlined" } }}
            />

            {/* Status Dropdown */}
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>

            {/* Search Box */}
            <TextField
              label="Search by Patient Name or ID"
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
                    <IconButton onClick={() => setSearchText("")}>
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
                borderRadius: "16px"
              }}
            >
              Clear All
            </Button>
          </Box>
        </Paper>
      </LocalizationProvider>

      {/* --- Tabs Section --- */}
      <Box display="flex" justifyContent="center" marginBottom={4} gap={3}>
        <Button
          variant={tab === "Pending" ? "contained" : "outlined"}
          onClick={() => setTab("Pending")}
          startIcon={<PendingIcon />}
          sx={{
            backgroundColor: tab === "Pending" ? colors.primary : "transparent",
            color: tab === "Pending" ? colors.white : colors.primary,
            borderColor: colors.primary,
            borderRadius: "16px",
            padding: "10px 30px"
          }}
        >
          Pending ({pendingCount})
        </Button>

        <Button
          variant={tab === "Completed" ? "contained" : "outlined"}
          onClick={() => setTab("Completed")}
          startIcon={<CheckCircleIcon />}
          sx={{
            backgroundColor: tab === "Completed" ? colors.primary : "transparent",
            color: tab === "Completed" ? colors.white : colors.primary,
            borderColor: colors.primary,
            borderRadius: "16px",
            padding: "10px 30px"
          }}
        >
          Completed ({completedCount})
        </Button>
      </Box>

      {/* --- Table Section --- */}
      <Paper elevation={4} sx={{ borderRadius: "24px", overflow: "hidden" }}>
        <Box sx={{ padding: 3, borderBottom: "1px solid #eee" }}>
          <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 600 }}>
            {tab} Prescriptions ({tableRows.length})
          </Typography>
        </Box>

        <Table>
          <TableHead sx={{ backgroundColor: colors.lightGray }}>
            <TableRow>
              <TableCell><b>Patient Name</b></TableCell>
              <TableCell><b>Doctor Name</b></TableCell>
              {tab === "Pending" && <TableCell><b>Items</b></TableCell>}
              <TableCell><b>Date</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tableRows.length > 0 ? (
              tableRows.map((row) => (
                <TableRow key={row.id} hover>
                  {/* Patient Name Column */}
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ marginRight: 2, bgcolor: tab === "Pending" ? colors.accent : colors.success, width: 32, height: 32 }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Typography fontWeight="bold">{row.patientName}</Typography>
                    </Box>
                  </TableCell>

                  {/* Doctor Name Column */}
                  <TableCell>{row.doctorName}</TableCell>

                  {/* Items Column (Only for Pending) */}
                  {tab === "Pending" && (
                    <TableCell>
                      <Chip 
                        label={row.itemCount + " items"} 
                        size="small" 
                        sx={{ bgcolor: colors.primary + "20", color: colors.primary, fontWeight: "bold" }}
                      />
                    </TableCell>
                  )}

                  {/* Date Column */}
                  <TableCell>
                    {formatPrescriptionDate(row.createdAt || row.prescriptionDate || row.issuedAt)}
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      {tab === "Pending" ? (
                        // Action for Pending: View & Dispense
                        <Button
                          variant="outlined"
                          onClick={() => handleView(row)}
                          startIcon={<AssignmentIcon />}
                          sx={{ borderColor: colors.accent, color: colors.accent }}
                        >
                          View Prescription
                        </Button>
                      ) : (
                        // Actions for Completed: View and Invoice
                        <>
                          <Button
                            variant="outlined"
                            onClick={() => handleViewCompleted(row)}
                            startIcon={<AssignmentIcon />}
                            sx={{ borderColor: colors.accent, color: colors.accent }}
                          >
                            View
                          </Button>

                          {/* Logic Check: Only show "Invoice" button if:
                             1. Patient is Staff
                             2. Invoice actually exists (checked in our useEffect)
                          */}
                          {row.patient && row.patient.role === "Staff" && invoiceExistsMap[row.id] === true && (
                            <Button
                              variant="outlined"
                              onClick={() => handleViewInvoice(row)}
                              startIcon={<ReceiptIcon />}
                              sx={{ borderColor: colors.primary, color: colors.primary }}
                            >
                              View Invoice
                            </Button>
                          )}
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // Empty State
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ padding: 6 }}>
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <Avatar sx={{ bgcolor: colors.lightGray, color: colors.gray, width: 64, height: 64, marginBottom: 2 }}>
                      <AssignmentIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h6" color={colors.gray}>
                      No prescriptions found
                    </Typography>
                    <Typography variant="body2" color={colors.gray}>
                      Try adjusting your search or filters.
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

export default PrescriptionsPage;