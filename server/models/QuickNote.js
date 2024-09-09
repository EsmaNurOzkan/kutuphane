const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuickNoteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    noteContent: {
        type: String,
        required: true
    }
}, { timestamps: true }); 

module.exports = mongoose.model('QuickNote', QuickNoteSchema);
