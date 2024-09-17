import React, { useState, useEffect } from 'react';
import { Button, Modal, ListGroup, Form } from 'react-bootstrap';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts'; 

pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
    axios.get(`http://localhost:5000/api/quote/${bookId}/quotes`)
      .then(response => {
        const sortedQuotes = response.data.quotes.sort((a, b) => a.pageNo - b.pageNo);
        setQuotes(sortedQuotes);
      })
      .catch(error => {
        console.error('Error fetching quotes:', error);
      });

    axios.get(`http://localhost:5000/api/note/${bookId}`)
      .then(response => {
        const sortedNotes = response.data.notes.sort((a, b) => a.pageNo - b.pageNo);
        setNotes(sortedNotes);
      })
      .catch(error => {
        console.error('Error fetching notes:', error);
      });
  }, [bookId]);

  const cleanText = (text) => {
    return text ? text.replace(/\s+/g, ' ').trim() : 'Metin bulunamadı'; 
  };

  
  
  const exportQuotesToPDF = () => {
    const margin = 15;
    const lineHeight = 14;
  
    const docDefinition = {
      content: selectedQuotes.map(quoteId => {
        const quote = quotes.find(q => q._id === quoteId);
        if (quote) {
          const cleanedText = cleanText(quote.text);
          const text = `Sayfa ${quote.pageNo || 'N/A'}: ${cleanedText}`;
  
          const content = [
            { text, margin: [margin, 0, margin, 0], fontSize: 12, style: 'quoteText' }
          ];
  
          if (quote.quoteNotes && quote.quoteNotes.length > 0) {
            quote.quoteNotes.forEach(note => {
              const noteText = cleanText(note.text);
              content.push({ text: `  - ${noteText}`, margin: [margin + 5, 0, margin, 0], fontSize: 12, style: 'noteText' });
            });
          }
  
          return content;
        }
        return [];
      }).flat(),
      styles: {
        quoteText: {
          margin: [0, 5],
        },
        noteText: {
          margin: [0, 2],
        }
      },
      pageMargins: [margin, margin, margin, margin],
    };
  
    pdfMake.createPdf(docDefinition).download('alintilarim.pdf');
  };
  
 
  const exportNotesToPDF = () => {
    const margin = 10;
    const lineHeight = 14;
  
    const docDefinition = {
      content: selectedNotes.map(noteId => {
        const note = notes.find(n => n._id === noteId);
        if (note) {
          const cleanedText = cleanText(note.text);
          const text = `Sayfa ${note.pageNo || 'N/A'}: ${cleanedText}`;
  
          return {
            text,
            margin: [margin, 5, margin, 5],
            fontSize: 12,
            style: 'noteText',
          };
        }
        return {};
      }),
      styles: {
        noteText: {
          margin: [0, 5],
        }
      },
      pageMargins: [margin, margin, margin, margin],
    };
  
    pdfMake.createPdf(docDefinition).download('notlarim.pdf');
  };
  

const exportQuotesToWord = () => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: selectedQuotes.flatMap(quoteId => {
        const quote = quotes.find(q => q._id === quoteId);
        return quote ? [
          new Paragraph({
            text: `Sayfa ${quote.pageNo || 'N/A'}: ${quote.text}`,
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
            text: `Sayfa ${note.pageNo || 'N/A'}: ${note.text}`,
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
      <h2>Dışa Aktar</h2>
      <Button variant="primary" onClick={handleQuotesModal}>Alıntıları Dışa Aktar</Button>{' '}
      <Button variant="primary" onClick={handleNotesModal}>Notları Dışa Aktar</Button>{' '}
      <Button variant="primary">Alıntı & Notları Dışa Aktar</Button>
      
      <Modal show={showQuotesModal} size="lg" onHide={handleQuotesModal}>
        <Modal.Header closeButton>
          <Modal.Title>Alıntıları Dışa Aktar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button variant="info" onClick={handleSelectAllQuotes}>
            {selectAllQuotes ? 'Tümünü Kaldır' : 'Tümünü Seç'}
          </Button>
          <ListGroup>
            {quotes.map(quote => (
              <ListGroup.Item key={quote._id}>
                <Form.Check 
                  type="checkbox"
                  label={`Sayfa ${quote.pageNo || 'N/A'}: ${cleanText(quote.text)}`}
                  checked={selectedQuotes.includes(quote._id)}
                  onChange={() => handleQuoteSelect(quote._id)}
                />
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleQuotesModal}>Kapat</Button>
          <Button variant="primary" onClick={exportQuotesToPDF}>PDF Olarak Dışa Aktar</Button>
          <Button variant="primary" onClick={exportQuotesToWord}>Word Olarak Dışa Aktar</Button>
        </Modal.Footer>
      </Modal>
      
      <Modal show={showNotesModal} size="lg" onHide={handleNotesModal}>
        <Modal.Header closeButton>
          <Modal.Title>Notları Dışa Aktar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button variant="info" onClick={handleSelectAllNotes}>
            {selectAllNotes ? 'Tümünü Kaldır' : 'Tümünü Seç'}
          </Button>
          <ListGroup>
            {notes.map(note => (
              <ListGroup.Item key={note._id}>
                <Form.Check 
                  type="checkbox"
                  label={`Sayfa ${note.pageNo || 'N/A'}: ${cleanText(note.text)}`}
                  checked={selectedNotes.includes(note._id)}
                  onChange={() => handleNoteSelect(note._id)}
                />
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleNotesModal}>Kapat</Button>
          <Button variant="primary" onClick={exportNotesToPDF}>PDF Olarak Dışa Aktar</Button>
          <Button variant="primary" onClick={exportNotesToWord}>Word Olarak Dışa Aktar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Export;
