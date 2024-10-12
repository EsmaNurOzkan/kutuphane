import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import "../../style/App.css"

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/home');
      window.location.reload();
    } catch (error) {
      console.error('Error logging in:', error.response ? error.response.data : error.message);
      alert('Giriş yapılırken bir hata oluştu');
    }
  };


  return (
    <>
    <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Text:ital@0;1&display=swap" rel="stylesheet" />

        <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet"/>

    </Helmet>
    <Container className="d-flex align-items-center justify-content-center " style={{ minHeight: '100vh' }}>
      <Row className="w-100">
        <Col sm={12} md={8} lg={6} className="mx-auto">
        <Card className=" border-0 shadow-lg bg-body" style={{ borderRadius: '3rem'  }}>
          <Card.Body>
              <h3 className="text-center mb-4" style={{ fontFamily: 'DM Serif Text, serif' }}>Giriş Yap</h3>
              <Form onSubmit={handleSubmit}>
                <Form.Group id="email">
                  <Form.Label style={{ fontFamily: "Cormorant, serif", fontWeight : 600 }}>E-posta</Form.Label>
                  <Form.Control
                    style={{ fontFamily: "Cormorant, serif", fontWeight : 400 }}
                    className="fs-5"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta"
                    required
                  />
                </Form.Group>
                <Form.Group id="password" className="mt-3">
                  <Form.Label style={{ fontFamily: "Cormorant, serif", fontWeight : 600 }}>Şifre</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifre"
                    required
                  />
                </Form.Group>
                <Button style={{ fontFamily: "Cormorant, serif", fontWeight : 500 }} type="submit" className=" w-100 mt-4">
                  Giriş Yap
                </Button>
              </Form>
              <Link to="/reset-password" style={{ fontFamily: "Cormorant, serif", fontWeight : 500 }} className="w-100 mt-3 d-block text-center">
                <a className="link-primary">Şifremi unuttum</a>
              </Link>
              <Link to="/register" style={{ fontFamily: "Cormorant, serif", fontWeight : 500 }} className=" w-100 mt-1 d-block text-center ">
                <a className='link-secondary' >Kayıt Ol</a>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    </>
  );
}

export default Login;
