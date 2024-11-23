import React, { useEffect, useState } from 'react';
import { Bell, Power } from 'react-feather';
import AdminSidebar from './AdminSidebar/AdminSidebar';
import styles from './AdminHome.module.css';
import { useTable } from 'react-table';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { AiOutlineUp, AiOutlineDown } from 'react-icons/ai';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { fireDB } from '../Firebase/FirebaseConfig';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../Firebase/FirebaseConfig';

const AdminHome = () => {
  const [isPresentCollapsed, setIsPresentCollapsed] = useState(false);
  const [isTotalCollapsed, setIsTotalCollapsed] = useState(false);
  const [presentData, setPresentData] = useState([]);
  const [totalData, setTotalData] = useState([]);
  const [presentSearchQuery, setPresentSearchQuery] = useState('');
  const [totalSearchQuery, setTotalSearchQuery] = useState('');

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
    // Fetch Present Employees Data
    const fetchAttendanceData = async () => {
      try {
        const todayDate = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD
        const attendanceCollection = collection(fireDB, 'AttendanceData');
        const snapshot = await getDocs(attendanceCollection);

        let matchingData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data[todayDate]) {
            const entry = data[todayDate];
            matchingData.push({
              employeeId: entry.employeeId,
              employeeName: entry.employeeName,
              designation: entry.designation,
              signInTime: entry.signInTime,
              signOutTime: entry.signOutTime,
            });
          }
        });

        setPresentData(matchingData);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };

    // Fetch Total Employees Data
    const fetchTotalEmployeesData = async () => {
      try {
        const employeeQuery = query(
          collection(fireDB, 'EmployeeData'),
          where('Status', '==', 'Active')
        );
        const snapshot = await getDocs(employeeQuery);

        const activeEmployees = snapshot.docs.map((doc) => ({
          id: doc.id,
          firstName: doc.data().firstName,
          lastName: doc.data().lastName,
          designation: doc.data().designation,
          address: doc.data().address,
          mobile: doc.data().mobile,
        }));

        setTotalData(activeEmployees);
      } catch (error) {
        console.error('Error fetching total employees data:', error);
      }
    };

    fetchAttendanceData();
    fetchTotalEmployeesData();
  }, []);

  // Define Present Employees Table Columns
  const presentColumns = React.useMemo(
    () => [
      { Header: 'Sr. No', accessor: (row, i) => i + 1 },
      { Header: 'Employee ID', accessor: 'employeeId' },
      { Header: 'Employee Name', accessor: 'employeeName' },
      { Header: 'Designation', accessor: 'designation' },
      { Header: 'Sign-In Time', accessor: 'signInTime' },
      { Header: 'Sign-Out Time', accessor: 'signOutTime' },
    ],
    []
  );

  // Define Total Employees Table Columns
  const totalColumns = React.useMemo(
    () => [
      { Header: 'Sr. No', accessor: (row, i) => i + 1 },
      { Header: 'First Name', accessor: 'firstName' },
      { Header: 'Last Name', accessor: 'lastName' },
      { Header: 'Designation', accessor: 'designation' },
      { Header: 'Address', accessor: 'address' },
      { Header: 'Mobile', accessor: 'mobile' },
    ],
    []
  );

  // Filter Present Data
  const presentDataFiltered = React.useMemo(
    () =>
      presentData.filter((row) =>
        Object.values(row).some((field) =>
          String(field).toLowerCase().includes(presentSearchQuery.toLowerCase())
        )
      ),
    [presentData, presentSearchQuery]
  );

  // Filter Total Employees Data
  const totalDataFiltered = React.useMemo(
    () =>
      totalData.filter((row) =>
        Object.values(row).some((field) =>
          String(field).toLowerCase().includes(totalSearchQuery.toLowerCase())
        )
      ),
    [totalData, totalSearchQuery]
  );

  // React-Table Hooks for Present and Total Tables
  const presentTable = useTable({ columns: presentColumns, data: presentDataFiltered });
  const totalTable = useTable({ columns: totalColumns, data: totalDataFiltered });

  return (
    <div className={styles.main}>
      <div className={styles.sidebar}>
        <AdminSidebar />
      </div>

      <div className={styles.content}>
      <div className={styles.header}>
          {/* Left Side */}
          <div className={styles.headerLeft}>
            <span className={`${styles.dot} ${styles.red}`}></span>
            <span className={`${styles.dot} ${styles.yellow}`}></span>
            <span className={`${styles.dot} ${styles.green}`}></span>
            <span className={styles.pageTitle}>Home Admin</span>
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
        {/* Present Employees Table */}
        <div className={styles.tables}>
          <div className={styles.searchContainer}>
            <p onClick={() => setIsPresentCollapsed(!isPresentCollapsed)}>
              {isPresentCollapsed ? <AiOutlineDown /> : <AiOutlineUp />}
            </p>
            <h2>Today's Present Employees</h2>
            <input
              type="text"
              placeholder="Search employees..."
              value={presentSearchQuery}
              onChange={(e) => setPresentSearchQuery(e.target.value)}
            />
          </div>
          {!isPresentCollapsed && (
            <table {...presentTable.getTableProps()} className={styles.table}>
              <thead>
                {presentTable.headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...presentTable.getTableBodyProps()}>
                {presentTable.rows.map((row) => {
                  presentTable.prepareRow(row);
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
          )}
        </div>

        {/* Total Employees Table */}
        <div className={styles.tables}>
          <div className={styles.searchContainer}>
            <p onClick={() => setIsTotalCollapsed(!isTotalCollapsed)}>
              {isTotalCollapsed ? <AiOutlineDown /> : <AiOutlineUp />}
            </p>
            <h2>Total Employees</h2>
            <input
              type="text"
              placeholder="Search employees..."
              value={totalSearchQuery}
              onChange={(e) => setTotalSearchQuery(e.target.value)}
            />
          </div>
          {!isTotalCollapsed && (
            <table {...totalTable.getTableProps()} className={styles.table}>
              <thead>
                {totalTable.headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...totalTable.getTableBodyProps()}>
                {totalTable.rows.map((row) => {
                  totalTable.prepareRow(row);
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
