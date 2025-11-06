import React, { useEffect, useMemo, useState } from "react";
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
  Fade,
  Slide,
  Collapse,
  Skeleton,
  Card,
  CardContent,
  Zoom,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  LocalPharmacy as PharmacyIcon,
  Inventory as InventoryIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Refresh as RefreshIcon,
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
import { searchMedicines } from "../../api/medicine";
import { dispenseManual } from "../../api/prescription";

// ---------------- ENHANCED THEME TOKENS ----------------
const THEME = {
  primary: "#0C3C3C",
  accent: "#45D27A",
  gray: "#6C6B6B",
  light: "#F8F9FA",
  bad: "#C62828",
  warn: "#EF6C00",
  good: "#2E7D32",
  gradients: {
    primary: "linear-gradient(135deg, #0C3C3C 0%, #154545 100%)",
    accent: "linear-gradient(135deg, #45D27A 0%, #5CE084 100%)",
    card: "linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)",
    danger: "linear-gradient(135deg, #C62828 0%, #D32F2F 100%)",
  },
  shadows: {
    card: "0 2px 12px rgba(12, 60, 60, 0.08)",
    cardHover: "0 8px 32px rgba(12, 60, 60, 0.12)",
    button: "0 4px 16px rgba(69, 210, 122, 0.24)",
    focus: "0 0 0 3px rgba(69, 210, 122, 0.16)",
  },
  borderRadius: {
    small: "8px",
    medium: "12px",
    large: "16px",
    xl: "20px",
  },
};

// ---------------- ENHANCED STYLED COMPONENTS ----------------
const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: THEME.borderRadius.medium,
    backgroundColor: "#fff",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
    "&:hover": {
      boxShadow: "0 4px 14px rgba(12, 60, 60, 0.08)",
      transform: "translateY(-1px)",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: THEME.primary,
        borderWidth: "1.5px",
      },
    },
    "&.Mui-focused": {
      boxShadow: THEME.shadows.focus,
      transform: "translateY(-1px)",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: THEME.accent,
        borderWidth: "2px",
      },
    },
    "&.Mui-disabled": {
      backgroundColor: "#f5f5f5",
      opacity: 0.7,
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(12, 60, 60, 0.15)",
    transition: "all 0.3s ease",
  },
  "& .MuiInputLabel-root": {
    color: THEME.gray,
    fontWeight: 500,
    "&.Mui-focused": {
      color: THEME.primary,
      fontWeight: 600,
    },
  },
};

const pillSx = {
  mr: 1,
  mb: 1,
  fontWeight: 600,
  background: `linear-gradient(135deg, ${THEME.accent}15, ${THEME.accent}25)`,
  color: THEME.primary,
  borderRadius: "999px",
  border: `1px solid ${THEME.accent}30`,
  transition: "all 0.2s ease",
  "&:hover": {
    background: `linear-gradient(135deg, ${THEME.accent}25, ${THEME.accent}35)`,
    transform: "scale(1.02)",
  },
};

const modernCardSx = {
  p: 2.5,
  borderRadius: THEME.borderRadius.large,
  background: THEME.gradients.card,
  border: "1px solid rgba(12, 60, 60, 0.08)",
  boxShadow: THEME.shadows.card,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    boxShadow: THEME.shadows.cardHover,
    transform: "translateY(-2px)",
    borderColor: "rgba(69, 210, 122, 0.2)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: THEME.gradients.accent,
    transform: "scaleX(0)",
    transformOrigin: "left",
    transition: "transform 0.3s ease",
  },
  "&:hover::before": {
    transform: "scaleX(1)",
  },
};

const lightCardSx = {
  p: 2.5,
  borderRadius: THEME.borderRadius.large,
  background: `linear-gradient(145deg, ${THEME.light}, #ffffff)`,
  border: "1px solid rgba(12, 60, 60, 0.06)",
  boxShadow: "0 1px 8px rgba(12, 60, 60, 0.04)",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 4px 16px rgba(12, 60, 60, 0.08)",
  },
};

const modernButtonSx = {
  borderRadius: THEME.borderRadius.medium,
  textTransform: "none",
  fontWeight: 600,
  px: 3,
  py: 1.2,
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
    transition: "left 0.5s",
  },
  "&:hover::before": {
    left: "100%",
  },
};

const Pill = ({ children, ...props }) => (
  <Zoom in timeout={300}>
    <Chip label={children} size="small" sx={pillSx} {...props} />
  </Zoom>
);

