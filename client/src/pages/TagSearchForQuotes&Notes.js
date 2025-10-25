import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { Container, Row, Col, Button, Badge, Card, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

const TagSearchForQuotesAndNotes = ({ userId }) => {
  const [tags, setTags] = useState([]); 
  const [selectedTags, setSelectedTags] = useState([]); 
  const [books, setBooks] = useState([]); 
  const [results, setResults] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(''); 

  useEffect(() => {
    const fetchBooks = async () => {
      if (!userId) return; 

      try {
        const res = await axios.get(`${BACKEND_URL}/api/my-shelve/user/${userId}`);
        const booksData = res.data;
        setBooks(booksData); 

        let allTags = [];
        booksData.forEach((book) => {
          if (Array.isArray(book.quotes) && book.quotes.length > 0) {
            book.quotes.forEach((quote) => {
              if (Array.isArray(quote.tags)) {
                allTags = [...allTags, ...quote.tags];
              }
            });
          }
          if (Array.isArray(book.notes) && book.notes.length > 0) {
            book.notes.forEach((note) => {
              if (Array.isArray(note.tags)) {
                allTags = [...allTags, ...note.tags];
              }
            });
          }
        });

        const uniqueTags = [...new Set(allTags)];
        setTags(uniqueTags);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchBooks();
  }, [userId]);

  const handleTagSelect = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSearch = () => {
    const filteredResults = [];

    books.forEach((book) => {
      const matchedQuotes = book.quotes?.filter((quote) =>
        quote.tags?.some((tag) => selectedTags.includes(tag))
      );

      const matchedNotes = book.notes?.filter((note) =>
        note.tags?.some((tag) => selectedTags.includes(tag))
      );

      if (matchedQuotes?.length > 0 || matchedNotes?.length > 0) {
        filteredResults.push({
          bookTitle: book.title,
          bookCoverUrl: book.coverImage 
            ? (book.coverImage.startsWith('uploads') 
                ? `${BACKEND_URL}/${book.coverImage}` 
                : book.coverImage) 
            : 'https://via.placeholder.com/150',
          quotes: matchedQuotes,
          notes: matchedNotes,
        });
      }
    });

    setResults(filteredResults); 
    console.log('Search results:', filteredResults);
  };

  const filteredTags = tags.filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <Container className="mt-4 text-center" >
      <h3 className="mb-4 ">All Tags</h3>
      <Form.Control 
        type="text" 
        placeholder="Search tag..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} 
        className="mb-3"
        style={{ width: '14rem', margin: '0 auto' }} 
      />

      <Row className="m-2">
        {filteredTags.length > 0 ? (
          filteredTags.map((tag, index) => (
            <Col key={index} xs={6} sm={4} md={3} lg={2} className="mb-3">
              <Badge
                pill
                variant={selectedTags.includes(tag) ? 'success' : 'secondary'}
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
                  opacity: selectedTags.includes(tag) ? 1 : 0.7,
                }}
              >
                #{tag}
              </Badge>
            </Col>
          ))
        ) : (
          <p>No tags found yet.</p>
        )}
      </Row>
  
      {selectedTags.length > 0 && (
        <Button className="mt-3" variant="primary" onClick={handleSearch}>
          Search with Selected Tags
        </Button>
      )}
  
      {results.length > 0 && (
        <Row className="mt-4">
          {results.map((result, index) => (
            <Col key={index} xs={12} md={6} lg={4} className="mb-3">
              <Card>
                <Card.Img variant="top" src={result.bookCoverUrl} alt={result.bookTitle} />
                <Card.Body>
                  <Card.Title>{result.bookTitle}</Card.Title>
                  <Card.Text>
                    {result.quotes && result.quotes.map((quote, i) => (
                      <div key={i}>
                        <p><strong><u>Quote:</u></strong> "{quote.text}"</p>
                        <p><strong><u>Quote Notes:</u></strong> "{quote.notes}"</p>
                        <p><strong><u>Tags:</u></strong> 
                          {quote.tags && quote.tags.map((tag, idx) => (
                            <span key={idx} style={{ marginRight: '8px' }}>#{tag}</span>
                          ))}
                        </p>
                      </div>
                    ))}
                    {result.notes && result.notes.map((note, i) => (
                      <div key={i}>
                        <p><strong><u>Note:</u></strong> {note.text}</p>
                        <p><strong><u>Tags:</u></strong> 
                          {note.tags && note.tags.map((tag, idx) => (
                            <span key={idx} style={{ marginRight: '0.2rem' }}>#{tag}</span>
                          ))}
                        </p>
                      </div>
                    ))}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default TagSearchForQuotesAndNotes;
