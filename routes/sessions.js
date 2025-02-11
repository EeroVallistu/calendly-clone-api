const express = require('express');
const router = express.Router();
const db = require('../db');

// Login - Create session
router.post('/', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const err = new Error('Email and password are required');
    err.statusCode = 400;
    throw err;
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      const dbError = new Error('Database error');
      dbError.statusCode = 500;
      throw dbError;
    }
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Store user in session
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    res.json({ 
      message: 'Login successful', 
      user: { 
        id: user.id, 
        email: user.email,
        name: user.name
      }
    });
  });
});

// Logout - Destroy session
router.delete('/', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
});

// Check session
router.get('/', (req, res) => {
  if (req.session.user) {
    return res.json({ 
      authenticated: true,
      user: req.session.user
    });
  }
  res.json({ authenticated: false });
});

module.exports = router; 