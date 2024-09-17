import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraPhoto, { FACING_MODES } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Spinner from 'react-bootstrap/Spinner';
import WhiteCover from '../utils/whitecover2.jpg';
import { Button, Card, Container, Form, Row, Col } from 'react-bootstrap';

const AddBook = () => {
  const navigate = useNavigate();
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [isbn, setIsbn] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const handleTakePhoto = (dataUri) => {
    const byteString = atob(dataUri.split(',')[1]);
    const mimeString = dataUri.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], 'photo.jpg', { type: mimeString });
    setCoverImage(file);
    setIsCameraOpen(false);
  };

  const handleUploadImage = (e) => {
    const file = e.target.files[0];
    setCoverImage(file);
  };

  const handleSaveBook = async () => {
    try {
      setIsImageUploading(true);
      let coverImagePath = WhiteCover;

      if (coverImage) {
        const formData = new FormData();
        formData.append('coverImage', coverImage);

        const token = localStorage.getItem('token');

        const uploadResponse = await axios.post('http://localhost:5000/api/my-library/upload-cover-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        });

        coverImagePath = uploadResponse.data.filePath.replace(/\\/g, '/').replace('public/', '');
      }

      const bookData = {
        title: bookTitle,
        author,
        pageCount,
        isbn,
        coverImage: coverImagePath,
      };

      await axios.post('http://localhost:5000/api/my-library/add-book', bookData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      alert('Kitap başarıyla eklendi!');
      navigate('/my-shelve');
    } catch (error) {
      console.error('Error adding book:', error);
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleSearchBooks = async () => {
    if (!searchQuery.trim()) {
      alert('Lütfen geçerli yazar/kitap adı ya da ISBN girin.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.get('http://localhost:5000/api/my-library/search-books', {
        params: { query: searchQuery, limit: 20 },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSearchResultToLibrary = async (book) => {
    try {
      const token = localStorage.getItem('token');

      await axios.post('http://localhost:5000/api/my-library/add-book', book, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      alert('Kitap başarıyla eklendi.');
    } catch (error) {
      console.error('Error adding search result book:', error);
    }
  };

  const handleSelectEntryMode = (mode) => {
    if (mode === 'manual') {
      setIsManualEntry(true);
    } else if (mode === 'search') {
      setIsManualEntry(false);
    }
  };

  return (
    <Container className="my-4">
      {!isManualEntry ? (
        <div className="mb-4">
          <Button variant="secondary" className="mb-2" onClick={() => handleSelectEntryMode('manual')}>
            Manuel ekle
          </Button>
          <Form.Group className="mb-2">
            <Form.Control
              type="text"
              placeholder="Ara"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" className="mb-4" onClick={handleSearchBooks}>
            Kitabı ara
          </Button>
          {isLoading && (
            <div className="text-center">
              <Spinner animation="border" />
              <p>Kitaplar yükleniyor...</p>
            </div>
          )}
          <Row xs={1} md={2} lg={3} className="g-4">
            {searchResults.map((book, index) => (
              <Col key={index}>
                <Card className="h-100">
                  {book.coverImage && (
                    <Card.Img
                      variant="top"
                      src={book.coverImage}
                      style={{
                        width: '100%',
                        height: '300px',
                        objectFit: 'contain',
                        borderRadius: '0.25rem', // Optional: to give rounded corners
                      }}
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <Card.Text>
                      Yazar: {book.author}
                      <br />
                      Sayfa sayısı: {book.pageCount}
                      <br />
                      ISBN: {book.isbn}
                    </Card.Text>
                    <Button variant="info" size="sm" onClick={() => handleAddSearchResultToLibrary(book)}>
                      Kitaplığıma ekle
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <Card className="p-4">
          <Card.Title className="mb-4">Manuel ekle</Card.Title>
          <Button variant="secondary" className="mb-4" onClick={() => handleSelectEntryMode('search')}>
            Kitap aramaya dön
          </Button>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Kitap adı"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Yazar"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="number"
              placeholder="Sayfa sayısı"
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="ISBN"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Kapak resmi</Form.Label>
            {isCameraOpen ? (
              <CameraPhoto
                onTakePhoto={(dataUri) => handleTakePhoto(dataUri)}
                idealFacingMode={FACING_MODES.ENVIRONMENT}
              />
            ) : (
              <>
                <Button variant="info" className="mb-2" onClick={() => setIsCameraOpen(true)}>
                  Fotoğraf çek
                </Button>
                <Form.Control type="file" accept="image/*" onChange={handleUploadImage} />
              </>
            )}
          </Form.Group>
          <Button variant="primary" onClick={handleSaveBook} disabled={isImageUploading}>
            Kitabı ekle
          </Button>
        </Card>
      )}
    </Container>
  );
};

export default AddBook;
