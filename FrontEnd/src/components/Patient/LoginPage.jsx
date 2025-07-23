import React, { useState } from "react";
import {
  Box, Button, TextField, Typography, Paper, Divider
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    // Insert real login logic here
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="90vh" sx={{ bgcolor: "#f5f7fa" }}>
      <Paper elevation={3} sx={{ p: 5, borderRadius: 4, width: 380, boxShadow: "0 4px 24px rgba(44,44,44,0.08)" }}>
        <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
          Login
        </Typography>
        <Typography sx={{ color: "#6c6b6b", mb: 2, fontFamily: "Poppins" }}>
          Log in to University Medical Center
        </Typography>
        <form onSubmit={handleLogin} autoComplete="off">
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            variant="outlined"
            InputProps={{ sx: { fontFamily: "Poppins" } }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            variant="outlined"
            InputProps={{ sx: { fontFamily: "Poppins" } }}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ my: 1 }}>
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained" color="secondary" fullWidth sx={{ mt: 3, mb: 1, fontWeight: 600, fontFamily: "Poppins" }}>
            Sign In
          </Button>
        </form>
        <Divider sx={{ my: 2 }}>OR</Divider>
        <Button variant="outlined" fullWidth sx={{ fontWeight: 500, borderColor: "#45d27a", color: "#0c3c3c" }} startIcon={<GoogleIcon />}>
          Sign in with Google
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage;
