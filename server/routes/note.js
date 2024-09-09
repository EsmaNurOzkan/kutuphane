const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

router.post('/add', noteController.addNote);

router.delete('/:bookId/:noteId', noteController.deleteNote);

router.patch('/:bookId/:noteId', noteController.updateNote);

router.get('/:bookId', noteController.getNotes);

module.exports = router;
