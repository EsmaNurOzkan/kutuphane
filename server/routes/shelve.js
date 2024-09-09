const express = require('express');
const router = express.Router();
const shelveController = require('../controllers/shelveController');


// books
router.get('/user/:userId', shelveController.getUserBooks);

router.get('/books/:bookId/details', shelveController.getBookDetails);

router.delete('/book/:bookId', shelveController.deleteBook);



// Tag 
router.post('/books/:bookId/tags', shelveController.addTagToBook);

router.delete('/books/:bookId/tags', shelveController.removeTagFromBook);

router.get('/books/:bookId/tags', shelveController.getTagsFromBook);



module.exports = router;