const QuantityStepper = ({ value, onChange, onIncrement, onDecrement, disabled, max }) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={0.5}
    sx={{
      background: disabled ? "#f5f5f5" : "#fff",
      borderRadius: THEME.borderRadius.medium,
      border: "1px solid rgba(12, 60, 60, 0.12)",
      overflow: "hidden",
      transition: "all 0.3s ease",
      "&:hover": {
        borderColor: disabled ? "rgba(12, 60, 60, 0.12)" : THEME.accent,
        boxShadow: disabled ? "none" : "0 2px 8px rgba(69, 210, 122, 0.15)",
      },
    }}
  >
    <IconButton
      size="small"
      onClick={onDecrement}
      disabled={disabled || value <= 0}
      sx={{
        borderRadius: 0,
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: disabled ? "transparent" : `${THEME.accent}15`,
          color: THEME.accent,
        },
      }}
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
        max,
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
      sx={{
        borderRadius: 0,
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: disabled ? "transparent" : `${THEME.accent}15`,
          color: THEME.accent,
        },
      }}
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
      ...modernButtonSx,
      ...props.sx,
    }}
  >
    {loading ? "Loading..." : children}
  </Button>
);

export default function ViewPrescriptionDialog({ open, onClose, rx }) {
  const [selections, setSelections] = useState({});
  const [invQuery, setInvQuery] = useState("");
  const [invResults, setInvResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [showInventory, setShowInventory] = useState(true);

  // confirmation + notifications + result summary
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, severity: "success", msg: "" });
  const [resultOpen, setResultOpen] = useState(false);
  const [resultPayload, setResultPayload] = useState(null);

  // ---------- Normalize items ----------
  const items = useMemo(() => {
    const raw = rx?.items || rx?.medications || [];
    return (raw || []).map((it, i) => {
      const id = it.id ?? it.itemId ?? null;
      const medName = it.medicineName || it.medicine?.name || it.medicine || "";
      const route = it.routeOfAdministration || it.route || "-";
      const duration = it.durationDays || it.days || it.duration || "";
      const timeArr = it.timeOfDay || it.timesOfDay || it.times || [];
      const qty = it.quantity ?? it.units ?? null;
      const form = it.form ?? it.medicineDetails?.form ?? "";
      const strength = it.strength ?? it.medicineDetails?.strength ?? "";
      const dosage = it.dosage ?? "";
      return {
        key: id ?? `idx_${i}`,
        id,
        medicineName: medName,
        route,
        duration,
        timeOfDay: Array.isArray(timeArr) ? timeArr : [],
        quantity: qty,
        form,
        strength,
        instructions: it.instructions ?? "",
        dosage,
      };
    });
  }, [rx]);

  // ---------- Reset on close/change ----------
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

  // ---------- Enhanced Selection helpers ----------
  const toggleSelect = (key) => {
    setSelections((prev) => {
      const cur = prev[key] || { checked: false, qty: "" };
      return { ...prev, [key]: { ...cur, checked: !cur.checked } };
    });
  };

  const setQty = (key, value) => {
    const v = value.replace(/[^\d]/g, "");
    setSelections((prev) => {
      const cur = prev[key] || { checked: false, qty: "" };
      return { ...prev, [key]: { ...cur, qty: v } };
    });
  };

  const stepQty = (key, delta) => {
    setSelections((prev) => {
      const cur = prev[key] || { checked: false, qty: "" };
      const n = Math.max(0, parseInt(cur.qty || "0", 10) + delta);
      return { ...prev, [key]: { ...cur, qty: String(n) } };
    });
  };

  const setSuggestedQty = (key, suggested) => {
    if (Number.isFinite(suggested)) {
      setSelections((prev) => {
        const cur = prev[key] || { checked: false, qty: "" };
        return { ...prev, [key]: { ...cur, qty: String(Math.max(0, suggested)) } };
      });
    }
  };

  const bulkSelectAll = () => {
    setSelections((prev) => {
      const next = { ...prev };
      items.forEach((it) => {
        const cur = next[it.key] || { checked: false, qty: "" };
        next[it.key] = { ...cur, checked: true };
      });
      return next;
    });
  };

  const bulkClear = () => {
    setSelections({});
  };

  const toggleCardExpansion = (key) => {
    setExpandedCards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ---------- Enhanced Inventory search ----------
  const runInventorySearch = async () => {
    if (!invQuery?.trim()) {
      setInvResults([]);
      return;
    }
    try {
      setLoadingSearch(true);
      const res = await searchMedicines(invQuery.trim());
      const list = Array.isArray(res) ? res : res?.data || [];
      setInvResults(list);
    } catch {
      setInvResults([]);
      setSnack({
        open: true,
        severity: "error",
        msg: "Failed to search inventory. Please try again.",
      });
    } finally {
      setLoadingSearch(false);
    }
  };

  const checkAvailabilityForItem = async (key, medName) => {
    if (!medName?.trim()) return;
    try {
      setSelections((prev) => {
        const cur = prev[key] || { checked: false, qty: "" };
        return { ...prev, [key]: { ...cur, checking: true } };
      });

      const res = await searchMedicines(medName.trim());
      const list = Array.isArray(res) ? res : res?.data || [];
      const best =
        list?.find((m) => m?.name?.toLowerCase() === medName.toLowerCase()) || list?.[0];
      const stock = best?.stock ?? best?.quantity ?? 0;
      const note = best ? `In stock: ${stock}` : "Not found";
      
      setSelections((prev) => {
        const cur = prev[key] || { checked: false, qty: "" };
        return { 
          ...prev, 
          [key]: { 
            ...cur, 
            availability: note, 
            stock, 
            checking: false 
          } 
        };
      });
    } catch {
      setSelections((prev) => {
        const cur = prev[key] || { checked: false, qty: "" };
        return { 
          ...prev, 
          [key]: { 
            ...cur, 
            availability: "Search failed", 
            checking: false 
          } 
        };
      });
    }
  };

  // ---------- Build payload ----------
  const buildPayload = () => {
    const payloadItems = [];
    items.forEach((it) => {
      const sel = selections[it.key];
      const qty = sel?.qty ? parseInt(sel.qty, 10) : 0;
      if (sel?.checked && qty > 0) {
        payloadItems.push({
          itemId: it.id ?? null,
          quantity: qty,
          medicineName: it.medicineName || null,
          dispensedQuantity: qty,
          dispensedStatus: 1,
        });
      }
    });
    return payloadItems;
  };

  // ---------- Enhanced Confirm / Submit ----------
  const openConfirm = () => {
    if (!rx?.id) {
      setSnack({ open: true, severity: "error", msg: "Prescription ID missing. Cannot dispense." });
      return;
    }
    const payloadItems = buildPayload();
    if (payloadItems.length === 0) {
      setSnack({ open: true, severity: "warning", msg: "Select at least one medicine and enter units to dispense." });
      return;
    }
    setConfirmOpen(true);
  };

  const handleDispense = async () => {
    const payloadItems = buildPayload();
    if (payloadItems.length === 0 || !rx?.id) {
      setConfirmOpen(false);
      return;
    }
    try {
      setSubmitting(true);
      const result = await dispenseManual(rx.id, payloadItems);
      if (result?.results?.length) {
        setResultPayload(result);
        setResultOpen(true);
      } else {
        setSnack({ open: true, severity: "success", msg: "Dispense request completed successfully!" });
        onClose?.(result);
      }
    } catch {
      setSnack({ open: true, severity: "error", msg: "Dispense failed. Please try again." });
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  };

  // ---------- Enhanced Derived summary ----------
  const selectedCount = useMemo(
    () => Object.values(selections).filter((s) => s.checked && (parseInt(s.qty || "0", 10) > 0)).length,
    [selections]
  );
  const totalUnits = useMemo(
    () =>
      Object.values(selections).reduce((acc, s) => {
        if (s.checked) acc += Math.max(0, parseInt(s.qty || "0", 10));
        return acc;
      }, 0),
    [selections]
  );

  if (!rx) return null;

  const headerDate = new Date(rx.createdAt || rx.prescriptionDate || Date.now()).toLocaleString();

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" }}
        PaperProps={{
          sx: {
            borderRadius: THEME.borderRadius.xl,
            overflow: "hidden",
            maxHeight: "90vh",
          }
        }}
      >
        {/* Enhanced Top gradient accent */}
        <Box 
          sx={{ 
            height: 8, 
            width: "100%", 
            background: THEME.gradients.accent,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "1px",
              background: "rgba(69, 210, 122, 0.3)",
            }
          }} 
        />

        <DialogTitle sx={{ pb: 2, background: THEME.gradients.card }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{
                width: 48, 
                height: 48, 
                borderRadius: THEME.borderRadius.medium,
                background: THEME.gradients.primary,
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                color: "#fff", 
                fontWeight: 800,
                fontSize: "1.2rem",
                boxShadow: THEME.shadows.card,
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  borderRadius: THEME.borderRadius.medium,
                  padding: "2px",
                  background: THEME.gradients.accent,
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "subtract",
                },
              }}>
                ℞
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: THEME.primary, mb: 0.5 }}>
                  Prescription — {rx.patientName}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip
                    size="small"
                    icon={<AnalyticsIcon />}
                    label={`Dr. ${rx.doctorName}`}
                    sx={{ 
                      bgcolor: `${THEME.primary}10`, 
                      color: THEME.primary,
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    size="small"
                    icon={<ScheduleIcon />}
                    label={headerDate}
                    sx={{ 
                      bgcolor: `${THEME.accent}10`, 
                      color: THEME.primary,
                      fontWeight: 600,
                    }}
                  />
                </Stack>
              </Box>
            </Stack>
            <IconButton 
              onClick={onClose}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2, pb: 1, background: "#fafbfc" }}>
          {/* Enhanced Inventory Search */}
          <Collapse in={showInventory}>
            <Card sx={{ ...lightCardSx, mb: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{
                      width: 32,
                      height: 32,
                      borderRadius: THEME.borderRadius.small,
                      background: THEME.gradients.accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <InventoryIcon fontSize="small" sx={{ color: "#fff" }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: THEME.primary }}>
                      Inventory Search
                    </Typography>
                    <Tooltip title="Search your stock for medicines and view current quantities" arrow>
                      <InfoIcon fontSize="small" sx={{ color: THEME.gray, cursor: "help" }} />
                    </Tooltip>
                  </Stack>
                  <IconButton 
                    size="small" 
                    onClick={() => setShowInventory(false)}
                    sx={{ color: THEME.gray }}
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
                    sx={inputSx}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: THEME.gray }} />,
                    }}
                  />
                  <LoadingButton
                    variant="contained"
                    onClick={runInventorySearch}
                    loading={loadingSearch}
                    startIcon={<SearchIcon />}
                    sx={{
                      background: THEME.gradients.accent,
                      boxShadow: THEME.shadows.button,
                      "&:hover": {
                        boxShadow: "0 6px 20px rgba(69, 210, 122, 0.3)",
                        transform: "translateY(-1px)",
                      },
                      minWidth: 140,
                    }}
                  >
                    Search
                  </LoadingButton>
                </Stack>

                {loadingSearch && (
                  <Fade in>
                    <LinearProgress 
                      sx={{ 
                        mb: 2, 
                        borderRadius: THEME.borderRadius.small,
                        height: 6,
                        backgroundColor: `${THEME.accent}20`,
                        "& .MuiLinearProgress-bar": {
                          background: THEME.gradients.accent,
                        },
                      }} 
                    />
                  </Fade>
                )}

                {invResults?.length > 0 && (
                  <Fade in>
                    <Card sx={{ 
                      border: "1px solid rgba(12, 60, 60, 0.08)",
                      borderRadius: THEME.borderRadius.medium,
                      overflow: "hidden",
                    }}>
                      <List dense sx={{ maxHeight: 240, overflowY: "auto" }}>
                        {invResults.map((m, i) => {
                          const stock = m.stock ?? m.quantity ?? 0;
                          const ok = Number(stock) > 0;
                          return (
                            <Slide key={m.id ?? m.name ?? i} in timeout={300 + i * 100} direction="right">
                              <ListItem 
                                divider={i < invResults.length - 1}
                                sx={{
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    backgroundColor: `${THEME.accent}08`,
                                  },
                                }}
                                secondaryAction={
                                  <Chip
                                    size="small"
                                    icon={<CheckCircleIcon sx={{ color: ok ? THEME.good : THEME.bad }} />}
                                    label={`Stock: ${stock}`}
                                    sx={{
                                      bgcolor: ok ? `${THEME.good}15` : `${THEME.bad}15`,
                                      color: ok ? THEME.good : THEME.bad,
                                      fontWeight: 700,
                                      border: `1px solid ${ok ? THEME.good : THEME.bad}30`,
                                    }}
                                  />
                                }
                              >
                                <ListItemText
                                  primary={
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: THEME.primary }}>
                                      {m.name || "-"} {m.strength ? `(${m.strength})` : ""}
                                    </Typography>
                                  }
                                  secondary={m.manufacturer ? `Manufacturer: ${m.manufacturer}` : null}
                                />
                              </ListItem>
                            </Slide>
                          );
                        })}
                      </List>
                    </Card>
                  </Fade>
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
                  color: THEME.primary,
                  "&:hover": { bgcolor: `${THEME.accent}10` },
                }}
              >
                Show Inventory Search
              </Button>
            </Box>
          )}

          {/* Enhanced Bulk actions */}
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
                  borderColor: THEME.accent,
                  color: THEME.accent,
                  "&:hover": {
                    bgcolor: `${THEME.accent}15`,
                    borderColor: THEME.accent,
                    transform: "translateY(-1px)",
                  },
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
                  borderColor: THEME.primary,
                  color: THEME.primary,
                  "&:hover": {
                    bgcolor: "rgba(12, 60, 60, 0.08)",
                    borderColor: THEME.primary,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Clear All
              </LoadingButton>
            </Stack>
            
            <Chip
              size="medium"
              icon={<PharmacyIcon />}
              label={`${selectedCount} selected • ${totalUnits} unit${totalUnits === 1 ? "" : "s"}`}
              sx={{
                bgcolor: selectedCount > 0 ? `${THEME.accent}20` : `${THEME.gray}15`,
                color: selectedCount > 0 ? THEME.primary : THEME.gray,
                fontWeight: 700,
                px: 2,
                height: 40,
                borderRadius: THEME.borderRadius.medium,
                border: `1px solid ${selectedCount > 0 ? THEME.accent : THEME.gray}30`,
                transition: "all 0.3s ease",
                "& .MuiChip-icon": {
                  color: selectedCount > 0 ? THEME.accent : THEME.gray,
                },
              }}
            />
          </Stack>

          <Divider sx={{ mb: 3, borderColor: "rgba(12, 60, 60, 0.08)" }} />

          {/* Enhanced Items list */}
          <Stack spacing={2} sx={{ pb: 2 }}>
            {items.map((it, index) => {
              const sel = selections[it.key] || {};
              const stock = sel.stock ?? null;
              const stockOk = stock == null ? null : Number(stock) > 0;
              const isExpanded = expandedCards[it.key];
              const hasDetails = it.instructions || it.timeOfDay?.length > 0;

              return (
                <Slide key={it.key} in timeout={300 + index * 100} direction="up">
                  <Card sx={modernCardSx}>
                    <CardContent sx={{ p: 0 }}>
                      <Stack spacing={2}>
                        {/* Main content row */}
                        <Stack 
                          direction={{ xs: "column", lg: "row" }} 
                          alignItems={{ lg: "flex-start" }} 
                          spacing={2}
                        >
                          {/* Medicine Info Section */}
                          <Box sx={{ flex: 1, minWidth: 300 }}>
                            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.5 }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ 
                                  fontWeight: 800, 
                                  color: THEME.primary,
                                  mb: 0.5,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}>
                                  {it.medicineName}
                                  {it.form || it.strength ? (
                                    <Chip
                                      size="small"
                                      label={[it.form, it.strength].filter(Boolean).join(" ")}
                                      sx={{
                                        bgcolor: `${THEME.primary}10`,
                                        color: THEME.primary,
                                        fontWeight: 600,
                                        fontSize: "0.7rem",
                                      }}
                                    />
                                  ) : null}
                                </Typography>
                                
                                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 1.5 }}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <Typography variant="caption" sx={{ color: THEME.gray, fontWeight: 600 }}>
                                      Route:
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={it.route}
                                      sx={{
                                        bgcolor: `${THEME.accent}15`,
                                        color: THEME.primary,
                                        fontWeight: 600,
                                        height: 20,
                                        fontSize: "0.7rem",
                                      }}
                                    />
                                  </Box>
                                  
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <Typography variant="caption" sx={{ color: THEME.gray, fontWeight: 600 }}>
                                      Duration:
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={it.duration ? `${it.duration} days` : "N/A"}
                                      sx={{
                                        bgcolor: `${THEME.primary}15`,
                                        color: THEME.primary,
                                        fontWeight: 600,
                                        height: 20,
                                        fontSize: "0.7rem",
                                      }}
                                    />
                                  </Box>

                                  {it.dosage && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                      <Typography variant="caption" sx={{ color: THEME.gray, fontWeight: 600 }}>
                                        Dosage:
                                      </Typography>
                                      <Chip
                                        size="small"
                                        label={it.dosage}
                                        sx={{
                                          bgcolor: `${THEME.warn}15`,
                                          color: THEME.warn,
                                          fontWeight: 600,
                                          height: 20,
                                          fontSize: "0.7rem",
                                        }}
                                      />
                                    </Box>
                                  )}
                                </Stack>

                                {/* Quick info pills */}
                                <Stack direction="row" flexWrap="wrap" gap={0.5}>
                                  {(it.timeOfDay || []).slice(0, 3).map((t) => (
                                    <Pill key={t}>{t}</Pill>
                                  ))}
                                  {(it.timeOfDay || []).length > 3 && (
                                    <Pill>+{(it.timeOfDay || []).length - 3} more</Pill>
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
                                    bgcolor: `${THEME.accent}15`,
                                    color: THEME.primary,
                                    "&:hover": {
                                      bgcolor: `${THEME.accent}25`,
                                      transform: "scale(1.1)",
                                    },
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  {isExpanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
                                </IconButton>
                              )}
                            </Stack>

                            {/* Expanded details */}
                            <Collapse in={isExpanded}>
                              <Box sx={{ 
                                mt: 2, 
                                p: 2, 
                                borderRadius: THEME.borderRadius.small,
                                bgcolor: `${THEME.light}50`,
                                border: "1px solid rgba(12, 60, 60, 0.05)",
                              }}>
                                {it.timeOfDay?.length > 3 && (
                                  <Box sx={{ mb: 1.5 }}>
                                    <Typography variant="caption" sx={{ color: THEME.gray, fontWeight: 600, mb: 1, display: "block" }}>
                                      All Times of Day:
                                    </Typography>
                                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                                      {it.timeOfDay.map((t) => <Pill key={t}>{t}</Pill>)}
                                    </Stack>
                                  </Box>
                                )}
                                
                                {it.instructions && (
                                  <Box>
                                    <Typography variant="caption" sx={{ color: THEME.gray, fontWeight: 600, mb: 1, display: "block" }}>
                                      Instructions:
                                    </Typography>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        color: THEME.primary,
                                        fontStyle: "italic",
                                        bgcolor: "#fff",
                                        p: 1.5,
                                        borderRadius: THEME.borderRadius.small,
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

                          {/* Actions Section */}
                          <Box sx={{ 
                            minWidth: { xs: "100%", lg: 400 },
                            maxWidth: { lg: 400 },
                          }}>
                            <Stack spacing={2}>
                              {/* Selection and quantity */}
                              <Box sx={{
                                p: 2,
                                borderRadius: THEME.borderRadius.medium,
                                bgcolor: sel.checked ? `${THEME.accent}08` : "#f8f9fa",
                                border: `2px solid ${sel.checked ? THEME.accent : "rgba(12, 60, 60, 0.08)"}`,
                                transition: "all 0.3s ease",
                              }}>
                                <FormControlLabel
                                  sx={{ 
                                    mb: 2,
                                    "& .MuiFormControlLabel-label": {
                                      fontWeight: 700,
                                      color: sel.checked ? THEME.primary : THEME.gray,
                                    },
                                  }}
                                  control={
                                    <Checkbox 
                                      checked={!!sel.checked} 
                                      onChange={() => toggleSelect(it.key)}
                                      sx={{
                                        color: THEME.accent,
                                        "&.Mui-checked": {
                                          color: THEME.accent,
                                        },
                                      }}
                                    />
                                  }
                                  label="Dispense this medication"
                                />

                                {/* Enhanced quantity stepper */}
                                <Stack spacing={2}>
                                  <Box>
                                    <Typography variant="caption" sx={{ color: THEME.gray, fontWeight: 600, mb: 1, display: "block" }}>
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

                                  {/* Action buttons */}
                                  <Stack direction="row" spacing={1}>
                                    <Tooltip title="Fill with requested quantity" arrow>
                                      <span>
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          onClick={() => setSuggestedQty(it.key, it.quantity ?? 0)}
                                          disabled={!sel.checked || !it.quantity}
                                          sx={{
                                            borderColor: THEME.accent,
                                            color: THEME.accent,
                                            "&:hover": {
                                              bgcolor: `${THEME.accent}15`,
                                              borderColor: THEME.accent,
                                            },
                                            ...modernButtonSx,
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
                                            borderColor: THEME.primary,
                                            color: THEME.primary,
                                            "&:hover": {
                                              bgcolor: "rgba(12, 60, 60, 0.08)",
                                              borderColor: THEME.primary,
                                            },
                                            ...modernButtonSx,
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

                              {/* Stock availability display */}
                              {sel.availability && (
                                <Fade in>
                                  <Box sx={{
                                    p: 2,
                                    borderRadius: THEME.borderRadius.medium,
                                    bgcolor: stockOk === null ? "#fff" : stockOk ? `${THEME.good}10` : `${THEME.bad}10`,
                                    border: `1px solid ${stockOk === null ? "rgba(0,0,0,0.1)" : stockOk ? THEME.good : THEME.bad}30`,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}>
                                    {stockOk !== null && (
                                      <Box sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        bgcolor: stockOk ? THEME.good : THEME.bad,
                                        animation: "pulse 2s infinite",
                                        "@keyframes pulse": {
                                          "0%": { opacity: 1 },
                                          "50%": { opacity: 0.5 },
                                          "100%": { opacity: 1 },
                                        },
                                      }} />
                                    )}
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: stockOk === null ? THEME.gray : stockOk ? THEME.good : THEME.bad,
                                        fontWeight: 700,
                                      }}
                                    >
                                      {sel.availability}
                                    </Typography>
                                  </Box>
                                </Fade>
                              )}
                            </Stack>
                          </Box>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Slide>
              );
            })}
          </Stack>

          {/* General notes */}
          {rx.generalNotes && (
            <Fade in>
              <Card sx={{ 
                ...lightCardSx, 
                mt: 2,
                borderLeft: `4px solid ${THEME.accent}`,
              }}>
                <CardContent>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <InfoIcon sx={{ color: THEME.accent, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: THEME.primary, mb: 1 }}>
                        General Notes
                      </Typography>
                      <Typography variant="body2" sx={{ color: THEME.gray, lineHeight: 1.6 }}>
                        {rx.generalNotes}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Fade>
          )}
        </DialogContent>

        {/* Enhanced sticky footer actions */}
        <DialogActions sx={{ 
          position: "sticky", 
          bottom: 0, 
          bgcolor: "#fff", 
          borderTop: "1px solid rgba(12, 60, 60, 0.08)",
          p: 2.5,
          background: THEME.gradients.card,
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
                label={`${selectedCount} item${selectedCount === 1 ? "" : "s"} selected`}
                sx={{
                  bgcolor: selectedCount > 0 ? `${THEME.accent}20` : `${THEME.gray}15`,
                  color: selectedCount > 0 ? THEME.primary : THEME.gray,
                  fontWeight: 700,
                  height: 36,
                  borderRadius: THEME.borderRadius.medium,
                  border: `1px solid ${selectedCount > 0 ? THEME.accent : THEME.gray}30`,
                  "& .MuiChip-icon": {
                    color: selectedCount > 0 ? THEME.accent : THEME.gray,
                  },
                }}
              />
              
              {totalUnits > 0 && (
                <Chip
                  size="medium"
                  label={`${totalUnits} unit${totalUnits === 1 ? "" : "s"} total`}
                  sx={{
                    bgcolor: `${THEME.primary}15`,
                    color: THEME.primary,
                    fontWeight: 700,
                    height: 36,
                    borderRadius: THEME.borderRadius.medium,
                    border: `1px solid ${THEME.primary}30`,
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
                  borderColor: THEME.primary,
                  color: THEME.primary,
                  "&:hover": {
                    bgcolor: "rgba(12, 60, 60, 0.08)",
                    borderColor: THEME.primary,
                    transform: "translateY(-1px)",
                  },
                  ...modernButtonSx,
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
                  background: selectedCount > 0 ? THEME.gradients.accent : THEME.gradients.primary,
                  boxShadow: selectedCount > 0 ? THEME.shadows.button : "none",
                  "&:hover": {
                    boxShadow: selectedCount > 0 ? "0 6px 20px rgba(69, 210, 122, 0.3)" : "0 4px 16px rgba(12, 60, 60, 0.2)",
                    transform: "translateY(-2px)",
                  },
                  "&:disabled": {
                    background: `${THEME.gray}40`,
                    color: "#fff",
                  },
                  ...modernButtonSx,
                  minWidth: 180,
                }}
              >
                Dispense Selected
              </LoadingButton>
            </Stack>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Enhanced CONFIRM DIALOG */}
      <Dialog 
        open={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: THEME.borderRadius.xl,
            overflow: "hidden",
          }
        }}
      >
        <Box sx={{ height: 6, background: THEME.gradients.accent }} />
        
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: THEME.borderRadius.medium,
              background: THEME.gradients.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <WarningIcon sx={{ color: "#fff" }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: THEME.primary }}>
              Confirm Dispense
            </Typography>
          </Stack>
          <IconButton 
            onClick={() => setConfirmOpen(false)} 
            sx={{ 
              position: "absolute", 
              right: 12, 
              top: 12,
              bgcolor: "rgba(255, 255, 255, 0.8)",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 3 }}>
          <Typography variant="body1" sx={{ mb: 3, color: THEME.gray, fontWeight: 500 }}>
            Please review and confirm the items and quantities to dispense:
          </Typography>
          
          <Card sx={{ 
            border: `1px solid ${THEME.accent}30`,
            borderRadius: THEME.borderRadius.medium,
            overflow: "hidden",
          }}>
            <List dense>
              {buildPayload().map((p, idx) => (
                <Slide key={`${p.itemId || p.medicineName || idx}-${p.quantity}`} in timeout={200 + idx * 100} direction="right">
                  <ListItem 
                    divider={idx < buildPayload().length - 1}
                    sx={{
                      py: 1.5,
                      "&:hover": {
                        bgcolor: `${THEME.accent}08`,
                      },
                      transition: "all 0.2s ease",
                    }}
                    secondaryAction={
                      <Chip
                        size="small"
                        label={`${p.quantity} unit${p.quantity === 1 ? "" : "s"}`}
                        sx={{
                          bgcolor: `${THEME.accent}20`,
                          color: THEME.primary,
                          fontWeight: 700,
                        }}
                      />
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 700, color: THEME.primary }}>
                          {p.medicineName || "Item"}
                        </Typography>
                      }
                      secondary={p.itemId ? (
                        <Typography variant="caption" sx={{ color: THEME.gray }}>
                          Item ID: {p.itemId}
                        </Typography>
                      ) : null}
                    />
                  </ListItem>
                </Slide>
              ))}
            </List>
          </Card>
          
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            borderRadius: THEME.borderRadius.medium,
            bgcolor: `${THEME.warn}10`,
            border: `1px solid ${THEME.warn}30`,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}>
            <InfoIcon sx={{ color: THEME.warn }} />
            <Typography variant="caption" sx={{ color: THEME.warn, fontWeight: 600 }}>
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
              borderColor: THEME.gray,
              color: THEME.gray,
              "&:hover": {
                bgcolor: `${THEME.gray}10`,
                borderColor: THEME.gray,
              },
              ...modernButtonSx,
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
              background: THEME.gradients.accent,
              boxShadow: THEME.shadows.button,
              "&:hover": {
                boxShadow: "0 6px 20px rgba(69, 210, 122, 0.3)",
                transform: "translateY(-1px)",
              },
              ...modernButtonSx,
              minWidth: 160,
            }}
          >
            Confirm & Dispense
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Enhanced RESULT SUMMARY DIALOG */}
      <Dialog 
        open={resultOpen} 
        onClose={() => setResultOpen(false)} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" }}
        PaperProps={{
          sx: {
            borderRadius: THEME.borderRadius.xl,
            overflow: "hidden",
          }
        }}
      >
        <Box sx={{ height: 6, background: THEME.gradients.good }} />
        
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: THEME.borderRadius.medium,
              background: THEME.gradients.good,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <CheckCircleIcon sx={{ color: "#fff" }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: THEME.primary }}>
              Dispense Summary
            </Typography>
          </Stack>
          <IconButton 
            onClick={() => setResultOpen(false)} 
            sx={{ 
              position: "absolute", 
              right: 12, 
              top: 12,
              bgcolor: "rgba(255, 255, 255, 0.8)",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 3 }}>
          {resultPayload?.results?.length ? (
            <Card sx={{ 
              border: `1px solid ${THEME.good}30`,
              borderRadius: THEME.borderRadius.medium,
              overflow: "hidden",
            }}>
              <List dense>
                {resultPayload.results.map((r, i) => (
                  <Fade key={i} in timeout={300 + i * 100}>
                    <ListItem 
                      divider={i < resultPayload.results.length - 1}
                      sx={{
                        py: 1.5,
                        "&:hover": {
                          bgcolor: `${THEME.good}08`,
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 700, color: THEME.primary }}>
                            {r.medicineName || r.itemId || "Item"}
                          </Typography>
                        }
                        secondary={
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                            <Chip
                              size="small"
                              label={`Dispensed: ${r.dispensedQty ?? 0}`}
                              sx={{
                                bgcolor: `${THEME.good}15`,
                                color: THEME.good,
                                fontWeight: 600,
                              }}
                            />
                            <Chip
                              size="small"
                              label={`Requested: ${r.requestedQty ?? 0}`}
                              sx={{
                                bgcolor: `${THEME.primary}15`,
                                color: THEME.primary,
                                fontWeight: 600,
                              }}
                            />
                            {r.note && (
                              <Typography variant="caption" sx={{ color: THEME.gray, fontStyle: "italic" }}>
                                {r.note}
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                    </ListItem>
                  </Fade>
                ))}
              </List>
            </Card>
          ) : (
            <Box sx={{ 
              textAlign: "center", 
              py: 4,
              color: THEME.good,
            }}>
              <CheckCircleIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: THEME.primary }}>
                Dispense Completed Successfully!
              </Typography>
              <Typography variant="body2" sx={{ color: THEME.gray, mt: 1 }}>
                All selected medications have been dispensed.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <LoadingButton
            onClick={() => {
              setResultOpen(false);
              onClose?.(resultPayload);
            }}
            variant="contained"
            size="large"
            fullWidth
            startIcon={<DoneIcon />}
            sx={{
              background: THEME.gradients.good,
              "&:hover": {
                boxShadow: "0 6px 20px rgba(46, 125, 50, 0.3)",
                transform: "translateY(-1px)",
              },
              ...modernButtonSx,
            }}
          >
            Done
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Enhanced SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" }}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          variant="filled"
          sx={{ 
            width: "100%",
            borderRadius: THEME.borderRadius.medium,
            fontWeight: 600,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            "& .MuiAlert-icon": {
              fontSize: "1.2rem",
            },
            "& .MuiAlert-message": {
              fontSize: "0.9rem",
            },
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>

      {/* Loading backdrop for better UX during submissions */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: "blur(8px)",
          background: "rgba(12, 60, 60, 0.1)",
        }}
        open={submitting}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress 
            size={48} 
            sx={{ 
              color: THEME.accent,
              "& .MuiCircularProgress-circle": {
                strokeLinecap: "round",
              },
            }} 
          />
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