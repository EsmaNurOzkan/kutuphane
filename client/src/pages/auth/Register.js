import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, Modal, Spinner } from 'react-bootstrap';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false); 
  const [loading, setLoading] = useState(false); 
  
  const navigate = useNavigate();

  const handleSendCode = async () => {
    setLoading(true); 
    try {
      await axios.post(`${BACKEND_URL}/api/auth/send-code`, { email });
      setShowModal(true);
      setMessage('Kayıt tamamlanması için e-posta adresinize bir doğrulama kodu gönderildi.');
      setCodeSent(true);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError('Bu e-posta zaten kayıtlı.');
      } else {
        setError('Kod gönderilirken bir hata oluştu.');
      }
    } finally {
      setLoading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setError('Şifreniz 8 karakterden uzun olmalıdır.');
      return;
    }

    if (!codeSent) {
      await handleSendCode();
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/auth/register`, {
        username, email, password, code: verificationCode
      });
      setMessage('Kayıt başarılı.');
      setError('');

      setShowModal(false);

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <>
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <Row className="w-100">
          <Col sm={12} md={8} lg={6} className="mx-auto">
            <Card className="border-0 shadow-lg bg-body" style={{ borderRadius: '3rem', padding: '1.5rem' }}>
              <Card.Body>
                <h3 className="text-center mb-4">Kayıt Ol</h3>
                <Form onSubmit={handleSubmit}>
                  <Form.Group id="username" className="mb-3">
                    <Form.Label>Kullanıcı Adı</Form.Label>
                    <Form.Control
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Kullanıcı Adı"
                      required
                    />
                  </Form.Group>

                  <Form.Group id="email" className="mb-3">
                    <Form.Label>E-posta</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-posta"
                      required
                    />
                  </Form.Group>

                  <Form.Group id="password" className="mb-4">
                    <Form.Label>Şifre</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Şifre (En az 8 karakter)"
                      required
                    />
                  </Form.Group>

                  <Button type="submit" className="w-100">
                    Kayıt Ol
                  </Button>
                </Form>

                {message && <p className="text-success text-center mt-3">{message}</p>}
                {error && <p className="text-danger text-center mt-3">{error}</p>}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Doğrulama Kodu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Kayıt işlemini tamamlamak için e-posta adresinize gelen doğrulama kodunu girin.</p>
          <Form.Group controlId="verificationCode">
            <Form.Label>Doğrulama Kodu</Form.Label>
            <Form.Control
              type="text"
              placeholder="E-posta ile gönderilen kodu girin"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </Form.Group>
          {loading && (
            <div className="text-center mt-3">
              <Spinner animation="border" />
              <p className="mt-2">Kod gönderiliyor...</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSubmit}>
            Doğrula ve Kayıt Ol
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Register;
