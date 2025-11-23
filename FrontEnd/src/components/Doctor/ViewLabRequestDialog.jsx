import React, { useEffect, useState } from "react";
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
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress,
  Fade,
  Card,
  CardContent,
  Zoom,
  Backdrop,
  CircularProgress,
  Grid,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  Science as ScienceIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as FacultyIcon,
  CalendarToday as DateIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";

import { getLabRequestById } from "../../api/labApi";

export default function ViewLabRequestDialog({ open, onClose, labRequestId }) {
  const [labRequest, setLabRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---------- Load lab request data ----------
  useEffect(() => {
    if (open && labRequestId) {
      loadLabRequest();
    } else if (!open) {
      setLabRequest(null);
      setError(null);
    }
  }, [open, labRequestId]);

  const loadLabRequest = async () => {
    try {
      setLoading(true);
      const data = await getLabRequestById(labRequestId);
      setLabRequest(data);
    } catch (err) {
      setError(err.message);
      console.error("Error loading lab request:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'warning';
      case 'PENDING':
        return 'default';
      case 'DECLINED':
        return 'error';
      default:
        return 'default';
    }
  };

  if (!labRequest && !loading) return null;

  const headerDate = labRequest ? new Date(labRequest.orderDate || Date.now()).toLocaleString() : "";

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
        TransitionProps={{ timeout: 300 }}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            overflow: "hidden",
            maxHeight: "90vh",
            zIndex: 1300,
          }
        }}
        sx={{ zIndex: 1300 }}
      >
        {/* Top gradient accent */}
        <Box
          sx={{
            height: 8,
            width: "100%",
            background: "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "1px",
              background: "rgba(33, 203, 243, 0.3)",
            }
          }}
        />

        <DialogTitle sx={{ pb: 2, background: "linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #0C3C3C 0%, #154545 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: "1.2rem",
                boxShadow: "0 2px 12px rgba(12, 60, 60, 0.08)",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  borderRadius: "12px",
                  padding: "2px",
                  background: "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "subtract",
                },
              }}>
                <ScienceIcon sx={{ fontSize: "1.5rem" }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#0C3C3C", mb: 0.5 }}>
                  Lab Request — {labRequest?.patientName || "Loading..."}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip
                    size="small"
                    icon={<ScienceIcon />}
                    label={`Test: ${labRequest?.testType || "N/A"}`}
                    sx={{
                      bgcolor: "rgba(33, 150, 243, 0.1)",
                      color: "#0C3C3C",
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    size="small"
                    icon={<DateIcon />}
                    label={headerDate}
                    sx={{
                      bgcolor: "rgba(69, 210, 122, 0.1)",
                      color: "#0C3C3C",
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
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <Fade in>
                <Stack alignItems="center" spacing={2}>
                  <CircularProgress size={48} sx={{ color: "#2196F3" }} />
                  <Typography variant="h6" sx={{ color: "#0C3C3C" }}>
                    Loading Lab Request...
                  </Typography>
                </Stack>
              </Fade>
            </Box>
          ) : labRequest ? (
            <Box>
              {/* University Header */}
              <Fade in timeout={300}>
                <Card sx={{
                  p: 2.5,
                  borderRadius: "16px",
                  background: "linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)",
                  border: "1px solid rgba(12, 60, 60, 0.08)",
                  boxShadow: "0 2px 12px rgba(12, 60, 60, 0.08)",
                  mb: 3,
                  textAlign: "center"
                }}>
                  <CardContent sx={{ py: 3 }}>
                    <Typography variant="h4" sx={{ color: "#0C3C3C", fontWeight: 800, mb: 1 }}>
                      UNIVERSITY OF PERADENIYA
                    </Typography>
                    <Typography variant="h6" sx={{ color: "#2196F3", fontWeight: 600, mb: 1 }}>
                      LABORATORY TEST REQUEST
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Medical Information System
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>

              <Divider sx={{ mb: 3, borderColor: "rgba(12, 60, 60, 0.08)" }} />

              {/* Patient Information */}
              <Fade in timeout={400}>
                <Card sx={{
                  p: 2.5,
                  borderRadius: "16px",
                  background: "linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)",
                  border: "1px solid rgba(12, 60, 60, 0.08)",
                  boxShadow: "0 2px 12px rgba(12, 60, 60, 0.08)",
                  mb: 3,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    boxShadow: "0 8px 32px rgba(12, 60, 60, 0.12)",
                    transform: "translateY(-2px)",
                  }
                }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                      <Box sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "8px",
                        background: "linear-gradient(135deg, #45D27A 0%, #5CE084 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <PersonIcon fontSize="small" sx={{ color: "#fff" }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#0C3C3C" }}>
                        Patient Information
                      </Typography>
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Name:</strong> {labRequest.patientName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Patient ID:</strong> {labRequest.patient?.id || "N/A"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Fade>

              {/* Test Information */}
              <Fade in timeout={500}>
                <Card sx={{
                  p: 2.5,
                  borderRadius: "16px",
                  background: "linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)",
                  border: "1px solid rgba(12, 60, 60, 0.08)",
                  boxShadow: "0 2px 12px rgba(12, 60, 60, 0.08)",
                  mb: 3,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    boxShadow: "0 8px 32px rgba(12, 60, 60, 0.12)",
                    transform: "translateY(-2px)",
                  }
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#0C3C3C", mb: 2 }}>
                      Test Information
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Test Type:</strong> {labRequest.testType}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Order Date:</strong> {formatDate(labRequest.orderDate)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Request ID:</strong> {labRequest.id}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Fade>

              {/* Status Information */}
              <Fade in timeout={600}>
                <Card sx={{
                  p: 2.5,
                  borderRadius: "16px",
                  background: "linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)",
                  border: "1px solid rgba(12, 60, 60, 0.06)",
                  boxShadow: "0 1px 8px rgba(12, 60, 60, 0.04)",
                  borderLeft: "4px solid #2196F3"
                }}>
                  <CardContent>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <InfoIcon sx={{ color: "#2196F3" }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0C3C3C", mb: 1 }}>
                          Request Status
                        </Typography>
                        <Chip
                          size="small"
                          label={labRequest.status}
                          color={getStatusColor(labRequest.status)}
                          variant="filled"
                          sx={{ mr: 2 }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            </Box>
          ) : null}
        </DialogContent>

        {/* Sticky footer actions */}
        <DialogActions sx={{
          position: "sticky",
          bottom: 0,
          bgcolor: "#fff",
          borderTop: "1px solid rgba(12, 60, 60, 0.08)",
          p: 2.5,
          background: "linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)",
        }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems="center"
            spacing={2}
            sx={{ width: "100%" }}
          >
            <Box sx={{ flex: 1 }}>
              {labRequest && (
                <Chip
                  size="medium"
                  icon={<ScienceIcon />}
                  label={`Request ID: ${labRequest.id}`}
                  sx={{
                    bgcolor: "rgba(12, 60, 60, 0.15)",
                    color: "#0C3C3C",
                    fontWeight: 700,
                    height: 36,
                    borderRadius: "12px",
                    border: "1px solid rgba(12, 60, 60, 0.3)",
                  }}
                />
              )}
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                onClick={onClose}
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "#0C3C3C",
                  color: "#0C3C3C",
                  "&:hover": {
                    bgcolor: "rgba(12, 60, 60, 0.08)",
                    borderColor: "#0C3C3C",
                    transform: "translateY(-1px)",
                  },
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  py: 1.2,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  minWidth: 100,
                }}
              >
                Close
              </Button>
            </Stack>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={Fade}
        TransitionProps={{ direction: "up" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: "12px",
            fontWeight: 600,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}