import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper, Divider, Link as MuiLink, Grid } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { loginUser } from "../../api/auth";
import { useNavigate, Link } from "react-router-dom";

const LoginPage = ({ onAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await loginUser({ email, password });
      localStorage.setItem("jwtToken", data.token);
      localStorage.setItem("userRole", data.role);
      if (onAuth) onAuth();

      switch (data.role) {
        case "Student":
          navigate("/patient/dashboard");
          break;
        case "Doctor":
          navigate("/doctor/dashboard");
          break;
        default:
          navigate("/dashboard");
          break;
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{ bgcolor: "background.default" }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          width: { xs: '90%', sm: 380 },
          boxShadow: "0 4px 24px rgba(44,44,44,0.08)",
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
          Login
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 2 }}>
          Log in to University Medical Center
        </Typography>
        <Box component="form" onSubmit={handleLogin} autoComplete="off" sx={{ mt: 1 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            variant="outlined"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            variant="outlined"
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ my: 1 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ mt: 3, mb: 1, fontWeight: 600 }}
          >
            Sign In
          </Button>
           <Grid container justifyContent="flex-end" sx={{ mt: 1 }}>
              <Grid item>
                <MuiLink component={Link} to="/signup" variant="body2" sx={{ color: 'secondary.main' }}>
                  Don't have an account? Sign Up
                </MuiLink>
              </Grid>
            </Grid>
        </Box>
        <Divider sx={{ my: 2 }}>OR</Divider>
        <Button
          variant="outlined"
          fullWidth
          sx={{ fontWeight: 500, borderColor: "#45d27a", color: "primary.main" }}
          startIcon={<GoogleIcon />}
          disabled
        >
          Sign in with Google
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage;
