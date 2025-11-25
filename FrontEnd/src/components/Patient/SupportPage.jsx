import React, { useState, useEffect } from "react";
import {
  Typography, Paper, Box, List, ListItem, ListItemText, TextField, Button, Divider, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, ListItemButton
} from "@mui/material";
import { submitSupportRequest, getMyTickets } from "../../api/support";
import { Link as RouterLink, useNavigate } from "react-router-dom"; 

const SupportPage = () => {
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState({ text: "", type: "" });
  const [isAccessibilityModalOpen, setAccessibilityModalOpen] = useState(false);
  const [myTickets, setMyTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const tickets = await getMyTickets();
        setMyTickets(tickets);
      } catch (error) {
        setFeedback({ text: "Failed to load your support tickets.", type: "error" });
      }
    };
    fetchTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ text: "", type: "" });
    try {
      const response = await submitSupportRequest(message);
      setFeedback({ text: response.message, type: "success" });
      setMessage("");
      const tickets = await getMyTickets();
      setMyTickets(tickets);
    } catch (error) {
      setFeedback({ text: error.message, type: "error" });
    }
  };

  return (
    <>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="80vh" gap={4}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4, width: '100%', maxWidth: 800 }}>
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
            <ListItemButton component={RouterLink} to="/patient/faq">
              <ListItemText
                primary="Help Center / FAQ"
                secondary="Find answers to common questions in our resource library."
              />
            </ListItemButton>
          </List>
          <Typography variant="h5" fontWeight={700} color="primary" mt={4} mb={2}>
            Submit a Support Ticket
          </Typography>
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
              helperText="Describe your issue in detail. Must be between 10 and 500 characters."
            />
            <Button type="submit" variant="contained" color="secondary" sx={{ mt: 2, float: "right" }}>
              Submit Request
            </Button>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 4, width: '100%', maxWidth: 800 }}>
          <Typography variant="h5" fontWeight={700} color="primary" mb={2}>
            My Submitted Tickets
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {myTickets.map(ticket => (
              <ListItem key={ticket.id} alignItems="flex-start" sx={{ flexDirection: 'column' }}>
                <ListItemText
                  primary={<Typography fontWeight="bold">Your Message:</Typography>}
                  secondary={ticket.message}
                />
                {ticket.reply && (
                  <Box sx={{ pl: 2, mt: 1, borderLeft: '2px solid #ccc' }}>
                    <ListItemText
                      primary={<Typography fontWeight="bold">Admin Reply:</Typography>}
                      secondary={ticket.reply}
                    />
                  </Box>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Status: {ticket.status} | Submitted: {new Date(ticket.createdAt).toLocaleString()}
                </Typography>
                <Divider sx={{ my: 2, width: '100%' }} />
              </ListItem>
            ))}
            {myTickets.length === 0 && (
              <Typography sx={{ textAlign: 'center', p: 2 }}>You have not submitted any support tickets.</Typography>
            )}
          </List>
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
