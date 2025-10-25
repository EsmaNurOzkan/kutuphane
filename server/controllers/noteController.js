const Book = require('../models/Book');

exports.addNote = async (req, res) => {
  const { bookId, text, pageNo, tags } = req.body; 
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const newNote = { text, pageNo, tags }; 
    book.notes.push(newNote);
    await book.save();

    res.status(201).json({ message: 'Note added successfully', notes: book.notes });
  } catch (error) {
    res.status(500).json({ message: 'Error occurred while adding the note', error });
  }
};

exports.deleteNote = async (req, res) => {
  const { bookId, noteId } = req.params;

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const noteIndex = book.notes.findIndex(note => note._id.toString() === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ message: 'Note not found' });
    }

    book.notes.splice(noteIndex, 1);
    await book.save();

    res.status(200).json({ message: 'Note deleted', notes: book.notes });
  } catch (error) {
    res.status(500).json({ message: 'Error occurred while deleting the note', error });
  }
};

exports.updateNote = async (req, res) => {
  const { noteId } = req.params;
  const { bookId, text, pageNo, tags } = req.body; 

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const note = book.notes.id(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.text = text || note.text;
    note.pageNo = pageNo || note.pageNo;
    note.tags = tags || note.tags;

    await book.save();
    res.status(200).json({ message: 'Note updated', notes: book.notes });
  } catch (error) {
    res.status(500).json({ message: 'Error occurred while updating the note', error });
  }
};

exports.getNotes = async (req, res) => {
  const { bookId } = req.params;

  try {
    const book = await Book.findById(bookId).select('notes');
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({ notes: book.notes });
  } catch (error) {
    res.status(500).json({ message: 'Error occurred while fetching notes', error });
  }
};
