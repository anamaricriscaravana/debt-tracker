import React, { useState } from 'react';
import DebtTracker from './components/DebtTracker';
import Login from './components/Login';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
  };

  return (
    <div className="App">
      {!token ? (
        <Login setToken={setToken} />
      ) : (
        <>
          {/* Logout Bar */}
          <div className="p-2 d-flex justify-content-end bg-dark shadow-sm">
            <span className="text-white me-3 align-self-center small">
              Welcome, <strong>{localStorage.getItem('username')}</strong>!
            </span>
            <button className="btn btn-sm btn-outline-danger fw-bold" onClick={handleLogout}>
              Logout
            </button>
          </div>

          <DebtTracker />
        </>
      )}
    </div>
  );
}

export default App;