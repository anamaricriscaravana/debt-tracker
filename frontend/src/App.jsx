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
  // --- Authentication & User State ---
  // Retrieve token and username from localStorage for session persistence
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  // --- UI & Theme State ---
  // Default to light mode unless saved otherwise in localStorage
  const [mode, setMode] = useState(() => { return localStorage.getItem('appTheme') || 'light'; });
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- Data Synchronization State ---
  // totalDebt and currentView are updated by the child (DebtTracker) and displayed in the Header
  const [totalDebt, setTotalDebt] = useState(0);
  const [currentView, setCurrentView] = useState('active');

  // --- Profile Menu State ---
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Persistence: Save theme preference whenever it changes
  useEffect(() => {
    localStorage.setItem('appTheme', mode);
  }, [mode]);

  // Real-time Clock: Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /**
   * Material UI Theme Configuration
   * useMemo optimizes performance by only recalculating the theme when 'mode' changes
   */
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

  // --- Event Handlers ---
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * Clears session data and resets state to redirect user to the Login page
   */
  const handleLogout = () => {
    handleClose();
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername('');
  };

  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline kicks in to normalize styles and apply background colors */}
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        <AppBar
          position="static"
          sx={{ bgcolor: mode === 'dark' ? '#000000' : '#007bff', transition: 'background-color 0.3s' }}
        >
          <Toolbar sx={{
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: { xs: 2, md: 0 },
            py: { xs: 2, md: 1 },
            px: 4
          }}>

            {/* --- Application Branding --- */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              width: { xs: '100%', md: 'auto' },
              justifyContent: { xs: 'center', md: 'flex-start' }
            }}>
              {/* Favicon / Logo Image */}
              <img
                src="/favicon.svg"
                alt="Logo"
                style={{
                  width: '32px',
                  height: '32px',
                  filter: 'brightness(0) invert(1)'
                }}
              />
              <Typography variant="h5" sx={{
                fontWeight: '900',
                letterSpacing: '1px',
                color: '#fff',
                textTransform: 'uppercase'
              }}>
                ReCollect
              </Typography>
            </Box>

            {/* --- Dynamic Stats & Clock Section --- */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: '100%', md: 'auto' },
              gap: { xs: 2, sm: 4 },
              flexDirection: 'row',
              ml: { md: 'auto' },
              mr: { md: 2 }
            }}>

              {/* Only show balance summary if user is logged in */}
              {token && (
                <>
                  <Box sx={{ textAlign: 'center', color: '#fff' }}>
                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.7, fontSize: '0.65rem' }}>
                      {currentView === 'active' ? 'Active Balance' : 'Total Settled'}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                      ₱{totalDebt.toLocaleString()}
                    </Typography>
                  </Box>

                  {/* Vertical Divider */}
                  <Box sx={{
                    height: '30px',
                    width: '1px',
                    bgcolor: 'rgba(255,255,255,0.3)',
                    mx: 2,
                    display: { xs: 'none', sm: 'block' }
                  }} />
                </>
              )}

              {/* Digital Clock and Calendar Display */}
              <Box sx={{ textAlign: 'center', color: '#fff' }}>
                <Typography sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                  {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Typography>
                <Typography sx={{ opacity: 0.7, fontSize: '0.65rem' }}>
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </Typography>
              </Box>
            </Box>

            {/* --- Utility Controls: Theme Toggle & Profile --- */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: '100%', md: 'auto' },
              gap: 1,
              mt: { xs: 1, md: 0 }
            }}>
              <Tooltip title={mode === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"} arrow>
                <IconButton onClick={toggleColorMode} color="inherit">
                  {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>

              {/* Avatar shows the first initial of the logged-in user */}
              {token && (
                <IconButton onClick={handleProfileClick} sx={{ p: 0 }}>
                  <Avatar sx={{
                    bgcolor: mode === 'dark' ? '#007bff' : '#0056b3',
                    width: 32, height: 32, fontSize: '0.85rem', fontWeight: 'bold',
                    border: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    {username ? username.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>
              )}
            </Box>
          </Toolbar>

          {/* --- User Profile Dropdown Menu --- */}
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
                minWidth: 160,
                borderRadius: 2,
                overflow: 'visible',
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10, height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                {username}
              </Typography>
              <Typography variant="caption" color="text.secondary">Lender</Typography>
            </Box>
            <hr style={{ margin: '4px 0', opacity: 0.1 }} />

            <MenuItem
              onClick={handleLogout}
              sx={{
                fontSize: '0.75rem',
                py: 0.5,
                minHeight: '32px',
                color: 'error.main',
                fontWeight: 600,
                mx: 1,
                borderRadius: '4px',
                '&:hover': { bgcolor: 'error.light', color: '#fff' }
              }}
            >
              <LogoutIcon sx={{ mr: 1, fontSize: '1rem' }} /> Logout
            </MenuItem>
          </Menu>
        </AppBar>

        {/* --- Main Content Area --- 
            Conditional Rendering: If no token, show Login. Otherwise, show DebtTracker.
        */}
        <Box sx={{ flexGrow: 1 }}>
          {!token ? (
            <Login setToken={setToken} setUsername={setUsername} />
          ) : (
            <DebtTracker
              darkMode={mode === 'dark'}
              setHeaderTotal={setTotalDebt}
              setHeaderView={setCurrentView}
              onLogout={handleLogout}
            />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;