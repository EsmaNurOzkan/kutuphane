import React, { useContext, useEffect, useState } from 'react';
import { Card, Spinner, Alert, Container, Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { AppContext } from '../AppContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

const Notes = ({ book }) => {
  const { notesUpdated, setNotesUpdated } = useContext(AppContext); 
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editText, setEditText] = useState('');
  const [editPageNo, setEditPageNo] = useState('');
  const [editTags, setEditTags] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BACKEND_URL}/api/note/${book._id}`);
        setNotes(response.data.notes);
        setLoading(false);
      } catch (err) {
        setError('An error occurred while fetching notes.');
        setLoading(false);
      }
    };

    fetchNotes();
  }, [book._id, notesUpdated]); 

  const updateNote = async () => {
    try {
      const response = await axios.patch(`${BACKEND_URL}/api/note/${book._id}/${selectedNote._id}`, {
        bookId: book._id,
        text: editText,
        pageNo: editPageNo,
        tags: editTags.split(',').map(tag => tag.trim())
      });
      setNotes(response.data.notes);
      setNotesUpdated(prev => !prev); 
      setShowEditModal(false);
      setShowDetailModal(false); 
      setDeleteSuccessMessage('Note updated successfully!');
      setTimeout(() => setDeleteSuccessMessage(''), 2000);
    } catch (error) {
      setError('An error occurred while updating the note.');
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/note/${book._id}/${noteId}`);
      setNotes(response.data.notes);
      setDeleteSuccessMessage('Note deleted successfully!');
      setNotesUpdated(prev => !prev); 
      setShowDetailModal(false);
      setTimeout(() => setDeleteSuccessMessage(''), 2000);
    } catch (error) {
      setError('An error occurred while deleting the note.');
    }
  };

  const openDetailModal = (note) => {
    setSelectedNote(note);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
  };

  const openDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(true);
  };

  const closeDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
  };

  const openEditModal = () => {
    setEditText(selectedNote.text);
    setEditPageNo(selectedNote.pageNo || '');
    setEditTags(selectedNote.tags.join(', '));
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  return (
    <Container className="text-center">
      {deleteSuccessMessage && <Alert variant="success">{deleteSuccessMessage}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <h3 className="my-2">My Notes</h3>

      <Container style={{ maxHeight: '45vh', overflowY: 'auto' }}>
        {notes.length === 0 && !loading && <p>You haven’t added any notes yet.</p>}

        {notes.map((note) => (
          <Card key={note._id} className="my-2" onClick={() => openDetailModal(note)}>
            <Card.Body>
              <Card.Title>Page {note.pageNo}</Card.Title>
              <Card.Text>{note.text}</Card.Text>
              <Card.Text>
                <strong>Tags:</strong> {note.tags.map(tag => `#${tag}`).join(' ')}
              </Card.Text>
            </Card.Body>
          </Card>
        ))}
      </Container>

      <Modal show={showDetailModal} onHide={closeDetailModal}>
        <Modal.Header closeButton>
          <Modal.Title>Note Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNote && (
            <>
              <h4>Page: {selectedNote.pageNo}</h4>
              <p>{selectedNote.text}</p>
              <p><strong>Tags:</strong> {selectedNote.tags.map(tag => `#${tag}`).join(' ')}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={openDeleteConfirmModal}>
            Delete
          </Button>
          <Button variant="primary" onClick={openEditModal}>
            Edit
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteConfirmModal} onHide={closeDeleteConfirmModal}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Note Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this note?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteConfirmModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => {
            deleteNote(selectedNote._id);
            closeDeleteConfirmModal();
          }}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={closeEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNote && (
            <Form>
              <Form.Group controlId="editText">
                <Form.Label>Note Content</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="editPageNo">
                <Form.Label>Page Number</Form.Label>
                <Form.Control
                  type="number"
                  value={editPageNo}
                  onChange={(e) => setEditPageNo(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="editTags">
                <Form.Label>Tags</Form.Label>
                <Form.Control
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" onClick={updateNote}>
                Update
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Notes;
