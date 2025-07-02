import React, { useState } from "react";
import {
  Avatar, Button, TextField, Typography, Paper, Box, Grid, Switch, FormControlLabel, Divider
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
    <Paper sx={{ maxWidth: 500, margin: "40px auto", p: 4 }}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Avatar src={user.avatar} sx={{ width: 80, height: 80, mb: 2 }} />
        <Typography variant="h5" mb={2}>Profile & Preferences</Typography>
        <form onSubmit={handleSave}>
          <TextField
            label="Full Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={user.email}
            disabled
          />
          <TextField
            label="Phone"
            fullWidth
            margin="normal"
            value={phone}
            onChange={e => setPhone(e.target.value)}
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
          />
          <Divider sx={{ my: 2 }} />
          <Button type="submit" variant="contained" fullWidth>
            Save Changes
          </Button>
        </form>
      </Box>
    </Paper>
  );
};

export default ProfilePage;
