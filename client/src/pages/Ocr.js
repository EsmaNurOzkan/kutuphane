import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { Camera } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import { Button, Modal, Spinner, Form } from 'react-bootstrap';

const Ocr = ({ target, onResultsSubmit }) => {
  const [images, setImages] = useState([]);
  const [ocrResults, setOcrResults] = useState('');
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    processImages(files);
  };

  const handleTakePhoto = (dataUri) => {
    setImages([dataUri]);
    processImages([dataUri]);
    setCameraOpen(false);
  };

  const processImages = async (images) => {
    setLoading(true);
    setError('');
    setOcrResults('');

    try {
      for (let image of images) {
        const { data: { text } } = await Tesseract.recognize(
          image,
          'eng',
          {
            logger: info => console.log(info), 
          }
        );
        setOcrResults(prevResults => prevResults + text + '\n\n');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setError('OCR işlemi sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleCameraError = (error) => {
    console.error('Camera Error:', error);
    setError('Kamera işlemi sırasında bir hata oluştu.');
  };

  const handleSubmit = () => {
    if (onResultsSubmit) {
      onResultsSubmit(ocrResults, target);
    }
  };

  return (
    <div>
      <h4>Burası OCR sayfası.</h4>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && (
        <div className="text-center">
          <Spinner animation="border" />
          <p>OCR işleniyor...</p>
        </div>
      )}
      <Form.Group>
        <Button variant="primary" onClick={() => document.getElementById('fileInput').click()}>
          Cihazdan Yükle
        </Button>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <Button variant="secondary" onClick={() => setCameraOpen(true)}>
          Kameradan Çek
        </Button>
      </Form.Group>

      {cameraOpen && (
        <Modal show={cameraOpen} onHide={() => setCameraOpen(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Kamera</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Camera
              onTakePhoto={(dataUri) => handleTakePhoto(dataUri)}
              onCameraError={handleCameraError}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setCameraOpen(false)}>
              Kapat
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {ocrResults && (
        <Form.Group>
          <Form.Label>OCR Sonuçları</Form.Label>
          <Form.Control
            as="textarea"
            rows={10}
            value={ocrResults}
            onChange={(e) => setOcrResults(e.target.value)}
          />
          <Button variant="primary" className="mt-2" onClick={handleSubmit}>
            Tamam
          </Button>
        </Form.Group>
      )}
    </div>
  );
};

export default Ocr;
