const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome to the home page!' });
});

module.exports = router;
