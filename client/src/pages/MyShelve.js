import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Col, Row, Container, Button, ListGroup, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

const MyShelve = ({ userId }) => {
  const [books, setBooks] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showTagModal, setShowTagModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/my-shelve/user/${userId}`);
        setBooks(response.data);
      } catch (error) {
        console.error('Error fetching books:', error);
        setErrorMessage('An error occurred while loading your books.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchBooks();
  }, [userId]);

  const handleDeleteBook = async () => {
    if (!bookToDelete) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/my-shelve/book/${bookToDelete}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      setBooks(books.filter((book) => book._id !== bookToDelete));
      setShowDeleteModal(false);
      setErrorMessage('');
    } catch (error) {
      console.error('Error deleting book:', error);
      setErrorMessage('An error occurred while deleting the book.');
    }
  };

  const handleSelectBook = (book) => {
navigate(`/book/${book._id}`, { state: { userId, book } });
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>My Library</h1>
        <div>
          <Button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="me-2">
            {viewMode === 'grid' ? 'List My Books' : 'View Covers'}
          </Button>
          <Button variant="info" onClick={() => setShowTagModal(true)}>
            Search by Tag
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" />
          <p>Loading your library...</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <Row>
              {books.length === 0 ? (
                <Col><p>Your library is empty</p></Col>
              ) : (
                books.map((book) => {
                  const coverImageUrl = book.coverImage 
                    ? (book.coverImage.startsWith('uploads') 
                        ? `${BACKEND_URL}/${book.coverImage}` 
                        : book.coverImage) 
                    : 'https://via.placeholder.com/150';
                  return (
                    <Col md={4} lg={3} key={book._id} className="mb-4">
                      <Card className="h-100" onClick={() => handleSelectBook(book)} style={{ cursor: 'pointer' }}>
                        <Card.Img variant="top" src={coverImageUrl} alt={book.title} />
                        <Card.Body>
                          <Card.Title>{book.title}</Card.Title>
                          <Card.Subtitle className="mb-2 text-muted">{book.author}</Card.Subtitle>
                          <Card.Text>
                            <strong>Page Count:</strong> {book.pageCount}<br />
                          </Card.Text>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className='m-3 opacity-85'
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setBookToDelete(book._id);
                              setShowDeleteModal(true); 
                            }}
                            style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize:"0.8rem" }}
                          >
                            Delete
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })
              )}
            </Row>
          ) : (
            <ListGroup>
              {books.length === 0 ? (
                <ListGroup.Item>Your library is empty..</ListGroup.Item>
              ) : (
                books.map((book) => (
                  <ListGroup.Item 
                    key={book._id} 
                    className="d-flex justify-content-between align-items-center"
                    onClick={() => handleSelectBook(book)} 
                    style={{ cursor: 'pointer' }}
                  >
                    <div>
                      <strong>{book.title}</strong>, {book.author}
                      <div><strong>Page Count:</strong> {book.pageCount}</div>
                      <div><strong>ISBN:</strong> {book.isbn || 'N/A'}</div>
                    </div>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setBookToDelete(book._id);
                        setShowDeleteModal(true); 
                      }}
                    >
                      Delete
                    </Button>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          )}
        </>
      )}

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Book</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to remove this book?</p>
          {errorMessage && <p className="text-danger">{errorMessage}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteBook}>Delete</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showTagModal} onHide={() => setShowTagModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Search by Tag</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button variant="secondary" onClick={() => { 
              setShowTagModal(false); 
              navigate('/tag-search-books'); 
            }}>Search Books</Button>
          <Button variant="secondary" onClick={() => { 
              setShowTagModal(false); 
              navigate('/tag-search'); 
            }}>
              Search Quotes/Notes
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTagModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyShelve;
