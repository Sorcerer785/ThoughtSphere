// models/RefreshToken.js
const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: { 
    type: String, 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: '7d' // This is SAFE here. It only deletes this token document.
  }
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);