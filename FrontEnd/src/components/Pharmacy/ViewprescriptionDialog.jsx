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
  Collapse,
  Card,
  CardContent,
  Fade,
  Slide,
  Zoom,
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
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { searchMedicines } from "../../api/medicine";
import { dispenseManual } from "../../api/prescription";

// ---------------- THEME-LIKE TOKENS ----------------
const THEME = {
  primary: "#0C3C3C",
  accent:  "#45D27A",
  gray:    "#6C6B6B",
  light:   "#F8F9FA",
  bad:     "#C62828",
  warn:    "#EF6C00",
  good:    "#2E7D32",
  gradients: {
    accent: "linear-gradient(135deg, #45D27A 0%, #2E7D32 100%)",
    primary: "linear-gradient(135deg, #0C3C3C 0%, #1A5A5A 100%)",
    card: "linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)",
  },
  shadows: {
    button: "0 4px 14px rgba(69, 210, 122, 0.25)",
  },
  borderRadius: {
    small: "8px",
    medium: "12px",
    large: "16px",
  },
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#fff",
    transition: "all .25s ease",
    boxShadow: "0 2px 8px rgba(12,60,60,0.06)",
    "&:hover": { boxShadow: "0 4px 14px rgba(12,60,60,0.10)", transform: "translateY(-1px)" },
    "&.Mui-focused": { boxShadow: "0 8px 22px rgba(69,210,122,0.20)", transform: "translateY(-2px)" },
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(12,60,60,0.20)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: THEME.primary },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: THEME.accent, borderWidth: 2 },
  "& .MuiInputLabel-root": { color: THEME.gray, "&.Mui-focused": { color: THEME.primary } },
};

const pillSx = { mr: 1, mb: 1, fontWeight: 600, bgcolor: `${THEME.accent}15`, color: THEME.primary, borderRadius: "999px" };
const cardSx = { p: 1.5, borderRadius: 2, border: "1px solid rgba(12,60,60,0.10)", background: "#fff" };
const lightCardSx = { p: 1.5, borderRadius: 2, border: "1px solid rgba(12,60,60,0.08)", background: THEME.light };

