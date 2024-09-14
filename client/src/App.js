import React, { useState, useEffect } from 'react';
import { AppProvider } from './AppContext'; 
import { jwtDecode } from 'jwt-decode';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MyNavbar from "./pages/MyNavbar"
import ResetPassword from './pages/auth/ResetPassword';
import MyLibrary from './pages/MyLibrary';
import MyShelve from "./pages/MyShelve";
import QuickNotes from './pages/QuickNotes';
import ReportIssue from "./pages/ReportIssue";
import AddBook from './pages/AddBook';
import { Helmet } from 'react-helmet';
import "./App.css"


axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token'); 
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

function App() {
  const [showExpiredMessage, setShowExpiredMessage] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('User is authenticated.', token);
      checkTokenExpiry();
    } else {
      console.log('User is not authenticated.');
    }
  }, []);

  const checkTokenExpiry = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000; 
      if (decodedToken.exp < currentTime) {
        console.log('Token süresi dolmuş. Yeniden giriş yapmanız gerekebilir.');
        localStorage.removeItem('token');
        setShowExpiredMessage(true); 

      } else {
        console.log('Token geçerli ve süresi devam ediyor.');
        setUserId(decodedToken.id); 
      }
    } else {
      console.log('Token mevcut değil.');
    }
  };

  return (
    <AppProvider>
      <Router>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Text:ital@0;1&display=swap" rel="stylesheet" />

        <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet"/>

        <link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet"></link>

    </Helmet>
      <MyNavbar /> 
         {showExpiredMessage && (
        <div style={{ margin:"1rem", padding:"0.5 rem", color:"black", opacity:"0.3", display: 'inline-block', justifyContent: 'center', alignItems: 'center' , backgroundColor: 'crimson', color: 'white', textAlign: 'center', width:"auto"}}>
        Oturum süreniz doldu, lütfen tekrar giriş yapın.
      </div> 
      )}
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/my-library" element={!!localStorage.getItem('token') ? <MyLibrary /> : <Navigate to="/login" />} />
        <Route path="/add-book" element={!!localStorage.getItem('token') ? <AddBook /> : <Navigate to="/login" />} />
        <Route path="/my-shelve" element={!!localStorage.getItem('token') ? <MyShelve userId={userId} /> : <Navigate to="/login" />} />
        <Route path="/quick-notes" element={!!localStorage.getItem('token') ? <QuickNotes /> : <Navigate to="/login" />} />
        <Route path="/report-issue" element={!!localStorage.getItem('token') ? <ReportIssue /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/home" />} /> 
      </Routes>
    </Router>
    </AppProvider>
  );
}

export default App;
