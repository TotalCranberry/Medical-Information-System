import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper, Divider, Link as MuiLink, Grid } from "@mui/material";
import { GoogleLogin } from '@react-oauth/google';
import { loginUser, loginWithGoogle } from "../../api/auth";
import { useNavigate, Link } from "react-router-dom";

const LoginPage = ({ onAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLoginSuccess = (data) => {
    localStorage.setItem("jwtToken", data.token);
    localStorage.setItem("userRole", data.role);
    if (onAuth) onAuth();

    switch (data.role) {
      case "Student":
        navigate("/student/dashboard");
        break;
      case "Doctor":
        navigate("/doctor/dashboard");
        break;
      default:
        // Fallback for other roles
        navigate(`/${data.role.toLowerCase()}/dashboard`);
        break;
    }
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await loginUser({ email, password });
      handleLoginSuccess(data);
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setError(null);
    try {
      // The credentialResponse object from Google contains the ID token
      const idToken = credentialResponse.credential;
      // We send this token to our backend
      const data = await loginWithGoogle(idToken);
      handleLoginSuccess(data);
    } catch (err) {
      setError(err.message || "Google login failed. Please try again.");
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
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
        <Box component="form" onSubmit={handleManualLogin} autoComplete="off" sx={{ mt: 1 }}>
          <TextField
            label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            fullWidth margin="normal" required variant="outlined"
          />
          <TextField
            label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            fullWidth margin="normal" required variant="outlined"
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ my: 1, textAlign: 'left' }}>
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained" color="secondary" fullWidth sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
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
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                    setError('Google Login Failed');
                }}
                width="300px"
                theme="outline"
            />
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
