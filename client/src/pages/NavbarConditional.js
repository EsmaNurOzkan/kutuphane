import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

function NavbarConditional() {
  const location = useLocation();
  
  if (['/home', '/login', '/register', '/resetpassword'].includes(location.pathname)) {
    return null;
  }

  return <Navbar />;
}

export default NavbarConditional;
