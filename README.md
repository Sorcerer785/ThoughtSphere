# ThoughtSphere 🌐

A modern full-stack blogging platform where users can share thoughts, create content, and engage with others through comments and likes.

## 🌍 Live Demo
**Frontend:** [Vercel](https://thought-sphere-beryl.vercel.app/)  
**Backend API:** [Render](https://thoughtsphere-kphy.onrender.com)

## 🚀 Features

- **User Authentication** - Register, login with JWT tokens
- **Create & Edit Posts** - Rich text editor with image uploads
- **Search & Filter** - Find posts by title, content, or tags
- **Comments & Likes** - Engage with community content
- **User Profiles** - Personal profile pages
- **Dark/Light Theme** - Toggle between themes
- **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

**Frontend:** React, React Router, Axios, ReactQuill  
**Backend:** Node.js, Express, MongoDB, JWT  
**Storage:** Cloudinary (images), MongoDB Atlas (database)  
**Deployment:** Vercel (frontend), Render (backend)

## 📋 Quick Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Cloudinary account

### Installation

1. **Clone & Install**
```bash
git clone <your-repo>
cd Blog

# Backend
cd server
npm install

# Frontend  
cd ../client
npm install
```

2. **Environment Setup**
```bash
# server/.env
MONGODB_URI=mongodb://localhost:27017/thoughtsphere
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. **Run the App**
```bash
# Backend (port 5000)
cd server
npm run dev

# Frontend (port 3000)
cd client
npm start
```

Visit `http://localhost:3000` to use the app.


## 📝 Usage

1. **Register/Login** to your account
2. **Create posts** with the rich text editor
3. **Add images** by uploading to posts
4. **Search** for content using the search bar
5. **Like & comment** on posts you enjoy

## 🔧 Key Scripts

```bash
# Development
npm run dev        # Start backend with nodemon
npm start          # Start frontend dev server

# Production  
npm start          # Start backend in production
npm run build      # Build frontend for production
```

## 📞 Support

For issues or questions, create an issue in the GitHub repository.

---

Built with ❤️ by Saurabh