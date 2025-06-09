import React, { useState } from "react";
import { Box, Typography, TextField, Button, Paper, Link, Alert } from '@mui/material';
import axios from 'axios';

function AuthPage({ onLoginSuccess }) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setLoading(true);
        try {
            let response;
            if (isRegisterMode) {
                // Register user
                response = await axios.post(`${API_BASE_URL}/auth/register/`, {
                email,
                username, 
                password,
                password2: password, // Send password confirmation
                });
                setSuccessMsg('Registration successful! Please log in.');
                setIsRegisterMode(false); //Switch to login mode after successful registration
            } else {
                //Login
                response = await axios.post(`${API_BASE_URL}/auth/login/`, {
                email,
                password,
                });

                // Store tokens in browser localStorage
                const { access, refresh } = response.data.token;
                localStorage.setItem('accessToken', access);
                localStorage.setItem('refreshToken', refresh);

                setSuccessMsg('Login successful!');
                onLoginSuccess(); //notify parent component (ChatWindow) of successful login
            }
        }   catch (err) {
            // Handle API errors
            if (err.response) {
                const message = err.response.data.detail || JSON.stringify(err.response.data);
                setError(message);
            } else if (err.request) {
                // Request was made but no response received
                setError('No response from server. Please check your network connection.');
            } else {
                setError('An unexpected error occurred: ' + err.message);
            }
            console.error("Authentication error:", err.response?.data || err.message);
            } finally {
            setLoading(false); //hide loading indicator
            }
    };

    return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        height: '100%', 
        boxSizing: 'border-box', 
      }}
    >
      <Paper
        elevation={6} //a subtle shadow
        sx={{
          p: 4,
          borderRadius: '12px',
          backgroundColor: 'background.paper', //Uses white background from theme
          width: '100%',
          maxWidth: '350px', //Limit width for aesthetic appeal
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'text.primary', mb: 3 }}>
          {isRegisterMode ? 'Create Account' : 'Welcome Back!'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>} 
        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

        <form onSubmit={handleSubmit}>
            {isRegisterMode && ( 
            <TextField
              label="Username"
              type="text"
              variant="outlined"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{
                '& label.Mui-focused': { color: 'primary.main' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'text.secondary' },
                  '&:hover fieldset': { borderColor: 'text.primary' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                },
                input: { color: 'text.primary' }
              }}
              required
            />
          )}
          <TextField
            label="Email"
            type="email"
            variant="outlined" //Outlined border style
            fullWidth
            margin="normal"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} //Update state on input change
            sx={{
              '& label.Mui-focused': { color: 'primary.main' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'text.secondary' },
                '&:hover fieldset': { borderColor: 'text.primary' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
              },
              input: { color: 'text.primary' } // Black input text
            }}
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              '& label.Mui-focused': { color: 'primary.main' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'text.secondary' },
                '&:hover fieldset': { borderColor: 'text.primary' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
              },
              input: { color: 'text.primary' }
            }}
            required
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, py: 1.2 }}
            disabled={loading} // diable button when loading
          >
            {loading ? (isRegisterMode ? 'Registering...' : 'Logging In...') : (isRegisterMode ? 'Register' : 'Log In')}
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
          {isRegisterMode ? "Already have an account?" : "Don't have an account?"}
          <Link
            component="button"
            variant="body2"
            onClick={() => { setIsRegisterMode(!isRegisterMode); setError(null); setSuccessMsg(null); setUsername(''); setEmail(''); setPassword(''); }}
            sx={{ ml: 1, color: 'primary.main', textDecoration: 'none', fontWeight: 'bold' }}
          >
            {isRegisterMode ? 'Log In' : 'Sign Up'}
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default AuthPage;
