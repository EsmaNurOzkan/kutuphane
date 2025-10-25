import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Modal } from 'react-bootstrap';
import Ocr from './Ocr';
import { AppContext } from '../AppContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

const AddNote = ({ bookId, pageCount, onSuccess }) => {
  const { notesUpdated, setNotesUpdated } = useContext(AppContext); 
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
      setError('Note content and page number are required.');
      return;
    }

    if (pageNo > pageCount) {
      setError(`You exceeded the page count. Please enter ${pageCount} or a lower value.`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

      const response = await axios.post(`${BACKEND_URL}/api/note/add`, {
        bookId,
        text,
        pageNo,
        tags: tagsArray
      });
      setSuccess('Note added successfully.');
      setError('');
      setNotesUpdated(true); 
      
      if (onSuccess) onSuccess();

    } catch (error) {
      setError('An error occurred while adding the note.');
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

      <h2>Add Page Note</h2>
      <p>Book ID: {bookId}</p>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="text">
          <Form.Label>Note Content</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="secondary" onClick={() => setShowOcrModal(true)}>
          Fill with OCR
        </Button>
        <Form.Group controlId="pageNo">
          <Form.Label>Page Number</Form.Label>
          <Form.Control
            value={pageNo}
            onChange={(e) => setPageNo(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="tags">
          <Form.Label>Tags (separate with commas)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Add Note
        </Button>
      </Form>

      {/* OCR Modal */}
      <Modal show={showOcrModal} onHide={() => setShowOcrModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>OCR Process</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Ocr target={text} onResultsSubmit={handleOcrSubmit} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOcrModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AddNote;
