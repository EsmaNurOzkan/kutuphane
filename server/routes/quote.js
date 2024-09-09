const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');

router.get('/:bookId/quotes', quoteController.getAllQuotes);

router.post('/add', quoteController.addQuote);

router.patch('/update', quoteController.updateQuote);

router.delete('/delete', quoteController.deleteQuote);

module.exports = router;
