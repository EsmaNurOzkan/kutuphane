import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); 
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      setMessage('Lütfen geçerli bir e-posta adresi girin');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/sendresetlink', { email });
      setMessage('4 haneli kod e-posta adresinize gönderildi');
      setStep(2);
    } catch (error) {
      setMessage('E-posta gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/verifycode', { email, resetCode });
      if (response.data.success) {
        setMessage('Kod doğrulandı. Şimdi yeni şifrenizi oluşturabilirsiniz.');
        setStep(3);
      } else {
        setMessage('Kod yanlış. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      setMessage('Kod doğrulama sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword.length < 8) {
      setMessage('Şifre en az 8 karakter uzunluğunda olmalıdır');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Şifreler uyuşmuyor');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/resetpassword', { email, resetCode, newPassword });
      setMessage('Şifre başarıyla sıfırlandı');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage('Şifre sıfırlanırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h1 className="text-center mb-4">Şifre Sıfırlama</h1>
          {loading && <div className="d-flex justify-content-center mb-3"><Spinner animation="border" /></div>}
          {message && <Alert variant={message.startsWith('Şifre') ? 'success' : 'danger'}>{message}</Alert>}
          {step === 1 && (
            <Form onSubmit={handleSendResetCode}>
              <Form.Group controlId="email">
                <Form.Label>E-posta adresinizi girin</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresinizi girin"
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="mt-3" disabled={loading}>
                4 Haneli Kodu Gönder
              </Button>
            </Form>
          )}
          {step === 2 && (
            <Form onSubmit={handleVerifyCode}>
              <Form.Group controlId="resetCode">
                <Form.Label>4 haneli kodu girin</Form.Label>
                <Form.Control
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="4 haneli kodu girin"
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="mt-3" disabled={loading}>
                Kodu Doğrula
              </Button>
            </Form>
          )}
          {step === 3 && (
            <Form onSubmit={handleResetPassword}>
              <Form.Group controlId="newPassword">
                <Form.Label>Yeni şifre</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Yeni şifre"
                />
              </Form.Group>
              <Form.Group controlId="confirmPassword">
                <Form.Label>Yeni şifreyi tekrar girin</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Yeni şifreyi tekrar girin"
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="mt-3" disabled={loading}>
                Şifreyi Sıfırla
              </Button>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default ResetPassword;
