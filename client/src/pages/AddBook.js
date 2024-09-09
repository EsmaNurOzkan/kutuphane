import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraPhoto, { FACING_MODES } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Spinner from 'react-bootstrap/Spinner'; 
import WhiteCover from '../utils/whitecover2.jpg'; 

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
        params: { query: searchQuery },
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
    <div className="container my-4">
      {!isManualEntry ? (
        <div className="mb-4">
          <button className="btn btn-secondary mb-2" onClick={() => handleSelectEntryMode('manual')}>
            Manuel ekle
          </button>
          <div className="form-group mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Ara"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary mb-4" onClick={handleSearchBooks}>
            Kitabı ara
          </button>
          {isLoading && (
            <div className="text-center">
              <Spinner animation="border" /> 
              <p>Kitaplar yükleniyor...</p>
            </div>
          )}
          <div>
            {searchResults.map((book, index) => (
              <div className="card mb-3" key={index}>
                <div className="card-body">
                  <h4 className="card-title">{book.title}</h4>
                  <p className="card-text">Yazar: {book.author}</p>
                  <p className="card-text">Sayfa sayısı: {book.pageCount}</p>
                  <p className="card-text">ISBN: {book.isbn}</p>
                  {book.coverImage && (
                    <img src={book.coverImage} alt={book.title} className="img-fluid mb-2" style={{ width: '100px', height: '150px' }} />
                  )}
                  <button className="btn btn-success" onClick={() => handleAddSearchResultToLibrary(book)}>
                    Kitaplığıma ekle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-4">
          <h3 className="mb-4">Manuel ekle</h3>
          <button className="btn btn-secondary mb-4" onClick={() => handleSelectEntryMode('search')}>
            Kitap aramaya dön
          </button>
          <div className="form-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Kitap adı"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
            />
          </div>
          <div className="form-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Yazar"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          <div className="form-group mb-3">
            <input
              type="number"
              className="form-control"
              placeholder="Sayfa sayısı"
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
            />
          </div>
          <div className="form-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="ISBN"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
            />
          </div>
          <div className="form-group mb-3">
            <label className="form-label m-2">Kapak resmi</label>
            {isCameraOpen ? (
              <CameraPhoto
                onTakePhoto={(dataUri) => handleTakePhoto(dataUri)}
                idealFacingMode={FACING_MODES.ENVIRONMENT}
              />
            ) : (
              <>
                <button className="btn btn-info mb-2" onClick={() => setIsCameraOpen(true)}>
                  Fotoğraf çek
                </button>
                <input type="file" accept="image/*" onChange={handleUploadImage} />
              </>
            )}
          </div>
          <button className="btn btn-primary" onClick={handleSaveBook} disabled={isImageUploading}>
            Kitabı ekle
          </button>
        </div>
      )}
    </div>
  );
};

export default AddBook;
