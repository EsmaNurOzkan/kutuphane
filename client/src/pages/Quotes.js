import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Button, Card, ListGroup, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { AppContext } from '../AppContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

const Quotes = ({ book }) => {
  const { quotesUpdated, setQuotesUpdated } = useContext(AppContext); 
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [editQuote, setEditQuote] = useState({ text: '', pageNo: '', quoteNotes: [], tags: [] });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteNoteModal, setShowDeleteNoteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/quote/${book._id}/quotes`);
        const allQuotes = response.data.quotes;

        const nonNumericPageQuotes = allQuotes.filter(quote => isNaN(quote.pageNo));
        const numericPageQuotes = allQuotes
          .filter(quote => !isNaN(quote.pageNo))
          .sort((a, b) => a.pageNo - b.pageNo);

        const sortedQuotes = [...nonNumericPageQuotes, ...numericPageQuotes];

        setQuotes(sortedQuotes);
      } catch (error) {
        console.error('Quotes fetch error:', error);
      }
    };

    if (book && book._id) {
      fetchQuotes();
    }
  }, [book._id, quotesUpdated]);

  const handleShowDetailsModal = (quote) => {
    setSelectedQuote(quote);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => setShowDetailsModal(false);

  const handleShowEditModal = () => {
    setEditQuote({
      text: selectedQuote?.text || '',
      pageNo: selectedQuote?.pageNo || '',
      quoteNotes: selectedQuote?.quoteNotes || [],
      tags: selectedQuote?.tags || []
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
      setErrorMessage('Please do not leave any note empty!');
      return;
    }

    try {
      const response = await axios.patch(`${BACKEND_URL}/api/quote/update`, {
        bookId: book._id,
        quoteId: selectedQuote._id,
        updatedQuote: {
          ...editQuote,
          tags: editQuote.tags || [] 
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const updatedQuotes = quotes.map(q => (q._id === selectedQuote._id ? response.data.quote : q));
      setQuotes(updatedQuotes);

      setSelectedQuote(response.data.quote);

      alert('Changes have been saved successfully.');
      setTimeout(() => {
        handleCloseEditModal();
        handleCloseDetailsModal();
      }, 2000);
    } catch (error) {
      console.error('Save changes error:', error);
      alert('An error occurred while saving changes.');
    }
  };

  const handleEditQuote = () => {
    setEditQuote({
      text: selectedQuote?.text || '',
      pageNo: selectedQuote?.pageNo || '',
      quoteNotes: selectedQuote?.quoteNotes || [],
      tags: selectedQuote?.tags || []
    });
    setShowEditModal(true);
  };

  const handleDeleteQuote = async () => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/quote/delete`, {
        data: {
          bookId: book._id,
          quoteId: selectedQuote._id
        }
      });
      setQuotes(quotes.filter(q => q._id !== selectedQuote._id));
      setQuotesUpdated(prev => !prev);
      handleCloseDeleteModal();
      handleCloseDetailsModal();
      alert(response.data.message);
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting.');
    }
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      const response = await axios.delete(`${BACKEND_URL}/api/quote/delete`, {
        data: {
          bookId: book._id,
          quoteId: selectedQuote._id,
          noteId: noteToDelete
        }
      });

      const updatedQuotes = quotes.map(quote =>
        quote._id === selectedQuote._id
          ? { ...quote, quoteNotes: (quote.quoteNotes || []).filter(note => note._id !== noteToDelete) }
          : quote
      );

      setQuotes(updatedQuotes);

      const updatedSelectedQuote = { ...selectedQuote, quoteNotes: (selectedQuote.quoteNotes || []).filter(note => note._id !== noteToDelete) };
      setSelectedQuote(updatedSelectedQuote);

      alert('Note has been deleted successfully.');
      handleCloseDeleteNoteModal();
    } catch (error) {
      console.error('Note deletion error:', error);
      alert('An error occurred while deleting the note.');
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
    <Container className="text-center">
      <h3 my-2>My Quotes</h3>
      <Container style={{maxHeight: '45vh', overflowY: 'auto'}}>
        {loading ? ( 
          <div>
            <Spinner animation="border" role="status">
              <span className="sr-only">Loading quotes...</span>
            </Spinner>
          </div>
        ) : (
          quotes.length === 0 ? (
            <p>You haven't added any quotes yet.</p>
          ) : (
            quotes.map((quote) => (
              <Card key={quote._id} className="my-2" onClick={() => handleShowDetailsModal(quote)}>
                <Card.Body>
                  <Card.Title>{quote.text}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">Page Number: {quote.pageNo}</Card.Subtitle>
                </Card.Body>
              </Card>
            ))
          )
        )}
      </Container>

      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Quote Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuote && (
            <div>
              <h4>Quote Text</h4>
              <p>{selectedQuote.text}</p>
              <h4>Page Number</h4>
              <p>{selectedQuote.pageNo}</p>
              <h4>Notes</h4>
              <ListGroup>
                {selectedQuote.quoteNotes && selectedQuote.quoteNotes.length > 0 ? (
                  selectedQuote.quoteNotes.map((note) => (
                    <ListGroup.Item key={note._id} className="d-flex justify-content-between align-items-center">
                      {note.text}
                      <Button variant="danger" size="sm" onClick={() => handleShowDeleteNoteModal(note._id)}>
                        Delete
                      </Button>
                    </ListGroup.Item>
                  ))
                ) : (
                  <p>No notes</p>
                )}
              </ListGroup>
              <h4>Tags</h4>
              <p>
                {selectedQuote.tags && selectedQuote.tags.length > 0 ? (
                  selectedQuote.tags.map(tag => `#${tag}`).join(', ')
                ) : (
                  'No tags'
                )}
              </p>
              <Button variant="primary" onClick={handleEditQuote}>Edit</Button>
              <Button variant="danger" onClick={handleShowDeleteModal}>Delete</Button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailsModal}>Close</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Quote</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formQuoteText">
              <Form.Label>Quote Text</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter quote text"
                value={editQuote.text}
                onChange={(e) => setEditQuote({ ...editQuote, text: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formPageNo">
              <Form.Label>Page Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter page number"
                value={editQuote.pageNo}
                onChange={(e) => setEditQuote({ ...editQuote, pageNo: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formQuoteNotes">
              <Form.Label>Notes</Form.Label>
              {editQuote.quoteNotes.map((note, index) => (
                <div key={index} className="mb-2">
                  <Form.Control
                    type="text"
                    placeholder="Enter note"
                    value={note.text}
                    onChange={(e) => {
                      const updatedNotes = [...editQuote.quoteNotes];
                      updatedNotes[index].text = e.target.value;
                      setEditQuote({ ...editQuote, quoteNotes: updatedNotes });
                    }}
                  />
                </div>
              ))}
              <Button
                variant="outline-secondary"
                onClick={() => setEditQuote({
                  ...editQuote,
                  quoteNotes: [...editQuote.quoteNotes, { text: '' }]
                })}
              >
                Add Note
              </Button>
            </Form.Group>
            <Form.Group controlId="formTags">
              <Form.Label>Tags</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter tags (comma separated)"
                value={editQuote.tags.join(', ')}
                onChange={(e) => setEditQuote({ ...editQuote, tags: e.target.value.split(',').map(tag => tag.trim()) })}
              />
            </Form.Group>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>Close</Button>
          <Button variant="primary" onClick={handleSaveChanges}>Save</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Quote</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this quote?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>No</Button>
          <Button variant="danger" onClick={handleDeleteQuote}>Yes, Delete</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteNoteModal} onHide={handleCloseDeleteNoteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this note?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteNoteModal}>No</Button>
          <Button variant="danger" onClick={handleDeleteNote}>Yes, Delete</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Quotes;
