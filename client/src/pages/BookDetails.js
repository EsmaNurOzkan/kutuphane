

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Nav, Navbar, Dropdown, DropdownButton } from 'react-bootstrap';
import AddQuote from './AddQuote';
import AddNote from './AddNote';
import Export from './Export';
import AddTag from "./AddTag";
import axios from 'axios'; 

const BookDetails = ({ book }) => {
  const [showModal, setShowModal] = useState('');
  const [tags, setTags] = useState([]); 
  const [selectedTag, setSelectedTag] = useState(null); 

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

  useEffect(() => {
    if (book && book._id) {
      fetchTags();
    }
  }, [book]);

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
    <Container  className="mt-4">
      <Row className="justify-content-center mb-4">
        <Col  >
          <Dropdown>
            <Dropdown.Toggle className="btn btn-sm" variant="outline-secondary" id="dropdown-basic">
              İşlemler
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleShow('addQuote')}>Alıntı Ekle</Dropdown.Item>
              <Dropdown.Item onClick={() => handleShow('addNote')}>Sayfa Notu Ekle</Dropdown.Item>
              <Dropdown.Item onClick={() => handleShow('addTag')}>Etiket Ekle</Dropdown.Item>
              <Dropdown.Item onClick={() => handleShow('export')}>Dışa Aktar</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col  >
          <Card>
            <Card.Img variant="top" src={coverImageUrl} alt={book.title} />
            <Card.Body>
              <Card.Title>{book.title}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">{book.author}</Card.Subtitle>
              <Card.Text>
                <strong>Sayfa Sayısı:</strong> {book.pageCount} <br />
                <strong>ISBN:</strong> {book.isbn} <br /> <br />
                Bu kitapta <strong>{book.quotes.length}</strong> alıntınız ve <strong>{book.notes.length}</strong> notunuz var!

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
