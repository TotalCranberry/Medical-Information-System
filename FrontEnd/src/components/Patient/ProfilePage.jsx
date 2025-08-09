import React, { useState, useEffect } from "react";
import {
  Button, TextField, Typography, Paper, Box, Switch, FormControlLabel, Divider
} from "@mui/material";

const ProfilePage = ({ user }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: Add backend API call to save profile changes
    console.log("Saving profile:", { name, phone, notifications });
  };

  if (!user) {
    return <Typography>Loading profile...</Typography>;
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="80vh">
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4, width: '100%', maxWidth: 420 }}>
        <Typography variant="h4" fontWeight={700} color="primary" mb={2}>
          Profile & Preferences
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box component="form" onSubmit={handleSave}>
          <TextField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Email"
            value={user.email || ''}
            fullWidth
            margin="normal"
            variant="outlined"
            disabled
          />
          <TextField
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <FormControlLabel
            control={
              <Switch
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                color="secondary"
              />
            }
            label="Receive Email Notifications"
            sx={{ mt: 2, display: 'block' }}
          />
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            sx={{ borderRadius: 2, fontWeight: 600, mt: 3 }}
            fullWidth
          >
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