const modernButtonSx = {
  borderRadius: THEME.borderRadius.medium,
  fontWeight: 600,
  textTransform: "none",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: THEME.shadows.button,
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

export default function ViewPrescriptionDialog({ open, onClose, rx, readOnly = false }) {
  const [selections, setSelections] = useState({});
  const [invQuery, setInvQuery] = useState("");
  const [invResults, setInvResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

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
      setShowInventory(false);
      setConfirmOpen(false);
      setResultOpen(false);
      setResultPayload(null);
    }
  }, [open, rx]);

  // ---------- Selection helpers ----------
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

  // ---------- Inventory search ----------
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
    } finally {
      setLoadingSearch(false);
    }
  };

  const checkAvailabilityForItem = async (key, medName) => {
    if (!medName?.trim()) return;
    try {
      const res = await searchMedicines(medName.trim());
      const list = Array.isArray(res) ? res : res?.data || [];
      const best =
        list?.find((m) => m?.name?.toLowerCase() === medName.toLowerCase()) || list?.[0];
      const stock = best?.stock ?? best?.quantity ?? 0;
      const note = best ? `In stock: ${stock}` : "Not found";
      setSelections((prev) => {
        const cur = prev[key] || { checked: false, qty: "" };
        return { ...prev, [key]: { ...cur, availability: note, stock } };
      });
    } catch {
      setSelections((prev) => {
        const cur = prev[key] || { checked: false, qty: "" };
        return { ...prev, [key]: { ...cur, availability: "Search failed" } };
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

  // ---------- Confirm / Submit ----------
  const openConfirm = () => {
    if (readOnly) return; // Prevent dispense in read-only mode
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
    if (readOnly) return; // Prevent dispense in read-only mode
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
        setSnack({ open: true, severity: "success", msg: "Dispense request completed." });
        onClose?.(result);
      }
    } catch {
      setSnack({ open: true, severity: "error", msg: "Dispense failed. Please try again." });
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  };

  // ---------- Derived summary ----------
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
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        {/* Top gradient accent */}
        <Box sx={{ height: 6, width: "100%", background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.accent})` }} />

        <DialogTitle sx={{ pb: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1.2}>
              <Box sx={{
                width: 36, height: 36, borderRadius: "10px", border: `2px solid ${THEME.primary}`,
                display: "flex", alignItems: "center", justifyContent: "center", color: THEME.primary, fontWeight: 800
              }}>
                ℞
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: THEME.primary }}>
                  Prescription — {rx.patientName}
                </Typography>
                <Typography variant="caption" sx={{ color: THEME.gray }}>
                  Doctor: <b>{rx.doctorName}</b> • Date: {headerDate}
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2, pb: 1, background: "#fafbfc" }}>
          {/* Enhanced Inventory Search - Hide in read-only mode */}
          {!readOnly && (
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
          )}

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

          {/* Enhanced Bulk actions - Hide in read-only mode */}
          {!readOnly && (
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
          )}

          <Divider sx={{ mb: 2 }} />

          {/* Items list */}
          <Stack spacing={1.5} sx={{ pb: 1 }}>
            {items.map((it) => {
              const sel = selections[it.key] || {};
              const stock = sel.stock ?? null;
              const stockOk = stock == null ? null : Number(stock) > 0;

              return (
                <Slide key={it.key} in timeout={300} direction="up">
                  <Card sx={{ ...cardSx }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.25}>
                        <Box sx={{ minWidth: 260 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: THEME.primary }}>
                            {it.medicineName}{" "}
                            <Typography component="span" variant="body2" sx={{ color: THEME.gray, fontWeight: 500 }}>
                              {it.form || it.strength ? `(${[it.form, it.strength].filter(Boolean).join(" ")})` : ""}
                            </Typography>
                          </Typography>
                          <Typography variant="body2" sx={{ color: THEME.gray }}>
                            Route: {it.route} &nbsp;|&nbsp; Duration: {it.duration ? `${it.duration} days` : "-"}
                            {it.dosage ? <> &nbsp;|&nbsp; Dosage: {it.dosage}</> : null}
                          </Typography>
                          <Stack direction="row" flexWrap="wrap" sx={{ mt: 1 }}>
                            {(it.timeOfDay || []).map((t) => <Pill key={t}>{t}</Pill>)}
                            {it.quantity != null && <Pill>Requested: {it.quantity}</Pill>}
                          </Stack>
                          {it.instructions && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              <i>Remarks:</i> {it.instructions}
                            </Typography>
                          )}
                        </Box>

                        {/* Actions Section - Show different content for read-only mode */}
                        <Box sx={{
                          minWidth: { xs: "100%", lg: 400 },
                          maxWidth: { lg: 400 },
                        }}>
                          {readOnly ? (
                            <Box sx={{
                              p: 2,
                              borderRadius: THEME.borderRadius.medium,
                              bgcolor: "#f8f9fa",
                              border: `2px solid rgba(12, 60, 60, 0.08)`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minHeight: 100,
                            }}>
                              <Typography variant="body1" sx={{ color: THEME.primary, fontWeight: 600 }}>
                                Prescription Details
                              </Typography>
                            </Box>
                          ) : (
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
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Slide>
              );
            })}
          </Stack>

          {rx.generalNotes && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2">
                <i>General notes:</i> {rx.generalNotes}
              </Typography>
            </>
          )}
        </DialogContent>

        {/* Enhanced sticky footer actions - Different for read-only mode */}
        <DialogActions sx={{
          position: "sticky",
          bottom: 0,
          bgcolor: "#fff",
          borderTop: "1px solid rgba(12, 60, 60, 0.08)",
          p: 2.5,
          background: THEME.gradients.card,
        }}>
          {readOnly ? (
            <Stack
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
              spacing={2}
              sx={{ width: "100%" }}
            >
              <Button
                onClick={onClose}
                variant="contained"
                size="large"
                sx={{
                  background: THEME.gradients.primary,
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(12, 60, 60, 0.3)",
                    transform: "translateY(-1px)",
                  },
                  ...modernButtonSx,
                  minWidth: 120,
                }}
              >
                Close
              </Button>
            </Stack>
          ) : (
            <Stack
              direction="row"
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
          )}
        </DialogActions>
      </Dialog>

      {/* CONFIRM DIALOG */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Confirm Dispense
          <IconButton onClick={() => setConfirmOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Please confirm the items and quantities to dispense:
          </Typography>
          <List dense sx={{ border: "1px solid #eee", borderRadius: 1 }}>
            {buildPayload().map((p, idx) => (
              <ListItem key={`${p.itemId || p.medicineName || idx}-${p.quantity}`} divider>
                <ListItemText
                  primary={`${p.medicineName || "Item"} — ${p.quantity} unit(s)`}
                  secondary={p.itemId ? `Item ID: ${p.itemId}` : null}
                />
              </ListItem>
            ))}
          </List>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            This action will record a manual dispense for the selected items.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined" sx={{ borderRadius: "10px" }}>
            Cancel
          </Button>
          <Button onClick={handleDispense} variant="contained" disabled={submitting} sx={{ borderRadius: "10px" }}>
            {submitting ? "Dispensing..." : "Confirm & Dispense"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* RESULT SUMMARY DIALOG */}
      <Dialog open={resultOpen} onClose={() => setResultOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Dispense Summary
          <IconButton onClick={() => setResultOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {resultPayload?.results?.length ? (
            <List dense>
              {resultPayload.results.map((r, i) => (
                <ListItem key={i} divider>
                  <ListItemText
                    primary={`${r.medicineName || r.itemId || "Item"}`}
                    secondary={`Dispensed: ${r.dispensedQty ?? 0} / Requested: ${r.requestedQty ?? 0}${r.note ? ` — ${r.note}` : ""}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2">Dispense request completed.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setResultOpen(false);
              onClose?.(resultPayload);
            }}
            variant="contained"
            sx={{ borderRadius: "10px" }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2600}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
