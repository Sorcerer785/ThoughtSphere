import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth'); // your auth router

const app = express();

// Parse JSON requests
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// CORS setup
app.use(cors({
  origin: 'https://thought-sphere-beryl.vercel.app', // ✅ your Vercel frontend
  credentials: true, // ✅ allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // optional
}));

// Optional: handle preflight requests for all routes
app.options('*', cors({
  origin: 'https://thought-sphere-beryl.vercel.app',
  credentials: true
}));

// Your routes
app.use('/api/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
