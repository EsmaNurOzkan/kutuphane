const Book = require('../models/Book');

exports.getAllQuotes = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Kitap bulunamadı.' });
    }

    res.status(200).json({ quotes: book.quotes });
  } catch (err) {
    res.status(500).json({ message: 'Bir hata oluştu.', error: err.message });
  }
};


exports.updateQuote = async (req, res) => {
  try {
    const { bookId, quoteId, updatedQuote } = req.body;
    const book = await Book.findOne({ _id: bookId });

    if (!book) {
      return res.status(404).json({ message: 'Kitap bulunamadı.' });
    }

    const quote = book.quotes.id(quoteId);
    if (!quote) {
      return res.status(404).json({ message: 'Alıntı bulunamadı.' });
    }

    quote.text = updatedQuote.text || quote.text;

    if (updatedQuote.quoteNotes) {
      updatedQuote.quoteNotes.forEach((note) => {
        const existingNote = quote.quoteNotes.id(note._id);
        if (existingNote) {
          existingNote.text = note.text || existingNote.text;
        } else {
          quote.quoteNotes.push(note);
        }
      });
    }

    if (Array.isArray(updatedQuote.tags)) {
      quote.tags = updatedQuote.tags;
    }

    await book.save();
    res.status(200).json({ message: 'Alıntı başarıyla güncellendi.', quote });
  } catch (err) {
    res.status(500).json({ message: 'Bir hata oluştu.', error: err.message });
  }
};


exports.deleteQuote = async (req, res) => {
  try {
    const { bookId, quoteId, noteId } = req.body;
    if (!bookId || !quoteId) {
      return res.status(400).json({ message: 'bookId veya quoteId sağlanmadı.' });
    }

    const book = await Book.findOne({ _id: bookId });

    if (!book) {
      return res.status(404).json({ message: 'Kitap bulunamadı.' });
    }

    const quoteIndex = book.quotes.findIndex(q => q._id.toString() === quoteId);

    if (quoteIndex === -1) {
      return res.status(404).json({ message: 'Alıntı bulunamadı.' });
    }

    if (noteId) {
      const noteIndex = book.quotes[quoteIndex].quoteNotes.findIndex(n => n._id.toString() === noteId);
      
      if (noteIndex !== -1) {
        book.quotes[quoteIndex].quoteNotes.splice(noteIndex, 1);
        await book.save();
        return res.status(200).json({ message: 'Not başarıyla silindi.' });
      } else {
        return res.status(404).json({ message: 'Not bulunamadı.' });
      }
    } else {
      book.quotes.splice(quoteIndex, 1);
      await book.save();
      return res.status(200).json({ message: 'Alıntı başarıyla silindi.' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Bir hata oluştu.', error: err.message });
  }
};

exports.addQuote = async (req, res) => {
  const { bookId, text, quoteNotes = [], pageNo, tags = [] } = req.body;

  try {
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ msg: 'Kitap bulunamadı' });

    const newQuote = { text, quoteNotes, pageNo, tags };

    book.quotes.push(newQuote);
    await book.save();

    res.status(200).json(book);
  } catch (error) {
    console.error('Hata ayrıntıları:', error); 
    console.error('Stack Trace:', error.stack); 
    res.status(500).json({ msg: 'Sunucu hatası', error: error.message });
  }
};
