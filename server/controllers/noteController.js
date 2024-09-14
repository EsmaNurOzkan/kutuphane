const Book = require('../models/Book');

exports.addNote = async (req, res) => {
  const { bookId, text, pageNo, tags } = req.body; 
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Kitap bulunamadı' });
    }

    const newNote = { text, pageNo, tags }; 
    book.notes.push(newNote);
    await book.save();

    res.status(201).json({ message: 'Not başarıyla eklendi', notes: book.notes });
  } catch (error) {
    res.status(500).json({ message: 'Not eklenirken hata oluştu', error });
  }
};

exports.deleteNote = async (req, res) => {
  const { bookId, noteId } = req.params;

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Kitap bulunamadı' });
    }

    const noteIndex = book.notes.findIndex(note => note._id.toString() === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ message: 'Not bulunamadı' });
    }

    book.notes.splice(noteIndex, 1);
    await book.save();

    res.status(200).json({ message: 'Not silindi', notes: book.notes });
  } catch (error) {
    res.status(500).json({ message: 'Not silinirken hata oluştu', error });
  }
};

exports.updateNote = async (req, res) => {
  const { noteId } = req.params;
  const { bookId, text, pageNo, tags } = req.body; 

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Kitap bulunamadı' });
    }

    const note = book.notes.id(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Not bulunamadı' });
    }

    note.text = text || note.text;
    note.pageNo = pageNo || note.pageNo;
    note.tags = tags || note.tags;

    await book.save();
    res.status(200).json({ message: 'Not güncellendi', notes: book.notes });
  } catch (error) {
    res.status(500).json({ message: 'Not güncellenirken hata oluştu', error });
  }
};


exports.getNotes = async (req, res) => {
  const { bookId } = req.params;

  try {
    const book = await Book.findById(bookId).select('notes');
    if (!book) {
      return res.status(404).json({ message: 'Kitap bulunamadı' });
    }

    res.status(200).json({ notes: book.notes });
  } catch (error) {
    res.status(500).json({ message: 'Notlar getirilirken hata oluştu', error });
  }
};
 