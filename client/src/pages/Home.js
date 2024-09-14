import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import 'bootstrap/dist/css/bootstrap.min.css';
import shelveLogo from '../utils/shelve3.png'; 

function Home() {
  const token = localStorage.getItem('token'); 

  return (
    <>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Text:ital@0;1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet"/>
      </Helmet>
      <Container>
        <Row className="justify-content-md-center" style={{ marginBottom: '10rem' }}>
          <Col md="10">
            <Card className="border-0 text-center">
              <Card.Body>
                <div className='m-2'>
                  <img src={shelveLogo} alt="Kütüphane Logo" style={{ width: '12rem', height: 'auto' }} />
                </div>
                <Card.Title as="h2" >Hoşgeldiniz!</Card.Title>
                <Card.Text>
                  <p className='fs-5' >Kendi dijital kütüphanenizi oluşturabileceğiniz harika bir platforma adım atıyorsunuz. Bu uygulama sayesinde, en sevdiğiniz kitapları bir araya getirip kişisel kitaplığınızı oluşturabilir, unutulmaz alıntılarınızı not alabilir ve dilediğiniz zaman bu notları okuyarak ilham alabilirsiniz.</p>
                </Card.Text>
                <Card.Text>
                  <p className='fs-5' >Kitaplarınızı ve alıntılarınızı güvenle saklayın, her an elinizin altında bulundurun. Dahası, bu değerli bilgileri ve anıları kolayca dışa aktararak paylaşabilir veya yedekleyebilirsiniz.</p>
                </Card.Text>
                {!token && (
                  <div className="d-flex justify-content-center mt-4">
                    <Link to="/login">
                      <Button variant="primary" style={{ fontWeight : 500 }} className="mr-2 btn-md">Giriş Yap</Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="success" style={{ fontWeight : 500 }} className="btn-md" >Kayıt Ol</Button>
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Home;
