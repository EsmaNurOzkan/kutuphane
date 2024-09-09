import React, { useState, useEffect } from 'react';
import { Button, Modal, ListGroup, Form } from 'react-bootstrap';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    // Alıntıları ve notları fetch etme
    axios.get(`http://localhost:5000/api/quote/${bookId}/quotes`)
      .then(response => {
        // Alıntıları pageNo'ya göre sıralama
        const sortedQuotes = response.data.quotes.sort((a, b) => a.pageNo - b.pageNo);
        setQuotes(sortedQuotes);
      })
      .catch(error => {
        console.error('Error fetching quotes:', error);
      });

    axios.get(`http://localhost:5000/api/note/${bookId}`)
      .then(response => {
        // Notları pageNo'ya göre sıralama
        const sortedNotes = response.data.notes.sort((a, b) => a.pageNo - b.pageNo);
        setNotes(sortedNotes);
      })
      .catch(error => {
        console.error('Error fetching notes:', error);
      });
  }, [bookId]);

  // Metin temizleme fonksiyonu
  const cleanText = (text) => {
    return text ? text.replace(/\s+/g, ' ').trim() : 'Metin bulunamadı'; // Boş metin durumunda varsayılan değer
  };

  // Alıntıları PDF olarak dışa aktarma
  const exportQuotesToPDF = () => {
    const doc = new jsPDF();
    doc.setFont('Helvetica');
    doc.setFontSize(12);

    let y = 10;
    const lineHeight = 10;
    const pageHeight = doc.internal.pageSize.height;

    selectedQuotes.forEach((quoteId) => {
      const quote = quotes.find(q => q._id === quoteId);
      if (quote) {
        const cleanedText = cleanText(quote.text);
        const text = `Sayfa ${quote.pageNo || 'N/A'}: ${cleanedText}`;

        const lines = doc.splitTextToSize(text, 180);

        lines.forEach(line => {
          if (y + lineHeight > pageHeight - 20) {
            doc.addPage();
            y = 10;
          }

          doc.text(line, 10, y);
          y += lineHeight;
        });

        if (quote.quoteNotes && quote.quoteNotes.length > 0) {
          quote.quoteNotes.forEach(note => {
            const noteText = cleanText(note.text);
            const noteLine = `  - ${noteText}`;

            const noteLines = doc.splitTextToSize(noteLine, 180);

            noteLines.forEach(line => {
              if (y + lineHeight > pageHeight - 20) {
                doc.addPage();
                y = 10;
              }

              doc.text(line, 15, y);
              y += lineHeight;
            });
          });
        }
      }
    });

    doc.save('quotes.pdf');
  };

  // Alıntıları Word olarak dışa aktarma
  const exportQuotesToWord = () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: selectedQuotes.flatMap(quoteId => {
          const quote = quotes.find(q => q._id === quoteId);
          return quote ? [
            new Paragraph({
              text: `Sayfa ${quote.pageNo || 'N/A'}: ${quote.text}`,
              spacing: { before: 200, after: 200 }, // Satır aralığını artırma
            }),
            ...quote.quoteNotes.map(note => new Paragraph({
              text: `  - ${note.text}`,
              spacing: { before: 200, after: 200 }, // Satır aralığını artırma
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

  // Notları PDF olarak dışa aktarma
  const exportNotesToPDF = () => {
    const doc = new jsPDF();
    doc.setFont('Helvetica');
    doc.setFontSize(12);

    let y = 10;
    const lineHeight = 10;
    const pageHeight = doc.internal.pageSize.height;

    selectedNotes.forEach((noteId) => {
      const note = notes.find(n => n._id === noteId);
      if (note) {
        const cleanedText = cleanText(note.text);
        const text = `Sayfa ${note.pageNo || 'N/A'}: ${cleanedText}`;

        const lines = doc.splitTextToSize(text, 180);

        lines.forEach(line => {
          if (y + lineHeight > pageHeight - 20) {
            doc.addPage();
            y = 10;
          }

          doc.text(line, 10, y);
          y += lineHeight;
        });
      }
    });

    doc.save('notes.pdf');
  };

  // Notları Word olarak dışa aktarma
  const exportNotesToWord = () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: selectedNotes.map(noteId => {
          const note = notes.find(n => n._id === noteId);
          return note ? new Paragraph({
            text: `Sayfa ${note.pageNo || 'N/A'}: ${note.text}`,
            spacing: { before: 200, after: 200 }, // Satır aralığını artırma
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

  // Modalları açma/kapatma işlemleri
  const handleQuotesModal = () => setShowQuotesModal(!showQuotesModal);
  const handleNotesModal = () => setShowNotesModal(!showNotesModal);

  // Alıntı seçimini değiştirme
  const handleQuoteSelect = (quoteId) => {
    setSelectedQuotes(prevSelected => 
      prevSelected.includes(quoteId)
        ? prevSelected.filter(id => id !== quoteId)
        : [...prevSelected, quoteId]
    );
  };

  // Not seçimini değiştirme
  const handleNoteSelect = (noteId) => {
    setSelectedNotes(prevSelected => 
      prevSelected.includes(noteId)
        ? prevSelected.filter(id => id !== noteId)
        : [...prevSelected, noteId]
    );
  };

  // Tüm alıntıları seçme/çıkarma
  const handleSelectAllQuotes = () => {
    setSelectAllQuotes(!selectAllQuotes);
    if (!selectAllQuotes) {
      setSelectedQuotes(quotes.map(quote => quote._id));
    } else {
      setSelectedQuotes([]);
    }
  };

  // Tüm notları seçme/çıkarma
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
