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

const Pill = ({ children }) => <Chip label={children} size="small" sx={pillSx} />;

export default function ViewPrescriptionDialog({ open, onClose, rx }) {
  const [selections, setSelections] = useState({});
  const [invQuery, setInvQuery] = useState("");
  const [invResults, setInvResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

        <DialogContent dividers sx={{ pt: 1.5, pb: 0 }}>
          {/* Inventory Search */}
          <Box sx={{ ...lightCardSx, mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <InventoryIcon fontSize="small" sx={{ color: THEME.primary }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: THEME.primary }}>
                Inventory search
              </Typography>
              <Tooltip title="Search your stock for a medicine and view current quantities.">
                <InfoIcon fontSize="small" sx={{ color: THEME.gray }} />
              </Tooltip>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
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
              <Button
                variant="outlined"
                onClick={runInventorySearch}
                disabled={loadingSearch}
                startIcon={loadingSearch ? <RefreshIcon /> : <SearchIcon />}
                sx={{
                  borderColor: THEME.primary, color: THEME.primary, borderRadius: "12px", px: 2.5,
                  "&:hover": { background: THEME.primary, color: "#fff" }
                }}
              >
                {loadingSearch ? "Searching…" : "Search"}
              </Button>
            </Stack>

            {loadingSearch && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}

            {invResults?.length > 0 && (
              <List dense sx={{ mt: 1, maxHeight: 180, overflowY: "auto", border: "1px solid #eee", borderRadius: 1 }}>
                {invResults.map((m, i) => {
                  const stock = m.stock ?? m.quantity ?? 0;
                  const ok = Number(stock) > 0;
                  return (
                    <ListItem key={m.id ?? m.name ?? i} divider secondaryAction={
                      <Chip
                        size="small"
                        icon={<CheckCircleIcon sx={{ color: ok ? THEME.good : THEME.bad }} />}
                        label={`Stock: ${stock}`}
                        sx={{
                          bgcolor: ok ? `${THEME.accent}20` : "#ffebee",
                          color: ok ? THEME.primary : THEME.bad,
                          fontWeight: 700
                        }}
                      />
                    }>
                      <ListItemText
                        primary={`${m.name || "-"} ${m.strength ? `(${m.strength})` : ""}`}
                        secondary={m.manufacturer ? `Manufacturer: ${m.manufacturer}` : null}
                        primaryTypographyProps={{ sx: { fontWeight: 700, color: THEME.primary } }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>

          {/* Bulk actions */}
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DoneAllIcon />}
              onClick={bulkSelectAll}
              sx={{ borderColor: THEME.accent, color: THEME.accent, borderRadius: "10px",
                "&:hover": { bgcolor: `${THEME.accent}15` } }}
            >
              Select all
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ClearAllIcon />}
              onClick={bulkClear}
              sx={{ borderColor: THEME.primary, color: THEME.primary, borderRadius: "10px",
                "&:hover": { bgcolor: "rgba(12,60,60,0.06)" } }}
            >
              Clear
            </Button>
            <Box sx={{ flex: 1 }} />
            <Chip
              size="small"
              icon={<PharmacyIcon />}
              label={`${selectedCount} selected • ${totalUnits} unit${totalUnits === 1 ? "" : "s"}`}
              sx={{ bgcolor: `${THEME.accent}15`, color: THEME.primary, fontWeight: 700 }}
            />
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {/* Items list */}
          <Stack spacing={1.5} sx={{ pb: 1 }}>
            {items.map((it) => {
              const sel = selections[it.key] || {};
              const stock = sel.stock ?? null;
              const stockOk = stock == null ? null : Number(stock) > 0;

              return (
                <Box key={it.key} sx={{ ...cardSx }}>
                  <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={1.25}>
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

                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: { xs: "100%", sm: 340 } }}>
                      <FormControlLabel
                        sx={{ mr: 1.5 }}
                        control={
                          <Checkbox checked={!!sel.checked} onChange={() => toggleSelect(it.key)} />
                        }
                        label="Dispense"
                      />

                      {/* Qty stepper */}
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: "auto" }}>
                        <IconButton size="small" onClick={() => stepQty(it.key, -1)} disabled={!sel.checked}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField
                          label="Units"
                          size="small"
                          value={sel.qty ?? ""}
                          onChange={(e) => setQty(it.key, e.target.value)}
                          inputProps={{ inputMode: "numeric", pattern: "[0-9]*", min: 0 }}
                          sx={{ width: 110, ...inputSx }}
                          disabled={!sel.checked}
                        />
                        <IconButton size="small" onClick={() => stepQty(it.key, +1)} disabled={!sel.checked}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 1 }}>
                        <Tooltip title="Fill with requested quantity (if available in prescription)">
                          <span>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => setSuggestedQty(it.key, it.quantity ?? 0)}
                              disabled={!sel.checked}
                              sx={{ borderRadius: "10px", borderColor: THEME.accent, color: THEME.accent,
                                "&:hover": { bgcolor: `${THEME.accent}12` } }}
                            >
                              Suggested
                            </Button>
                          </span>
                        </Tooltip>

                        <Tooltip title="Check stock for this medicine">
                          <span>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => checkAvailabilityForItem(it.key, it.medicineName)}
                              sx={{ borderRadius: "10px", borderColor: THEME.primary, color: THEME.primary,
                                "&:hover": { bgcolor: "rgba(12,60,60,0.06)" } }}
                            >
                              Availability
                            </Button>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Stack>

                  {sel.availability && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 1,
                        color: stockOk === null ? "text.secondary" : stockOk ? THEME.good : THEME.bad,
                        fontWeight: stockOk === null ? 400 : 700,
                      }}
                    >
                      {sel.availability}
                    </Typography>
                  )}
                </Box>
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

        {/* Sticky footer actions */}
        <DialogActions sx={{ position: "sticky", bottom: 0, bgcolor: "#fff", borderTop: "1px solid rgba(12,60,60,0.10)" }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mr: "auto", pl: 1 }}>
            <Chip
              size="small"
              icon={<PharmacyIcon />}
              label={`${selectedCount} item${selectedCount === 1 ? "" : "s"} • ${totalUnits} unit${totalUnits === 1 ? "" : "s"}`}
              sx={{ bgcolor: `${THEME.accent}15`, color: THEME.primary, fontWeight: 700 }}
            />
          </Stack>

          <Button onClick={onClose} variant="outlined" sx={{ borderColor: THEME.primary, color: THEME.primary, borderRadius: "10px",
            "&:hover": { bgcolor: "rgba(12,60,60,0.06)" } }}>
            Close
          </Button>

          <Button
            onClick={openConfirm}
            variant="contained"
            disabled={submitting}
            sx={{ bgcolor: THEME.primary, borderRadius: "10px", "&:hover": { bgcolor: "#0a2e2e" } }}
          >
            {submitting ? "Dispensing..." : "Dispense Selected"}
          </Button>
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
