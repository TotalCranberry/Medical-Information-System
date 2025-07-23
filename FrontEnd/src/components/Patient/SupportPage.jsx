import React from "react";
import {
  Typography, Paper, Box, List, ListItem, ListItemText, TextField, Button, Divider
} from "@mui/material";

const SupportPage = () => (
  <Box display="flex" alignItems="center" justifyContent="center" minHeight="80vh" sx={{ bgcolor: "#f5f7fa" }}>
    <Paper elevation={3} sx={{ p: 4, borderRadius: 4, width: 500 }}>
      <Typography variant="h4" fontWeight={700} color="primary" mb={2}>
        Accessibility & Support
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        <ListItem>
          <ListItemText
            primary="Accessibility Features"
            secondary="Screen reader, high-contrast mode, and keyboard navigation support."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Help Center / FAQ"
            secondary="Find answers to common questions in our resource library."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Contact Support"
            secondary="Submit a query below for 1:1 assistance."
          />
        </ListItem>
      </List>
      <form>
        <TextField
          label="Your Message"
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          margin="normal"
        />
        <Button variant="contained" color="secondary" sx={{ mt: 2, float: "right" }}>
          Submit
        </Button>
      </form>
    </Paper>
  </Box>
);

export default SupportPage;
