const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const libraryController = require('../controllers/libraryController');
const path = require('path');
const multer = require('multer');

router.get('/', authenticateToken, libraryController.getMyLibrary);

router.post('/add-book', authenticateToken, libraryController.addBook);

router.post('/upload-cover-image', authenticateToken, libraryController.uploadCoverImage);
  
router.get('/search-books', authenticateToken, libraryController.searchBooks);

module.exports = router;
