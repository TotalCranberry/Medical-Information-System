import React, { useState } from "react";
import {
  Avatar, Button, TextField, FormControlLabel, Checkbox,
  Link, Grid, Box, Typography, Container, Paper, MenuItem, Divider
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
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="90vh" sx={{ bgcolor: "#f5f7fa" }}>
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar sx={{ m: 1, bgcolor: "#45d27a" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>Sign Up</Typography>
          </Box>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              margin="normal"
              autoFocus
              variant="outlined"
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              required
            />
            <TextField
              select
              label="Role"
              value={role}
              onChange={e => setRole(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
            >
              <MenuItem value="student">Student/Staff</MenuItem>
              <MenuItem value="provider">Healthcare Provider</MenuItem>
            </TextField>
            <FormControlLabel
              control={<Checkbox value="agree" color="secondary" />}
              label="I agree to the terms and conditions"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              sx={{ mt: 3, mb: 2, fontWeight: 600 }}
            >
              Sign Up
            </Button>
            <Grid container>
              <Grid item>
                <Link href="/login" variant="body2" sx={{ color: "#45d27a" }}>
                  Already have an account? Login
                </Link>
              </Grid>
            </Grid>
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignupPage;
