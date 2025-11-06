import React, { useState, useEffect } from 'react';
import { Button, Modal, ListGroup, Form, ButtonGroup } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { saveAs } from 'file-saver';
import robotoFont from '../assets/fonts/Roboto-Medium.ttf'; 
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
      .catch(error => console.error('Error fetching quotes:', error));

    axios.get(`${BACKEND_URL}/api/note/${bookId}`)
      .then(response => {
        const sortedNotes = response.data.notes.sort((a, b) => a.pageNo - b.pageNo);
        setNotes(sortedNotes);
      })
      .catch(error => console.error('Error fetching notes:', error));
  }, [bookId]);

  const cleanText = (text) => text ? text.replace(/\s+/g, ' ').trim() : 'No text found';

  const wrapText = (text, font, fontSize, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (let word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);

      if (width < maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const exportQuotesToPDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      const fontBytes = await fetch(robotoFont).then(res => res.arrayBuffer());
      const customFont = await pdfDoc.embedFont(fontBytes);

      let page = pdfDoc.addPage([595, 842]);
      const { height, width } = page.getSize();
      const margin = 50;
      const fontSize = 12;
      const lineHeight = 18;
      const maxWidth = width - margin * 2;
      let y = height - margin;

      page.drawText('Alıntılar', {
        x: margin,
        y,
        size: 18,
        font: customFont,
        color: rgb(0, 0, 0),
      });
      y -= 30;

      for (const quoteId of selectedQuotes) {
        const quote = quotes.find(q => q._id === quoteId);
        if (!quote) continue;

        const cleanedText = cleanText(quote.text);
        const text = `Sayfa ${quote.pageNo || 'N/A'}: ${cleanedText}`;
        const lines = wrapText(text, customFont, fontSize, maxWidth);

        for (let line of lines) {
          if (y < margin + 20) {
            page = pdfDoc.addPage([595, 842]);
            y = height - margin;
          }
          page.drawText(line, { x: margin, y, size: fontSize, font: customFont, color: rgb(0, 0, 0) });
          y -= lineHeight;
        }

        if (quote.quoteNotes && quote.quoteNotes.length > 0) {
          for (const note of quote.quoteNotes) {
            const noteText = cleanText(note.text);
            const noteLines = wrapText(`- ${noteText}`, customFont, fontSize - 1, maxWidth - 20);
            for (let nLine of noteLines) {
              if (y < margin + 20) {
                page = pdfDoc.addPage([595, 842]);
                y = height - margin;
              }
              page.drawText(nLine, {
                x: margin + 15,
                y,
                size: fontSize - 1,
                font: customFont,
                color: rgb(0.1, 0.1, 0.1),
              });
              y -= lineHeight;
            }
          }
        }

        y -= 10;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, 'quotes.pdf');
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF oluşturulurken hata oluştu!');
    }
  };

  const exportNotesToPDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      const fontBytes = await fetch(robotoFont).then(res => res.arrayBuffer());
      const customFont = await pdfDoc.embedFont(fontBytes);

      let page = pdfDoc.addPage([595, 842]);
      const { height, width } = page.getSize();
      const margin = 50;
      const fontSize = 12;
      const lineHeight = 18;
      const maxWidth = width - margin * 2;
      let y = height - margin;

      page.drawText('Notlar', {
        x: margin,
        y,
        size: 18,
        font: customFont,
        color: rgb(0, 0, 0),
      });
      y -= 30;

      for (const noteId of selectedNotes) {
        const note = notes.find(n => n._id === noteId);
        if (!note) continue;

        const cleanedText = cleanText(note.text);
        const text = `Sayfa ${note.pageNo || 'N/A'}: ${cleanedText}`;
        const lines = wrapText(text, customFont, fontSize, maxWidth);

        for (let line of lines) {
          if (y < margin + 20) {
            page = pdfDoc.addPage([595, 842]);
            y = height - margin;
          }
          page.drawText(line, { x: margin, y, size: fontSize, font: customFont, color: rgb(0, 0, 0) });
          y -= lineHeight;
        }
        y -= 10;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, 'notes.pdf');
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF oluşturulurken hata oluştu!');
    }
  };

  const exportQuotesToWord = () => {
    const doc = new Document({
      sections: [{
        children: selectedQuotes.flatMap(quoteId => {
          const quote = quotes.find(q => q._id === quoteId);
          return quote ? [
            new Paragraph({ text: `Sayfa ${quote.pageNo || 'N/A'}: ${quote.text}`, spacing: { before: 200, after: 200 } }),
            ...quote.quoteNotes.map(note => new Paragraph({ text: `- ${note.text}`, spacing: { before: 200, after: 200 } })),
          ] : [];
        }),
      }],
    });

    Packer.toBlob(doc)
      .then(blob => saveAs(blob, 'quotes.docx'))
      .catch(error => console.error('Error exporting quotes to Word:', error));
  };

  const exportNotesToWord = () => {
    const doc = new Document({
      sections: [{
        children: selectedNotes.map(noteId => {
          const note = notes.find(n => n._id === noteId);
          return note ? new Paragraph({
            text: `Sayfa ${note.pageNo || 'N/A'}: ${note.text}`,
            spacing: { before: 200, after: 200 },
          }) : null;
        }).filter(Boolean),
      }],
    });

    Packer.toBlob(doc)
      .then(blob => saveAs(blob, 'notes.docx'))
      .catch(error => console.error('Error exporting notes to Word:', error));
  };

  const handleQuotesModal = () => setShowQuotesModal(!showQuotesModal);
  const handleNotesModal = () => setShowNotesModal(!showNotesModal);

  const handleQuoteSelect = (quoteId) => {
    setSelectedQuotes(prev =>
      prev.includes(quoteId) ? prev.filter(id => id !== quoteId) : [...prev, quoteId]
    );
  };

  const handleNoteSelect = (noteId) => {
    setSelectedNotes(prev =>
      prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]
    );
  };

  const handleSelectAllQuotes = () => {
    setSelectAllQuotes(!selectAllQuotes);
    setSelectedQuotes(!selectAllQuotes ? quotes.map(q => q._id) : []);
  };

  const handleSelectAllNotes = () => {
    setSelectAllNotes(!selectAllNotes);
    setSelectedNotes(!selectAllNotes ? notes.map(n => n._id) : []);
  };

  return (
    <div className="container">
      <ButtonGroup className='d-flex justify-content-center'>
        <Button className='btn-sm' variant="primary" onClick={handleQuotesModal}>Export Quotes</Button>{' '}
        <Button className='btn-sm' variant="primary" onClick={handleNotesModal}>Export Notes</Button>{' '}
      </ButtonGroup>

      <Modal show={showQuotesModal} size="lg" onHide={handleQuotesModal}>
        <Modal.Header closeButton><Modal.Title>Export Quotes</Modal.Title></Modal.Header>
        <Modal.Body>
          <Button variant="info" onClick={handleSelectAllQuotes}>
            {selectAllQuotes ? 'Deselect All' : 'Select All'}
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
          <Button variant="primary" onClick={exportQuotesToPDF}>Export as PDF</Button>
          <Button variant="primary" onClick={exportQuotesToWord}>Export as Word</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showNotesModal} size="lg" onHide={handleNotesModal}>
        <Modal.Header closeButton><Modal.Title>Export Notes</Modal.Title></Modal.Header>
        <Modal.Body>
          <Button variant="info" onClick={handleSelectAllNotes}>
            {selectAllNotes ? 'Deselect All' : 'Select All'}
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
          <Button variant="primary" onClick={exportNotesToPDF}>Export as PDF</Button>
          <Button variant="primary" onClick={exportNotesToWord}>Export as Word</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Export;
