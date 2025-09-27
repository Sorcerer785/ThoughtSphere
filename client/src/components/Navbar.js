import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SearchBar from './SearchBar';
import { PenSquare, User, LogOut, Home, PlusCircle, Moon, Sun } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <PenSquare size={24} />
          ThoughtSphere
        </Link>
        
        <div className="nav-menu">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            <Home size={18} />
            Home
          </Link>
          
          <SearchBar className="nav-search" />
          
          {user ? (
            <>
              <Link 
                to="/create-post" 
                className={`nav-link ${isActive('/create-post') ? 'active' : ''}`}
              >
                <PlusCircle size={18} />
                Write
              </Link>
              
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              
              <div className="nav-dropdown">
                <button className="nav-profile">
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt="Profile" 
                      className="profile-img-small"
                    />
                  ) : (
                    <User size={18} />
                  )}
                  {user.firstName}
                </button>
                
                <div className="dropdown-content">
                  <Link to={`/profile/${user.id}`}>
                    <User size={16} />
                    Profile
                  </Link>
                  <button onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <Link 
                to="/login" 
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className={`nav-link nav-button ${isActive('/register') ? 'active' : ''}`}
              >
                Register
              </Link>
            </div>
          )}

          <button 
            onClick={toggleTheme}
            className="theme-toggle"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;