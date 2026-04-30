import React, { useState, useMemo, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  IconButton,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Avatar,
  Tooltip
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';

import DebtTracker from './components/DebtTracker';
import Login from './components/Login';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [mode, setMode] = useState(() => { return localStorage.getItem('appTheme') || 'light'; });
  const [totalDebt, setTotalDebt] = useState(0);
  const [currentView, setCurrentView] = useState('active');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    localStorage.setItem('appTheme', mode);
  }, [mode]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#007bff',
          },
          background: {
            default: mode === 'dark' ? '#000000' : '#f8f9fa',
          }
        },
      }),
    [mode]
  );

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        <AppBar
          position="static"
          sx={{ bgcolor: mode === 'dark' ? '#000000' : '#007bff', transition: 'background-color 0.3s' }}
        >
          <Toolbar sx={{
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center', // I-center lahat ng stack items vertically sa mobile
            gap: { xs: 2, md: 0 },
            py: { xs: 2, md: 1 },
            px: 4
          }}>
            {/* 1. Title */}
            <Typography variant="h5" sx={{
              fontWeight: '900',
              letterSpacing: '1px',
              color: '#fff',
              textAlign: 'center', // I-center ang "DEBT TRACKER" text
              width: { xs: '100%', md: 'auto' }
            }}>
              DEBT TRACKER
            </Typography>

            {/* 2. Middle Section (Balance & Time) */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center', // ETO ANG FIX: I-center ang balance at date sa mobile
              width: { xs: '100%', md: 'auto' }, // Kunin ang buong lapad sa mobile
              gap: { xs: 3, sm: 4 },
              flexDirection: 'row',
              ml: { md: 'auto' },
              mr: { md: 2 }
            }}>
              {token && (
                <Box sx={{ textAlign: 'center', color: '#fff' }}> {/* Ginawang textAlign: center */}
                  <Typography variant="caption" sx={{ display: 'block', opacity: 0.7, fontSize: '0.65rem' }}>
                    {currentView === 'active' ? 'Active Balance' : 'Total Settled'}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                    ₱{totalDebt.toLocaleString()}
                  </Typography>
                </Box>
              )}

              {/* Divider - Itago sa mobile para mas malinis */}
              <Box sx={{ height: '30px', width: '1px', bgcolor: 'rgba(255,255,255,0.3)', display: { xs: 'none', sm: 'block' } }} />

              <Box sx={{ textAlign: 'center', color: '#fff' }}>
                <Typography sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                  {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Typography>
                <Typography sx={{ opacity: 0.7, fontSize: '0.65rem' }}>
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </Typography>
              </Box>
            </Box>

            {/* 3. Right Icons Section */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center', // I-center din ang icons sa ilalim
              width: { xs: '100%', md: 'auto' },
              gap: 2,
              mt: { xs: 1, md: 0 }
            }}>
              <Tooltip title={mode === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"} arrow>
                <IconButton onClick={toggleColorMode} color="inherit">
                  {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>

              {token && (
                <IconButton onClick={handleProfileClick} sx={{ p: 0 }}>
                  <Avatar sx={{
                    bgcolor: mode === 'dark' ? '#007bff' : '#0056b3',
                    width: 32, height: 32, fontSize: '0.85rem', fontWeight: 'bold',
                    border: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    {localStorage.getItem('username')?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              )}
            </Box>
          </Toolbar>
          
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 180,
                borderRadius: 2,
                overflow: 'visible',
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {localStorage.getItem('username')}
              </Typography>
              <Typography variant="caption" color="text.secondary">Lender</Typography>
            </Box>
            <hr style={{ margin: '4px 0', opacity: 0.1 }} />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontWeight: 'medium' }}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </AppBar>

        <Box sx={{ flexGrow: 1 }}>
          {!token ? (
            <Login setToken={setToken} />
          ) : (
            <DebtTracker
              darkMode={mode === 'dark'}
              setHeaderTotal={setTotalDebt}
              setHeaderView={setCurrentView}
            />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;