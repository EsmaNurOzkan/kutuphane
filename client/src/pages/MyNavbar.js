import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap'; // React-Bootstrap bileşenleri
import 'bootstrap/dist/css/bootstrap.min.css';

function MyNavbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  return (
    <Navbar  bg="light" expand="md">
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav  className="navbar-main m-auto">
          <Nav.Link as={Link} to="/">Anasayfa </Nav.Link>
          <NavDropdown title="Kütüphanem " id="basic-nav-dropdown">
            <NavDropdown.Item as={Link} to="/my-shelve">
              Kitaplığım 
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/add-book">
              Kitap Ekle 
            </NavDropdown.Item>
          </NavDropdown>
          <Nav.Link as={Link} to="/quick-notes">Hızlı notlarım </Nav.Link>
          <Nav.Link as={Link} to="/report-issue">Sorun Bildir </Nav.Link>
          {token && (
            <Nav.Link onClick={handleLogout} style={{ cursor: 'pointer' }}>
              Çıkış yap
            </Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default MyNavbar;
