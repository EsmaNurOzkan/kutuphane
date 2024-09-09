const Book = require('../models/Book');


exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params; // URL parametresinden kitap ID'sini alın
    
    // Kitap bulun ve sil
    const result = await Book.findByIdAndDelete(bookId);
    
    // Kitap bulunamadıysa hata döndür
    if (!result) {
      return res.status(404).json({ message: 'Kitap bulunamadı' });
    }

    // Silme işlemi başarılıysa yanıt gönder
    res.status(200).json({ message: 'Kitap başarıyla silindi' });
  } catch (error) {
    console.error('Kitap silme hatası:', error); // Hata detaylarını loglayın
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};


exports.getUserBooks = async (req, res) => {
    try {
        const userId = req.params.userId;
        const books = await Book.find({ user: userId });
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getBookDetails = async (req, res) => {
    const { bookId } = req.params;
    try {
        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ msg: 'Kitap bulunamadı' });

        res.status(200).json({
            quotes: book.quotes,
            notes: book.notes
        });
    } catch (error) {
        res.status(500).json({ msg: 'Sunucu hatası' });
    }
};


  exports.addNote = async (req, res) => {
    const { bookId, text, pageNo } = req.body;
  
    try {
      const book = await Book.findById(bookId);
      if (!book) return res.status(404).json({ msg: 'Kitap bulunamadı' });
  
      book.notes.push({ text, pageNo });
      await book.save();
      
      res.status(200).json(book);
    } catch (error) {
      res.status(500).json({ msg: 'Sunucu hatası' });
    }
  };
  

  exports.updateNote = async (req, res) => {
    const { bookId, noteId, text, pageNo } = req.body;
  
    try {
      const book = await Book.findById(bookId);
      if (!book) return res.status(404).json({ msg: 'Kitap bulunamadı' });
  
      const note = book.notes.id(noteId);
      if (!note) return res.status(404).json({ msg: 'Not bulunamadı' });
  
      note.text = text;
      note.pageNo = pageNo;
      
      await book.save();
      
      res.status(200).json(book);
    } catch (error) {
      res.status(500).json({ msg: 'Sunucu hatası' });
    }
  };
  



exports.deleteNote = async (req, res) => {
  const { bookId, noteId } = req.params;

  try {
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ msg: 'Kitap bulunamadı' });

    const note = book.notes.id(noteId);
    if (!note) return res.status(404).json({ msg: 'Not bulunamadı' });

    note.remove();
    await book.save();

    res.status(200).json({ msg: 'Not başarıyla silindi', book });
  } catch (error) {
    res.status(500).json({ msg: 'Sunucu hatası' });
  }
};



exports.addTagToBook = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const { tags } = req.body; 

    console.log('Received request to add tags:', { bookId, tags });

    const book = await Book.findById(bookId);
    if (!book) {
      console.log('Book not found with ID:', bookId);
      return res.status(404).json({ message: 'Book not found' });
    }

    console.log('Found book:', book);

    const newTags = tags.map(text => ({ text })); 
    book.tags.push(...newTags);

    console.log('Tags to be added:', newTags);

    await book.save();
    console.log('Book updated successfully:', book);

    res.status(200).json({ message: 'Tags added successfully!', book });
  } catch (error) {
    console.error('Error adding tags:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'An error occurred while adding the tags.' });
  }
};


exports.removeTagFromBook = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const { tagId } = req.body; // Tag ID'sini body'den al

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Tag'ı tagId ile karşılaştırarak filtreleme
    book.tags = book.tags.filter(t => t._id.toString() !== tagId);
    await book.save();

    res.status(200).json({ message: 'Tag removed successfully!', book });
  } catch (error) {
    console.error('Error removing tag:', error);
    res.status(500).json({ message: 'An error occurred while removing the tag.' });
  }
};

// Tags'ı fetch etme
exports.getTagsFromBook = async (req, res) => {
  try {
    const bookId = req.params.bookId;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({ tags: book.tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ message: 'An error occurred while fetching the tags.' });
  }
};





