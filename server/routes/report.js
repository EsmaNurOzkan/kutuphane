const express = require('express');
const router = express.Router();
const { reportIssue } = require('../controllers/reportController');
const authMiddleware = require('../middleware/authenticateToken'); 

router.post('/', authMiddleware, reportIssue);

module.exports = router;
