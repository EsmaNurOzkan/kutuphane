import React, { useContext, useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Nav, Navbar, Stack } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import AddQuote from './AddQuote';
import AddNote from './AddNote';
import Export from './Export';
import AddTag from "./AddTag";
import axios from 'axios'; 
import { AppContext } from '../AppContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

const BookDetails = ({ userId: propUserId }) => {
  const { notesUpdated, quotesUpdated } = useContext(AppContext);

  const [book, setBook] = useState(null);
  const [tags, setTags] = useState([]); 
  const [showModal, setShowModal] = useState('');
  const [selectedTag, setSelectedTag] = useState(null); 
  const [notesCount, setNotesCount] = useState(0);
  const [quotesCount, setQuotesCount] = useState(0);

  const { bookId: routeBookId } = useParams();

  useEffect(() => {
    if (routeBookId) localStorage.setItem("bookId", routeBookId);
    if (propUserId) localStorage.setItem("userId", propUserId);
  }, [routeBookId, propUserId]);

  const effectiveBookId = routeBookId || localStorage.getItem("bookId");
  const effectiveUserId = propUserId || localStorage.getItem("userId");

  const fetchBook = async () => {
    try {
      if (!effectiveUserId || !effectiveBookId) return;

      const response = await axios.get(`${BACKEND_URL}/api/my-shelve/user/${effectiveUserId}`);
      const books = response.data;
      const foundBook = books.find(b => b._id === effectiveBookId);

      if (foundBook) {
        setBook(foundBook);
        setNotesCount(foundBook.notes.length);
        setQuotesCount(foundBook.quotes.length);
      }
    } catch (error) {
      console.error('Error fetching book:', error);
    }
  };

  const fetchTags = async () => {
    try {
      if (!book?._id) return;
      const response = await axios.get(`${BACKEND_URL}/api/my-shelve/books/${book._id}/tags`);
      setTags(response.data.tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchUpdatedBook = async () => {
    try {
      if (!book?._id) return;
      const response = await axios.get(`${BACKEND_URL}/api/my-shelve/books/${book._id}/details`);
      setNotesCount(response.data.notes.length);
      setQuotesCount(response.data.quotes.length);
    } catch (error) {
      console.error('Error fetching updated book data:', error);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [effectiveBookId, effectiveUserId]);

  useEffect(() => {
    if (book && book._id) fetchTags();
  }, [book]);

  useEffect(() => {
    if (book && book._id) fetchUpdatedBook();
  }, [notesUpdated, quotesUpdated]);

  const handleShow = (modalType) => setShowModal(modalType);
  const handleClose = () => {
    setShowModal('');
    setSelectedTag(null);
  };

  const handleSuccess = (modalType) => {
    if (modalType === 'addTag') fetchTags();
    setTimeout(() => handleClose(), 2000);
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    setShowModal('viewTag');
  };

  const handleDeleteTag = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/api/my-shelve/books/${book._id}/tags`, {
        data: { tagId: selectedTag._id }
      });
      setTags(tags.filter(tag => tag._id !== selectedTag._id));
      handleClose();
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  if (!book) return <p className="text-center mt-5">Loading book details...</p>;

  const coverImageUrl = book.coverImage 
    ? (book.coverImage.startsWith('uploads') 
        ? `${BACKEND_URL}/${book.coverImage}` 
        : book.coverImage) 
    : 'https://via.placeholder.com/150';

  let ModalContent;
  switch (showModal) {
    case 'addQuote':
      ModalContent = <AddQuote bookId={book._id} pageCount={book.pageCount} onSuccess={handleSuccess} />;
      break;
    case 'addNote':
      ModalContent = <AddNote bookId={book._id} pageCount={book.pageCount} onSuccess={handleSuccess} />;
      break;
    case 'addTag':
      ModalContent = <AddTag bookId={book._id} onSuccess={handleSuccess} />;
      break;
    case 'export':
      ModalContent = <Export bookId={book._id} />;
      break;
    case 'viewTag':
      ModalContent = (
        <>
          <h5>#{selectedTag.text}</h5>
          <Button variant="danger" onClick={handleDeleteTag}>Delete</Button>
        </>
      );
      break;
    default:
      ModalContent = null;
  }

  return (
    <Container className="mt-4">
      <Navbar bg="light" expand="lg" className='fs-6'>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link onClick={() => handleShow('addQuote')}>Add Quote</Nav.Link>
            <Nav.Link onClick={() => handleShow('addNote')}>Add Page Note</Nav.Link>
            <Nav.Link onClick={() => handleShow('addTag')}>Add Tag</Nav.Link>
            <Nav.Link onClick={() => handleShow('export')}>Export</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Row className="justify-content-center my-4">
      <Col md={10}>
        <Card className="p-3 shadow-sm">
          <Row>
            <Col md={6} className="d-flex justify-content-center align-items-start">
           
              <Card.Img
              src={coverImageUrl}
              alt={book.title}
              style={{
              width: "100%",
              maxWidth: "400px",
              height: "auto",
              objectFit: "contain",
              borderRadius: "8px",
              marginTop: "10px",
              imageRendering: "crisp-edges" 
            }}
          />


            </Col>

            <Col md={6}>
              <Card.Body className='mt-4'>
                <Card.Title className="fs-2 fw-bold">{book.title}</Card.Title>
                <Card.Subtitle className="my-2 text-muted fs-5">{book.author}</Card.Subtitle>
                  <Stack className='my-4' gap={1}> 
                  <div><strong>Page Count:</strong> {book.pageCount}</div>
                  <div><strong>Publisher:</strong> {book.publisher}</div>
                  <div><strong>Published date:</strong> {book.publishDate}</div>
                  <div><strong>ISBN:</strong> {book.isbn}</div>
                  <div className='my-3'>
                    This book has <strong>{quotesCount}</strong> quotes and <strong>{notesCount}</strong> notes!
                  </div>
                </Stack>

                <div className="my-2">
                  <strong>Tags:</strong>
                  <div className="mt-2">
                    {tags.length > 0 ? (
                      tags.map(tag => (
                        <span
                          key={tag._id}
                          className="badge bg-primary text-white me-1"
                          style={{ fontWeight: "bold", cursor: "pointer" }}
                          onClick={() => handleTagClick(tag)}
                        >
                          #{tag.text}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted"> No tags yet</span>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>


      <Modal
        show={showModal !== ''}
        onHide={handleClose}
        centered
        size="lg" 
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {showModal === 'addQuote' && 'Add Quote'}
            {showModal === 'addNote' && 'Add Page Note'}
            {showModal === 'export' && 'Export'}
            {showModal === 'addTag' && 'Add Tag'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{ModalContent}</Modal.Body>
      </Modal>
    </Container>
  );
};

export default BookDetails;
