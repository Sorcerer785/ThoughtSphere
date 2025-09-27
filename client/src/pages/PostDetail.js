import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Heart, MessageCircle, Calendar, Tag, Edit, Trash2, Reply } from 'lucide-react';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/posts/${id}`);
      setPost(response.data);
      setLiked(user && response.data.likes.includes(user.id));
      setLikeCount(response.data.likes.length);
    } catch (error) {
      toast.error('Error fetching post');
      navigate('/');
    }
    setLoading(false);
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/comments/post/${id}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const response = await axios.post(`/api/posts/${id}/like`);
      setLiked(response.data.liked);
      setLikeCount(response.data.likes);
    } catch (error) {
      toast.error('Error liking post');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    if (!newComment.trim()) return;

    try {
      const response = await axios.post('/api/comments', {
        content: newComment,
        postId: id
      });

      setComments([response.data, ...comments]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Error adding comment');
    }
  };

  const handleReply = async (commentId) => {
    if (!user) {
      toast.error('Please login to reply');
      return;
    }

    if (!replyContent.trim()) return;

    try {
      const response = await axios.post('/api/comments', {
        content: replyContent,
        postId: id,
        parentCommentId: commentId
      });

      fetchComments(); // Refresh comments to show the reply
      setReplyingTo(null);
      setReplyContent('');
      toast.success('Reply added!');
    } catch (error) {
      toast.error('Error adding reply');
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`/api/posts/${id}`);
        toast.success('Post deleted successfully');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Error deleting post');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return <div className="error-message">Post not found</div>;
  }

  return (
    <div className="post-detail-container">
      <article className="post-detail">
        {post.featuredImage && (
          <div className="post-featured-image">
            <img src={post.featuredImage} alt={post.title} />
          </div>
        )}

        <div className="post-header">
          <h1 className="post-title">{post.title}</h1>
          
          <div className="post-meta">
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

            {user && user.id === post.author._id && (
              <div className="post-actions">
                <Link to={`/edit-post/${post._id}`} className="btn-edit">
                  <Edit size={16} />
                  Edit
                </Link>
                <button onClick={handleDeletePost} className="btn-delete">
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>

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
        </div>

        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

        <div className="post-interactions">
          <button 
            onClick={handleLike} 
            className={`like-button ${liked ? 'liked' : ''}`}
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            {likeCount}
          </button>
          
          <div className="comment-count">
            <MessageCircle size={18} />
            {comments.length} Comments
          </div>
        </div>
      </article>

      <section className="comments-section">
        <h3>Comments</h3>
        
        {user ? (
          <form onSubmit={handleComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows="3"
              required
            />
            <button type="submit" className="btn-primary">Post Comment</button>
          </form>
        ) : (
          <p className="login-prompt">
            <Link to="/login">Login</Link> to join the discussion
          </p>
        )}

        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment._id} className="comment">
              <div className="comment-header">
                <Link to={`/profile/${comment.author._id}`} className="comment-author">
                  {comment.author.profilePicture ? (
                    <img 
                      src={comment.author.profilePicture} 
                      alt={comment.author.username}
                      className="comment-avatar"
                    />
                  ) : (
                    <div className="comment-avatar-placeholder">
                      {comment.author.firstName[0]}{comment.author.lastName[0]}
                    </div>
                  )}
                  <span>{comment.author.firstName} {comment.author.lastName}</span>
                </Link>
                <span className="comment-date">{formatDate(comment.createdAt)}</span>
              </div>
              
              <p className="comment-content">{comment.content}</p>
              
              <div className="comment-actions">
                <button className="comment-like">
                  <Heart size={14} />
                  {comment.likes.length}
                </button>
                
                {user && (
                  <button 
                    onClick={() => setReplyingTo(comment._id)}
                    className="reply-button"
                  >
                    <Reply size={14} />
                    Reply
                  </button>
                )}
              </div>

              {replyingTo === comment._id && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleReply(comment._id);
                  }}
                  className="reply-form"
                >
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    rows="2"
                    required
                  />
                  <div className="reply-actions">
                    <button type="submit" className="btn-primary btn-sm">Reply</button>
                    <button 
                      type="button" 
                      onClick={() => setReplyingTo(null)}
                      className="btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {comment.replies && comment.replies.map(reply => (
                <div key={reply._id} className="reply">
                  <div className="comment-header">
                    <Link to={`/profile/${reply.author._id}`} className="comment-author">
                      {reply.author.profilePicture ? (
                        <img 
                          src={reply.author.profilePicture} 
                          alt={reply.author.username}
                          className="comment-avatar"
                        />
                      ) : (
                        <div className="comment-avatar-placeholder">
                          {reply.author.firstName[0]}{reply.author.lastName[0]}
                        </div>
                      )}
                      <span>{reply.author.firstName} {reply.author.lastName}</span>
                    </Link>
                    <span className="comment-date">{formatDate(reply.createdAt)}</span>
                  </div>
                  
                  <p className="comment-content">{reply.content}</p>
                  
                  <div className="comment-actions">
                    <button className="comment-like">
                      <Heart size={14} />
                      {reply.likes.length}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PostDetail;