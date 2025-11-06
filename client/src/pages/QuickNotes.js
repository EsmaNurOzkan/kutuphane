import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, ListGroup, Modal, Spinner, Alert, Row, Col, ButtonGroup, Button } from "react-bootstrap";


import Ocr from './Ocr';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

function QuickNotes() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [editNote, setEditNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrResults, setOcrResults] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}/api/quick-notes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sortedNotes = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setNotes(sortedNotes);
      } catch (error) {
        console.error('Error fetching notes:', error);
        setError('An error occurred while fetching notes.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleAddNote = async () => {
    if (newNote.trim() === '') {
      setError('Please do not leave the note empty.');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`${BACKEND_URL}/api/quick-notes`, { noteContent: newNote }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes([response.data.newNote, ...notes].sort((a, b) => new Date(b.date) - new Date(a.date)));
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
      setError('Failed to add note.');
    }
  };

  const handleEditNote = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(`${BACKEND_URL}/api/quick-notes/${selectedNote._id}`,
        { noteContent: editNote, date: new Date() }, {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const updatedNotes = notes.map(note => note._id === selectedNote._id ? response.data.updatedNote : note);
      setNotes(updatedNotes.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setSelectedNote(null);
    } catch (error) {
      console.error('Error editing note:', error);
      setError('Failed to edit note.');
    }
  };

  const handleDeleteNote = async () => {
    const confirm = window.confirm('Are you sure you want to delete this note?');
    if (!confirm) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${BACKEND_URL}/api/quick-notes/${selectedNote._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.filter(note => note._id !== selectedNote._id).sort((a, b) => new Date(b.date) - new Date(a.date)));
      setSelectedNote(null);
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Failed to delete note.');
    }
  };

  const handleOcrSubmit = (results) => {
    setOcrResults(results);
    setNewNote(results); 
    setShowOcrModal(false);
  };

  return (
  <Container className="my-5">
  {error && <Alert variant="danger">{error}</Alert>}

  {loading ? (
    <div className="text-center ">
      <Spinner animation="border" role="status" />
      <p className="mt-3">Loading your notes...</p>
    </div>
  ) : (
    <>
      <Form>
        <Form.Group controlId="formNote">
          <Form.Label className="fw-bold text-center d-block">Add a New Note</Form.Label>
          <Form.Control
            type="text"
            as="textarea"
            rows={5}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter your note here..."
            className="shadow-sm"
            style={{ borderRadius: '10px' }}
          />
        </Form.Group>
<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: "10px",
    paddingRight: "20px",
  }}
>
  <ButtonGroup style={{ gap: "1", marginRight: "0" }}>
    <Button
      variant="primary"
      onClick={handleAddNote}
      className="fw-bold shadow-sm"
      style={{
        borderRadius: "8px 0 0 8px",
        marginRight: "-1px" 
      }}
    >
      Add Note
    </Button>

    <Button
      variant="outline-secondary"
      onClick={() => setShowOcrModal(true)}
      className="fw-bold shadow-sm"
      style={{
        borderRadius: "0 8px 8px 0",
      }}
    >
      OCR
    </Button>
  </ButtonGroup>
</div>

      </Form>
      <div className="mt-5">
        <h4 className="mb-3 fw-bold">My Quick Notes</h4>
        <ListGroup>
          {notes.length === 0 ? (
            <ListGroup.Item className="text-center text-muted">No notes found</ListGroup.Item>
          ) : (
            notes.map((note) => (
              <ListGroup.Item
                key={note._id}
                onClick={() => {
                  setSelectedNote(note);
                  setEditNote(note.noteContent);
                }}
                style={{
                  cursor: 'pointer',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                }}
                className="d-flex justify-content-between align-items-start"
              >
                <div>{note.noteContent}</div>
                <small className="text-muted">{new Date(note.date).toLocaleString()}</small>
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      </div>

      {selectedNote && (
        <Modal show={true} onHide={() => setSelectedNote(null)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Note</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Control
              as="textarea"
              rows={5}
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              className="shadow-sm"
              style={{ borderRadius: '10px' }}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={handleEditNote} className="fw-bold">
              Save
            </Button>
            <Button variant="danger" onClick={handleDeleteNote} className="fw-bold">
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <Modal show={showOcrModal} onHide={() => setShowOcrModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>OCR Process</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Ocr target={newNote} onResultsSubmit={handleOcrSubmit} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOcrModal(false)} className="fw-bold">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )}



</Container>


);
}

export default QuickNotes;
