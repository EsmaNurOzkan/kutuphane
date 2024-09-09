import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Spinner, Alert, Container, Modal, Button } from 'react-bootstrap';

const Notes = ({ book }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/note/${book._id}`);
        setNotes(response.data.notes);
      } catch (err) {
        setError('Notlar getirilirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [book._id]);

  const updateNote = async () => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/note/${book._id}/${selectedNote._id}`, {
        text: editText,
      });
      setNotes(response.data.notes);
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
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <Spinner animation="border" role="status">
          <span className="sr-only">Yükleniyor...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">Hata: {error}</Alert>;
  }

  return (
    <Container className="text-center">
      <h2 className="my-2">Notlarım</h2>

      {deleteSuccessMessage && <Alert variant="success">{deleteSuccessMessage}</Alert>}

      <Container style={{maxHeight: '45vh', overflowY: 'auto' }}>
        {notes.length === 0 ? (
          <p>Henüz not almadınız.</p>
        ) : (
          notes.map((note) => (
            <Card className="mb-4" key={note._id} onClick={() => openDetailModal(note)}>
              <Card.Body>
                <Card.Text style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {note.text}
                </Card.Text>
              </Card.Body>
              <Card.Footer className="text-muted">
                Sayfa Numarası: {note.pageNo || 'Belirtilmemiş'}
              </Card.Footer>
            </Card>
          ))
        )}
      </Container>
      

      <Modal show={showDetailModal} onHide={closeDetailModal}>
        <Modal.Header closeButton>
          <Modal.Title>Not Detayı</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{selectedNote?.text}</p>
          <p><strong>Sayfa No:</strong> {selectedNote?.pageNo || 'Belirtilmemiş'}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={openDeleteConfirmModal}>Sil</Button>
          <Button variant="primary" onClick={openEditModal}>Düzenle</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={closeEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Not Düzenle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label>Metin:</label>
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="form-control"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEditModal}>İptal</Button>
          <Button variant="primary" onClick={updateNote}>Güncelle</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteConfirmModal} onHide={closeDeleteConfirmModal}>
        <Modal.Header closeButton>
          <Modal.Title>Silme Onayı</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bu notu silmek istediğinize emin misiniz?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteConfirmModal}>
            İptal
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteNote(selectedNote._id);
              closeDeleteConfirmModal();
            }}
          >
            Tamam
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Notes;
