import React, { useEffect, useState } from 'react'
import styles from './ViewEmployee.module.css';
import { Bell, Power } from 'react-feather';
import ManagerSidebar from '../ManagerSidebar/ManagerSidebar';
import { AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
import { useTable } from 'react-table';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { fireDB } from '../../Firebase/FirebaseConfig';

const ViewEmployeesManager = () => {

  const [isPresentCollapsed, setIsPresentCollapsed] = useState(false);
  const [isTotalCollapsed, setIsTotalCollapsed] = useState(false);
  const [presentData, setPresentData] = useState([]);
  const [totalData, setTotalData] = useState([]);
  const [presentSearchQuery, setPresentSearchQuery] = useState('');
  const [totalSearchQuery, setTotalSearchQuery] = useState('');


  useEffect(() => {
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

    fetchTotalEmployeesData();
  }, []);

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

  const totalDataFiltered = React.useMemo(
    () =>
      totalData.filter((row) =>
        Object.values(row).some((field) =>
          String(field).toLowerCase().includes(totalSearchQuery.toLowerCase())
        )
      ),
    [totalData, totalSearchQuery]
  );
  const totalTable = useTable({ columns: totalColumns, data: totalDataFiltered });

  return (
    <div className={styles.main}>
      <div className={styles.sidebar}>
        <ManagerSidebar />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          {/* Left Side */}
          <div className={styles.headerLeft}>
            <span className={`${styles.dot} ${styles.red}`}></span>
            <span className={`${styles.dot} ${styles.yellow}`}></span>
            <span className={`${styles.dot} ${styles.green}`}></span>
            <span className={styles.pageTitle}>View & Edit Employee</span>
          </div>

          {/* Right Side */}
          <div className={styles.headerRight}>
            <Bell className={styles.icon} title="Notifications" />
            <Power className={styles.icon} title="Logout" />
          </div>
        </div>

        <div className={styles.tables}>
          <div className={styles.searchContainer}>
            <div>
              <p onClick={() => setIsTotalCollapsed(!isTotalCollapsed)}>
                {isTotalCollapsed ? <AiOutlineDown /> : <AiOutlineUp />}
              </p>
              <h2>Total Employees</h2>
            </div>
            <input
              className={styles.searchBar}
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
  )
}

export default ViewEmployeesManager