import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, ListGroup, Container, Row, Col } from 'react-bootstrap';

const AddTag = ({ bookId, onSuccess }) => {
  const [tags, setTags] = useState([]); 
  const [tagText, setTagText] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleAddTag = (e) => {
    e.preventDefault();

    if (tagText.trim() === '') return;

    setTags([...tags, tagText.trim()]);
    setTagText(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`http://localhost:5000/api/my-shelve/books/${bookId}/tags`, { tags });

      if (response.status === 200) {
        setMessage(response.data.message);
        setError('');
        setTags([]);

        onSuccess('addTag');
      }
    } catch (error) {
      setError(error.response ? error.response.data.message : 'Bir hata oluştu');
      setMessage('');
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2 className="text-center mb-4">Etiket Ekle</h2>
          <p className="text-center">Book ID: {bookId}</p>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formTag">
              <Form.Label>Tag:</Form.Label>
              <Form.Control
                type="text"
                value={tagText}
                onChange={(e) => setTagText(e.target.value)}
                placeholder="Tag ekleyin"
              />
            </Form.Group>
            <Button variant="primary" onClick={handleAddTag} className="mb-3">
              Tag Ekle
            </Button>
            <ListGroup className="mb-3">
              {tags.map((tag, index) => (
                <ListGroup.Item key={index}>{tag}</ListGroup.Item>
              ))}
            </ListGroup>
            <Button variant="success" type="submit" block>
              Tag'leri Gönder
            </Button>
          </Form>
          {message && <Alert variant="success" className="mt-3">{message}</Alert>}
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Col>
      </Row>
    </Container>
  );
};

export default AddTag;
