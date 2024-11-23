import React, { useState, useEffect } from 'react';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import styles from './CreateEmployee.module.css';
import { Bell, Power } from 'react-feather';
import Swal from 'sweetalert2';
import { auth, fireDB } from '../../Firebase/FirebaseConfig';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

const CreateEmployee = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    address: '',
    designation: '',
    aadharCardNumber: '',
    aadharCard: null,
    employeeID: '', // Add employeeID field
  });

  useEffect(() => {
    // Fetch the number of documents in EmployeeData collection to generate Employee ID
    const generateEmployeeID = async () => {
      try {
        const querySnapshot = await getDocs(collection(fireDB, 'EmployeeData'));
        const employeeCount = querySnapshot.size; // Get the document count

        // Generate employee ID in the format EMP000X
        const employeeID = `EMP${(employeeCount + 1).toString().padStart(4, '0')}`;
        setFormData((prevData) => ({
          ...prevData,
          employeeID, // Set the generated Employee ID
        }));
      } catch (error) {
        console.error('Error generating employee ID:', error);
      }
    };

    generateEmployeeID(); // Call the function when component mounts
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, aadharCard: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstName, lastName, email, employeeID } = formData;

    try {
      const userRef = doc(fireDB, 'EmployeeData', employeeID);
      await setDoc(userRef, {
        firstName,
        lastName,
        email,
        mobile: formData.mobile,
        address: formData.address,
        designation: formData.designation,
        aadharCardNumber: formData.aadharCardNumber,
        aadharCard: formData.aadharCard ? formData.aadharCard.name : '',
        role: 'Employee',
        Status: 'Active',
        LeaveStatus: 'Inactive',
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Employee Created!',
        text: 'The employee has been added successfully.',
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
        employeeID: '', // Reset employeeID
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
            <span className={styles.pageTitle}>Add Employee</span>
          </div>

          {/* Right Side */}
          <div className={styles.headerRight}>
            <Bell className={styles.icon} title="Notifications" />
            <Power className={styles.icon} title="Logout" />
          </div>
        </div>

        <div className={styles.managerInvitetion}>
          <h2>Add Employee Form</h2>
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

            <div className={styles['form-group']}>
              <label htmlFor="employeeID">Employee ID</label>
              <input
                type="text"
                id="employeeID"
                name="employeeID"
                value={formData.employeeID}
                onChange={handleChange}
                required
                readOnly
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
              <button type="submit">Add Employee</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEmployee;
