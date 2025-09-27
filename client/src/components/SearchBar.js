import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

const SearchBar = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsExpanded(false);
      setQuery('');
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  // Auto-focus when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300); // Wait for animation to complete
    }
  }, [isExpanded]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) && !query) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, query]);

  return (
    <div className={`search-bar ${isExpanded ? 'expanded' : ''} ${className}`}>
      <form onSubmit={handleSearch} className="search-form">
        {!isExpanded && (
          <button
            type="button"
            className="search-toggle"
            onClick={handleToggle}
          >
            <Search size={18} />
          </button>
        )}
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts, tags, or content..."
          className={`search-input ${isExpanded ? 'visible' : ''}`}
        />
        
        {isExpanded && query && (
          <button
            type="button"
            className="search-clear"
            onClick={handleClear}
          >
            <X size={16} />
          </button>
        )}

        {isExpanded && (
          <button
            type="submit"
            className="search-submit"
            disabled={!query.trim()}
          >
            <Search size={16} />
          </button>
        )}
      </form>
    </div>
  );
};

export default SearchBar;