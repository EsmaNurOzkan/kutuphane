import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Modal } from 'react-bootstrap';
import Ocr from './Ocr'; 
import { AppContext } from '../AppContext';


const AddQuote = ({ bookId, pageCount, onSuccess }) => {
  const { quotesUpdated, setQuotesUpdated } = useContext(AppContext); 
  const [quoteText, setQuoteText] = useState('');
  const [quoteNotes, setQuoteNotes] = useState([{ text: '' }]);
  const [pageNo, setPageNo] = useState('');
  const [tags, setTags] = useState([]); 
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrTarget, setOcrTarget] = useState('quoteText'); 

  const handleQuoteTextChange = (e) => setQuoteText(e.target.value);
  const handlePageNoChange = (e) => setPageNo(e.target.value);

  const handleQuoteNoteChange = (index, e) => {
    const newQuoteNotes = [...quoteNotes];
    newQuoteNotes[index].text = e.target.value;
    setQuoteNotes(newQuoteNotes);
  };

  const addQuoteNote = () => setQuoteNotes([...quoteNotes, { text: '' }]);

  const removeQuoteNote = (index) => {
    const newQuoteNotes = quoteNotes.filter((_, i) => i !== index);
    setQuoteNotes(newQuoteNotes);
  };

  const handleTagsChange = (e) => {
    const newTags = e.target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== ''); 
    setTags(newTags); 
  };

  const handleOcrResults = (results) => {
    if (ocrTarget === 'quoteText') {
      setQuoteText(results);
    } else {
      const index = parseInt(ocrTarget, 10);
      if (index >= 0 && index < quoteNotes.length) {
        const newQuoteNotes = [...quoteNotes];
        newQuoteNotes[index].text = results;
        setQuoteNotes(newQuoteNotes);
      }
    }
    setShowOcrModal(false);
    setOcrTarget('quoteText'); 
  };

  const handleTextOcrClick = () => {
    setOcrTarget('quoteText');
    setShowOcrModal(true);
  };

  const handleNoteOcrClick = (index) => {
    setOcrTarget(index.toString());
    setShowOcrModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pageNo > pageCount) {
      setError(`Sayfa sayısını aştınız. Lütfen ${pageCount} veya daha düşük bir değer girin.`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!quoteText.trim()) {
      setError("Lütfen alıntı metnini doldurun.");
      setTimeout(() => setError(''), 3000);
      return;
    }

    setError('');
    try {
      const dataToSend = {
        bookId,
        text: quoteText,
        pageNo,
        quoteNotes: quoteNotes.filter(note => note.text.trim() !== ''),
        tags, 
      };

      await axios.post('http://localhost:5000/api/quote/add', dataToSend);
      setSuccess('Alıntı başarıyla eklendi.');
      setError('');

      setQuotesUpdated(true); 


      if (onSuccess) onSuccess();
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      setSuccess('');
    }
  };

  return (
    <div className="container mt-4">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="pageNo">
          <Form.Label>Sayfa Numarası</Form.Label>
          <Form.Control
            value={pageNo}
            onChange={handlePageNoChange}
            required 
          />
        </Form.Group>       

        <Form.Group controlId="quoteText">
          <Form.Label>Alıntı Metni</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={quoteText}
            onChange={handleQuoteTextChange}
          />
          <Button variant="secondary" className="mt-2" onClick={handleTextOcrClick}>
            OCR ile Doldur
          </Button>
        </Form.Group>

        <Form.Group controlId="quoteNotes">
          <Form.Label>Alıntı Notları (Opsiyonel)</Form.Label>
          {quoteNotes.map((note, index) => (
            <div key={index} className="d-flex mb-2 align-items-center">
              <Form.Control
                as="textarea"
                rows={3}
                value={note.text}
                onChange={(e) => handleQuoteNoteChange(index, e)}
              />
              <Button variant="danger" className="ms-2" onClick={() => removeQuoteNote(index)}>
                Sil
              </Button>
              <Button variant="secondary" className="ms-2" onClick={() => handleNoteOcrClick(index)}>
                OCR
              </Button>
            </div>
          ))}
          <Button variant="primary" className=" btn-sm mb-2" onClick={addQuoteNote}>
            Daha fazla not ekle
          </Button>
        </Form.Group>

        <Form.Group controlId="tags">
          <Form.Label>Tag'ler (virgül ile ayırın)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Tag'leri virgülle ayırın"
            onChange={handleTagsChange}
          />
        </Form.Group>

        <Button variant="success" type="submit">
          Kaydet
        </Button>
      </Form>

      <Modal show={showOcrModal} onHide={() => setShowOcrModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>OCR İşlemi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Ocr onResultsSubmit={handleOcrResults} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOcrModal(false)}>
            Kapat
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddQuote;
