import React, { useState, useEffect } from 'react';
import styles from './CreateLeaves.module.css';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import { Bell, Power } from 'react-feather';
import { fireDB } from '../../Firebase/FirebaseConfig';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../Firebase/FirebaseConfig';

const CreateLeaves = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [leaveDays, setLeaveDays] = useState('');
  const [leaveData, setLeaveData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveFrequency, setLeaveFrequency] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const navigate = useNavigate(); // Initialize navigate

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      navigate('/'); // Redirect to the login or home page
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeeCollectionRef = collection(fireDB, 'EmployeeData');
        const q = query(
          employeeCollectionRef,
          where('Status', '==', 'Active'),
          where('LeaveStatus', '==', 'Inactive')
        );
        const querySnapshot = await getDocs(q);
        const employeeList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          fullName: `${doc.data().firstName} ${doc.data().lastName}`,
        }));

        setEmployees(employeeList);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  const handleEmployeeChange = (event) => {
    const selectedEmployeeId = event.target.value;
    setSelectedEmployee(selectedEmployeeId);
    const selectedEmployeeData = employees.find(
      (employee) => employee.id === selectedEmployeeId
    );
    if (selectedEmployeeData) {
      setEmployeeId(selectedEmployeeData.id);
    }
  };

  const handleLeaveTypeChange = (event) => {
    setLeaveType(event.target.value);
  };

  const handleLeaveFrequencyChange = (event) => {
    setLeaveFrequency(event.target.value);
  };

  const handleLeaveDaysChange = (event) => {
    setLeaveDays(event.target.value);
  };

  const handleFromDateChange = (event) => {
    const newFromDate = event.target.value;
    setFromDate(newFromDate);
    updateToDate(newFromDate);
  };

  const handleToDateChange = (event) => {
    setToDate(event.target.value);
  };

  const updateToDate = (fromDate) => {
    if (fromDate) {
      const date = new Date(fromDate);
      if (leaveFrequency === 'Monthly') {
        date.setMonth(date.getMonth() + 1);
      } else if (leaveFrequency === 'Yearly') {
        date.setFullYear(date.getFullYear() + 1);
      }
      const newToDate = date.toISOString().split('T')[0];
      setToDate(newToDate);
    }
  };

  const leaveTypeMapping = {
    'Casual Leave': 'casualLeave',
    'Earn Leave': 'earnLeave',
    'HPL Leave': 'hplLeave'
  };

  const handleAddLeaveData = () => {
    if (selectedEmployee && leaveType && leaveDays) {
      const selectedEmployeeData = employees.find(
        (employee) => employee.id === selectedEmployee
      );
      const employeeName = selectedEmployeeData ? selectedEmployeeData.fullName : '';
      const leaveKey = leaveTypeMapping[leaveType];

      const existingLeaveDataIndex = leaveData.findIndex(
        (data) => data.employeeId === employeeId
      );

      if (existingLeaveDataIndex !== -1) {
        const updatedLeaveData = [...leaveData];
        updatedLeaveData[existingLeaveDataIndex] = {
          ...updatedLeaveData[existingLeaveDataIndex],
          [leaveKey]: leaveDays
        };
        setLeaveData(updatedLeaveData);
      } else {
        const newLeaveData = {
          employeeName,
          employeeId,
          leaveFrequency,
          fromDate,
          toDate,
          casualLeave: leaveType === 'Casual Leave' ? leaveDays : '',
          earnLeave: leaveType === 'Earn Leave' ? leaveDays : '',
          hplLeave: leaveType === 'HPL Leave' ? leaveDays : ''
        };
        setLeaveData((prevData) => [...prevData, newLeaveData]);
      }
    }
  };

  const handleSubmitLeave = async (employeeId) => {
    const leaveDataToSubmit = leaveData.find((data) => data.employeeId === employeeId);
    if (leaveDataToSubmit) {
      try {
        const employeeRef = doc(fireDB, 'EmployeeData', employeeId);
        const leaveDetails = {
          employeeName: leaveDataToSubmit.employeeName,
          leaveFrequency: leaveDataToSubmit.leaveFrequency,
          fromDate: leaveDataToSubmit.fromDate,
          toDate: leaveDataToSubmit.toDate,
          casualLeave: leaveDataToSubmit.casualLeave,
          earnLeave: leaveDataToSubmit.earnLeave,
          hplLeave: leaveDataToSubmit.hplLeave,
        };
        await updateDoc(employeeRef, {
          LeaveDetails: leaveDetails,
          LeaveStatus: 'Active',
        });
        Swal.fire({
          title: 'Success!',
          text: 'Leave details submitted and status updated successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'There was an error submitting the leave details.',
          icon: 'error',
          confirmButtonText: 'Try Again',
        });
        console.error('Error submitting leave details: ', error);
      }
    } else {
      Swal.fire({
        title: 'Warning!',
        text: 'Employee not found in leave data.',
        icon: 'warning',
        confirmButtonText: 'OK',
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
            <span className={styles.pageTitle}>Create Leaves</span>
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

        {/* Form Section */}
        <div className={styles.leaveForm}>
          <div className={styles.formGroup}>
            <label htmlFor="employee">Select Employee</label>
            <select
              id="employee"
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              className={styles.select}
            >
              <option value="" disabled>Select an Employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName}
                </option>
              ))}
            </select>
          </div>

          {employeeId && (
            <div className={styles.formGroup}>
              <label htmlFor="employeeId">Employee ID</label>
              <input
                type="text"
                id="employeeId"
                value={employeeId}
                readOnly
                className={styles.readonlyInput}
              />
            </div>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="leaveType">Select Leave Type</label>
            <select
              id="leaveType"
              value={leaveType}
              onChange={handleLeaveTypeChange}
              className={styles.select}
            >
              <option value="" disabled>Select Leave Type</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Earn Leave">Earn Leave</option>
              <option value="HPL Leave">HPL Leave</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="leaveFrequency">Select Leave Frequency</label>
            <select
              id="leaveFrequency"
              value={leaveFrequency}
              onChange={handleLeaveFrequencyChange}
              className={styles.select}
            >
              <option value="" disabled>Select Leave Frequency</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
           
          <div className={styles.formGroup}>
            <label htmlFor="leaveRange">Select Date Range</label>
            <div className={styles.dateRange}>
              <label htmlFor="fromDate" className={styles.dateLabel}>From</label>
              <input
                type="date"
                id="fromDate"
                value={fromDate}
                onChange={handleFromDateChange}
                className={styles.dateInput}
              />

              <label htmlFor="toDate" className={styles.dateLabel}>To</label>
              <input
                type="date"
                id="toDate"
                value={toDate}
                onChange={handleToDateChange}
                className={styles.dateInput}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="leaveDays">Enter Number of Leave Days</label>
            <input
              type="number"
              id="leaveDays"
              value={leaveDays}
              onChange={handleLeaveDaysChange}
              min="1"
              placeholder="Enter number of days"
              className={styles.input}
            />
          </div>

          <button onClick={handleAddLeaveData} className={styles.addButton}>
            Add
          </button>
        </div>

        {/* Leave Data Table */}
        {leaveData.length > 0 && (
          <div className={styles.leaveTable}>
            <h3>Leave Data</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Employee ID</th>
                  <th>Leave Frequency</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Casual Leave</th>
                  <th>Earn Leave</th>
                  <th>HPL Leave</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaveData.map((data, index) => (
                  <tr key={index}>
                    <td data-label="Employee Name">{data.employeeName}</td>
                    <td data-label="Employee ID">{data.employeeId}</td>
                    <td data-label="Leave Frequency">{data.leaveFrequency}</td>
                    <td data-label="From">{data.fromDate}</td>
                    <td data-label="To">{data.toDate}</td>
                    <td data-label="Casual Leave">{data.casualLeave}</td>
                    <td data-label="Earn Leave">{data.earnLeave}</td>
                    <td data-label="HPL Leave">{data.hplLeave}</td>
                    <td>
                      <button onClick={() => handleSubmitLeave(data.employeeId)} className={styles.submitButton}>
                        Submit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateLeaves;
