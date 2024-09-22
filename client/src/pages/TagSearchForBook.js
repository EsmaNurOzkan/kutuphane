import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Badge, Button, Form, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const TagSearchForBook = ({ userId }) => {
    const [tags, setTags] = useState([]); // Tüm tagler
    const [selectedTags, setSelectedTags] = useState([]); // Seçili tagler
    const [searchTerm, setSearchTerm] = useState(''); // Tag arama terimi
    const [allBooks, setAllBooks] = useState([]); // Tüm kitaplar
    const [filteredBooks, setFilteredBooks] = useState([]); // Filtrelenmiş kitaplar
    const [isSearching, setIsSearching] = useState(false); // Arama durumu
  
    useEffect(() => {
      const fetchBooks = async () => {
        if (!userId) return;
  
        try {
          const res = await axios.get(`http://localhost:5000/api/my-shelve/user/${userId}`);
          const books = res.data;
          let allTags = [];
  
          // Kitapların taglerini toplama
          books.forEach(book => {
            if (Array.isArray(book.tags)) {
              allTags = [...allTags, ...book.tags.map(tag => tag.text)];
            }
          });
  
          // Tüm taglerin unique olmasını sağlama
          const uniqueTags = [...new Set(allTags)];
          setTags(uniqueTags);
          setAllBooks(books); // Tüm kitapları başlangıçta kaydet
          setFilteredBooks(books); // Başlangıçta filtrelenmiş kitaplar
        } catch (error) {
          console.error('Tagler alınırken bir hata oluştu:', error);
        }
      };
  
      fetchBooks();
    }, [userId]);
  
    useEffect(() => {
      // Tagler değiştiğinde kitapları filtrele
      const updatedFilteredBooks = filterBooksByTags();
      setFilteredBooks(updatedFilteredBooks);
    }, [selectedTags, allBooks]);
  
    const handleTagSelect = (tag) => {
      if (selectedTags.includes(tag)) {
        setSelectedTags(selectedTags.filter(t => t !== tag));
      } else {
        setSelectedTags([...selectedTags, tag]);
      }
    };
  
    // Seçili tagler ile kitapları filtreleme fonksiyonu
    const filterBooksByTags = () => {
      if (selectedTags.length === 0) {
        return allBooks; // Seçili tag yoksa tüm kitapları döndür
      }
  
      return allBooks.filter(book =>
        book.tags.some(tag => selectedTags.includes(tag.text))
      );
    };
  
    // Tag arama işlemi
    const filteredTags = tags.filter(tag =>
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    // Kitap kapağı URL'ini düzgün bir şekilde çekme fonksiyonu
    const getBookCoverUrl = (book) => {
      return book.coverImage 
        ? (book.coverImage.startsWith('uploads') 
          ? `http://localhost:5000/${book.coverImage}` 
          : book.coverImage) 
        : 'https://via.placeholder.com/150';
    };
  
    // Kart üzerindeki etiketlere tıklama işlemi
    const handleTagClick = (tag) => {
      setSearchTerm(tag.text);
    };
  
    return (
      <Container className="mt-4 text-center">
        <h3 className="mb-4">Tüm Tagler</h3>
  
        {/* Arama Kutusu */}
        <Form.Control
          type="text"
          placeholder="Tag ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3"
          style={{ width: '14rem', margin: '0 auto' }}
        />
  
        {/* Tagler Listesi */}
        <Row className="m-2">
          {filteredTags.length > 0 ? (
            filteredTags.map((tag, index) => (
              <Col key={index} xs={6} sm={4} md={3} lg={2} className="mb-3">
                <Badge
                  pill
                  onClick={() => handleTagSelect(tag)}
                  style={{
                    cursor: 'pointer',
                    padding: '10px',
                    fontSize: '1rem',
                    display: 'block',
                    textAlign: 'center',
                    backgroundColor: selectedTags.includes(tag) ? '#28a745' : '#6c757d',
                    color: 'white',
                    border: selectedTags.includes(tag) ? '2px solid #155724' : 'none',
                    opacity: selectedTags.includes(tag) ? 1 : 0.7
                  }}
                >
                  #{tag}
                </Badge>
              </Col>
            ))
          ) : (
            <p>Henüz tag bulunamadı.</p>
          )}
        </Row>
  
        <Row className="mt-4">
  {filteredBooks.length > 0 ? (
    filteredBooks.map((book, index) => (
      <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
        <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Card.Img variant="top" src={getBookCoverUrl(book)} alt={book.title} />
          <Card.Body style={{ flex: '1 0 auto' }}>
            <Card.Title>{book.title}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{book.author}</Card.Subtitle>
            <Card.Text>
              <strong>Sayfa Sayısı:</strong> {book.pageCount} <br />
              <strong>ISBN:</strong> {book.isbn} <br />
            </Card.Text>
          </Card.Body>
          <Card.Footer style={{ flexShrink: 0 }}>
            <strong>Etiketler:</strong>
            <div className="mt-2">
              {book.tags.map(tag => (
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
        </Card>
      </Col>
    ))
  ) : (
    <p>Kitap bulunamadı.</p>
  )}
</Row>

      </Container>
    );
  };
  
  export default TagSearchForBook;
  