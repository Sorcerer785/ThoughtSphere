import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Upload, Save, Eye } from 'lucide-react';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    published: false
  });
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ]
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'script', 'indent', 'blockquote',
    'code-block', 'color', 'background', 'align', 'link', 'image'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleContentChange = (content) => {
    setFormData({ ...formData, content });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Please enter content');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('tags', formData.tags);
      submitData.append('published', publish);
      
      if (featuredImage) {
        submitData.append('featuredImage', featuredImage);
      }

      const response = await axios.post('/api/posts', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(publish ? 'Post published successfully!' : 'Post saved as draft!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating post');
    }

    setLoading(false);
  };

  return (
    <div className="create-post-container">
      <div className="create-post-header">
        <h1>Create New Post</h1>
        <div className="post-actions">
          <button 
            onClick={(e) => handleSubmit(e, false)}
            disabled={loading}
            className="btn-secondary"
          >
            <Save size={18} />
            Save Draft
          </button>
          <button 
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="btn-primary"
          >
            <Eye size={18} />
            Publish
          </button>
        </div>
      </div>

      <form className="create-post-form">
        <div className="form-group">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter your post title..."
            className="title-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="featuredImage" className="image-upload-label">
            <Upload size={20} />
            {featuredImage ? 'Change Featured Image' : 'Add Featured Image'}
          </label>
          <input
            type="file"
            id="featuredImage"
            accept="image/*"
            onChange={handleImageChange}
            className="image-input"
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={handleContentChange}
            modules={modules}
            formats={formats}
            placeholder="Write your story..."
            className="content-editor"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Add tags (comma separated)"
            className="tags-input"
          />
          <small className="form-help">
            Separate multiple tags with commas (e.g., javascript, react, programming)
          </small>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;