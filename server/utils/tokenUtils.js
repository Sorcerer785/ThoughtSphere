const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate Access Token (15 minutes)
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Generate Refresh Token (7 days)
const generateRefreshToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate both tokens
const generateTokens = (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken();
  return { accessToken, refreshToken };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens
};