import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Col, Row, Container, Button, ListGroup, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import BookDetails from './BookDetails';
import Quotes from './Quotes';
import Notes from './Notes';

const MyShelve = ({ userId }) => {
  const [books, setBooks] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showTagModal, setShowTagModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/my-shelve/user/${userId}`);
        setBooks(response.data);
      } catch (error) {
        console.error('Error fetching books:', error);
        setErrorMessage('Kitaplar yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchBooks();
    }
  }, [userId]);

  const handleDeleteBook = async () => {
    if (!bookToDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/my-shelve/book/${bookToDelete}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setBooks(books.filter((book) => book._id !== bookToDelete));
      setShowDeleteModal(false);
      setErrorMessage('');
    } catch (error) {
      console.error('Error deleting book:', error);
      setErrorMessage('Kitap silinirken bir hata oluştu.');
    }
  };

  const handleSelectBook = (book) => {
    setSelectedBook(book);
  };

  const handleViewMode = () => {
    if (selectedBook) {
      navigate('/view-mode', { state: { book: selectedBook } });
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Kitaplığım</h1>
        <div>
          <Button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="me-2">
            {viewMode === 'grid' ? 'Kitaplarımı Listele' : 'Kapak Resimleriyle Gör'}
          </Button>
          <Button variant="info" onClick={() => setShowTagModal(true)}>
            Tag ile Ara
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" />
          <p>Kitaplığınız yükleniyor...</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <Row>
              {books.length === 0 ? (
                <Col><p>Kitaplığınız boş</p></Col>
              ) : (
                books.map((book) => {
                  const coverImageUrl = book.coverImage 
                    ? (book.coverImage.startsWith('uploads') 
                        ? `http://localhost:5000/${book.coverImage}` 
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
                            <strong>Sayfa Sayısı:</strong> {book.pageCount}<br />
                            <strong>ISBN:</strong> {book.isbn || 'N/A'}
                          </Card.Text>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setBookToDelete(book._id);
                              setShowDeleteModal(true); 
                            }}
                            style={{ position: 'absolute', bottom: '10px', right: '10px' }}
                          >
                            Sil
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
                <ListGroup.Item>Kitaplığınız boş..</ListGroup.Item>
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
                      <div><strong>Sayfa Sayısı:</strong> {book.pageCount}</div>
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
                      Sil
                    </Button>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          )}
        </>
      )}

      {selectedBook && (
        <Modal show={true} onHide={() => setSelectedBook(null)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{selectedBook.title}</Modal.Title>
            <Button variant="primary" className="ml-auto" onClick={handleViewMode}>
              Okuma Modu
            </Button>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6} className="d-flex flex-column justify-content-center align-items-center">
                <BookDetails book={selectedBook} />
              </Col>
              <Col md={6} className="d-flex flex-column justify-content-center align-items-center">
                <Row className="w-100 mb-2">
                  <Col className="d-flex justify-content-center">
                    <Quotes book={selectedBook} />
                  </Col>
                </Row>
                <Row className="w-100">
                  <Col className="d-flex justify-content-center">
                    <Notes book={selectedBook} />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setSelectedBook(null)}>Kapat</Button>
          </Modal.Footer>
        </Modal>
      )}

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Kitap Sil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bu kitabı kaldırmak istediğinize emin misiniz?</p>
          {errorMessage && <p className="text-danger">{errorMessage}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>İptal</Button>
          <Button variant="danger" onClick={handleDeleteBook}>Sil</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showTagModal} onHide={() => setShowTagModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tag ile Ara</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button variant="secondary" onClick={() => { 
              setShowTagModal(false); 
              navigate('/tag-search-books'); 
            }}>Kitap Ara</Button>
          <Button variant="secondary" onClick={() => { 
              setShowTagModal(false); 
              navigate('/tag-search'); 
            }}>
              Alıntı/Not Ara
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTagModal(false)}>Kapat</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyShelve;
