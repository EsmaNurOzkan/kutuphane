import React, { useState, useEffect } from 'react';
import { Button, Modal, ListGroup, Form } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph } from 'docx';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Export = ({ bookId }) => {
  const [quotes, setQuotes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedQuotes, setSelectedQuotes] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [showQuotesModal, setShowQuotesModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectAllQuotes, setSelectAllQuotes] = useState(false);
  const [selectAllNotes, setSelectAllNotes] = useState(false);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/quote/${bookId}/quotes`)
      .then(response => {
        const sortedQuotes = response.data.quotes.sort((a, b) => a.pageNo - b.pageNo);
        setQuotes(sortedQuotes);
      })
      .catch(error => {
        console.error('Error fetching quotes:', error);
      });

    axios.get(`${BACKEND_URL}/api/note/${bookId}`)
      .then(response => {
        const sortedNotes = response.data.notes.sort((a, b) => a.pageNo - b.pageNo);
        setNotes(sortedNotes);
      })
      .catch(error => {
        console.error('Error fetching notes:', error);
      });
  }, [bookId]);

  const cleanText = (text) => {
    return text ? text.replace(/\s+/g, ' ').trim() : 'No text found';
  };

  const exportQuotesToPDF = () => {
    const content = selectedQuotes.map(quoteId => {
      const quote = quotes.find(q => q._id === quoteId);
      if (quote) {
        const cleanedText = cleanText(quote.text);
        const text = `Page ${quote.pageNo || 'N/A'}: ${cleanedText}`;

        const content = [
          `<p style="margin: 5px; font-size: 12px;">${text}</p>`
        ];

        if (quote.quoteNotes && quote.quoteNotes.length > 0) {
          quote.quoteNotes.forEach(note => {
            const noteText = cleanText(note.text);
            content.push(`<p style="margin-left: 10px; font-size: 12px;">- ${noteText}</p>`);
          });
        }

        return content.join('');
      }
      return '';
    }).join('');

    const element = document.createElement('div');
    element.innerHTML = content;
    html2pdf(element);
  };

  const exportNotesToPDF = () => {
    const content = selectedNotes.map(noteId => {
      const note = notes.find(n => n._id === noteId);
      if (note) {
        const cleanedText = cleanText(note.text);
        const text = `Page ${note.pageNo || 'N/A'}: ${cleanedText}`;

        return `<p style="margin: 5px; font-size: 12px;">${text}</p>`;
      }
      return '';
    }).join('');

    const element = document.createElement('div');
    element.innerHTML = content;
    html2pdf(element);
  };

  const exportQuotesToWord = () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: selectedQuotes.flatMap(quoteId => {
          const quote = quotes.find(q => q._id === quoteId);
          return quote ? [
            new Paragraph({
              text: `Page ${quote.pageNo || 'N/A'}: ${quote.text}`,
              spacing: { before: 200, after: 200 },
            }),
            ...quote.quoteNotes.map(note => new Paragraph({
              text: `  - ${note.text}`,
              spacing: { before: 200, after: 200 },
            })),
          ] : [];
        }),
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, 'quotes.docx');
    }).catch(error => {
      console.error('Error exporting quotes to Word:', error);
    });
  };

  const exportNotesToWord = () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: selectedNotes.map(noteId => {
          const note = notes.find(n => n._id === noteId);
          return note ? new Paragraph({
            text: `Page ${note.pageNo || 'N/A'}: ${note.text}`,
            spacing: { before: 200, after: 200 },
          }) : null;
        }).filter(Boolean),
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, 'notes.docx');
    }).catch(error => {
      console.error('Error exporting notes to Word:', error);
    });
  };

  const handleQuotesModal = () => setShowQuotesModal(!showQuotesModal);
  const handleNotesModal = () => setShowNotesModal(!showNotesModal);

  const handleQuoteSelect = (quoteId) => {
    setSelectedQuotes(prevSelected => 
      prevSelected.includes(quoteId)
        ? prevSelected.filter(id => id !== quoteId)
        : [...prevSelected, quoteId]
    );
  };

  const handleNoteSelect = (noteId) => {
    setSelectedNotes(prevSelected => 
      prevSelected.includes(noteId)
        ? prevSelected.filter(id => id !== noteId)
        : [...prevSelected, noteId]
    );
  };

  const handleSelectAllQuotes = () => {
    setSelectAllQuotes(!selectAllQuotes);
    if (!selectAllQuotes) {
      setSelectedQuotes(quotes.map(quote => quote._id));
    } else {
      setSelectedQuotes([]);
    }
  };

  const handleSelectAllNotes = () => {
    setSelectAllNotes(!selectAllNotes);
    if (!selectAllNotes) {
      setSelectedNotes(notes.map(note => note._id));
    } else {
      setSelectedNotes([]);
    }
  };

  return (
    <div className="container">
      <h2>Export</h2>
      <Button variant="primary" onClick={handleQuotesModal}>Export Quotes</Button>{' '}
      <Button variant="primary" onClick={handleNotesModal}>Export Notes</Button>{' '}
      <Button variant="primary">Export Quotes & Notes</Button>

      <Modal show={showQuotesModal} size="lg" onHide={handleQuotesModal}>
        <Modal.Header closeButton>
          <Modal.Title>Export Quotes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button variant="info" onClick={handleSelectAllQuotes}>
            {selectAllQuotes ? 'Deselect All' : 'Select All'}
          </Button>
          <ListGroup>
            {quotes.map(quote => (
              <ListGroup.Item key={quote._id}>
                <Form.Check 
                  type="checkbox"
                  label={`Page ${quote.pageNo || 'N/A'}: ${cleanText(quote.text)}`}
                  checked={selectedQuotes.includes(quote._id)}
                  onChange={() => handleQuoteSelect(quote._id)}
                />
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleQuotesModal}>Close</Button>
          <Button variant="primary" onClick={exportQuotesToPDF}>Export as PDF</Button>
          <Button variant="primary" onClick={exportQuotesToWord}>Export as Word</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showNotesModal} size="lg" onHide={handleNotesModal}>
        <Modal.Header closeButton>
          <Modal.Title>Export Notes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button variant="info" onClick={handleSelectAllNotes}>
            {selectAllNotes ? 'Deselect All' : 'Select All'}
          </Button>
          <ListGroup>
            {notes.map(note => (
              <ListGroup.Item key={note._id}>
                <Form.Check 
                  type="checkbox"
                  label={`Page ${note.pageNo || 'N/A'}: ${cleanText(note.text)}`}
                  checked={selectedNotes.includes(note._id)}
                  onChange={() => handleNoteSelect(note._id)}
                />
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleNotesModal}>Close</Button>
          <Button variant="primary" onClick={exportNotesToPDF}>Export as PDF</Button>
          <Button variant="primary" onClick={exportNotesToWord}>Export as Word</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Export;
