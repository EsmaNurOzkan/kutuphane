import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraPhoto, { FACING_MODES } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Spinner from 'react-bootstrap/Spinner';
import WhiteCover from '../utils/whitecover2.jpg';
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import { Button, Card, Container, Form, Row, Col, Modal } from 'react-bootstrap';

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
  const [isRankButton, setIsRankButton] = useState(false);
  const [isListView, setIsListView] = useState(false);
  const [sortOption, setSortOption] = useState('Recommended ranking');
  const [suggestions, setSuggestions] = useState([]); 
  const [showModal, setShowModal] = useState(false);  
  const [selectedBook, setSelectedBook] = useState(null); 
  const [debounceTimer, setDebounceTimer] = useState(null);


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


    const handleSearchInputChange = (e) => {
      const value = e.target.value;
      setSearchQuery(value);

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      if (!value.trim()) {
        setSuggestions([]);
        return;
      }

      const timer = setTimeout(async () => {
        try {
          const response = await axios.get(`${BACKEND_URL}/api/my-library/search-books`, {
            params: { query: value, limit: 5 },
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          setSuggestions(response.data || []);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      }, 500); 
      setDebounceTimer(timer);
    };


 const handleSearchBooks = async () => {
  if (!searchQuery.trim()) {
    alert('Please enter a valid author/book name or ISBN.');
    return;
  }

  setIsLoading(true);
  setSuggestions([]); 

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
    setIsRankButton(true);
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
    
    if (error.response && error.response.data.message === 'This book is already in your library.') {
      alert('This book is already in your library.');
    } else {
      alert('An error occurred while adding the book.');
    }
  }
};

  const handleSortBooks = (option) => {
    setSortOption(option);

    let sortedBooks = [...searchResults];

    switch (option) {
      case 'Alphabetical':
        sortedBooks.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;

      case 'Newest to oldest':
        sortedBooks.sort((a, b) => {
          const dateA = new Date(a.publishDate || 0);
          const dateB = new Date(b.publishDate || 0);
          return dateB - dateA; 
        });
        break;

      case 'Oldest to newest':
        sortedBooks.sort((a, b) => {
          const dateA = new Date(a.publishDate || 0);
          const dateB = new Date(b.publishDate || 0);
          return dateA - dateB; 
        });
        break;

      default:
      
        return;
    }

    setSearchResults(sortedBooks);
  };

  const handleSelectEntryMode = (mode) => {
    if (mode === 'manual') {
      setIsManualEntry(true);
    } else if (mode === 'search') {
      setIsManualEntry(false);
    }
  };

  const searchRef = useRef(null); 

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setSuggestions([]); 
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
  }, []);


  return (
    <Container className="my-4">
      {!isManualEntry ? (
        <div className="mb-4">

        <Form.Group className="m-2" ref={searchRef}>
          <div className='d-flex justify-content-center'>
            <Form.Control
            type="text"
            placeholder="Book title, author or publisher"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchBooks();
              }
            }}
            className="rounded-pill shadow-sm px-3 w-50"
          />
          
          </div>
          <div className='d-flex justify-content-center'>
            <Button variant="primary" size = "sm" className="m-3" onClick={handleSearchBooks}> Search book </Button> 
          <Button variant="secondary" size = "sm" className="m-3" onClick={() => handleSelectEntryMode('manual')}> Add manually </Button>

          </div>

        {suggestions.length > 0 && (
          <ul
            className="list-group position-absolute"
            style={{ zIndex: 1000, width: '70%' }}
          >
            {suggestions.map((book, index) => (
              <li
                key={index}
                className="list-group-item list-group-item-action"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSelectedBook(book);
                  setShowModal(true);
                  setSuggestions([]);
                  setSearchQuery('');
                }}
              >
                {book.title} - {book.author}
              </li>
            ))}
          </ul>
  )}

  </Form.Group>
          <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
              <Modal.Header closeButton>
                <Modal.Title>{selectedBook?.title}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Card>
                  {selectedBook?.coverImage && (
                    <Card.Img
                      variant="top"
                      src={selectedBook.coverImage}
                      style={{ width: '100%', height: '300px', objectFit: 'contain' }}
                    />
                  )}
                  <Card.Body>
                    <Card.Text>
                      <u>Author:</u> {selectedBook?.author} <br />
                      <u>Publisher:</u> {selectedBook?.publisher} <br />
                      <u>Published Date:</u> {selectedBook?.publishDate} <br />
                      <u>Page count:</u> {selectedBook?.pageCount} <br />
                      <u>ISBN:</u> {selectedBook?.isbn}
                    </Card.Text>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => {
                        handleAddSearchResultToLibrary(selectedBook);
                        setShowModal(false);
                      }}
                    >
                      Add to my library
                    </Button>
                  </Card.Body>
                </Card>
              </Modal.Body>
        </Modal>

          {isLoading && (
            <div className="text-center">
              <Spinner animation="border" />
              <p>Loading books...</p>
            </div>
          )}
            {isRankButton && (
            
            <div className="d-flex align-items-center mb-3">
          <div className="flex-grow-1 d-flex justify-content-start">
            <Button
              variant={isListView ? "primary" : "outline-primary"}
              size="sm"
              onClick={() => setIsListView(!isListView)}
            >
              {isListView ? "Card view" : "List view"}
            </Button>
          </div>

        <div className="ms-auto">
          <Dropdown as={NavItem}>
            <Dropdown.Toggle>{sortOption}</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleSortBooks('Recommended ranking')}>
                Recommended ranking
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleSortBooks('Alphabetical')}>
                Alphabetical
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleSortBooks('Newest to oldest')}>
                Newest to oldest
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleSortBooks('Oldest to newest')}>
                Oldest to newest
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

           )}

           {isListView ? (

  <div className="mt-3">
    <table className="table table-striped align-middle">
      <thead>
        <tr>
          <th>Title</th>
          <th>Author</th>
          <th>Publisher</th>
          <th>Published Date</th>
          <th>Page Count</th>
          <th>ISBN</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {searchResults.map((book, index) => (
          <tr key={index}>
            <td>{book.title}</td>
            <td>{book.author}</td>
            <td>{book.publisher}</td>
            <td>{book.publishDate}</td>
            <td>{book.pageCount}</td>
            <td>{book.isbn}</td>
            <td>
              <Button
                variant="info"
                size="sm"
                onClick={() => handleAddSearchResultToLibrary(book)}
              >
                Add
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
) : (

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
          <Card.Body className="d-flex flex-column">
            <Card.Title>{book.title}</Card.Title>
            <Card.Text className="flex-grow-1" >
              <u>Author:</u> {book.author}
              <br />
              <u>Publisher:</u> {book.publisher}
              <br />
              <u>Published Date:</u> {book.publishDate}
              <br />
              <u>Page count:</u> {book.pageCount}
              <br />
              <u>ISBN:</u> {book.isbn}
            </Card.Text>
            <div className='text-center mt-1'>
              <Button
              variant="info"
              size="sm"
              className='m-3'
              onClick={() => handleAddSearchResultToLibrary(book)}
            >
              Add to my library
            </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    ))}
  </Row>
)}

        </div>
      ) : (
       <Card className="p-4 shadow-sm rounded-4" style={{ maxWidth: "450px", margin: "0 auto" }}>
  <Card.Title className="mb-4 text-center fw-bold">Add manually</Card.Title>

  <div className="d-flex justify-content-start mb-3">
    <Button
      variant="secondary"
      size="sm"
      className="fw-semibold px-3 btn-sm"
      onClick={() => handleSelectEntryMode('search')}
    >
      ← Back to search
    </Button>
  </div>


  <Form
    onSubmit={(e) => {
      e.preventDefault(); 
      handleSaveBook();
    }}
  >
    <Form.Group className="mb-3">
      <Form.Control
        type="text"
        placeholder="Book title"
        value={bookTitle}
        onChange={(e) => setBookTitle(e.target.value)}
        className="rounded-3"
        required
      />
    </Form.Group>

    <Form.Group className="mb-3">
      <Form.Control
        type="text"
        placeholder="Author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        className="rounded-3"
        required
      />
    </Form.Group>

    <Form.Group className="mb-3">
      <Form.Control
        type="number"
        placeholder="Page count"
        value={pageCount}
        onChange={(e) => setPageCount(e.target.value)}
        className="rounded-3"
        required
      />
    </Form.Group>

    <Form.Group className="mb-3">
      <Form.Control
        type="text"
        placeholder="ISBN"
        value={isbn}
        onChange={(e) => setIsbn(e.target.value)}
        className="rounded-3"
        required
      />
    </Form.Group>

    <Form.Group className="mb-4">
      <Form.Label className="fw-semibold">Cover image</Form.Label>
      {isCameraOpen ? (
        <CameraPhoto
          onTakePhoto={(dataUri) => handleTakePhoto(dataUri)}
          idealFacingMode={FACING_MODES.ENVIRONMENT}
        />
      ) : (
        <div className="d-flex flex-column align-items-center mt-2 gap-2">
          <Button
            variant="info"
            size="sm"
            className="fw-semibold px-4"
            onClick={() => setIsCameraOpen(true)}
          >
            📷 Take photo
          </Button>

          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleUploadImage}
            style={{ maxWidth: "250px" }}
          />
        </div>
      )}
    </Form.Group>

    <div
      className="d-flex"
      style={{
        marginTop: "2rem",
        marginLeft: "4rem",
      }}
    >
      <Button
        variant="primary"
        size="sm"
        className="fw-semibold px-4"
        type="submit" 
        disabled={isImageUploading}
      >
        Add book
      </Button>
    </div>
  </Form>
</Card>

      )}
    </Container>
  );
};

export default AddBook;
