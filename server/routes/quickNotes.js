const express = require('express');
const router = express.Router();
const { createNote, getNotes, updateNote, deleteNote } = require('../controllers/quickNotesController');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/', authenticateToken, createNote);

router.get('/', authenticateToken, getNotes);

router.put('/:id', authenticateToken, updateNote);

router.delete('/:id', authenticateToken, deleteNote);

module.exports = router;
