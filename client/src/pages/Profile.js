import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { User, Mail, Calendar, Users, Heart, MessageCircle, Edit, Upload } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    username: ''
  });
  const [profileImage, setProfileImage] = useState(null);

  const isOwnProfile = currentUser && currentUser.id === id;

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`/api/users/${id}`);
      setProfileData(response.data.user);
      setPosts(response.data.posts);
      
      if (currentUser && !isOwnProfile) {
        setIsFollowing(response.data.user.followers.some(f => f._id === currentUser.id));
      }
      
      setEditForm({
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName,
        bio: response.data.user.bio || '',
        username: response.data.user.username
      });
    } catch (error) {
      toast.error('Error fetching profile');
    }
    setLoading(false);
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('Please login to follow users');
      return;
    }

    try {
      const response = await axios.post(`/api/users/${id}/follow`);
      setIsFollowing(response.data.following);
      
      // Update follower count in profile data
      setProfileData(prev => ({
        ...prev,
        followers: response.data.following 
          ? [...prev.followers, { _id: currentUser.id }]
          : prev.followers.filter(f => f._id !== currentUser.id)
      }));
      
      toast.success(response.data.following ? 'Following user' : 'Unfollowed user');
    } catch (error) {
      toast.error('Error updating follow status');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      Object.keys(editForm).forEach(key => {
        formData.append(key, editForm[key]);
      });
      
      if (profileImage) {
        formData.append('profilePicture', profileImage);
      }

      const response = await axios.put('/api/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProfileData(response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating profile');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return <div className="error-message">Profile not found</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar">
            {profileData.profilePicture ? (
              <img 
                src={profileData.profilePicture} 
                alt={profileData.username}
              />
            ) : (
              <div className="avatar-placeholder">
                <User size={48} />
              </div>
            )}
            
            {isEditing && (
              <label className="avatar-upload">
                <Upload size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </label>
            )}
          </div>

          <div className="profile-details">
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="edit-profile-form">
                <div className="form-row">
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                    placeholder="First Name"
                    required
                  />
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                    placeholder="Last Name"
                    required
                  />
                </div>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                  placeholder="Username"
                  required
                />
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                  rows="3"
                />
                <div className="edit-actions">
                  <button type="submit" className="btn-primary">Save Changes</button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1>{profileData.firstName} {profileData.lastName}</h1>
                <p className="username">@{profileData.username}</p>
                {profileData.bio && <p className="bio">{profileData.bio}</p>}
                
                <div className="profile-meta">
                  <div className="meta-item">
                    <Mail size={16} />
                    {profileData.email}
                  </div>
                  <div className="meta-item">
                    <Calendar size={16} />
                    Joined {formatDate(profileData.createdAt)}
                  </div>
                </div>

                <div className="profile-stats">
                  <div className="stat">
                    <span className="stat-number">{posts.length}</span>
                    <span className="stat-label">Posts</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{profileData.followers.length}</span>
                    <span className="stat-label">Followers</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{profileData.following.length}</span>
                    <span className="stat-label">Following</span>
                  </div>
                </div>

                <div className="profile-actions">
                  {isOwnProfile ? (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="btn-primary"
                    >
                      <Edit size={16} />
                      Edit Profile
                    </button>
                  ) : currentUser && (
                    <button 
                      onClick={handleFollow}
                      className={`btn-follow ${isFollowing ? 'following' : ''}`}
                    >
                      <Users size={16} />
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="posts-section">
          <h2>Posts ({posts.length})</h2>
          
          {posts.length === 0 ? (
            <div className="empty-state">
              <p>{isOwnProfile ? 'You haven\'t written any posts yet.' : 'This user hasn\'t written any posts yet.'}</p>
            </div>
          ) : (
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
                    <h3 className="post-title">
                      <a href={`/posts/${post._id}`}>{post.title}</a>
                    </h3>
                    
                    <div className="post-excerpt">
                      {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </div>

                    <div className="post-meta">
                      <span className="post-date">
                        <Calendar size={14} />
                        {formatDate(post.createdAt)}
                      </span>
                      <div className="post-stats">
                        <span className="stat">
                          <Heart size={14} />
                          {post.likes.length}
                        </span>
                        <span className="stat">
                          <MessageCircle size={14} />
                          {post.comments.length}
                        </span>
                      </div>
                    </div>

                    {post.tags.length > 0 && (
                      <div className="post-tags">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;