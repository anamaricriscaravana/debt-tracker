import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { IconButton, Box } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DebtTracker from './components/DebtTracker';
import Login from './components/Login';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [mode, setMode] = useState('light');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark' ? {
            background: { default: '#121212', paper: '#1e1e1e' }
          } : {
            background: { default: '#f5f5f5', paper: '#ffffff' }
          }),
        },
      }),
    [mode]
  );
  
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
  };

return (
    <ThemeProvider theme={theme}>
      {/* 2. Mahalaga ito para mag-apply ang background color sa buong screen */}
      <CssBaseline /> 
      
      <Box sx={{ minHeight: '100vh' }}>
        {/* Toggle Button for Theme */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <IconButton onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>

        {!token ? (
          <Login setToken={setToken} />
        ) : (
          <>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
               <button className="btn btn-sm btn-outline-danger" onClick={handleLogout}>
                Logout
              </button>
            </Box>
            <DebtTracker />
          </>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;