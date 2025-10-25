import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap'; 
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
    <Navbar bg="light" expand="md">
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="navbar-main m-auto">
          <Nav.Link as={Link} to="/">Home</Nav.Link>
          <NavDropdown title="My Library" id="basic-nav-dropdown">
            <NavDropdown.Item as={Link} to="/my-shelve">
              My Books
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/add-book">
              Add Book
            </NavDropdown.Item>
          </NavDropdown>
          <Nav.Link as={Link} to="/quick-notes">Quick Notes</Nav.Link>
          <Nav.Link as={Link} to="/report-issue">Report Issue</Nav.Link>
          {token && (
            <Nav.Link onClick={handleLogout} style={{ cursor: 'pointer' }}>
              Logout
            </Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default MyNavbar;
