import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

const SearchBar = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsExpanded(false);
  };

  return (
    <div className={`search-bar ${isExpanded ? 'expanded' : ''} ${className}`}>
      <form onSubmit={handleSearch} className="search-form">
        <button
          type="button"
          className="search-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Search size={18} />
        </button>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts, tags, or content..."
          className={`search-input ${isExpanded ? 'visible' : ''}`}
          onBlur={() => {
            if (!query) setIsExpanded(false);
          }}
        />
        
        {query && (
          <button
            type="button"
            className="search-clear"
            onClick={handleClear}
          >
            <X size={16} />
          </button>
        )}
      </form>
    </div>
  );
};

export default SearchBar;