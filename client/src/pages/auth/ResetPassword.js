import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); 
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      setMessage('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/auth/sendresetlink`, { email });
      setMessage('A 4-digit code has been sent to your email address');
      setStep(2);
    } catch (error) {
      setMessage('An error occurred while sending the email');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/verifycode`, { email, resetCode });
      if (response.data.success) {
        setMessage('Code verified. You can now create your new password.');
        setStep(3);
      } else {
        setMessage('Incorrect code. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred while verifying the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/auth/resetpassword`, { email, resetCode, newPassword });
      setMessage('Password has been successfully reset');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage('An error occurred while resetting the password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h1 className="text-center mb-4">Reset Password</h1>
          {loading && <div className="d-flex justify-content-center mb-3"><Spinner animation="border" /></div>}
          {message && <Alert variant={message.startsWith('Password') ? 'success' : 'danger'}>{message}</Alert>}
          {step === 1 && (
            <Form onSubmit={handleSendResetCode}>
              <Form.Group controlId="email">
                <Form.Label>Enter your email address</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="mt-3" disabled={loading}>
                Send 4-Digit Code
              </Button>
            </Form>
          )}
          {step === 2 && (
            <Form onSubmit={handleVerifyCode}>
              <Form.Group controlId="resetCode">
                <Form.Label>Enter the 4-digit code</Form.Label>
                <Form.Control
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="Enter the 4-digit code"
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="mt-3" disabled={loading}>
                Verify Code
              </Button>
            </Form>
          )}
          {step === 3 && (
            <Form onSubmit={handleResetPassword}>
              <Form.Group controlId="newPassword">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                />
              </Form.Group>
              <Form.Group controlId="confirmPassword">
                <Form.Label>Re-enter New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="mt-3" disabled={loading}>
                Reset Password
              </Button>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default ResetPassword;
