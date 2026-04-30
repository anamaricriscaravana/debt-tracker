import React, { useState } from 'react';
import axios from 'axios';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Link,
  Alert
} from '@mui/material';

const Login = ({ setToken }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isRegister ? 'register' : 'login';
        try {
            const res = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, credentials);
            
            if (isRegister) {
                alert("Account created! You can now login.");
                setIsRegister(false);
            } else {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('username', res.data.username);
                setToken(res.data.token);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || "Something went wrong");
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 3 }}>
                    <Typography component="h1" variant="h5" align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
                        {isRegister ? 'Create Account' : 'DebtTracker Login'}
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Username"
                            autoFocus
                            value={credentials.username}
                            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Password"
                            type="password"
                            value={credentials.password}
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
                            color={isRegister ? "success" : "primary"}
                        >
                            {isRegister ? 'Register Now' : 'Sign In'}
                        </Button>
                        
                        <Box sx={{ textAlign: 'center' }}>
                            <Link 
                                component="button" 
                                variant="body2" 
                                onClick={(e) => { e.preventDefault(); setIsRegister(!isRegister); }}
                                sx={{ textDecoration: 'none', fontWeight: 'medium' }}
                            >
                                {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;