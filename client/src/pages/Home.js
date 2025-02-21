import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
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
        <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet" />
      </Helmet>
      <Container className="d-flex flex-column align-items-center justify-content-center text-center mt-4">
      <motion.div
        initial={{ scale: 0.3, opacity: 0.2 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="mb-2"
      >
        <img src={shelveLogo} alt="Kütüphane Logo" style={{ width: '16rem', height: 'auto' }} />
      </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, delay: 0.2 }}
          className="mb-3"
        >
          Hoşgeldiniz!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 3, delay: 0.4 }}
          className="fs-5 text-muted"
        >
          Kendi dijital kütüphanenizi oluşturabileceğiniz harika bir platforma adım atıyorsunuz. 
          En sevdiğiniz kitapları bir araya getirip kişisel kitaplığınızı oluşturabilir, unutulmaz 
          alıntılarınızı kaydedebilir ve istediğiniz zaman ilham alabilirsiniz.
        </motion.p>
        {!token && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="d-flex gap-3 mt-4"
          >
            <Link to="/login">
              <Button variant="primary" size="lg" className="fw-bold px-4">Giriş Yap</Button>
            </Link>
            <Link to="/register">
              <Button variant="success" size="lg" className="fw-bold px-4">Kayıt Ol</Button>
            </Link>
          </motion.div>
        )}
      </Container>
    </>
  );
}

export default Home;