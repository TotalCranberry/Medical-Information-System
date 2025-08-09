import React, { useState } from "react";
import {
  Typography, Paper, Box, List, ListItem, ListItemText, TextField, Button, Divider, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, ListItemButton
} from "@mui/material";
import { submitSupportRequest } from "../../api/support";
import { useNavigate } from "react-router-dom";

const SupportPage = () => {
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState({ text: "", type: "" });
  const [isAccessibilityModalOpen, setAccessibilityModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ text: "", type: "" });
    try {
      const response = await submitSupportRequest(message);
      setFeedback({ text: response.message, type: "success" });
      setMessage("");
    } catch (error) {
      setFeedback({ text: error.message, type: "error" });
    }
  };

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="80vh">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4, width: '100%', maxWidth: 600 }}>
          <Typography variant="h4" fontWeight={700} color="primary" mb={2}>
            Accessibility & Support
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            <ListItemButton onClick={() => setAccessibilityModalOpen(true)}>
              <ListItemText
                primary="Accessibility Features"
                secondary="Information on screen reader, high-contrast mode, and keyboard navigation support."
              />
            </ListItemButton>
            <ListItemButton onClick={() => navigate('../faq')}>
              <ListItemText
                primary="Help Center / FAQ"
                secondary="Find answers to common questions in our resource library."
              />
            </ListItemButton>
            <ListItem>
              <ListItemText
                primary="Contact Support"
                secondary="For other issues, submit a query below for 1:1 assistance."
              />
            </ListItem>
          </List>
          <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit}>
            <TextField
              label="Your Message"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              margin="normal"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              helperText="Message must be between 10 and 500 characters."
            />
            <Button type="submit" variant="contained" color="secondary" sx={{ mt: 2, float: "right" }}>
              Submit Request
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Accessibility Modal */}
      <Dialog open={isAccessibilityModalOpen} onClose={() => setAccessibilityModalOpen(false)}>
        <DialogTitle fontWeight={700}>Accessibility Statement</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            We are committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
          </Typography>
          <Typography variant="h6" mt={2}>Conformance Status</Typography>
          <Typography gutterBottom>
            This application is designed to be compliant with WCAG 2.1 level AA. Features include:
          </Typography>
          <ul>
            <li><Typography><b>Keyboard Navigation:</b> All interactive elements can be accessed and operated using a keyboard.</Typography></li>
            <li><Typography><b>Screen Reader Support:</b> We use semantic HTML and ARIA labels to ensure compatibility with modern screen readers.</Typography></li>
            <li><Typography><b>High Contrast:</b> The color scheme has been chosen to meet contrast ratio guidelines, making text easier to read.</Typography></li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccessibilityModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!feedback.text} autoHideDuration={6000} onClose={() => setFeedback({ text: "", type: "" })}>
        <Alert onClose={() => setFeedback({ text: "", type: "" })} severity={feedback.type || "info"} sx={{ width: '100%' }}>
          {feedback.text}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SupportPage;
