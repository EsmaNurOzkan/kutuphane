import React, { useContext, useEffect, useState } from 'react';
import { Card, Spinner, Alert, Container, Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { AppContext } from '../AppContext';

const Notes = ({ book }) => {
  const { notesUpdated, setNotesUpdated } = useContext(AppContext); // useContext ile alın
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
        const response = await axios.get(`http://localhost:5000/api/note/${book._id}`);
        setNotes(response.data.notes);
        setLoading(false);
      } catch (err) {
        setError('Notlar getirilirken bir hata oluştu');
        setLoading(false);
      }
    };

    fetchNotes();
  }, [book._id, notesUpdated]); 

  const updateNote = async () => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/note/${book._id}/${selectedNote._id}`, {
        bookId: book._id,
        text: editText,
        pageNo: editPageNo,
        tags: editTags.split(',').map(tag => tag.trim())
      });
      setNotes(response.data.notes);
      setNotesUpdated(prev => !prev); 
      setShowEditModal(false);
      setShowDetailModal(false); 
      setDeleteSuccessMessage('Not başarıyla güncellendi!');
      setTimeout(() => setDeleteSuccessMessage(''), 2000);
    } catch (error) {
      setError('Not güncellenirken bir hata oluştu');
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/note/${book._id}/${noteId}`);
      setNotes(response.data.notes);
      setDeleteSuccessMessage('Not başarıyla silindi!');
      setNotesUpdated(prev => !prev); 
      setShowDetailModal(false);
      setTimeout(() => setDeleteSuccessMessage(''), 2000);
    } catch (error) {
      setError('Not silinirken bir hata oluştu');
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
      <h3 className="my-2">Notlarım</h3>

      <Container style={{ maxHeight: '45vh', overflowY: 'auto' }}>
        {notes.length === 0 && !loading && <p>Henüz not almadınız.</p>}

        {notes.map((note) => (
          <Card key={note._id} className="my-2" onClick={() => openDetailModal(note)}>
            <Card.Body>
              <Card.Title>Sayfa {note.pageNo}</Card.Title>
              <Card.Text>{note.text}</Card.Text>
              <Card.Text>
                <strong>Tagler:</strong> {note.tags.map(tag => `#${tag}`).join(' ')}
              </Card.Text>
            </Card.Body>
          </Card>
        ))}
      </Container>

      <Modal show={showDetailModal} onHide={closeDetailModal}>
        <Modal.Header closeButton>
          <Modal.Title>Not Detayı</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNote && (
            <>
              <h4>Sayfa: {selectedNote.pageNo}</h4>
              <p>{selectedNote.text}</p>
              <p><strong>Tagler:</strong> {selectedNote.tags.map(tag => `#${tag}`).join(' ')}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={openDeleteConfirmModal}>
            Sil
          </Button>
          <Button variant="primary" onClick={openEditModal}>
            Düzenle
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteConfirmModal} onHide={closeDeleteConfirmModal}>
        <Modal.Header closeButton>
          <Modal.Title>Not Silme Onayı</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bu notu silmek istediğinizden emin misiniz?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteConfirmModal}>
            İptal
          </Button>
          <Button variant="danger" onClick={() => {
            deleteNote(selectedNote._id);
            closeDeleteConfirmModal();
          }}>
            Sil
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={closeEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Notu Düzenle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNote && (
            <Form>
              <Form.Group controlId="editText">
                <Form.Label>Not İçeriği</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="editPageNo">
                <Form.Label>Sayfa Numarası</Form.Label>
                <Form.Control
                  type="number"
                  value={editPageNo}
                  onChange={(e) => setEditPageNo(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="editTags">
                <Form.Label>Tagler</Form.Label>
                <Form.Control
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" onClick={updateNote}>
                Güncelle
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Notes;
