import React, { useState } from "react";
import {
  Avatar, Button, TextField, FormControlLabel, Checkbox, Link as MuiLink, Grid, Box, Typography, Container, Paper, MenuItem, IconButton, InputAdornment
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../api/auth";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!agreeTerms) {
      setError("You must agree to the terms and conditions.");
      return;
    }
    const payload = {
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      authMethod: "Manual",
    };
    try {
      await registerUser(payload);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" >
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4, mt: 4, mb: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>
              Sign Up
            </Typography>
          </Box>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
              autoFocus
              variant="outlined"
              required
            />
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              required
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth margin="normal" required variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              required
            >
              <MenuItem value="Doctor">Doctor</MenuItem>
              <MenuItem value="Staff">Staff</MenuItem>
              <MenuItem value="Pharmacist">Pharmacist</MenuItem>
              <MenuItem value="LabTechnician">Lab Technician</MenuItem>
            </TextField>
            <FormControlLabel
              control={<Checkbox checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} color="secondary" />}
              label="I agree to the terms and conditions"
              sx={{ mt: 1 }}
            />
            {error && <Typography color="error" variant="body2" sx={{ mt: 2 }}>{error}</Typography>}
            {success && <Typography color="success.main" variant="body2" sx={{ mt: 2 }}>{success}</Typography>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              sx={{ mt: 3, mb: 2, fontWeight: 600 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <MuiLink component={Link} to="/login" variant="body2" sx={{ color: "secondary.main" }}>
                  Already have an account? Login
                </MuiLink>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignupPage;
