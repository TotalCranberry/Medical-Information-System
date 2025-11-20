import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
  Stack,
  Checkbox,
  FormControlLabel,
  TextField,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress,
  Collapse,
  Card,
  CardContent,
  Backdrop,
  CircularProgress,
} from "@mui/material";

// Only keeping essential icons
import {
  Close as CloseIcon,
  LocalPharmacy as PharmacyIcon,
  Inventory as InventoryIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  DoneAll as DoneAllIcon,
  ClearAll as ClearAllIcon,
  CheckCircle as CheckCircleIcon,
  InfoOutlined as InfoIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Analytics as AnalyticsIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Done as DoneIcon,
} from "@mui/icons-material";

// API Functions
import { searchMedicines } from "../../api/medicine";
import { dispenseManual } from "../../api/prescription";

// --- Simple Color Configuration ---
const colors = {
  primary: "#0C3C3C",    // Dark Teal
  accent: "#45D27A",     // Bright Green
  gray: "#6C6B6B",
  white: "#ffffff",
  light: "#F8F9FA",
  bad: "#C62828",
  warn: "#EF6C00",
  good: "#2E7D32",
  cardBackground: "#ffffff", // Solid background instead of gradient
  border: "rgba(12, 60, 60, 0.12)"
};

// --- Simple Styles ---

// Standard Input Style
const inputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#fff"
  }
};

// Standard Card Style (No Gradients)
const cardStyle = {
  padding: "20px",
  borderRadius: "16px",
  backgroundColor: colors.cardBackground,
  border: "1px solid " + colors.border,
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
};

// Pill / Chip Style
const pillStyle = {
  marginRight: "8px",
  marginBottom: "8px",
  fontWeight: 600,
  backgroundColor: colors.accent + "22", // Light green background (using hex opacity)
  color: colors.primary,
  borderRadius: "999px",
  border: "1px solid " + colors.accent + "40"
};

// --- Components ---

const Pill = ({ children, ...props }) => (
  <Chip label={children} size="small" sx={pillStyle} {...props} />
);

const QuantityStepper = ({ value, onChange, onIncrement, onDecrement, disabled, max }) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={0.5}
    sx={{
      background: disabled ? "#f5f5f5" : "#fff",
      borderRadius: "12px",
      border: "1px solid " + colors.border,
      overflow: "hidden"
    }}
  >
    <IconButton
      size="small"
      onClick={onDecrement}
      disabled={disabled || value <= 0}
    >
      <RemoveIcon fontSize="small" />
    </IconButton>
    <TextField
      label="Units"
      size="small"
      value={value}
      onChange={onChange}
      inputProps={{
        inputMode: "numeric",
        pattern: "[0-9]*",
        min: 0,
        max: max,
        style: { textAlign: "center", fontWeight: 600 },
      }}
      sx={{
        width: 80,
        "& .MuiOutlinedInput-root": {
          borderRadius: 0,
          "& fieldset": { border: "none" },
        },
        "& .MuiInputLabel-root": { display: "none" },
      }}
      disabled={disabled}
    />
    <IconButton
      size="small"
      onClick={onIncrement}
      disabled={disabled}
    >
      <AddIcon fontSize="small" />
    </IconButton>
  </Stack>
);

const LoadingButton = ({ loading, children, startIcon, ...props }) => (
  <Button
    {...props}
    startIcon={loading ? <CircularProgress size={16} /> : startIcon}
    disabled={loading || props.disabled}
    sx={{
      borderRadius: "12px",
      textTransform: "none",
      fontWeight: 600,
      padding: "10px 24px",
      ...props.sx,
    }}
  >
    {loading ? "Loading..." : children}
  </Button>
);

