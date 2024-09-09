import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Button, Card, ListGroup, Modal, Form, Alert } from 'react-bootstrap';

const Quotes = ({ book }) => {
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [editQuote, setEditQuote] = useState({ text: '', pageNo: '', quoteNotes: [] });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteNoteModal, setShowDeleteNoteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');  

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/quote/${book._id}/quotes`);
        setQuotes(response.data.quotes);
      } catch (error) {
        console.error('Quotes fetch error:', error);
      }
    };

    fetchQuotes();
  }, [book._id]);

  const handleShowDetailsModal = (quote) => {
    setSelectedQuote(quote);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => setShowDetailsModal(false);

  const handleShowEditModal = () => {
    setEditQuote({
      text: selectedQuote.text,
      pageNo: selectedQuote.pageNo,
      quoteNotes: [...selectedQuote.quoteNotes]
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setErrorMessage('');  
  };

  const handleSaveChanges = async () => {
    const emptyNote = editQuote.quoteNotes.some(note => note.text.trim() === '');
    if (emptyNote) {
      setErrorMessage('Lütfen not alanını boş bırakmayın!');
      return;
    }

    try {
      const response = await axios.patch('http://localhost:5000/api/quote/update', {
        bookId: book._id,
        quoteId: selectedQuote._id,
        updatedQuote: editQuote
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      const updatedQuotes = quotes.map(q => (q._id === selectedQuote._id ? response.data.quote : q));
      setQuotes(updatedQuotes);
  
      setSelectedQuote(response.data.quote);
      
      handleCloseEditModal();
      alert('Değişiklikler başarıyla kaydedildi.');
    } catch (error) {
      console.error('Save changes error:', error);
      alert('Değişiklikler kaydedilirken bir hata oluştu.');
    }
  };
  
  const handleDeleteQuote = async () => {
    try {
      const response = await axios.delete('http://localhost:5000/api/quote/delete', {
        data: {
          bookId: book._id,
          quoteId: selectedQuote._id
        }
      });
      setQuotes(quotes.filter(q => q._id !== selectedQuote._id));
      handleCloseDeleteModal();
      handleCloseDetailsModal();
      alert(response.data.message);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Silme işlemi sırasında bir hata oluştu.');
    }
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      const response = await axios.delete('http://localhost:5000/api/quote/delete', {
        data: {
          bookId: book._id,
          quoteId: selectedQuote._id,
          noteId: noteToDelete
        }
      });
  
      const updatedQuotes = quotes.map(quote =>
        quote._id === selectedQuote._id
          ? { ...quote, quoteNotes: quote.quoteNotes.filter(note => note._id !== noteToDelete) }
          : quote
      );
  
      setQuotes(updatedQuotes);
  
      const updatedSelectedQuote = { ...selectedQuote, quoteNotes: selectedQuote.quoteNotes.filter(note => note._id !== noteToDelete) };
      setSelectedQuote(updatedSelectedQuote);
  
      alert('Not başarıyla silindi.');
      handleCloseDeleteNoteModal();
    } catch (error) {
      console.error('Not silme hatası:', error);
      alert('Not silinirken bir hata oluştu.');
    }
  };

  const handleShowDeleteNoteModal = (noteId) => {
    setNoteToDelete(noteId);
    setShowDeleteNoteModal(true);
  };

  const handleCloseDeleteNoteModal = () => setShowDeleteNoteModal(false);

  const handleShowDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  return (
    <Container className="text-center" >
      <h2 my-2 >Alıntılarım</h2>
      <Container style={{maxHeight: '45vh', overflowY: 'auto'}}>
    {quotes.length === 0 ? (
      <p>Henüz alıntı yapmadınız.</p>
    ) : (
      quotes.map((quote) => (
        <Card key={quote._id} style={{ marginBottom: '20px' }} onClick={() => handleShowDetailsModal(quote)}>
          <Card.Body>
            <Card.Title>{quote.text}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">Sayfa Numarası: {quote.pageNo}</Card.Subtitle>
          </Card.Body>
        </Card>
      ))
    )}
  </Container>

      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Alıntı Detayları</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuote && (
            <div>
              <h4>Alıntı Metni</h4>
              <p>{selectedQuote.text}</p>
              <h4>Sayfa Numarası</h4>
              <p>{selectedQuote.pageNo}</p>
              <h4>Notlar</h4>
              <ListGroup>
                {selectedQuote.quoteNotes.map((note) => (
                  <ListGroup.Item key={note._id} className="d-flex justify-content-between align-items-center">
                    {note.text}
                    <Button variant="danger" size="sm" onClick={() => handleShowDeleteNoteModal(note._id)}>
                      Sil
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Button variant="primary" onClick={handleShowEditModal} className="mt-3">
                Düzenle
              </Button>
              <Button variant="danger" onClick={handleShowDeleteModal} className="mt-3 ml-2">
                Sil
              </Button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailsModal}>Kapat</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Alıntıyı Düzenle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuote && (
            <Form>
              <Form.Group controlId="formQuoteText">
                <Form.Label>Alıntı Metni</Form.Label>
                <Form.Control
                  type="text"
                  value={editQuote.text}
                  onChange={(e) => setEditQuote({ ...editQuote, text: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="formPageNo">
                <Form.Label>Sayfa Numarası</Form.Label>
                <Form.Control
                  type="number"
                  value={editQuote.pageNo}
                  onChange={(e) => setEditQuote({ ...editQuote, pageNo: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="formQuoteNotes">
                <Form.Label>Notlar</Form.Label>
                <ListGroup>
                  {editQuote.quoteNotes.map((note, index) => (
                    <ListGroup.Item key={index}>
                      <Form.Control
                        type="text"
                        value={note.text}
                        onChange={(e) => {
                          const updatedNotes = [...editQuote.quoteNotes];
                          updatedNotes[index].text = e.target.value;
                          setEditQuote({ ...editQuote, quoteNotes: updatedNotes });
                        }}
                      />
                      <Button variant="danger" size="sm" onClick={() => {
                        const updatedNotes = editQuote.quoteNotes.filter((_, i) => i !== index);
                        setEditQuote({ ...editQuote, quoteNotes: updatedNotes });
                      }}>
                        Sil
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Button variant="primary" onClick={() => setEditQuote({ ...editQuote, quoteNotes: [...editQuote.quoteNotes, { text: '' }] })}>
                  Not Ekle
                </Button>
              </Form.Group>
              {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>Kapat</Button>
          <Button variant="primary" onClick={handleSaveChanges}>Kaydet</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Alıntıyı Sil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bu alıntıyı silmek istediğinizden emin misiniz?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>İptal</Button>
          <Button variant="danger" onClick={handleDeleteQuote}>Sil</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteNoteModal} onHide={handleCloseDeleteNoteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Notu Sil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bu notu silmek istediğinizden emin misiniz?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteNoteModal}>İptal</Button>
          <Button variant="danger" onClick={handleDeleteNote}>Sil</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Quotes;
