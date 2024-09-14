import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Modal } from 'react-bootstrap';
import Ocr from './Ocr';
import { AppContext } from '../AppContext';

const AddNote = ({ bookId, pageCount, onSuccess }) => {
  const { notesUpdated, setNotesUpdated } = useContext(AppContext); // useContext ile alın
  const [text, setText] = useState('');
  const [pageNo, setPageNo] = useState('');
  const [tags, setTags] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [success, setSuccess] = useState('');
  const [ocrResults, setOcrResults] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text || !pageNo) {
      setError('Not içeriği ve sayfa numarası zorunludur.');
      return;
    }

    if (pageNo > pageCount) {
      setError(`Sayfa sayısını aştınız. Lütfen ${pageCount} veya daha düşük bir değer girin.`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

      const response = await axios.post('http://localhost:5000/api/note/add', {
        bookId,
        text,
        pageNo,
        tags: tagsArray
      });
      setSuccess('Not başarıyla eklendi.');
      setError('');
      setNotesUpdated(true); // Başarı durumu güncellenir
      
      if (onSuccess) onSuccess();

    } catch (error) {
      setError('Not eklenirken hata oluştu');
      setSuccess("");
    }
  };

  const handleOcrSubmit = (results, target) => {
    setOcrResults(results);
    setText(results);
    setShowOcrModal(false);
  };

  return (
    <Container className="mt-4">
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      <h2>Sayfa Notu Ekle</h2>
      <p>Book ID: {bookId}</p>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="text">
          <Form.Label>Not İçeriği</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="secondary" onClick={() => setShowOcrModal(true)}>
          OCR ile Doldur
        </Button>
        <Form.Group controlId="pageNo">
          <Form.Label>Sayfa Numarası</Form.Label>
          <Form.Control
            value={pageNo}
            onChange={(e) => setPageNo(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="tags">
          <Form.Label>Etiketler (virgüllerle ayırın)</Form.Label>
          <Form.Control
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Not Ekle
        </Button>
      </Form>

      {/* OCR Modal */}
      <Modal show={showOcrModal} onHide={() => setShowOcrModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>OCR İşlemi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Ocr target={text} onResultsSubmit={handleOcrSubmit} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOcrModal(false)}>
            Kapat
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AddNote;
