import React, { useState, useEffect } from "react";
import {
  Button, TextField, Typography, Paper, Box, Switch, FormControlLabel,
  Divider, IconButton, InputAdornment, Snackbar, Alert,
  Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { changePassword } from "../../api/auth"; 
import { updateProfile } from "../../api/auth";

const ProfilePage = ({ user, onProfileUpdate }) => {
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [gender, setGender] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      if (user.dateOfBirth) {
        setDateOfBirth(new Date(user.dateOfBirth));
      }
      setGender(user.gender || "");
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    try {
      const updateData = { name, gender };
      
      if ((user?.role === "Student" || user?.role === "Staff") && dateOfBirth && !user?.dateOfBirth) {
        updateData.dateOfBirth = dateOfBirth.toISOString().split('T')[0];
      }
      
      const { user: updatedUser, message } = await updateProfile(updateData);
      setMessage({ text: message || "Profile updated successfully!", type: "success" });

      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
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
          
          {(user?.role === "Student" || user?.role === "Staff") && (
            <TextField
              label="Date of Birth"
              type="date"
              value={dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                if (!user?.dateOfBirth) {
                  setDateOfBirth(e.target.value ? new Date(e.target.value) : null);
                }
              }}
              fullWidth
              margin="normal"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              disabled={!!user?.dateOfBirth}
              helperText={user?.dateOfBirth ? "Date of birth cannot be changed once set." : ""}
            />
          )}

          {/* FIX: Gender field is no longer disabled and can be changed */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Gender</InputLabel>
            <Select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              label="Gender"
              // The "disabled" prop has been removed to allow changes
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </Select>
            {/* The helper text has also been removed */}
          </FormControl>
          
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
            {/* ... password fields remain the same */}
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