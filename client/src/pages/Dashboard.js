import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PlusCircle, Edit, Trash2, Eye, EyeOff, Calendar, Heart, MessageCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, published, draft

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get('/api/users/dashboard/posts');
      setPosts(response.data);
    } catch (error) {
      toast.error('Error fetching posts');
    }
    setLoading(false);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`/api/posts/${postId}`);
        setPosts(posts.filter(post => post._id !== postId));
        toast.success('Post deleted successfully');
      } catch (error) {
        toast.error('Error deleting post');
      }
    }
  };

  const togglePublishStatus = async (postId, currentStatus) => {
    try {
      const formData = new FormData();
      formData.append('published', !currentStatus);
      
      await axios.put(`/api/posts/${postId}`, formData);
      
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, published: !currentStatus }
          : post
      ));
      
      toast.success(currentStatus ? 'Post unpublished' : 'Post published');
    } catch (error) {
      toast.error('Error updating post status');
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'published') return post.published;
    if (filter === 'draft') return !post.published;
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your posts...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Your Dashboard</h1>
        <Link to="/create-post" className="btn-primary">
          <PlusCircle size={18} />
          Create New Post
        </Link>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{posts.filter(p => p.published).length}</h3>
          <p>Published Posts</p>
        </div>
        <div className="stat-card">
          <h3>{posts.filter(p => !p.published).length}</h3>
          <p>Draft Posts</p>
        </div>
        <div className="stat-card">
          <h3>{posts.reduce((sum, post) => sum + post.likes.length, 0)}</h3>
          <p>Total Likes</p>
        </div>
        <div className="stat-card">
          <h3>{posts.reduce((sum, post) => sum + post.comments.length, 0)}</h3>
          <p>Total Comments</p>
        </div>
      </div>

      <div className="dashboard-filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Posts ({posts.length})
        </button>
        <button 
          className={filter === 'published' ? 'active' : ''}
          onClick={() => setFilter('published')}
        >
          Published ({posts.filter(p => p.published).length})
        </button>
        <button 
          className={filter === 'draft' ? 'active' : ''}
          onClick={() => setFilter('draft')}
        >
          Drafts ({posts.filter(p => !p.published).length})
        </button>
      </div>

      <div className="posts-list">
        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            <p>No posts found.</p>
            <Link to="/create-post" className="btn-primary">
              Create Your First Post
            </Link>
          </div>
        ) : (
          filteredPosts.map(post => (
            <div key={post._id} className="post-item">
              <div className="post-item-content">
                <div className="post-item-header">
                  <h3>
                    {post.published ? (
                      <Link to={`/posts/${post._id}`}>{post.title}</Link>
                    ) : (
                      <span>{post.title}</span>
                    )}
                  </h3>
                  <div className="post-status">
                    {post.published ? (
                      <span className="status-published">
                        <Eye size={14} />
                        Published
                      </span>
                    ) : (
                      <span className="status-draft">
                        <EyeOff size={14} />
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                <div className="post-item-meta">
                  <span className="post-date">
                    <Calendar size={14} />
                    {formatDate(post.createdAt)}
                  </span>
                  <span className="post-stats">
                    <Heart size={14} />
                    {post.likes.length}
                  </span>
                  <span className="post-stats">
                    <MessageCircle size={14} />
                    {post.comments.length}
                  </span>
                </div>

                {post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="post-item-actions">
                <Link to={`/edit-post/${post._id}`} className="btn-icon" title="Edit">
                  <Edit size={16} />
                </Link>
                
                <button
                  onClick={() => togglePublishStatus(post._id, post.published)}
                  className="btn-icon"
                  title={post.published ? 'Unpublish' : 'Publish'}
                >
                  {post.published ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                
                <button
                  onClick={() => handleDeletePost(post._id)}
                  className="btn-icon btn-danger"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;