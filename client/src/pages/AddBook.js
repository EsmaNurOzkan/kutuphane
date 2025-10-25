import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraPhoto, { FACING_MODES } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Spinner from 'react-bootstrap/Spinner';
import WhiteCover from '../utils/whitecover2.jpg';
import { Button, Card, Container, Form, Row, Col } from 'react-bootstrap';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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

        const uploadResponse = await axios.post(`${BACKEND_URL}/api/my-library/upload-cover-image`, formData, {
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

      await axios.post(`${BACKEND_URL}/api/my-library/add-book`, bookData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      alert('Book added successfully!');
      navigate('/my-shelve');
    } catch (error) {
      console.error('Error adding book:', error);
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleSearchBooks = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a valid author/book name or ISBN.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.get(`${BACKEND_URL}/api/my-library/search-books`, {
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

      await axios.post(`${BACKEND_URL}/api/my-library/add-book`, book, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      alert('Book added to your library successfully.');
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
            Add manually
          </Button>
          <Form.Group className="mb-2">
            <Form.Control
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" className="mb-4" onClick={handleSearchBooks}>
            Search book
          </Button>
          {isLoading && (
            <div className="text-center">
              <Spinner animation="border" />
              <p>Loading books...</p>
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
                        borderRadius: '0.25rem',
                      }}
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <Card.Text>
                      Author: {book.author}
                      <br />
                      Page count: {book.pageCount}
                      <br />
                      ISBN: {book.isbn}
                    </Card.Text>
                    <Button variant="info" size="sm" onClick={() => handleAddSearchResultToLibrary(book)}>
                      Add to my library
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <Card className="p-4">
          <Card.Title className="mb-4">Add manually</Card.Title>
          <Button variant="secondary" className="mb-4" onClick={() => handleSelectEntryMode('search')}>
            Back to search
          </Button>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Book title"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="number"
              placeholder="Page count"
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
            <Form.Label>Cover image</Form.Label>
            {isCameraOpen ? (
              <CameraPhoto
                onTakePhoto={(dataUri) => handleTakePhoto(dataUri)}
                idealFacingMode={FACING_MODES.ENVIRONMENT}
              />
            ) : (
              <>
                <Button variant="info" className="mb-2" onClick={() => setIsCameraOpen(true)}>
                  Take photo
                </Button>
                <Form.Control type="file" accept="image/*" onChange={handleUploadImage} />
              </>
            )}
          </Form.Group>
          <Button variant="primary" onClick={handleSaveBook} disabled={isImageUploading}>
            Add book
          </Button>
        </Card>
      )}
    </Container>
  );
};

export default AddBook;
