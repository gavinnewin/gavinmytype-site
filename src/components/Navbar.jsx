import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <header className="header">
      {/* Logo */}
      <Link to="/" className="logo">
        gavinmytype
      </Link>

      {/* Hamburger Button */}
      <button 
        className={`hamburger ${open ? 'active' : ''}`} 
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Nav links */}
      <nav className={`navbar ${open ? "open" : ""}`}>
        <Link to="/" onClick={() => setOpen(false)}>
          Home
        </Link>
        <Link to="/about" onClick={() => setOpen(false)}>
          About
        </Link>
        <Link to="/links" onClick={() => setOpen(false)}>
          Product Links
        </Link>
        <Link to="/monkeytype" onClick={() => setOpen(false)}>
          GavinType
        </Link>
        <Link to="/keytester" onClick={() => setOpen(false)}>
          KeyTester
        </Link>
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=gavinmytype@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
        >
          Contact
        </a>
        <div className="theme-toggle">
          <label className="switch">
            <input 
              type="checkbox" 
              checked={isDarkMode}
              onChange={toggleTheme}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
