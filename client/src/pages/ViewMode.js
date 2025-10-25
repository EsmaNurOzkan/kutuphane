import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Card, Row, Col, Spinner, Button } from 'react-bootstrap';
import axios from 'axios';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import '../style/ViewMode.css'; 

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

const ViewMode = () => {
  const location = useLocation();
  const { book } = location.state || {};
  const [groupedContent, setGroupedContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchUpdatedBook = useCallback(async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/my-shelve/books/${book._id}/details`
      );
      const updatedBook = response.data;

      const combinedQuotes = updatedBook.quotes || [];
      const independentNotes = updatedBook.notes || [];

      const grouped = combinedQuotes.reduce((acc, quote) => {
        const pageNo = quote.pageNo;
        if (!acc[pageNo]) acc[pageNo] = { quotes: [], notes: [] };
        acc[pageNo].quotes.push(quote);
        return acc;
      }, {});

      independentNotes.forEach((note) => {
        const pageNo = note.pageNo;
        if (!grouped[pageNo]) grouped[pageNo] = { quotes: [], notes: [] };
        grouped[pageNo].notes.push(note);
      });

      setGroupedContent(grouped);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching updated book data:', error);
    }
  }, [book]);

  useEffect(() => {
    if (book && book._id) {
      fetchUpdatedBook();
    }
  }, [book, fetchUpdatedBook]);

  const handlePageChange = (direction) => {
    setCurrentPage((prevPage) => {
      const maxPages = getSortedPageNumbers().length;
      if (direction === 'next') {
        return prevPage < maxPages - 1 ? prevPage + 1 : prevPage;
      } else {
        return prevPage > 0 ? prevPage - 1 : prevPage;
      }
    });
  };

  const getSortedPageNumbers = () => {
    const pageNumbers = Object.keys(groupedContent);
    const nonNumericPages = pageNumbers.filter((pageNo) => isNaN(pageNo));
    const numericPages = pageNumbers.filter((pageNo) => !isNaN(pageNo));
    numericPages.sort((a, b) => Number(a) - Number(b));
    return [...nonNumericPages, ...numericPages];
  };

  const renderPageContent = (pageNo) => {
    const content = groupedContent[pageNo] || { quotes: [], notes: [] };
    return (
      <div>
        <h4 className="text-center">Page {pageNo}</h4>
        <Row>
          {content.quotes.map((quote, i) => (
            <Col key={i} sm={12} className="mb-3">
              <Card>
                <Card.Body>
                  <Card.Text>
                    <strong>Quote:</strong> {quote.text}
                  </Card.Text>
                  {quote.quoteNotes && quote.quoteNotes.length > 0 && (
                    <div>
                      <strong>Quote Notes:</strong>
                      {quote.quoteNotes.map((note, i) => (
                        <p key={i}>{note.text}</p>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
          {content.notes.length > 0 && (
            <Col sm={12} className="mb-3">
              <Card>
                <Card.Body>
                  <strong>My Notes:</strong>
                  <ul>
                    {content.notes.map((note, i) => (
                      <li key={i}>{note.text}</li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '100vh' }}
      >
        <div className="text-center">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Loading your quotes and notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="my-4 text-center">{book.title}</h1>
      <Container style={{ minHeight: '60vh' }}> 
        <TransitionGroup>
          <CSSTransition
            key={getSortedPageNumbers()[currentPage]}
            timeout={300}
            classNames="fade"
          >
            <div>{renderPageContent(getSortedPageNumbers()[currentPage])}</div>
          </CSSTransition>
        </TransitionGroup>
      </Container>
      <div className="d-flex justify-content-between mt-3">
        <Button
          variant="secondary"
          onClick={() => handlePageChange('prev')}
          disabled={currentPage === 0}
        >
          Previous Page
        </Button>
        <Button
          variant="secondary"
          onClick={() => handlePageChange('next')}
          disabled={currentPage === getSortedPageNumbers().length - 1}
        >
          Next Page
        </Button>
      </div>
    </div>
  );
};

export default ViewMode;
