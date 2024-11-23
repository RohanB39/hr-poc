import React, { useState, useEffect } from 'react'
import { Bell, Power } from 'react-feather';
import styles from './EmployeeAttendanceManager.module.css';
import ManagerSidebar from '../ManagerSidebar/ManagerSidebar';
import { useTable } from 'react-table';
import { FaEdit, FaTrash, FaCalendarAlt } from 'react-icons/fa';
import { AiOutlineUp, AiOutlineDown } from 'react-icons/ai';
import { fireDB } from '../../Firebase/FirebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { parse, format } from 'date-fns';
import WorkingHours from './workingHours/WorkingHours';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../Firebase/FirebaseConfig';

const EmployeeAttendanceManager = () => {
  const [isTotalCollapsed, setIsTotalCollapsed] = useState(false);
  const [totalSearchQuery, setTotalSearchQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceButtonText, setAttendanceButtonText] = useState({});
  const [employeeStatus, setEmployeeStatus] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [managers, setManagers] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const employeeIds = employees.map((employee) => employee.employeeId);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [highlightedDates, setHighlightedDates] = useState([]);
  const [hoursNotComplete, setHoursNotComplete] = useState([]);
  const [leavesDate, setLeavesDate] = useState([]);
  const [halfDayDate, setHalfDayDate] = useState([]);
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const [showNotification, setShowNotification] = useState(false);


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
    const fetchEmployeeData = async () => {
      const q = query(
        collection(fireDB, 'EmployeeData'),
        where('Status', '==', 'Active')
      );
      const querySnapshot = await getDocs(q);
      const employeeData = querySnapshot.docs.map((doc, index) => ({
        srNo: index + 1,
        employeeId: doc.id,
        employeeName: `${doc.data().firstName} ${doc.data().lastName}`,
        designation: doc.data().designation,
      }));
      setEmployees(employeeData);
    };
    fetchEmployeeData();
  }, []);

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      const q = collection(fireDB, 'AttendanceData');
      const querySnapshot = await getDocs(q);
      const attendance = querySnapshot.docs.map((doc) => ({
        employeeId: doc.id,
        attendanceDetails: doc.data(),
      }));
      setAttendanceData(attendance);
    };

    fetchAttendanceData();
  }, []);

  // Function to get today's attendance button text
  const getAttendanceButtonText = async (employeeId) => {
    const today = getFormattedDate();
    const employeeDocRef = doc(fireDB, 'AttendanceData', employeeId);
    const employeeDocSnap = await getDoc(employeeDocRef);

    if (employeeDocSnap.exists()) {
      const attendanceData = employeeDocSnap.data();
      const todayAttendance = attendanceData[today];

      if (todayAttendance) {
        return todayAttendance.signIn ? 'Sign Out' : 'Sign In';
      }
    }
    return 'Sign In';
  };

  const getFormattedDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSignIn = async (employeeId, employeeName, employeeDesignation) => {
    if (typeof employeeId !== 'string' || !employeeId.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Employee ID',
        text: 'The Employee ID is not valid. Please check and try again.',
      });
      return;
    }
    const today = getFormattedDate();
    const employeeDocRef = doc(fireDB, 'AttendanceData', employeeId);
    try {
      const employeeDocSnap = await getDoc(employeeDocRef);
      if (employeeDocSnap.exists()) {
        const attendanceData = employeeDocSnap.data();
        const todayAttendance = attendanceData[today];
        if (todayAttendance) {
          if (todayAttendance.signIn === true) {
            // Sign out the employee
            await updateDoc(employeeDocRef, {
              [`${today}.signIn`]: false,
              [`${today}.signOutTime`]: new Date().toLocaleString(),
            });
          } else {
            // Sign in the employee
            await updateDoc(employeeDocRef, {
              [`${today}.signIn`]: true,
              [`${today}.signInTime`]: new Date().toLocaleString(),
            });
          }
        } else {
          // Create new attendance record
          await updateDoc(employeeDocRef, {
            [today]: {
              employeeId: employeeId,
              employeeName: employeeName,
              designation: employeeDesignation,
              signInTime: new Date().toLocaleString(),
              signIn: true,
            },
          });
        }
      } else {
        await setDoc(employeeDocRef, {
          [today]: {
            employeeId: employeeId,
            employeeName: employeeName,
            designation: employeeDesignation,
            signInTime: new Date().toLocaleString(),
            signIn: true,
          },
        });
      }

      // Set flag in sessionStorage to show notification on page reload
      sessionStorage.setItem('attendanceSuccess', 'true');

      // Refresh the page
      window.location.reload();

    } catch (error) {
      console.error('Error in attendance handling:', error);

      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'An error occurred while processing the attendance. Please try again.',
      });
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('attendanceSuccess')) {
      setShowNotification(true);
      sessionStorage.removeItem('attendanceSuccess');
      setTimeout(() => {
        setShowNotification(false);
      }, 4000);
    }
  }, []);

  // Update the attendance button text when employee data or attendance data changes
  useEffect(() => {
    const updateAttendanceText = async () => {
      const newAttendanceText = {};
      for (const employee of employees) {
        const buttonText = await getAttendanceButtonText(employee.employeeId);
        newAttendanceText[employee.employeeId] = buttonText;
      }
      setAttendanceButtonText(newAttendanceText); // Set all attendance button texts
    };

    if (employees.length > 0) {
      updateAttendanceText();
    }
  }, [employees]);

  const handleAddLeave = async (employeeId) => {
    const employeeDocRef = doc(fireDB, 'EmployeeData', employeeId);
    const employeeDocSnap = await getDoc(employeeDocRef);

    if (employeeDocSnap.exists()) {
      const employeeData = employeeDocSnap.data();
      const leaveStatus = employeeData.LeaveStatus;
      const leaveDetails = employeeData.LeaveDetails;

      if (leaveStatus === 'Active') {
        const availableLeaves =
          leaveDetails.casualLeave > 0 ||
          leaveDetails.earnLeave > 0 ||
          leaveDetails.hplLeave > 0;

        if (availableLeaves) {
          Swal.fire({
            title: 'Select Leave Type',
            html: `
              <p>Paid leaves available:</p>
              <p>Casual Leave: ${leaveDetails.casualLeave}</p>
              <p>Earned Leave: ${leaveDetails.earnLeave}</p>
              <p>HPL Leave: ${leaveDetails.hplLeave}</p>
              <select id="leaveType" class="swal2-input">
                <option value="casualLeave">Casual Leave</option>
                <option value="earnLeave">Earned Leave</option>
                <option value="hplLeave">HPL Leave</option>
              </select>
              <input type="number" id="leaveDays" class="swal2-input" placeholder="Enter number of days" min="1" max="${Math.max(leaveDetails.casualLeave, leaveDetails.earnLeave, leaveDetails.hplLeave)}" />
            `,
            preConfirm: () => {
              const leaveType = document.getElementById('leaveType').value;
              const leaveDays = parseInt(document.getElementById('leaveDays').value);
              if (leaveDays <= 0 || isNaN(leaveDays)) {
                Swal.showValidationMessage('Please enter a valid number of days');
                return false;
              }
              return { leaveType, leaveDays };
            },
          }).then(async (result) => {
            if (result.isConfirmed) {
              const { leaveType, leaveDays } = result.value;

              if (leaveDetails[leaveType] >= leaveDays) {
                await updateDoc(employeeDocRef, {
                  [`LeaveDetails.${leaveType}`]: leaveDetails[leaveType] - leaveDays,
                });
                const updatedEmployeeDocSnap = await getDoc(employeeDocRef);
                const updatedLeaveDetails = updatedEmployeeDocSnap.data().LeaveDetails;

                if (
                  updatedLeaveDetails.casualLeave === 0 &&
                  updatedLeaveDetails.earnLeave === 0 &&
                  updatedLeaveDetails.hplLeave === 0
                ) {
                  await updateDoc(employeeDocRef, { LeaveStatus: 'Inactive' });
                }
                const currentDate = new Date().toISOString().split('T')[0];
                const attendanceDocRef = doc(fireDB, 'AttendanceData', employeeId);
                const attendanceDocSnap = await getDoc(attendanceDocRef);

                if (attendanceDocSnap.exists()) {
                  await updateDoc(attendanceDocRef, {
                    [`${currentDate}`]: {
                      signInSignOut: false,
                      PaidLeaves: {
                        leaveType,
                        leaveDays,
                        appliedDate: currentDate,
                      },
                    },
                  });
                } else {
                  await setDoc(attendanceDocRef, {
                    [`${currentDate}`]: {
                      signInSignOut: false,
                      PaidLeaves: {
                        leaveType,
                        leaveDays,
                        appliedDate: currentDate,
                      },
                    },
                  });
                }

                Swal.fire({
                  icon: 'success',
                  title: 'Leave Approved',
                  text: `${leaveDays} days of ${leaveType} has been deducted from ${employeeData.firstName} ${employeeData.lastName}'s leave balance.`,
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Insufficient Leave',
                  text: `You do not have enough ${leaveType} available.`,
                });
              }
            }
          });
        }
      } else {
        await updateDoc(employeeDocRef, { LeaveStatus: 'Inactive' });
        Swal.fire({
          title: 'No Paid Leaves Available',
          html: `
            <p>Paid leaves are not available. Take unpaid leaves instead.</p>
            <input type="number" id="unpaidLeaveDays" class="swal2-input" placeholder="Enter number of days" min="1" />
          `,
          preConfirm: () => {
            const unpaidLeaveDays = parseInt(document.getElementById('unpaidLeaveDays').value);
            if (unpaidLeaveDays <= 0 || isNaN(unpaidLeaveDays)) {
              Swal.showValidationMessage('Please enter a valid number of days');
              return false;
            }
            return { unpaidLeaveDays };
          },
        }).then(async (result) => {
          if (result.isConfirmed) {
            const { unpaidLeaveDays } = result.value;
            const currentDate = new Date().toISOString().split('T')[0];
            const attendanceDocRef = doc(fireDB, 'AttendanceData', employeeId);
            const attendanceDocSnap = await getDoc(attendanceDocRef);

            if (attendanceDocSnap.exists()) {
              await updateDoc(attendanceDocRef, {
                [`${currentDate}`]: {
                  signInSignOut: false,
                  UnpaidLeaves: {
                    leaveDays: unpaidLeaveDays,
                    appliedDate: currentDate,
                  },
                },
              });
            } else {
              await setDoc(attendanceDocRef, {
                [`${currentDate}`]: {
                  signInSignOut: false,
                  UnpaidLeaves: {
                    leaveDays: unpaidLeaveDays,
                    appliedDate: currentDate,
                  },
                },
              });
            }

            Swal.fire({
              icon: 'success',
              title: 'Unpaid Leave Recorded',
              text: `${unpaidLeaveDays} days of unpaid leave has been recorded for ${employeeData.firstName} ${employeeData.lastName}.`,
            });
          }
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Employee Not Found',
        text: 'This employee does not exist in the database.',
      });
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Sr. No',
        accessor: 'srNo',
      },
      {
        Header: 'Employee ID',
        accessor: 'employeeId',
      },
      {
        Header: 'Employee Name',
        accessor: 'employeeName',
      },
      {
        Header: 'Designation',
        accessor: 'designation',
      },
      {
        Header: 'Attendance',
        Cell: ({ row }) => {
          const employeeId = row.original.employeeId;
          const employeeName = row.original.employeeName;
          const employeeDesignation = row.original.designation;
          const buttonText = attendanceButtonText[employeeId] || 'Loading...';

          return (
            <button
              className={styles.signinOut}
              onClick={() => handleSignIn(employeeId, employeeName, employeeDesignation)}
            >
              {buttonText}
            </button>
          );
        },
      },
      {
        Header: 'Leave',
        Cell: ({ row }) => (
          <button className={styles.signinOut} onClick={() => handleAddLeave(row.original.employeeId)}>
            Add leave
          </button>
        ),
      },
      {
        Header: 'Action',
        Cell: ({ row }) => (
          <div className={styles.tableIcon}>
            <span onClick={() => handleEdit(row.original)}>
              <FaEdit />
            </span>
            <span className={styles.trash} onClick={() => handleDelete(row.original)}>
              <FaTrash />
            </span>
            <span className={styles.trash} onClick={() => handleCalendar(row.original)}>
              <FaCalendarAlt />
            </span>
          </div>
        ),
      },
    ],
    [attendanceButtonText, employeeStatus]
  );

  const handleCalendar = (employeeData) => {
    const employeeId = employeeData.employeeId;
    setSelectedEmployeeId(employeeId);
    setIsCalendarVisible(true);
    fetchAttendanceData(employeeId);
  };


  const handleEdit = async (rowData) => {
    setIsEditing(true);
    setEditData({
      employeeId: rowData.employeeId,
      employeeName: rowData.employeeName,
      designation: rowData.designation,
    });

    try {
      const employeeDocRef = doc(fireDB, 'EmployeeData', rowData.employeeId); // Get the doc by employeeId
      const employeeDocSnap = await getDoc(employeeDocRef);
      if (employeeDocSnap.exists()) {
        const employeeData = employeeDocSnap.data();
        setEditData({
          ...editData,
          employeeId: employeeData.employeeId,
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          email: employeeData.email,
          mobile: employeeData.mobile,
          role: employeeData.role,
          address: employeeData.address,
          leaveStatus: employeeData.LeaveStatus, // Assuming leaveStatus is in the employee data
        });
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (!editData.employeeId) {
        throw new Error('Employee ID is missing');
      }
      if (!editData.employeeName || editData.employeeName.split(' ').length < 2) {
        throw new Error('Employee name must have both first and last names');
      }
      const employeeDocRef = doc(fireDB, 'EmployeeData', editData.employeeId);
      const employeeDocSnap = await getDoc(employeeDocRef);
      if (!employeeDocSnap.exists()) {
        throw new Error('Employee document not found');
      }
      await updateDoc(employeeDocRef, {
        firstName: editData.employeeName.split(' ')[0],
        lastName: editData.employeeName.split(' ')[1],
        email: editData.email,
        designation: editData.designation,
        address: editData.address,
        mobile: editData.mobile,
        role: editData.role,
        leaveStatus: editData.leaveStatus,
      });
      Swal.fire('Updated!', `${editData.employeeName} details have been updated.`, 'success');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating manager:', error);
      Swal.fire('Error!', error.message || 'There was an issue updating the manager.', 'error');
    }
  };

  const handleDelete = (rowData) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to deactivate ${rowData.employeeName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, deactivate!',
      cancelButtonText: 'No, keep active!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const managerRef = doc(fireDB, 'EmployeeData', rowData.employeeId);
          await updateDoc(managerRef, {
            Status: 'InActive',
          });
          setManagers(prevManagers =>
            prevManagers.map(manager =>
              manager.employeeId === rowData.employeeId
                ? { ...manager, Status: 'InActive' }
                : manager
            )
          );
          Swal.fire('Deactivated!', `${rowData.employeeName} has been deactivated.`, 'success');
        } catch (error) {
          console.error('Error deactivating manager:', error);
          Swal.fire('Error!', 'There was an issue deactivating the manager.', 'error');
        }
      }
    });
  };


  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: employees,
  });

  const filteredTotRowals = rows.filter(row =>
    Object.values(row.original).some(field =>
      String(field).toLowerCase().includes(totalSearchQuery.toLowerCase())
    )
  );

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (year, month) => {
    const days = [];
    const firstDayOfMonth = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Fill in days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    // Add empty days at the start of the week
    const startDay = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    for (let i = 0; i < startDay; i++) {
      days.unshift(null);
    }

    return days;
  };

  // Hook to regenerate days whenever the current date changes
  useEffect(() => {
    getDaysInMonth();
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  // Change month to the next month
  const handleNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };


  const tileClassName = (date) => {
    const dateStr = formatDate(date);

    // Check for matching dates and return appropriate class
    if (leavesDate.includes(dateStr)) {
      return styles.leaves;
    }
    if (highlightedDates.includes(dateStr)) {
      return styles.presentt;
    }
    if (hoursNotComplete.includes(dateStr)) {
      return styles.notComplete;
    }
    if (halfDayDate.includes(dateStr)) {
      return styles.halfDay;
    }

    // Default class (if needed) to avoid empty strings
    return styles.default || null;
  };

  const fetchAttendanceData = async (employeeId) => {
    try {
      // Fetch attendance data for the given employee ID
      const docRef = doc(fireDB, "AttendanceData", employeeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const attendanceData = docSnap.data();
        let tempHighlightedDates = [];
        let tempHoursNotComplete = [];
        let tempLeavesDate = [];
        let temphalfDay = [];
        // Loop through each date object in the document
        for (const date in attendanceData) {
          const dateData = attendanceData[date];
          // Check if there's 'signInTime' and 'signOutTime'
          if (dateData.signInTime && dateData.signOutTime) {
            // Parse the sign-in and sign-out times
            const signInTime = parse(dateData.signInTime, 'MM/dd/yyyy, hh:mm:ss a', new Date());
            const signOutTime = parse(dateData.signOutTime, 'MM/dd/yyyy, hh:mm:ss a', new Date());
            // Calculate the worked hours
            const workedHours = (signOutTime - signInTime) / (1000 * 60 * 60);
            // Check if worked hours are greater than 8
            if (workedHours <= 5) {
              tempHoursNotComplete.push(date);
            } else if (workedHours >= 5 && workedHours <= 8) {
              temphalfDay.push(date);
            } else {
              tempHighlightedDates.push(date);
            }
          }
          if (dateData.UnpaidLeaves || dateData.PaidLeaves) {
            tempLeavesDate.push(date); // Add to leavesDate
          }
        }

        setHighlightedDates(tempHighlightedDates);
        setHoursNotComplete(tempHoursNotComplete);
        setLeavesDate(tempLeavesDate);
        setHalfDayDate(temphalfDay);
      } else {
        // If no matching document, clear the arrays
        console.log("No such document!");
        setHighlightedDates([]);
        setHoursNotComplete([]);
        setLeavesDate([]);
        setHalfDayDate([]);
      }
    } catch (error) {
      console.error("Error getting document:", error);

      // Ensure the arrays are cleared on error
      setHighlightedDates([]);
      setHoursNotComplete([]);
      setLeavesDate([]);
      setHalfDayDate([]);
    }
  };

  return (
    <div className={styles.main}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <ManagerSidebar />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.header}>
          {/* Left Side */}
          <div className={styles.headerLeft}>
            <span className={`${styles.dot} ${styles.red}`}></span>
            <span className={`${styles.dot} ${styles.yellow}`}></span>
            <span className={`${styles.dot} ${styles.green}`}></span>
            <span className={styles.pageTitle}>Employee Attendance</span>
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
        {showNotification && (
        <div className={styles.movingline}></div>
      )}


      <div className={styles.tables}>
          <div className={styles.searchContainer}>
            <div className={styles.collapseButtonContainer}>
              <p
                className={styles.collapseButton}
                onClick={() => setIsTotalCollapsed(!isTotalCollapsed)}
              >
                {isTotalCollapsed ? <AiOutlineDown /> : <AiOutlineUp />}
              </p>
              <h2>Employee Attendance</h2>
            </div>
            <input
              type="text"
              className={styles.searchBar}
              placeholder="Search employees..."
              value={totalSearchQuery}
              onChange={(e) => setTotalSearchQuery(e.target.value)}
            />
          </div>

          {/* Add scrollable wrapper */}
          <div className={styles.tableContainer}>
            <table {...getTableProps()} className={styles.table}>
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column, columnIndex) => (
                      <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {/* Render rows only if the table is not collapsed */}
                {!isTotalCollapsed &&
                  filteredTotRowals.map((row) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell) => (
                          <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                        ))}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {isEditing && (
          <div className={styles.modalOverlay}>
            <div className={styles.editForm}>
              <h3>Edit Employee</h3>
              {/* Displaying First Name and Last Name merged */}
              <div>
                <label>Employee Name</label>
                <input
                  type="text"
                  value={editData.employeeName}
                  onChange={(e) => setEditData({ ...editData, employeeName: e.target.value })}
                />

                {/* Other editable fields */}
                <label>Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </div>

              <div>
                <label>Designation</label>
                <input
                  type="text"
                  value={editData.designation}
                  onChange={(e) => setEditData({ ...editData, designation: e.target.value })}
                />

                <label>Address</label>
                <input
                  type="text"
                  value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                />
              </div>

              <div>
                <label>Mobile</label>
                <input
                  type="text"
                  value={editData.mobile}
                  onChange={(e) => setEditData({ ...editData, mobile: e.target.value })}
                />

                <label>Role</label>
                <input
                  type="text"
                  value={editData.role}
                  onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                />
              </div>

              {/* Readonly Leave Status */}
              <label>Leave Status</label>
              <input
                type="text"
                value={editData.leaveStatus || 'N/A'} // Assuming leaveStatus can be 'N/A' if it's not available
                readOnly
              />

              <div className={styles.editButtons}>
                <button onClick={handleSaveEdit}>Save</button>
                <button onClick={handleCancelEdit}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {isCalendarVisible && (
          <div className={styles.calendarPopup}>
            <div className={styles.calendarOverlay} onClick={() => setIsCalendarVisible(false)} />
            <div className={styles.calendarContent}>
              <h3>Calendar for Employee {selectedEmployeeId}</h3>

              <div className={styles.calendarControls}>
                <p className={styles.prv} onClick={handlePrevMonth}>&lt;</p>
                <span>{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</span>
                <p className={styles.prv} onClick={handleNextMonth}> &gt;</p>
              </div>

              <table className={styles.calendarTable}>
                <thead>
                  <tr>
                    <th>Sun</th>
                    <th>Mon</th>
                    <th>Tue</th>
                    <th>Wed</th>
                    <th>Thu</th>
                    <th>Fri</th>
                    <th>Sat</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Get the first day of the month and the total days in the month
                    const firstDayOfMonth = new Date(currentYear, currentMonth, 1); // Adjust `currentYear` and `currentMonth` variables
                    const startDay = firstDayOfMonth.getDay(); // Day of the week (0 = Sunday, 1 = Monday, etc.)
                    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate(); // Get total days in the month

                    const rows = [];
                    let dayCounter = 1;

                    // Generate 6 weeks (rows), each containing 7 days (cells)
                    for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
                      const cells = [];

                      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                        const cellIndex = rowIndex * 7 + dayIndex;

                        if (cellIndex < startDay || dayCounter > totalDays) {
                          // Add empty cell for offset or after the last day of the month
                          cells.push(<td key={dayIndex}></td>);
                        } else {
                          // Add the day cell
                          const date = new Date(currentYear, currentMonth, dayCounter);
                          const dateStr = formatDate(date);
                          const isHighlighted = highlightedDates.includes(dateStr);
                          const isLeaveDay = leavesDate.includes(dateStr);
                          const isHoursNotComplete = hoursNotComplete.includes(dateStr);
                          const isHalfDay = halfDayDate.includes(dateStr);
                          cells.push(
                            <td
                              key={dayIndex}
                              className={tileClassName(date)}
                              data-date={dateStr}
                            >
                              {isLeaveDay && (
                                <div className={styles.tooltip}>
                                  <div className={styles.present}>
                                    <p>On Leave</p>
                                  </div>
                                </div>
                              )}
                              {isHoursNotComplete && (
                                <div className={styles.tooltip}>
                                  <div className={styles.present}>
                                    <p>Minimum Hours Not Complete</p>
                                    <p>Absent</p>
                                  </div>
                                </div>
                              )}
                              {isHighlighted && (
                                <div className={styles.tooltip}>
                                  <div className={styles.present}>
                                    <p>Present</p>
                                  </div>
                                </div>
                              )}
                              {isHalfDay && (
                                <div className={styles.tooltip}>
                                  <div className={styles.present}>
                                    <p>Half Day</p>
                                  </div>
                                </div>
                              )}
                              {!isLeaveDay && !isHighlighted && !isHoursNotComplete && !isHalfDay && (
                                <div className={styles.tooltip}>
                                  <div className={styles.present}>
                                    <p>No Sign In</p>
                                    <p>No Sign Out</p>
                                  </div>
                                </div>
                              )}
                              {dayCounter++}
                            </td>
                          );
                        }
                      }

                      rows.push(<tr key={rowIndex}>{cells}</tr>);
                    }

                    return rows;
                  })()}
                </tbody>
              </table>
              <div className={styles.info}>
                <div>
                  <p>Present Days: {highlightedDates.length}</p>
                  <p>Absent Days: {hoursNotComplete.length}</p>
                </div>
                <div>
                  <p>Paid Leaves: {leavesDate.length}</p>
                  <p>Unpaid Leaves: {new Date(currentYear, currentMonth + 1, 0).getDate() - (leavesDate.length + highlightedDates.length)}</p>
                </div>
              </div>
              <button onClick={() => setIsCalendarVisible(false)} className={styles.closeButton}>Close</button>
            </div>
          </div>
        )}

        <WorkingHours employeeIds={employeeIds} />

      </div>
    </div>
  )
}

export default EmployeeAttendanceManager