export default function ViewPrescriptionDialog({ open, onClose, rx }) {
  // --- State ---
  const [selections, setSelections] = useState({});
  const [invQuery, setInvQuery] = useState("");
  const [invResults, setInvResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [showInventory, setShowInventory] = useState(true);

  // Dialogs & Notifications
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, severity: "success", msg: "" });
  const [resultOpen, setResultOpen] = useState(false);
  const [resultPayload, setResultPayload] = useState(null);

  // --- 1. Normalize Data ---
  // This converts the incoming prescription data into a standard format our component can use.
  const items = useMemo(() => {
    const rawItems = rx?.items || rx?.medications || [];
    
    return rawItems.map((item, index) => {
      // Helper to get value or fallback
      const id = item.id || item.itemId || null;
      const medName = item.medicineName || (item.medicine && item.medicine.name) || item.medicine || "";
      const route = item.routeOfAdministration || item.route || "-";
      const duration = item.durationDays || item.days || item.duration || "";
      
      // Time of day array logic
      let timeArr = [];
      if (Array.isArray(item.timeOfDay)) timeArr = item.timeOfDay;
      else if (Array.isArray(item.timesOfDay)) timeArr = item.timesOfDay;
      else if (Array.isArray(item.times)) timeArr = item.times;

      const quantity = item.quantity || item.units || null;
      
      // Medicine Details logic
      const form = item.form || (item.medicineDetails && item.medicineDetails.form) || "";
      const strength = item.strength || (item.medicineDetails && item.medicineDetails.strength) || "";
      const dosage = item.dosage || "";

      return {
        key: id || ("idx_" + index),
        id: id,
        medicineName: medName,
        route: route,
        duration: duration,
        timeOfDay: timeArr,
        quantity: quantity,
        form: form,
        strength: strength,
        instructions: item.instructions || "",
        dosage: dosage,
      };
    });
  }, [rx]);

  // --- 2. Effects ---

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelections({});
      setInvQuery("");
      setInvResults([]);
      setConfirmOpen(false);
      setResultOpen(false);
      setResultPayload(null);
      setExpandedCards({});
    }
  }, [open, rx]);

  // --- 3. Selection Handlers ---

  const toggleSelect = (key) => {
    const newSelections = { ...selections };
    const currentItem = newSelections[key] || { checked: false, qty: "" };
    
    // Toggle checked status
    currentItem.checked = !currentItem.checked;
    
    // Reset quantity if unchecked or if stock is 0
    const stock = currentItem.stock || null;
    if (currentItem.checked && stock === 0) {
      currentItem.qty = "0";
    }
    
    newSelections[key] = currentItem;
    setSelections(newSelections);
  };

  const setQty = (key, value) => {
    // Only allow numbers
    const cleanValue = value.replace(/[^0-9]/g, "");
    
    const newSelections = { ...selections };
    const currentItem = newSelections[key] || { checked: false, qty: "" };
    
    currentItem.qty = cleanValue;
    newSelections[key] = currentItem;
    setSelections(newSelections);
  };

  const stepQty = (key, delta) => {
    const newSelections = { ...selections };
    const currentItem = newSelections[key] || { checked: false, qty: "" };
    
    let currentQty = parseInt(currentItem.qty || "0", 10);
    let nextQty = Math.max(0, currentQty + delta);
    
    currentItem.qty = String(nextQty);
    newSelections[key] = currentItem;
    setSelections(newSelections);
  };

  const setSuggestedQty = (key, suggested) => {
    if (Number.isFinite(suggested)) {
      const newSelections = { ...selections };
      const currentItem = newSelections[key] || { checked: false, qty: "" };
      
      currentItem.qty = String(Math.max(0, suggested));
      newSelections[key] = currentItem;
      setSelections(newSelections);
    }
  };

  const bulkSelectAll = () => {
    const nextSelections = { ...selections };
    items.forEach((item) => {
      const currentItem = nextSelections[item.key] || { checked: false, qty: "" };
      currentItem.checked = true;
      nextSelections[item.key] = currentItem;
    });
    setSelections(nextSelections);
  };

  const bulkClear = () => {
    setSelections({});
  };

  const toggleCardExpansion = (key) => {
    setExpandedCards((prev) => {
      const newState = { ...prev };
      newState[key] = !prev[key];
      return newState;
    });
  };

  // --- 4. Inventory Logic ---

  const runInventorySearch = async () => {
    if (!invQuery || invQuery.trim() === "") {
      setInvResults([]);
      return;
    }
    
    try {
      setLoadingSearch(true);
      const res = await searchMedicines(invQuery.trim());
      
      // Handle API response variations
      let list = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (res && res.data) {
        list = res.data;
      }
      
      setInvResults(list);
    } catch (error) {
      setInvResults([]);
      setSnack({
        open: true,
        severity: "error",
        msg: "Failed to search inventory. Please try again.",
      });
    }
    setLoadingSearch(false);
  };

  const checkAvailabilityForItem = async (key, medName) => {
    if (!medName || medName.trim() === "") return;
    
    // Set loading state for this item
    setSelections((prev) => {
      const current = prev[key] || { checked: false, qty: "" };
      return { ...prev, [key]: { ...current, checking: true } };
    });

    try {
      const res = await searchMedicines(medName.trim());
      
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (res && res.data) list = res.data;

      // Find best match
      const bestMatch = list.find((m) => m.name.toLowerCase() === medName.toLowerCase()) || list[0];
      
      const stock = bestMatch ? (bestMatch.stock || bestMatch.quantity || 0) : 0;
      const note = bestMatch ? ("In stock: " + stock) : "Not found";
      
      // Update state with result
      setSelections((prev) => {
        const current = prev[key] || { checked: false, qty: "" };
        return { 
          ...prev, 
          [key]: { 
            ...current, 
            availability: note, 
            stock: stock, 
            checking: false 
          } 
        };
      });

    } catch (error) {
      setSelections((prev) => {
        const current = prev[key] || { checked: false, qty: "" };
        return { 
          ...prev, 
          [key]: { 
            ...current, 
            availability: "Search failed", 
            checking: false 
          } 
        };
      });
    }
  };

  // --- 5. Submission Logic ---

  const buildPayload = () => {
    const payloadItems = [];
    
    items.forEach((item) => {
      const selection = selections[item.key];
      
      if (selection && selection.checked) {
        const qty = selection.qty ? parseInt(selection.qty, 10) : 0;
        
        payloadItems.push({
          itemId: item.id || null,
          quantity: qty,
          medicineName: item.medicineName || null,
          dispensedQuantity: qty,
          dispensedStatus: qty > 0 ? 1 : 0,
        });
      }
    });
    
    return payloadItems;
  };

  const openConfirm = () => {
    if (!rx || !rx.id) {
      setSnack({ open: true, severity: "error", msg: "Prescription ID missing. Cannot dispense." });
      return;
    }
    
    const payloadItems = buildPayload();
    if (payloadItems.length === 0) {
      setSnack({ open: true, severity: "warning", msg: "Select at least one medicine to dispense." });
      return;
    }
    
    setConfirmOpen(true);
  };

  const handleDispense = async () => {
    const payloadItems = buildPayload();
    if (payloadItems.length === 0 || !rx.id) {
      setConfirmOpen(false);
      return;
    }
    
    try {
      setSubmitting(true);
      const result = await dispenseManual(rx.id, payloadItems);
      
      if (result && result.results && result.results.length > 0) {
        setResultPayload(result);
        setResultOpen(true);
      } else {
        setSnack({ open: true, severity: "success", msg: "Dispense request completed successfully!" });
        if (onClose) onClose(result);
      }
    } catch (error) {
      setSnack({ open: true, severity: "error", msg: "Dispense failed. Please try again." });
    }
    
    setSubmitting(false);
    setConfirmOpen(false);
  };

  // --- 6. Calculations ---

  const selectedCount = Object.values(selections).filter((s) => s.checked).length;
  
  const totalUnits = Object.values(selections).reduce((acc, s) => {
    if (s.checked) {
      return acc + Math.max(0, parseInt(s.qty || "0", 10));
    }
    return acc;
  }, 0);

  if (!rx) return null;

  const headerDate = new Date(rx.createdAt || rx.prescriptionDate || Date.now()).toLocaleString();

  // --- 7. Render ---

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            overflow: "hidden",
            maxHeight: "90vh",
          }
        }}
      >
        {/* Refactor Note: Replaced gradient bar with solid accent color */}
        <Box 
          sx={{ 
            height: 8, 
            width: "100%", 
            backgroundColor: colors.accent, 
            position: "relative",
          }} 
        />

        {/* Refactor Note: Replaced gradient background with solid card background */}
        <DialogTitle sx={{ pb: 2, backgroundColor: colors.cardBackground }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{
                width: 48, 
                height: 48, 
                borderRadius: "12px",
                backgroundColor: colors.primary,
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                color: "#fff", 
                fontWeight: 800,
                fontSize: "1.2rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                ℞
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: colors.primary, mb: 0.5 }}>
                  Prescription — {rx.patientName}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip
                    size="small"
                    icon={<AnalyticsIcon />}
                    label={"Dr. " + rx.doctorName}
                    sx={{ 
                      bgcolor: colors.primary + "10", 
                      color: colors.primary,
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    size="small"
                    icon={<ScheduleIcon />}
                    label={headerDate}
                    sx={{ 
                      bgcolor: colors.accent + "10", 
                      color: colors.primary,
                      fontWeight: 600,
                    }}
                  />
                </Stack>
              </Box>
            </Stack>
            <IconButton 
              onClick={onClose}
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.05)",
                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.1)" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2, pb: 1, backgroundColor: "#fafbfc" }}>
          
          {/* Inventory Search Section */}
          <Collapse in={showInventory}>
            <Card sx={{ ...cardStyle, backgroundColor: "#fff", mb: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      backgroundColor: colors.accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <InventoryIcon fontSize="small" sx={{ color: "#fff" }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary }}>
                      Inventory Search
                    </Typography>
                    <Tooltip title="Search your stock for medicines and view current quantities" arrow>
                      <InfoIcon fontSize="small" sx={{ color: colors.gray, cursor: "help" }} />
                    </Tooltip>
                  </Stack>
                  <IconButton 
                    size="small" 
                    onClick={() => setShowInventory(false)}
                    sx={{ color: colors.gray }}
                  >
                    <VisibilityOffIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    label="Search inventory by medicine name"
                    size="small"
                    fullWidth
                    value={invQuery}
                    onChange={(e) => setInvQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") runInventorySearch(); }}
                    sx={inputStyle}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: colors.gray }} />,
                    }}
                  />
                  <LoadingButton
                    variant="contained"
                    onClick={runInventorySearch}
                    loading={loadingSearch}
                    startIcon={<SearchIcon />}
                    sx={{
                      backgroundColor: colors.accent,
                      color: "#fff",
                      "&:hover": { backgroundColor: "#3db86a" },
                      minWidth: 140,
                    }}
                  >
                    Search
                  </LoadingButton>
                </Stack>

                {loadingSearch && (
                  <LinearProgress 
                    sx={{ 
                      mb: 2, 
                      borderRadius: "4px",
                      height: 6,
                      backgroundColor: colors.accent + "20",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: colors.accent,
                      },
                    }} 
                  />
                )}

                {invResults.length > 0 && (
                  <Card sx={{ 
                    border: "1px solid rgba(12, 60, 60, 0.08)",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}>
                    <List dense sx={{ maxHeight: 240, overflowY: "auto" }}>
                      {invResults.map((m, i) => {
                        const stock = m.stock || m.quantity || 0;
                        const isOk = Number(stock) > 0;
                        return (
                          <ListItem 
                            key={m.id || m.name || i}
                            divider={i < invResults.length - 1}
                            sx={{
                              "&:hover": { backgroundColor: colors.accent + "08" },
                            }}
                            secondaryAction={
                              <Chip
                                size="small"
                                icon={<CheckCircleIcon sx={{ color: isOk ? colors.good : colors.bad }} />}
                                label={"Stock: " + stock}
                                sx={{
                                  bgcolor: isOk ? colors.good + "15" : colors.bad + "15",
                                  color: isOk ? colors.good : colors.bad,
                                  fontWeight: 700,
                                }}
                              />
                            }
                          >
                            <ListItemText
                              primary={
                                <Typography variant="body1" sx={{ fontWeight: 700, color: colors.primary }}>
                                  {(m.name || "-") + (m.strength ? " (" + m.strength + ")" : "")}
                                </Typography>
                              }
                              secondary={m.manufacturer ? "Manufacturer: " + m.manufacturer : null}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Card>
                )}
              </CardContent>
            </Card>
          </Collapse>

          {!showInventory && (
            <Box sx={{ mb: 2 }}>
              <Button
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() => setShowInventory(true)}
                sx={{ 
                  color: colors.primary,
                  "&:hover": { bgcolor: colors.accent + "10" },
                }}
              >
                Show Inventory Search
              </Button>
            </Box>
          )}

          {/* Bulk Actions */}
          <Stack 
            direction={{ xs: "column", sm: "row" }} 
            spacing={2} 
            sx={{ mb: 3 }}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Stack direction="row" spacing={1.5} sx={{ flex: 1 }}>
              <LoadingButton
                size="medium"
                variant="outlined"
                startIcon={<DoneAllIcon />}
                onClick={bulkSelectAll}
                sx={{
                  borderColor: colors.accent,
                  color: colors.accent,
                }}
              >
                Select All
              </LoadingButton>
              <LoadingButton
                size="medium"
                variant="outlined"
                startIcon={<ClearAllIcon />}
                onClick={bulkClear}
                sx={{
                  borderColor: colors.primary,
                  color: colors.primary,
                }}
              >
                Clear All
              </LoadingButton>
            </Stack>
            
            <Chip
              size="medium"
              icon={<PharmacyIcon />}
              label={selectedCount + " selected • " + totalUnits + (totalUnits === 1 ? " unit" : " units")}
              sx={{
                bgcolor: selectedCount > 0 ? colors.accent + "20" : colors.gray + "15",
                color: selectedCount > 0 ? colors.primary : colors.gray,
                fontWeight: 700,
                px: 2,
                height: 40,
                borderRadius: "12px",
                "& .MuiChip-icon": {
                  color: selectedCount > 0 ? colors.accent : colors.gray,
                },
              }}
            />
          </Stack>

          <Divider sx={{ mb: 3, borderColor: "rgba(12, 60, 60, 0.08)" }} />

          {/* Prescription Items List */}
          <Stack spacing={2} sx={{ pb: 2 }}>
            {items.map((it, index) => {
              const sel = selections[it.key] || {};
              const stock = sel.stock || null;
              const stockOk = stock == null ? null : Number(stock) > 0;
              const isExpanded = expandedCards[it.key];
              const hasDetails = it.instructions || (it.timeOfDay && it.timeOfDay.length > 0);

              return (
                <Card key={it.key} sx={cardStyle}>
                  <CardContent sx={{ p: 0 }}>
                    <Stack spacing={2}>
                      {/* Main Info Row */}
                      <Stack 
                        direction={{ xs: "column", lg: "row" }} 
                        alignItems={{ lg: "flex-start" }} 
                        spacing={2}
                      >
                        {/* Medicine Details Column */}
                        <Box sx={{ flex: 1, minWidth: 300 }}>
                          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.5 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 800, 
                                color: colors.primary,
                                mb: 0.5,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}>
                                {it.medicineName}
                                {(it.form || it.strength) && (
                                  <Chip
                                    size="small"
                                    label={[it.form, it.strength].filter(Boolean).join(" ")}
                                    sx={{
                                      bgcolor: colors.primary + "10",
                                      color: colors.primary,
                                      fontWeight: 600,
                                      fontSize: "0.7rem",
                                    }}
                                  />
                                )}
                              </Typography>
                              
                              <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 1.5 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <Typography variant="caption" sx={{ color: colors.gray, fontWeight: 600 }}>
                                    Route:
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label={it.route}
                                    sx={{
                                      bgcolor: colors.accent + "15",
                                      color: colors.primary,
                                      fontWeight: 600,
                                      height: 20,
                                      fontSize: "0.7rem",
                                    }}
                                  />
                                </Box>
                                
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <Typography variant="caption" sx={{ color: colors.gray, fontWeight: 600 }}>
                                    Duration:
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label={it.duration ? (it.duration + " days") : "N/A"}
                                    sx={{
                                      bgcolor: colors.primary + "15",
                                      color: colors.primary,
                                      fontWeight: 600,
                                      height: 20,
                                      fontSize: "0.7rem",
                                    }}
                                  />
                                </Box>

                                {it.dosage && (
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <Typography variant="caption" sx={{ color: colors.gray, fontWeight: 600 }}>
                                      Dosage:
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={it.dosage}
                                      sx={{
                                        bgcolor: colors.warn + "15",
                                        color: colors.warn,
                                        fontWeight: 600,
                                        height: 20,
                                        fontSize: "0.7rem",
                                      }}
                                    />
                                  </Box>
                                )}
                              </Stack>

                              {/* Timing Pills */}
                              <Stack direction="row" flexWrap="wrap" gap={0.5}>
                                {(it.timeOfDay || []).slice(0, 3).map((t) => (
                                  <Pill key={t}>{t}</Pill>
                                ))}
                                {(it.timeOfDay || []).length > 3 && (
                                  <Pill>+{(it.timeOfDay.length - 3)} more</Pill>
                                )}
                                {it.quantity != null && (
                                  <Pill>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                      <AnalyticsIcon sx={{ fontSize: "0.8rem" }} />
                                      Requested: {it.quantity}
                                    </Box>
                                  </Pill>
                                )}
                              </Stack>
                            </Box>

                            {hasDetails && (
                              <IconButton
                                size="small"
                                onClick={() => toggleCardExpansion(it.key)}
                                sx={{
                                  bgcolor: colors.accent + "15",
                                  color: colors.primary,
                                }}
                              >
                                {isExpanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
                              </IconButton>
                            )}
                          </Stack>

                          {/* Details Section (Collapsible) */}
                          <Collapse in={isExpanded}>
                            <Box sx={{ 
                              mt: 2, 
                              p: 2, 
                              borderRadius: "8px",
                              bgcolor: colors.light + "50",
                              border: "1px solid rgba(12, 60, 60, 0.05)",
                            }}>
                              {it.timeOfDay && it.timeOfDay.length > 3 && (
                                <Box sx={{ mb: 1.5 }}>
                                  <Typography variant="caption" sx={{ color: colors.gray, fontWeight: 600, mb: 1, display: "block" }}>
                                    All Times of Day:
                                  </Typography>
                                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                                    {it.timeOfDay.map((t) => <Pill key={t}>{t}</Pill>)}
                                  </Stack>
                                </Box>
                              )}
                              
                              {it.instructions && (
                                <Box>
                                  <Typography variant="caption" sx={{ color: colors.gray, fontWeight: 600, mb: 1, display: "block" }}>
                                    Instructions:
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: colors.primary,
                                      fontStyle: "italic",
                                      bgcolor: "#fff",
                                      p: 1.5,
                                      borderRadius: "8px",
                                      border: "1px solid rgba(12, 60, 60, 0.1)",
                                    }}
                                  >
                                    {it.instructions}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Collapse>
                        </Box>

                        {/* Action Column */}
                        <Box sx={{ 
                          minWidth: { xs: "100%", lg: 400 },
                          maxWidth: { lg: 400 },
                        }}>
                          <Stack spacing={2}>
                            {/* Dispense Control Box */}
                            <Box sx={{
                              p: 2,
                              borderRadius: "12px",
                              bgcolor: sel.checked ? colors.accent + "08" : "#f8f9fa",
                              border: "2px solid " + (sel.checked ? colors.accent : "rgba(12, 60, 60, 0.08)"),
                              transition: "all 0.3s ease",
                            }}>
                              <FormControlLabel
                                sx={{ 
                                  mb: 2,
                                  "& .MuiFormControlLabel-label": {
                                    fontWeight: 700,
                                    color: sel.checked ? colors.primary : colors.gray,
                                  },
                                }}
                                control={
                                  <Checkbox 
                                    checked={!!sel.checked} 
                                    onChange={() => toggleSelect(it.key)}
                                    sx={{
                                      color: colors.accent,
                                      "&.Mui-checked": { color: colors.accent },
                                    }}
                                  />
                                }
                                label="Dispense this medication"
                              />

                              <Stack spacing={2}>
                                <Box>
                                  <Typography variant="caption" sx={{ color: colors.gray, fontWeight: 600, mb: 1, display: "block" }}>
                                    Quantity to dispense:
                                  </Typography>
                                  <QuantityStepper
                                    value={sel.qty || ""}
                                    onChange={(e) => setQty(it.key, e.target.value)}
                                    onIncrement={() => stepQty(it.key, 1)}
                                    onDecrement={() => stepQty(it.key, -1)}
                                    disabled={!sel.checked}
                                    max={stock || 999}
                                  />
                                </Box>

                                <Stack direction="row" spacing={1}>
                                  <Tooltip title="Fill with requested quantity" arrow>
                                    <span>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => setSuggestedQty(it.key, it.quantity || 0)}
                                        disabled={!sel.checked || !it.quantity}
                                        sx={{
                                          borderColor: colors.accent,
                                          color: colors.accent,
                                          "&:hover": {
                                            bgcolor: colors.accent + "15",
                                            borderColor: colors.accent,
                                          },
                                          borderRadius: "12px",
                                          textTransform: "none",
                                          fontWeight: 600,
                                          flex: 1,
                                        }}
                                      >
                                        Suggested
                                      </Button>
                                    </span>
                                  </Tooltip>

                                  <Tooltip title="Check current stock availability" arrow>
                                    <span>
                                      <LoadingButton
                                        size="small"
                                        variant="outlined"
                                        loading={sel.checking}
                                        onClick={() => checkAvailabilityForItem(it.key, it.medicineName)}
                                        sx={{
                                          borderColor: colors.primary,
                                          color: colors.primary,
                                          "&:hover": {
                                            bgcolor: "rgba(12, 60, 60, 0.08)",
                                            borderColor: colors.primary,
                                          },
                                          flex: 1,
                                        }}
                                      >
                                        Stock
                                      </LoadingButton>
                                    </span>
                                  </Tooltip>
                                </Stack>
                              </Stack>
                            </Box>

                            {/* Stock Status */}
                            {sel.availability && (
                              <Box sx={{
                                p: 2,
                                borderRadius: "12px",
                                bgcolor: stockOk === null ? "#fff" : stockOk ? colors.good + "10" : colors.bad + "10",
                                border: "1px solid " + (stockOk === null ? "rgba(0,0,0,0.1)" : stockOk ? colors.good : colors.bad) + "30",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}>
                                {stockOk !== null && (
                                  <Box sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    bgcolor: stockOk ? colors.good : colors.bad,
                                  }} />
                                )}
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: stockOk === null ? colors.gray : stockOk ? colors.good : colors.bad,
                                    fontWeight: 700,
                                  }}
                                >
                                  {sel.availability}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>

          {/* General Notes */}
          {rx.generalNotes && (
            <Card sx={{ 
              ...cardStyle, 
              mt: 2,
              borderLeft: "4px solid " + colors.accent,
            }}>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <InfoIcon sx={{ color: colors.accent, mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.primary, mb: 1 }}>
                      General Notes
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.gray, lineHeight: 1.6 }}>
                      {rx.generalNotes}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}
        </DialogContent>

        {/* Footer Actions */}
        <DialogActions sx={{ 
          position: "sticky", 
          bottom: 0, 
          bgcolor: "#fff", 
          borderTop: "1px solid rgba(12, 60, 60, 0.08)",
          p: 2.5,
          backgroundColor: colors.cardBackground,
        }}>
          <Stack 
            direction={{ xs: "column", sm: "row" }} 
            alignItems="center" 
            spacing={2} 
            sx={{ width: "100%" }}
          >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
              <Chip
                size="medium"
                icon={<PharmacyIcon />}
                label={selectedCount + (selectedCount === 1 ? " item" : " items") + " selected"}
                sx={{
                  bgcolor: selectedCount > 0 ? colors.accent + "20" : colors.gray + "15",
                  color: selectedCount > 0 ? colors.primary : colors.gray,
                  fontWeight: 700,
                  height: 36,
                  borderRadius: "12px",
                }}
              />
              
              {totalUnits > 0 && (
                <Chip
                  size="medium"
                  label={totalUnits + (totalUnits === 1 ? " unit" : " units") + " total"}
                  sx={{
                    bgcolor: colors.primary + "15",
                    color: colors.primary,
                    fontWeight: 700,
                    height: 36,
                    borderRadius: "12px",
                  }}
                />
              )}
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button 
                onClick={onClose} 
                variant="outlined" 
                size="large"
                sx={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "rgba(12, 60, 60, 0.08)",
                    borderColor: colors.primary,
                  },
                  minWidth: 100,
                }}
              >
                Close
              </Button>

              <LoadingButton
                onClick={openConfirm}
                variant="contained"
                size="large"
                loading={submitting}
                disabled={selectedCount === 0}
                startIcon={<PharmacyIcon />}
                sx={{
                  // Refactor Note: Replaced gradient background with solid color logic
                  background: selectedCount > 0 ? colors.accent : colors.primary,
                  color: "#fff",
                  minWidth: 180,
                  "&:hover": {
                    // Simple darker shade on hover
                    backgroundColor: selectedCount > 0 ? "#3db86a" : "#0a2e2e"
                  }
                }}
              >
                Dispense Selected
              </LoadingButton>
            </Stack>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: "20px", overflow: "hidden" }
        }}
      >
        {/* Refactor Note: Replaced gradient bar with solid accent color */}
        <Box sx={{ height: 6, backgroundColor: colors.accent }} />
        
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              backgroundColor: colors.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <WarningIcon sx={{ color: "#fff" }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: colors.primary }}>
              Confirm Dispense
            </Typography>
          </Stack>
          <IconButton 
            onClick={() => setConfirmOpen(false)} 
            sx={{ 
              position: "absolute", 
              right: 12, 
              top: 12,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 3 }}>
          <Typography variant="body1" sx={{ mb: 3, color: colors.gray, fontWeight: 500 }}>
            Please review and confirm the items and quantities to dispense:
          </Typography>
          
          {/* Removed border gradient logic */}
          <Card sx={{ 
            border: "1px solid " + colors.accent + "30",
            borderRadius: "12px",
            overflow: "hidden",
          }}>
            <List dense>
              {(() => {
                const payloadItems = [];
                items.forEach(item => {
                  const selection = selections[item.key];
                  if(selection && selection.checked) {
                    payloadItems.push({
                      ...item,
                      qtyToDispense: parseInt(selection.qty || "0", 10)
                    });
                  }
                });

                return payloadItems.map((p, idx) => (
                  <ListItem 
                    key={idx}
                    divider={idx < payloadItems.length - 1}
                    secondaryAction={
                      <Chip
                        size="small"
                        label={p.qtyToDispense + (p.qtyToDispense === 1 ? " unit" : " units")}
                        sx={{
                          bgcolor: colors.accent + "20",
                          color: colors.primary,
                          fontWeight: 700,
                        }}
                      />
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 700, color: colors.primary }}>
                          {p.medicineName || "Item"}
                        </Typography>
                      }
                      secondary={p.id ? (
                        <Typography variant="caption" sx={{ color: colors.gray }}>
                          Item ID: {p.id}
                        </Typography>
                      ) : null}
                    />
                  </ListItem>
                ));
              })()}
            </List>
          </Card>
          
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            borderRadius: "12px",
            bgcolor: colors.warn + "10",
            border: "1px solid " + colors.warn + "30",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}>
            <InfoIcon sx={{ color: colors.warn }} />
            <Typography variant="caption" sx={{ color: colors.warn, fontWeight: 600 }}>
              This action will permanently record a manual dispense for the selected items.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setConfirmOpen(false)} 
            variant="outlined" 
            size="large"
            sx={{
              borderColor: colors.gray,
              color: colors.gray,
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleDispense}
            variant="contained"
            size="large"
            loading={submitting}
            startIcon={<DoneIcon />}
            sx={{
              backgroundColor: colors.accent,
              color: "#fff",
              minWidth: 160,
              "&:hover": { backgroundColor: "#3db86a" }
            }}
          >
            Confirm & Dispense
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Result Summary Dialog */}
      <Dialog 
        open={resultOpen} 
        onClose={() => setResultOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: "20px", overflow: "hidden" }
        }}
      >
        {/* Refactor Note: Replaced gradient bar with solid good color */}
        <Box sx={{ height: 6, backgroundColor: colors.good }} />
        
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              backgroundColor: colors.good,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <CheckCircleIcon sx={{ color: "#fff" }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: colors.primary }}>
              Dispense Summary
            </Typography>
          </Stack>
          <IconButton 
            onClick={() => setResultOpen(false)} 
            sx={{ 
              position: "absolute", 
              right: 12, 
              top: 12,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 3 }}>
          {resultPayload && resultPayload.results && resultPayload.results.length ? (
            <Card sx={{ 
              border: "1px solid " + colors.good + "30",
              borderRadius: "12px",
              overflow: "hidden",
            }}>
              <List dense>
                {resultPayload.results.map((r, i) => (
                  <ListItem 
                    key={i}
                    divider={i < resultPayload.results.length - 1}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 700, color: colors.primary }}>
                          {r.medicineName || r.itemId || "Item"}
                        </Typography>
                      }
                      secondary={
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                          <Chip
                            size="small"
                            label={"Dispensed: " + (r.dispensedQty || 0)}
                            sx={{
                              bgcolor: colors.good + "15",
                              color: colors.good,
                              fontWeight: 600,
                            }}
                          />
                          <Chip
                            size="small"
                            label={"Requested: " + (r.requestedQty || 0)}
                            sx={{
                              bgcolor: colors.primary + "15",
                              color: colors.primary,
                              fontWeight: 600,
                            }}
                          />
                          {r.note && (
                            <Typography variant="caption" sx={{ color: colors.gray, fontStyle: "italic" }}>
                              {r.note}
                            </Typography>
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Card>
          ) : (
            <Box sx={{ textAlign: "center", py: 4, color: colors.good }}>
              <CheckCircleIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary }}>
                Dispense Completed Successfully!
              </Typography>
              <Typography variant="body2" sx={{ color: colors.gray, mt: 1 }}>
                All selected medications have been dispensed.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <LoadingButton
            onClick={() => {
              setResultOpen(false);
              if (onClose) onClose(resultPayload);
            }}
            variant="contained"
            size="large"
            fullWidth
            startIcon={<DoneIcon />}
            sx={{
              backgroundColor: colors.good,
              color: "#fff",
              "&:hover": { backgroundColor: "#256328" }
            }}
          >
            Done
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: "12px", fontWeight: 600 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "rgba(12, 60, 60, 0.7)", // Solid darker background for readability
        }}
        open={submitting}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={48} sx={{ color: colors.accent }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Processing Dispense...
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Please wait while we update the inventory
          </Typography>
        </Stack>
      </Backdrop>
    </>
  );
}