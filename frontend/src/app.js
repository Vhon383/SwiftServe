    import React, { useState, useEffect } from 'react';
    import './app.css';
    import Login from './components/Login';
    import Dashboard from './components/Dashboard';
    import Admin from './components/Admin';

    function App() {
      const [user, setUser] = useState(null);
      const [view, setView] = useState('login');
      const [darkMode, setDarkMode] = useState(false);

      useEffect(() => {
        document.body.className = darkMode ? 'dark-mode' : '';
      }, [darkMode]);

      return (
        <div className="container">
          <button className="toggle-dark" onClick={() => setDarkMode(!darkMode)} title="Toggle Dark Mode">
            {darkMode ? '☀️' : '🌙'}
          </button>
          {!user ? (
            <Login setUser={setUser} />
          ) : view === 'dashboard' ? (
            <Dashboard user={user} setView={setView} setUser={setUser} />
          ) : (
            <Admin setView={setView} user={user} setUser={setUser} />
          )}
        </div>
      );
    }

    export default App;
    