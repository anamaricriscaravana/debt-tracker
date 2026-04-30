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

const Login = ({ setToken, setUsername }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [credentials, setCredentials] = useState({ username: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');

    const handleToggleMode = (e) => {
        e.preventDefault();
        setIsRegister(!isRegister);
        setError('');
        setCredentials({ username: '', password: '', confirmPassword: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isRegister && credentials.password !== credentials.confirmPassword) {
            return setError("Passwords do not match!");
        }

        const endpoint = isRegister ? 'register' : 'login';
        try {
            const res = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, {
                username: credentials.username,
                password: credentials.password
            });

            if (isRegister) {
                alert("Account created! You can now login.");
                setIsRegister(false);
                setCredentials({ username: '', password: '', confirmPassword: '' }); // Clear after register
            } else {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('username', res.data.username);
                setUsername(res.data.username);
                setToken(res.data.token);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || "Something went wrong");
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={2} sx={{ p: 3, width: '100%', borderRadius: 2 }}>
                    <Typography component="h1" variant="h6" align="center" sx={{ fontWeight: '600', mb: 2 }}>
                        {isRegister ? 'Create an Account' : 'Login'}
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2, py: 0, fontsize: '0.85rem' }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Username"
                            autoFocus
                            size="small"
                            value={credentials.username}
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Password"
                            type="password"
                            size="small"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        />
                        {isRegister && (
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Confirm Password"
                                type="password"
                                size="small"
                                value={credentials.confirmPassword}
                                onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                            />
                        )}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2, mb: 1.5, py: 1, fontSize: '0.85rem', fontWeight: '600', borderRadius: 1.5 }}
                        >
                            {isRegister ? 'Register' : 'Login'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Link
                                component="button"
                                variant="caption"
                                onClick={handleToggleMode}
                                sx={{ textDecoration: 'none', color: 'text.secondary' }}
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