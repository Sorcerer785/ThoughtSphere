const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateTokens, generateAccessToken } = require('../utils/tokenUtils');
const RefreshToken = require('../models/RefreshToken');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName
    });

    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Save refresh token to database
    await new RefreshToken({ 
    token: refreshToken, 
    user: user._id 
    }).save();

    // Set httpOnly cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, //process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Save refresh token to database
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    // Set httpOnly cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token not provided' });

    // 1. Find the token in the separate collection
    const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
    if (!tokenDoc) return res.status(403).json({ message: 'Invalid refresh token' });

    // 2. Find the user associated with that token
    const user = await User.findById(tokenDoc.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 3. Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // 4. Delete the old token and save the new one (Rotation)
    await tokenDoc.deleteOne(); 
    await new RefreshToken({ token: newRefreshToken, user: user._id }).save();

    // 5. Set cookie & Response (Same as before)
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true, // process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken, user: { id: user._id, /* ... other fields */ } });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (refreshToken) {
      // Remove refresh token from database
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    // Clear cookie
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Logout from all devices
router.post('/logout-all', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (refreshToken) {
      // Remove all refresh tokens for this user
      const user = await User.findOne({ 'refreshTokens.token': refreshToken });
      if (user) {
        user.refreshTokens = [];
        await user.save();
      }
    }

    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out from all devices successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
