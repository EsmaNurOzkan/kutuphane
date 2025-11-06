import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

const ReportIssue = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });

  const [responseMessage, setResponseMessage] = useState('');
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const res = await axios.post(`${BACKEND_URL}/api/report-issue`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      setResponseMessage(res.data.message);
      setTimeout(() => {
        setResponseMessage('');
        navigate('/main'); 
      }, 2000);
    } catch (error) {
      console.error('Form submission error:', error);
      setResponseMessage('An error occurred, please try again.');
      setTimeout(() => setResponseMessage(''), 2000);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">Report Issue / Suggestion</h2>
          <form onSubmit={handleSubmit} className="needs-validation" noValidate>
            <div className="mb-3">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input
                type="text"
                className="form-control"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input
                type="text"
                className="form-control"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="message" className="form-label">Issue / Suggestion</label>
              <textarea
                className="form-control"
                id="message"
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary mx-auto d-block">Submit</button>
          </form>
          {responseMessage && (
            <div className="alert alert-info mt-3 text-center" role="alert">
              {responseMessage}
            </div>
          )}
        </div>
      </div>
    </div>
    

  );
};

export default ReportIssue;
