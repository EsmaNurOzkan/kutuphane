require('dotenv').config(); 
const Book = require('../models/Book'); 
const User = require('../models/User'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage });

exports.addBook = async (req, res) => {
  try {
    const { title, author, pageCount, isbn, coverImage } = req.body;
    const userId = req.user.id;

    if (!title || !author || !pageCount ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newBook = new Book({
      user: userId,
      title,
      author,
      pageCount,
      isbn,
      coverImage
    });

    await newBook.save();

    res.status(201).json({ message: 'Book added successfully!', book: newBook });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ message: 'An error occurred while adding the book.' });
  }
};

exports.uploadCoverImage = (req, res) => {
  upload.single('coverImage')(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading image', error: err });
    }
    const filePath = req.file ? req.file.path : '';
    res.status(200).json({ filePath: filePath });
  });
};


exports.getMyLibrary = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while fetching library data.' });
  }
};

exports.getMyShelve = async (req, res) => {
  try {
    const userId = req.user.id;
    const books = await Book.find({ user: userId });
    res.status(200).json({ books });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while fetching shelve data.' });
  }
};


exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY; 

    const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q: query,
        key: apiKey,
        maxResults: 21
      },
    });



    const books = response.data.items.map(item => ({
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown',
      pageCount: item.volumeInfo.pageCount,
      isbn: item.volumeInfo.industryIdentifiers ? item.volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier : 'Unknown',
      coverImage: item.volumeInfo.imageLinks && item.volumeInfo.imageLinks.thumbnail
        ? item.volumeInfo.imageLinks.thumbnail
        : 'uploads/whitecover2.jpg', 
    }));
    res.status(200).json(books);

  } catch (error) {
    console.error('Error searching for books:', error);
    res.status(500).json({ message: 'An error occurred while searching for books.' });
  }
};