import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import "../../style/App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.log("Backend URL:", process.env.REACT_APP_BACKEND_URL);
      console.error('Error logging in:', error.response ? error.response.data : error.message);
      alert('Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Text:ital@0;1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet" />
      </Helmet>
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <Row className="w-100">
          <Col sm={12} md={8} lg={6} className="mx-auto">
            <Card className="border-0 shadow-lg bg-body" style={{ borderRadius: '3rem', padding: '2rem' }}>
              <Card.Body>
                <h3 className="text-center mb-4" style={{ fontFamily: 'DM Serif Text, serif' }}>Giriş Yap</h3>
                <Form onSubmit={handleSubmit} className="d-flex flex-column">
                  <Form.Group id="email">
                    <Form.Label style={{ fontFamily: "Cormorant, serif", fontWeight: 600 }}>E-posta</Form.Label>
                    <Form.Control
                      style={{ fontFamily: "Cormorant, serif", fontWeight: 400 }}
                      className="fs-5"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-posta"
                      required
                    />
                  </Form.Group>
                  <Form.Group id="password" className="mt-3">
                    <Form.Label style={{ fontFamily: "Cormorant, serif", fontWeight: 600 }}>Şifre</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Şifre"
                      required
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-center">
                    <Button style={{ fontFamily: "Cormorant, serif", fontWeight: 500 }} type="submit" className="w-75 mt-4" disabled={loading}>
                      {loading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                          {' '}Giriş yapılıyor...
                        </>
                      ) : (
                        'Giriş Yap'
                      )}
                    </Button>
                  </div>
                </Form>
                <div className="text-center mt-3">
                  <Link to="/reset-password" style={{ fontFamily: "Cormorant, serif", fontWeight: 500 }} className="d-block link-primary">
                    Şifremi unuttum
                  </Link>
                  <Link to="/register" style={{ fontFamily: "Cormorant, serif", fontWeight: 500 }} className="d-block link-secondary mt-1">
                    Kayıt Ol
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Login;
