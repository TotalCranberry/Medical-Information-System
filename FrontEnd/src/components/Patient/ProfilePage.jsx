import React, { useState } from "react";
import {
  Avatar, Button, TextField, Typography, Paper, Box, Switch, FormControlLabel, Divider
} from "@mui/material";

const ProfilePage = ({ user }) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [notifications, setNotifications] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    // Add backend API call to save profile changes
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="90vh" sx={{ bgcolor: "#f5f7fa" }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4, width: 420 }}>
        <Typography variant="h4" fontWeight={700} color="primary" mb={2}>Profile & Preferences</Typography>
        <Divider sx={{ mb: 3 }} />
        <form onSubmit={handleSave}>
          <TextField
            label="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Phone Number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            fullWidth
            margin="normal"
          />
          <FormControlLabel
            control={
              <Switch
                checked={notifications}
                onChange={e => setNotifications(e.target.checked)}
                color="primary"
              />
            }
            label="Receive Email Notifications"
            sx={{ mt: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            sx={{ borderRadius: 2, fontWeight: 600, mt: 2 }}
            fullWidth
          >
            Save Changes
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
