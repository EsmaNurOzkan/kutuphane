import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap'; // React-Bootstrap bileşenleri
import 'bootstrap/dist/css/bootstrap.min.css';

function MyNavbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem('token'); 

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/home'); 
    window.location.reload();
  };

  return (
    <Navbar 
      style={{
        backgroundColor: 'lightGray',
        width: '60%', 
        margin: '0 auto', 
        marginTop: "1rem",
        borderRadius: '1rem',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        opacity: token ? 1 : 0.5, 
      }}
      expand="md"
    >
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav
          style={{
            display: 'flex', 
            justifyContent: 'center', 
            width: '100%',
          }}
        >
          <Nav.Link className="mr-3" as={Link} to="/home">Anasayfa</Nav.Link>
          <NavDropdown title="Kütüphanem" id="basic-nav-dropdown">
            <NavDropdown.Item as={Link} to="/my-shelve">Kitaplığım</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/add-book">Kitap Ekle</NavDropdown.Item>
          </NavDropdown>
          <Nav.Link as={Link} to="/quick-notes">Hızlı notlarım</Nav.Link>
          <Nav.Link as={Link} to="/report-issue">Sorun Bildir</Nav.Link>
          {token && (
            <Nav.Link
              className="ml-3"
              onClick={handleLogout}
              style={{ cursor: 'pointer' }}
            >
              Çıkış yap
            </Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default MyNavbar;
