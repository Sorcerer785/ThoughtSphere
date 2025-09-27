import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Heart, MessageCircle, Eye, Calendar, Tag, ArrowLeft } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  const query = searchParams.get('q');
  const page = searchParams.get('page') || 1;

  useEffect(() => {
    if (query) {
      searchPosts();
    }
  }, [query, page]);

  const searchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Searching for:', query); // Debug log
      
      const response = await axios.get('/api/posts/search', {
        params: { q: query, page: currentPage, limit: 10 }
      });
      
      console.log('Search response:', response.data); // Debug log
      
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Search error details:', error.response || error); // Detailed error log
      setError(error.response?.data?.message || 'Error searching posts');
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 200) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...' 
      : textContent;
  };

  const highlightText = (text, searchQuery) => {
    if (!searchQuery) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="highlight">{part}</mark>
      ) : part
    );
  };

  if (!query) {
    return (
      <div className="search-container">
        <div className="search-empty">
          <Search size={64} />
          <h2>Search ThoughtSphere</h2>
          <p>Enter a search term to find posts, tags, or content</p>
          <Link to="/" className="btn-primary">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="search-container">
        <div className="search-header">
          <h1>Searching for "{query}"</h1>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Searching posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-container">
      <div className="search-header">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <div className="search-info">
          <h1>Search Results for "{query}"</h1>
          <p className="search-meta">
            {total === 0 ? 'No results found' : `${total} result${total !== 1 ? 's' : ''} found`}
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {posts.length === 0 && !error ? (
        <div className="search-no-results">
          <Search size={48} />
          <h3>No posts found</h3>
          <p>Try searching with different keywords or check your spelling.</p>
          <div className="search-suggestions">
            <h4>Search Tips:</h4>
            <ul>
              <li>Use different keywords</li>
              <li>Search for specific tags</li>
              <li>Try shorter search terms</li>
              <li>Check for typos</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="search-results">
          <div className="posts-grid">
            {posts.map(post => (
              <article key={post._id} className="post-card search-result">
                {post.featuredImage && (
                  <div className="post-image">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title}
                    />
                  </div>
                )}
                
                <div className="post-content">
                  <div className="post-header">
                    <Link to={`/profile/${post.author._id}`} className="author-info">
                      {post.author.profilePicture ? (
                        <img 
                          src={post.author.profilePicture} 
                          alt={post.author.username}
                          className="author-avatar"
                        />
                      ) : (
                        <div className="author-avatar-placeholder">
                          {post.author.firstName[0]}{post.author.lastName[0]}
                        </div>
                      )}
                      <div>
                        <span className="author-name">
                          {post.author.firstName} {post.author.lastName}
                        </span>
                        <div className="post-date">
                          <Calendar size={14} />
                          {formatDate(post.createdAt)}
                        </div>
                      </div>
                    </Link>
                  </div>

                  <h2 className="post-title">
                    <Link to={`/posts/${post._id}`}>
                      {highlightText(post.title, query)}
                    </Link>
                  </h2>
                  
                  <p className="post-excerpt">
                    {highlightText(truncateContent(post.content), query)}
                  </p>

                  {post.tags.length > 0 && (
                    <div className="post-tags">
                      {post.tags.map(tag => (
                        <span 
                          key={tag} 
                          className={`tag ${tag.toLowerCase().includes(query.toLowerCase()) ? 'highlighted-tag' : ''}`}
                        >
                          <Tag size={12} />
                          {highlightText(tag, query)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="post-stats">
                    <span className="stat">
                      <Heart size={16} />
                      {post.likes.length}
                    </span>
                    <span className="stat">
                      <MessageCircle size={16} />
                      {post.comments.length}
                    </span>
                    <Link to={`/posts/${post._id}`} className="read-more">
                      <Eye size={16} />
                      Read More
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  className={`page-button ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;