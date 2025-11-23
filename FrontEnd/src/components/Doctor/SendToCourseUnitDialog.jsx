import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  Send as SendIcon,
  Email as EmailIcon,
  PictureAsPdf as PdfIcon,
  Visibility as PreviewIcon,
} from "@mui/icons-material";
import { sendMedicalToCourseUnit, previewMedicalPdf } from "../../api/appointments";

const SendToCourseUnitDialog = ({ open, onClose, medicalId, onMedicalUpdate }) => {
  const [courseUnitEmail, setCourseUnitEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfPreview, setPdfPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSend = async () => {
    if (!courseUnitEmail.trim()) {
      setError("Please enter the course unit email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(courseUnitEmail.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await sendMedicalToCourseUnit(medicalId, courseUnitEmail.trim());

      // Reset form and close dialog
      setCourseUnitEmail("");
      onClose();

      // Notify parent component
      onMedicalUpdate?.();

    } catch (err) {
      setError(err.message || "Failed to send medical certificate to course unit");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPreview = async () => {
    try {
      setPreviewLoading(true);
      setError("");

      const pdfBlob = await previewMedicalPdf(medicalId);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfPreview(pdfUrl);
      setShowPreview(true);
    } catch (err) {
      setError("Failed to load PDF preview: " + (err.message || "Unknown error"));
    } finally {
      setPreviewLoading(false);
    }
  };

  // Cleanup PDF URL when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (pdfPreview) {
        URL.revokeObjectURL(pdfPreview);
      }
    };
  }, [pdfPreview]);

  const handleClose = () => {
    if (!loading) {
      setCourseUnitEmail("");
      setError("");
      if (pdfPreview) {
        URL.revokeObjectURL(pdfPreview);
      }
      setPdfPreview(null);
      setShowPreview(false);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          maxHeight: "90vh",
        }
      }}
    >
      <DialogTitle sx={{
        pb: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <EmailIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Send to Course Unit
          </Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Preview the medical certificate PDF and enter the course unit's email address to send it.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* PDF Preview Section */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              PDF Preview
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={previewLoading ? <CircularProgress size={16} /> : <PreviewIcon />}
              onClick={handleLoadPreview}
              disabled={previewLoading || loading}
              sx={{ minWidth: 120 }}
            >
              {previewLoading ? "Loading..." : showPreview ? "Reload Preview" : "Load Preview"}
            </Button>
          </Box>

          {showPreview && pdfPreview && (
            <Paper
              elevation={1}
              sx={{
                p: 1,
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                backgroundColor: '#f9f9f9',
                mb: 2
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '400px',
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <iframe
                  src={pdfPreview}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  title="Medical Certificate Preview"
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                Medical Certificate Preview - This is how the PDF will appear when sent
              </Typography>
            </Paper>
          )}

          {!showPreview && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Click "Load Preview" to see how the medical certificate PDF will look before sending it.
              </Typography>
            </Alert>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Email Input Section */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Send Certificate
        </Typography>

        <TextField
          fullWidth
          label="Course Unit Email"
          type="email"
          value={courseUnitEmail}
          onChange={(e) => setCourseUnitEmail(e.target.value)}
          placeholder="course.unit@university.edu.lk"
          disabled={loading}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: <EmailIcon sx={{ mr: 1, color: "action" }} />,
          }}
        />

        <Alert severity="info">
          <Typography variant="body2">
            <strong>Note:</strong> The email will be sent from your doctor account with the medical certificate attached as a PDF.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSend}
          disabled={loading || !courseUnitEmail.trim()}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
          sx={{
            minWidth: 120,
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#1565c0" }
          }}
        >
          {loading ? "Sending..." : "Send Certificate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendToCourseUnitDialog;