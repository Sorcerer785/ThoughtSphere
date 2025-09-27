import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, MessageCircle, Eye, Calendar, Tag } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTag, setSelectedTag] = useState('');
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, [currentPage, selectedTag]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 10 };
      if (selectedTag) params.tags = selectedTag;

      const response = await axios.get('/api/posts', { params });
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
      
      // Extract unique tags
      const tags = [...new Set(response.data.posts.flatMap(post => post.tags))];
      setAllTags(tags);
    } catch (error) {
      console.error('Error fetching posts:', error);
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

  if (loading && posts.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-hero">
        <h1>Welcome to ThoughtSphere</h1>
        <p>Where ideas converge and thoughts take shape. Share your insights and connect with thinkers around the world.</p>
      </div>

      <div className="home-content">
        <aside className="sidebar">
          <div className="filter-section">
            <h3>Filter by Tags</h3>
            <div className="tag-filter">
              <button 
                className={`tag-button ${!selectedTag ? 'active' : ''}`}
                onClick={() => setSelectedTag('')}
              >
                All Posts
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`tag-button ${selectedTag === tag ? 'active' : ''}`}
                  onClick={() => setSelectedTag(tag)}
                >
                  <Tag size={14} />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="posts-main">
          <div className="posts-grid">
            {posts.map(post => (
              <article key={post._id} className="post-card">
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
                    <Link to={`/posts/${post._id}`}>{post.title}</Link>
                  </h2>
                  
                  <p className="post-excerpt">
                    {truncateContent(post.content)}
                  </p>

                  {post.tags.length > 0 && (
                    <div className="post-tags">
                      {post.tags.map(tag => (
                        <span key={tag} className="tag">
                          <Tag size={12} />
                          {tag}
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`page-button ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;