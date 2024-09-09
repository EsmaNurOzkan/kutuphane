const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quoteNoteSchema = new Schema({
  text: {
    type: String,
    required: true
  }
}, { _id: true });


const quoteSchema = new Schema({
  text: {
    type: String,
    required: false
  },
  quoteNotes: {
    type: [quoteNoteSchema],
    default: [] 
  },
  pageNo: {
    type: Number,
    required: true
  }
}, { _id: true });


const noteSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  pageNo: {
    type: Number,
    required: false
  }
}, { _id: true });

const tagSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  }
}, { _id: true });

const bookSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  pageCount: {
    type: Number,
    required: true
  },
  isbn: {
    type: String,
    required: false
  },
  coverImage: {
    type: String,
    required: false
  },
  quotes: {
    type: [quoteSchema],
    default: []
  },
  notes: {
    type: [noteSchema], 
    default: [] 
  },
  tags: {
    type: [tagSchema], 
    default: []
  }
});

module.exports = mongoose.model('Book', bookSchema);
