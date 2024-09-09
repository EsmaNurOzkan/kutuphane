const QuickNote = require('../models/QuickNote');

const createNote = async (req, res) => {
    try {
        const { noteContent, date } = req.body;
        const newNote = new QuickNote({
            user: req.user.id,
            noteContent,
            date
        });
        await newNote.save();
        res.status(201).json({ message: 'Note created successfully', newNote });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create note', error });
    }
};

const getNotes = async (req, res) => {
    try {
        const notes = await QuickNote.find({ user: req.user.id });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch notes', error });
    }
};

const updateNote = async (req, res) => {
    try {
        const { noteContent, date } = req.body; 
        const noteId = req.params.id;

        const updatedNote = await QuickNote.findOneAndUpdate(
            { _id: noteId, user: req.user.id }, 
            { noteContent, date }, 
            { new: true } 
        );

        if (!updatedNote) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.status(200).json({ message: 'Note updated successfully', updatedNote });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update note', error });
    }
};


const deleteNote = async (req, res) => {
    try {
        const noteId = req.params.id;

        const deletedNote = await QuickNote.findOneAndDelete({ _id: noteId, user: req.user.id });

        if (!deletedNote) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete note', error });
    }
};

module.exports = { createNote, getNotes, updateNote, deleteNote };
