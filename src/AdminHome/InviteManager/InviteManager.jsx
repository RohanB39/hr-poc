import React, { useState } from 'react'
import styles from './InviteManager.module.css';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import { Bell, Power } from 'react-feather';
import Swal from 'sweetalert2'; 
import emailjs from 'emailjs-com'; 
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, fireDB } from '../../Firebase/FirebaseConfig'; 
import { collection, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

const InviteManager = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    address: '',
    designation: '',
    aadharCardNumber: '',
    aadharCard: null,
    password: '',
    username: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, aadharCard: e.target.files[0] }));
  };

  const navigate = useNavigate(); // Initialize navigate

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      navigate('/'); // Redirect to the login or home page
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const sendEmail = (toEmail, username, password) => {
    emailjs
      .send(
        'service_npxb19n',
        'template_vhyg6vg',
        {
          to_email: toEmail,
          username: username,
          password: password
        },
        '9BlMSdgu7t1eZRCvj'
      )
      .then((response) => {
        console.log('Email sent successfully:', response);
      })
      .catch((error) => {
        console.error('Email send failed:', error);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstName, lastName, email, username, password } = formData;

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userRef = doc(fireDB, 'Users', username);
      await setDoc(userRef, {
        firstName,
        lastName,
        email,
        mobile: formData.mobile,
        address: formData.address,
        designation: formData.designation,
        aadharCardNumber: formData.aadharCardNumber,
        aadharCard: formData.aadharCard ? formData.aadharCard.name : '',
        username,
        role: 'Manager',
        managerStatus: 'Active',
      });
      sendEmail(email, username, password);
      Swal.fire({
        icon: 'success',
        title: 'Manager Invited!',
        text: 'The invitation has been sent successfully.',
      });
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        address: '',
        designation: '',
        aadharCardNumber: '',
        aadharCard: null,
        password: '',
        username: ''
      });

    } catch (error) {
      console.error(error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message,
      });
    }
  };

  return (
    <div className={styles.main}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <AdminSidebar />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.header}>
          {/* Left Side */}
          <div className={styles.headerLeft}>
            <span className={`${styles.dot} ${styles.red}`}></span>
            <span className={`${styles.dot} ${styles.yellow}`}></span>
            <span className={`${styles.dot} ${styles.green}`}></span>
            <span className={styles.pageTitle}>Invite Managers</span>
          </div>

          {/* Right Side */}
          <div className={styles.headerRight}>
            <Bell className={styles.icon} title="Notifications" />
            <Power
              className={styles.icon}
              title="Logout"
              onClick={handleLogout} // Trigger logout on click
            />
          </div>
        </div>

        <div className={styles.managerInvitetion}>
          <h2>Manager Invitation Form</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles['form-group']}>
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles['form-group']}>
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="mobile">Mobile Number</label>
              <input
                type="text"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>

            <div className={`${styles['form-group']} ${styles['full-width']}`}>
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="designation">Designation</label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles['form-group']}>
              <label htmlFor="aadharCardNumber">Aadhar Card Number</label>
              <input
                type="text"
                id="aadharCardNumber"
                name="aadharCardNumber"
                value={formData.aadharCardNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="aadharCard">Upload Aadhar Card</label>
              <input
                type="file"
                id="aadharCard"
                name="aadharCard"
                onChange={handleFileChange}
                required
              />
            </div>
            <div className={styles['form-group']} style={{ marginTop: '4%' }}>
              <button type="submit">Send Invitation</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default InviteManager