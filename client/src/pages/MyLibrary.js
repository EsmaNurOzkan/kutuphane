import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const MyLibrary = () => {
  const navigate = useNavigate();

  return (
    <div className="container my-4">
      <div className="d-flex flex-column align-items-center mb-4">
        <button
          className="btn btn-lg btn-primary mb-2"
          onClick={() => navigate('/my-shelve')}
        >
          My Books
        </button>
        <button
          className="btn btn-lg btn-success"
          onClick={() => navigate('/add-book')}
        >
          Add Book
        </button>
      </div>
    </div>
  );
};

export default MyLibrary;
