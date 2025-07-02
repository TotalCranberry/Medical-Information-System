import React from "react";
import {
  Typography, Paper, Box, List, ListItem, ListItemText, TextField, Button, Divider
} from "@mui/material";

const SupportPage = () => (
  <Paper sx={{ maxWidth: 700, margin: "40px auto", p: 4 }}>
    <Typography variant="h5" mb={2}>Accessibility & Support</Typography>
    <Box mb={3}>
      <Typography variant="h6" mb={1}>Accessibility Features</Typography>
      <List>
        <ListItem>
          <ListItemText primary="Keyboard Navigation" secondary="Navigate all pages using Tab, Shift+Tab, and Enter." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Screen Reader Support" secondary="All forms and tables have accessible labels and roles." />
        </ListItem>
        <ListItem>
          <ListItemText primary="High Contrast Mode" secondary="Use your browser's high contrast settings for better visibility." />
        </ListItem>
      </List>
    </Box>
    <Divider />
    <Box mt={3} mb={3}>
      <Typography variant="h6" mb={1}>Help Center / FAQ</Typography>
      <List>
        <ListItem>
          <ListItemText primary="How do I reset my password?" secondary="Use the 'Forgot password?' link on the login page." />
        </ListItem>
        <ListItem>
          <ListItemText primary="How do I book an appointment?" secondary="Go to the Appointments tab and fill out the booking form." />
        </ListItem>
      </List>
    </Box>
    <Divider />
    <Box mt={3}>
      <Typography variant="h6" mb={1}>Contact Support</Typography>
      <form>
        <TextField
          label="Your Email"
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Describe your issue"
          fullWidth
          margin="normal"
          multiline
          minRows={3}
          required
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Submit</Button>
      </form>
    </Box>
  </Paper>
);

export default SupportPage;
