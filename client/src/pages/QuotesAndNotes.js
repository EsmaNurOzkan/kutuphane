import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Card, ListGroup, Form, Nav, Modal, Navbar } from 'react-bootstrap';
import AddQuote from './AddQuote';
import AddNote from './AddNote';
import Export from './Export';

const QuotesAndNotes = ({ book }) => {
  const [quotes, setQuotes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isEditing, setIsEditing] = useState({ itemId: null, isQuote: null });
  const [editText, setEditText] = useState('');
  const [editPageNo, setEditPageNo] = useState('');
  const [newQuoteNotes, setNewQuoteNotes] = useState([]);
  const [isAdding, setIsAdding] = useState({ quote: false, note: false });
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState('Modal');

  const fetchBookData = async () => {
    if (!book?._id) {
      console.error("book._id tanımlı değil.");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/my-shelve/books/${book._id}/details`);
      if (response.data && response.data.quotes && response.data.notes) {
        setQuotes(response.data.quotes);
        setNotes(response.data.notes);
      } else {
        console.error("Beklenen yanıt formatı alınamadı:", response.data);
      }
    } catch (error) {
      console.error('Error fetching book data:', error);
    }
  };

  useEffect(() => {
    fetchBookData();
  }, [book?._id]);

  const handleUpdateQuote = async () => {
    try {
      await axios.patch('http://localhost:5000/api/my-shelve/quotes', {
        bookId: book._id,
        quoteId: isEditing.itemId,
        text: editText,
        quoteNotes: newQuoteNotes,
        pageNo: editPageNo
      });

      fetchBookData();
    } catch (error) {
      console.error('Error updating quote:', error);
    } finally {
      setIsEditing({ itemId: null, isQuote: null });
      setEditText('');
      setEditPageNo('');
      setNewQuoteNotes([]);
    }
  };

  const handleUpdateQuoteNote = async (quoteId, quoteNoteId) => {
    try {
      await axios.patch(`http://localhost:5000/api/my-shelve/quotes/${book._id}/${quoteId}/quote-notes/${quoteNoteId}`, {
        text: editText
      });

      fetchBookData();
    } catch (error) {
      console.error('Error updating quote note:', error);
    } finally {
      setIsEditing({ itemId: null, isQuote: null });
      setEditText('');
    }
  };

  const handleUpdateNote = async () => {
    try {
      await axios.patch('http://localhost:5000/api/my-shelve/notes', {
        bookId: book._id,
        noteId: isEditing.itemId,
        text: editText,
        pageNo: editPageNo
      });

      fetchBookData();
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setIsEditing({ itemId: null, isQuote: null });
      setEditText('');
      setEditPageNo('');
    }
  };

  const handleUpdate = () => {
    if (isEditing.isQuote) {
      if (newQuoteNotes.length > 0) {
        handleUpdateQuote();
      } else {
        handleUpdateQuoteNote(isEditing.itemId, isEditing.itemId); // Replace with actual quote note ID
      }
    } else {
      handleUpdateNote();
    }
  };

  const handleEditClick = (item, isQuote) => {
    setIsEditing({ itemId: item._id, isQuote });
    setEditText(item.text);
    setEditPageNo(item.pageNo);
    if (isQuote && item.quoteNotes) {
      setNewQuoteNotes(item.quoteNotes);
    }
  };

  const handleDelete = async (itemId, isQuote = true) => {
    const url = isQuote 
      ? `http://localhost:5000/api/my-shelve/quotes/${book._id}/${itemId}`
      : `http://localhost:5000/api/my-shelve/notes/${book._id}/${itemId}`;
  
    try {
      await axios.delete(url);
  
      if (isQuote) {
        setQuotes(quotes.filter(quote => quote._id !== itemId));
      } else {
        setNotes(notes.filter(note => note._id !== itemId));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleShowModal = (content, title) => {
    setModalContent(
      React.cloneElement(content, { onClose: handleCloseModal })
    );
    setModalTitle(title);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalContent(null);
    setModalTitle('Modal');
    fetchBookData();
  };

  return (
    <Container>
      <Navbar bg="light" variant="light" className="mb-3">
        <Nav className="me-auto">
          <Nav.Link onClick={() => handleShowModal(<AddQuote bookId={book._id} pageCount={book.pageCount} />, 'Add Quote')}>
            Add Quote
          </Nav.Link>
          <Nav.Link onClick={() => handleShowModal(<AddNote bookId={book._id} pageCount={book.pageCount} />, 'Add Note')}>
            Add Note
          </Nav.Link>
          <Nav.Link onClick={() => handleShowModal(<Export bookId={book._id} pageCount={book.pageCount} />, 'Export')}>
            Export
          </Nav.Link>
        </Nav>
      </Navbar>
      
      <div style={{ maxHeight: "40vh", overflowY: 'auto', overflowX: 'hidden' }}>
        <Row>
          <Col>
            <ListGroup>
              {quotes.map((quote) => (
                <ListGroup.Item key={quote._id}>
                  <Card>
                    <Card.Body>
                      {isEditing.itemId === quote._id && isEditing.isQuote ? (
                        <Form>
                          <Form.Group>
                            <Form.Label>Quote</Form.Label>
                            <Form.Control 
                              as="textarea" 
                              rows={3} 
                              value={editText} 
                              onChange={(e) => setEditText(e.target.value)} 
                            />
                          </Form.Group>
                          <Form.Group>
                            <Form.Label>Notes</Form.Label>
                            <Form.Control 
                              as="textarea" 
                              rows={2} 
                              value={newQuoteNotes} 
                              onChange={(e) => setNewQuoteNotes(e.target.value.split('\n'))} 
                            />
                          </Form.Group>
                          <Form.Group>
                            <Form.Label>Page Number</Form.Label>
                            <Form.Control 
                              type="text" 
                              value={editPageNo} 
                              onChange={(e) => setEditPageNo(e.target.value)} 
                            />
                          </Form.Group>
                          <Button onClick={handleUpdate}>Update</Button>
                        </Form>
                      ) : (
                        <>
                          <Card.Text>{quote.text}</Card.Text>
                          {quote.quoteNotes && (
                            <Card.Text>
                              {quote.quoteNotes.map((note, index) => (
                                <div key={index}>
                                  <i>{note}</i>
                                </div>
                              ))}
                            </Card.Text>
                          )}
                          <Card.Text>Page: {quote.pageNo}</Card.Text>
                          <Button size="sm" onClick={() => handleEditClick(quote, true)}>Edit</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(quote._id, true)}>Delete</Button>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
        </Row>
      </div>

      <div style={{ maxHeight: "40vh", overflowY: 'auto', overflowX: 'hidden' }}>
        <Row>
          <Col>
            <ListGroup>
              {notes.map((note) => (
                <ListGroup.Item key={note._id}>
                  <Card>
                    <Card.Body>
                      {isEditing.itemId === note._id && !isEditing.isQuote ? (
                        <Form>
                          <Form.Group>
                            <Form.Label>Note</Form.Label>
                            <Form.Control 
                              as="textarea" 
                              rows={3} 
                              value={editText} 
                              onChange={(e) => setEditText(e.target.value)} 
                            />
                          </Form.Group>
                          <Form.Group>
                            <Form.Label>Page Number</Form.Label>
                            <Form.Control 
                              type="text" 
                              value={editPageNo} 
                              onChange={(e) => setEditPageNo(e.target.value)} 
                            />
                          </Form.Group>
                          <Button onClick={handleUpdate}>Update</Button>
                        </Form>
                      ) : (
                        <>
                          <Card.Text>{note.text}</Card.Text>
                          <Card.Text>Page: {note.pageNo}</Card.Text>
                          <Button size="sm" onClick={() => handleEditClick(note, false)}>Edit</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(note._id, false)}>Delete</Button>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
        </Row>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalContent}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default QuotesAndNotes;
