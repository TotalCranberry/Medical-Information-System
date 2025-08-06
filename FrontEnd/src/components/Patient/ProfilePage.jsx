import React, { useState, useEffect } from "react";
import {
  Button, TextField, Typography, Paper, Box, Switch, FormControlLabel, Divider, IconButton, InputAdornment, Snackbar, Alert
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { changePassword } from "../../api/auth"; 
import { updateProfile } from "../../api/auth";

const ProfilePage = ({ user, onProfileUpdate }) => {
  const [name, setName] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (user) {
      setName(user.name || "");
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    try {
      const updatedUser = await updateProfile({ name }); // Pass only the fields to be updated
      setMessage({ text: response.message || "Profile updated successfully!", type: "success" });
      if (onProfileUpdate) {
        onProfileUpdate(updatedUser); // Notify parent component of the change
      }
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    try {
      const response = await changePassword({ currentPassword, newPassword });
      setMessage({ text: response.message, type: "success" });
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    }
  };

  if (!user) {
    return <Typography>Loading profile...</Typography>;
  }

  return (
    // FIX: Changed to a column layout to stack the forms vertically
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={4}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4, width: '100%', maxWidth: 420 }}>
        <Typography variant="h4" fontWeight={700} color="primary" mb={2}>
          Profile & Preferences
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box component="form" onSubmit={handleProfileSave}>
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
      
      {user?.authMethod === "Manual" && (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4, width: '100%', maxWidth: 420 }}>
          <Typography variant="h5" fontWeight={700} color="primary" mb={2}>Change Password</Typography>
          <Divider sx={{ mb: 3 }} />
          <Box component="form" onSubmit={handlePasswordChange}>
            <TextField
              label="Current Password"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth margin="normal" required variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth margin="normal" required variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" color="secondary" sx={{ borderRadius: 2, fontWeight: 600, mt: 3 }} fullWidth>
              Update Password
            </Button>
          </Box>
        </Paper>
      )}

      <Snackbar open={!!message.text} autoHideDuration={6000} onClose={() => setMessage({ text: "", type: "" })}>
        <Alert onClose={() => setMessage({ text: "", type: "" })} severity={message.type || "info"} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
