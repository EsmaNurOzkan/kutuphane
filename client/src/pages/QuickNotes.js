import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, ListGroup, Alert, Spinner, Modal } from 'react-bootstrap';
import Ocr from './Ocr';

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
        const response = await axios.get('http://localhost:5000/api/quick-notes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sortedNotes = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setNotes(sortedNotes);
      } catch (error) {
        console.error('Notları çekerken hata oluştu:', error);
        setError('Notları çekerken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleAddNote = async () => {
    if (newNote.trim() === '') {
      setError('Not alanını boş bırakmayın.');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('http://localhost:5000/api/quick-notes', { noteContent: newNote }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes([response.data.newNote, ...notes].sort((a, b) => new Date(b.date) - new Date(a.date)));
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
      setError('Not eklenemedi.');
    }
  };

  const handleEditNote = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(`http://localhost:5000/api/quick-notes/${selectedNote._id}`,
        { noteContent: editNote, date: new Date() }, {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const updatedNotes = notes.map(note => note._id === selectedNote._id ? response.data.updatedNote : note);
      setNotes(updatedNotes.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setSelectedNote(null);
    } catch (error) {
      console.error('Error editing note:', error);
      setError('Not düzenlenemedi');
    }
  };

  const handleDeleteNote = async () => {
    const confirm = window.confirm('Silmek istediğinizden emin misiniz?');
    if (!confirm) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/quick-notes/${selectedNote._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.filter(note => note._id !== selectedNote._id).sort((a, b) => new Date(b.date) - new Date(a.date)));
      setSelectedNote(null);
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Not silinemedi');
    }
  };

  const handleOcrSubmit = (results) => {
    setOcrResults(results);
    setNewNote(results); 
    setShowOcrModal(false);
  };

  return (
    <Container className="my-4">
      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <div className="text-center">
          <p>Notlarınız yükleniyor...</p>
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <Form>
            <Form.Group controlId="formNote">
              <Form.Label>Yeni bir not ekle</Form.Label>
              <Form.Control
                type="text"
                as="textarea"
                rows={7}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Notunuzu girin"
              />
            </Form.Group>
            <Button variant="primary" onClick={handleAddNote} className="mt-2">
              Notu ekle
            </Button>
            <Button variant="secondary" className="mt-2 ml-2" onClick={() => setShowOcrModal(true)}>
              OCR
            </Button>
          </Form>
  
          <div className="mt-4">
            <h4>Hızlı notlarım</h4>
            <ListGroup>
              {notes.length === 0 ? (
                <ListGroup.Item>Not bulunamadı</ListGroup.Item>
              ) : (
                notes.map((note) => (
                  <ListGroup.Item
                    key={note._id}
                    onClick={() => {
                      setSelectedNote(note);
                      setEditNote(note.noteContent);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {note.noteContent} - {new Date(note.date).toLocaleString()}
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </div>

          {selectedNote && (
            <Modal show={true} onHide={() => setSelectedNote(null)} size="lg">
              <Modal.Header closeButton>
                <Modal.Title>Notu düzenle</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onClick={handleEditNote}>
                  Kaydet
                </Button>
                <Button variant="danger" onClick={handleDeleteNote}>
                  Notu sil
                </Button>
              </Modal.Footer>
            </Modal>
          )}
        </>
      )}

      <Modal show={showOcrModal} onHide={() => setShowOcrModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>OCR İşlemi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Ocr target={newNote} onResultsSubmit={handleOcrSubmit} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOcrModal(false)}>
            Kapat
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default QuickNotes;
