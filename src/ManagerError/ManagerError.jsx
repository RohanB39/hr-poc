import React from 'react';
import { FaExclamationTriangle, FaPhoneAlt } from 'react-icons/fa'; 
import { Link } from 'react-router-dom';
const ManagerError = () => {
  return (
    <div 
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f8f9fa',
        height: '100vh'
      }}
    >
      <FaExclamationTriangle 
        size={60} 
        color="#f39c12" 
        style={{ marginBottom: '20px' }} 
      />
      <h1 style={{ fontSize: '36px', color: '#e74c3c',}}>Ohh Snap!!</h1>
      <p style={{ fontSize: '20px', color: '#e74c3c', marginBottom: '20px' }}>
        You are not invited by the admin. We can't proceed ahead.
      </p>
      <p style={{ fontSize: '18px', color: '#555', marginBottom: '30px' }}>
        For more details, please contact admin support.
      </p>
      <div>
        <FaPhoneAlt size={30} color="#2c3e50" style={{ marginRight: '10px' }} />
        <span style={{ fontSize: '18px', color: '#2c3e50' }}>
          Call Admin Support: <b>(123) 456-7890</b>
        </span>
        <p style={{ fontSize: '18px', color: '#555', marginTop: '30px' }}>
        <button><Link to="/" style={{color: 'white', textDecoration: 'none' }}>Login</Link></button>
      </p>
      </div>
    </div>
  );
};

export default ManagerError;
