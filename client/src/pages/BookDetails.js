import React, { useContext, useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Nav, Navbar } from 'react-bootstrap';
import AddQuote from './AddQuote';
import AddNote from './AddNote';
import Export from './Export';
import AddTag from "./AddTag";
import axios from 'axios'; 
import { AppContext } from '../AppContext';


const BookDetails = ({ book }) => {
  const { notesUpdated, setNotesUpdated } = useContext(AppContext); 
  const { quotesUpdated, setQuotesUpdated } = useContext(AppContext); 
  const [showModal, setShowModal] = useState('');
  const [tags, setTags] = useState([]); 
  const [selectedTag, setSelectedTag] = useState(null); 
  const [notesCount, setNotesCount] = useState(book.notes.length);
  const [quotesCount, setQuotesCount] = useState(book.quotes.length);

  const handleShow = (modalType) => {
    setShowModal(modalType);
  };

  const handleClose = () => {
    setShowModal('');
    setSelectedTag(null); 
  };

  const handleSuccess = (modalType) => {
    if (modalType === 'addTag') {
      fetchTags();
    }
    setTimeout(() => {
      handleClose(); 
    }, 2000);
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/my-shelve/books/${book._id}/tags`);
      setTags(response.data.tags); 
      console.log(response.data.tags); 
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchUpdatedBook = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/my-shelve/books/${book._id}/details`);
      setNotesCount(response.data.notes.length);
      setQuotesCount(response.data.quotes.length);
    } catch (error) {
      console.error('Error fetching updated book data:', error);
    }
  };

  useEffect(() => {
    if (book && book._id) {
      fetchTags();
    }
  }, [book]);

  useEffect(() => {
    if (book && book._id) {
      fetchUpdatedBook();
    }
  }, [notesUpdated, quotesUpdated]);

  const handleTagClick = (tag) => {
    setSelectedTag(tag); 
    setShowModal('viewTag');
  };

  const handleDeleteTag = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/my-shelve/books/${book._id}/tags`, {
        data: { tagId: selectedTag._id } 
      });
      setTags(tags.filter(tag => tag._id !== selectedTag._id));
      handleClose(); 
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  if (!book) return null;

  const coverImageUrl = book.coverImage 
    ? (book.coverImage.startsWith('uploads') 
        ? `http://localhost:5000/${book.coverImage}` 
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
          <Button variant="danger" onClick={handleDeleteTag}>Sil</Button>
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
            <Nav.Link onClick={() => handleShow('addQuote')}>Alıntı Ekle</Nav.Link>
            <Nav.Link onClick={() => handleShow('addNote')}>Sayfa Notu Ekle</Nav.Link>
            <Nav.Link onClick={() => handleShow('addTag')}>Etiket Ekle</Nav.Link>
            <Nav.Link onClick={() => handleShow('export')}>Dışa Aktar</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Row className="justify-content-center mb-4">
        <Col>
          <Card>
            <Card.Img variant="top" src={coverImageUrl} alt={book.title} />
            <Card.Body>
              <Card.Title>{book.title}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">{book.author}</Card.Subtitle>
              <Card.Text>
                id: {book._id}
                <strong>Sayfa Sayısı:</strong> {book.pageCount} <br />
                <strong>ISBN:</strong> {book.isbn} <br /> <br />
                Bu kitapta <strong>{quotesCount}</strong> alıntınız ve <strong>{notesCount}</strong> notunuz var!
              </Card.Text>
              <Card.Footer>
                <strong>Etiketler:</strong>
                <div className="mt-2">
                  {tags.map(tag => (
                    <span 
                      key={tag._id} 
                      className="badge bg-primary text-white me-1" 
                      style={{ fontWeight: 'bold', cursor: 'pointer' }} 
                      onClick={() => handleTagClick(tag)}
                    >
                      #{tag.text}
                    </span>
                  ))}
                </div>
              </Card.Footer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal !== ''} onHide={handleClose} centered size={showModal === 'viewTag' ? 'sm' : ''}>
        <Modal.Header closeButton>
          <Modal.Title>
            {showModal === 'addQuote' && 'Alıntı Ekle'}
            {showModal === 'addNote' && 'Sayfa Notu Ekle'}
            {showModal === 'export' && 'Dışa Aktar'}
            {showModal === 'viewTag' && 'Tag Detayları'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {ModalContent}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default BookDetails;
