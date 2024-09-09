import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Modal } from 'react-bootstrap';
import Ocr from './Ocr'; 

const AddNote = ({ bookId, pageCount, onSuccess }) => {
  const [text, setText] = useState('');
  const [pageNo, setPageNo] = useState('');
  const [success, setSuccess] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrResults, setOcrResults] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text || !pageNo) {
      setError('Not içeriği ve sayfa numarası zorunludur.');
      return;
    }

    if ( pageNo > pageCount) {
      setError(`Sayfa sayısını aştınız. Lütfen ${pageCount} veya daha düşük bir değer girin.`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/note/add', { bookId, text, pageNo });
      setMessage(response.data.message);
      
      setError('');
      onSuccess(); 
    } catch (error) {
      setError('Not eklenirken hata oluştu');
    }
  };

  const handleOcrSubmit = (results, target) => {
    setOcrResults(results);
    setText(results); 
    setShowOcrModal(false); 
  };

  return (
    <Container className="mt-4">
      {message && <Alert variant="success" className="mt-3">{message}</Alert>}
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      <h2>Sayfa Notu Ekle</h2>
      <p>Book ID: {bookId}</p>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="text">
          <Form.Label>Not İçeriği</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
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
            type="number"
            value={pageNo}
            onChange={(e) => setPageNo(e.target.value)}
            required
            min = {1}
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
