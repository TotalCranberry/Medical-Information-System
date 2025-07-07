import React, { useState } from "react";
import {
  Avatar, Button, TextField, FormControlLabel, Checkbox,
  Link, Grid, Box, Typography, Container, Paper, MenuItem
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    // Implement signup logic here
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">Sign Up</Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="University Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <TextField
              select
              label="Role"
              value={role}
              onChange={e => setRole(e.target.value)}
              fullWidth
              margin="normal"
            >
              <MenuItem value="student">Student/Staff</MenuItem>
              <MenuItem value="provider">Healthcare Provider</MenuItem>
            </TextField>
            <FormControlLabel
              control={<Checkbox value="terms" color="primary" />}
              label="I agree to the terms and conditions"
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, mb: 1 }}>
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">Already have an account? Login</Link>
              </Grid>
            </Grid>
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignupPage;
