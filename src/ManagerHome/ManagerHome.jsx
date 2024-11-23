import React, { useState } from 'react'
import styles from './ManagerHome.module.css';
import ManagerSidebar from './ManagerSidebar/ManagerSidebar';
import { Bell, Power } from 'react-feather';
import { useTable } from 'react-table';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { AiOutlineUp, AiOutlineDown } from 'react-icons/ai';

const ManagerHome = () => {

  const [isPresentCollapsed, setIsPresentCollapsed] = useState(false);
  const [isAbsentCollapsed, setIsAbsentCollapsed] = useState(false);
  const [isTotalCollapsed, setIsTotalCollapsed] = useState(false);

  const data = React.useMemo(
    () => [
      { srNo: 1, employeeId: 'E001', employeeName: 'John Doe', designation: 'Software Engineer', address: '123 Main St' },
      { srNo: 2, employeeId: 'E002', employeeName: 'Jane Smith', designation: 'Product Manager', address: '456 Oak St' },
      { srNo: 3, employeeId: 'E003', employeeName: 'Sam Brown', designation: 'Designer', address: '789 Pine St' },
      { srNo: 4, employeeId: 'E004', employeeName: 'Anna Lee', designation: 'QA Engineer', address: '101 Maple St' },
      { srNo: 5, employeeId: 'E004', employeeName: 'Anna Lee', designation: 'QA Engineer', address: '101 Maple St' },
      { srNo: 6, employeeId: 'E004', employeeName: 'Anna Lee', designation: 'QA Engineer', address: '101 Maple St' },
      { srNo: 7, employeeId: 'E004', employeeName: 'Anna Lee', designation: 'QA Engineer', address: '101 Maple St' },
    ],
    []
  );

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
        Header: 'Address',
        accessor: 'address',
      },
      {
        Header: 'Action',
        Cell: ({ row }) => (
          <div className={styles.tableIcon}>
            <span onClick={() => handleEdit(row.original)} >
              <FaEdit />
            </span>
            <span className={styles.trash} onClick={() => handleDelete(row.original)} >
              <FaTrash />
            </span>
          </div>
        ),
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });

  const [presentsearchQuery, setpresentSearchQuery] = useState('');
  const [absentsearchQuery, seabsentSearchQuery] = useState('');
  const [totalearchQuery, setTotalSearchQuery] = useState('');

  // Filter rows based on the search query
  const filteredOresentRows = rows.filter(row =>
    Object.values(row.original).some(field =>
      String(field).toLowerCase().includes(presentsearchQuery.toLowerCase())
    )
  );

  const filteredAbsentRows = rows.filter(row =>
    Object.values(row.original).some(field =>
      String(field).toLowerCase().includes(absentsearchQuery.toLowerCase())
    )
  );

  const filteredTotRowals = rows.filter(row =>
    Object.values(row.original).some(field =>
      String(field).toLowerCase().includes(totalearchQuery.toLowerCase())
    )
  );


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
            <span className={styles.pageTitle}>Home Page</span>
          </div>

          {/* Right Side */}
          <div className={styles.headerRight}>
            <Bell className={styles.icon} title="Notifications" />
            <Power className={styles.icon} title="Logout" />
          </div>
        </div>

        <div className={styles.dashboardContent}>
          <div className={styles.tables}>
            <div className={styles.searchContainer}>
              <div className={styles.collapseButtonContainer}>
                <p
                  className={styles.collapseButton}
                  onClick={() => setIsPresentCollapsed(!isPresentCollapsed)}
                >
                  {isPresentCollapsed ? <AiOutlineDown /> : <AiOutlineUp />}
                </p>
                <h2 className={styles.present}>Today's Present Employees</h2>
              </div>
              <input
                type="text"
                className={styles.searchBar}
                placeholder="Search employees..."
                value={presentsearchQuery}
                onChange={(e) => setpresentSearchQuery(e.target.value)}
              />
            </div>

            {/* Add scrollable wrapper */}
            <div className={styles.tableContainer}>
              <table {...getTableProps()} className={styles.table}>
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column, columnIndex) => (
                        <th {...column.getHeaderProps()}>
                          {column.render('Header')}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {/* Render rows only if the table is not collapsed */}
                  {!isPresentCollapsed &&
                    filteredOresentRows.map((row) => {
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


          <div className={styles.tables}>
            <div className={styles.searchContainer}>
              <div className={styles.collapseButtonContainer}>
                <p
                  className={styles.collapseButton}
                  onClick={() => setIsAbsentCollapsed(!isAbsentCollapsed)}
                >
                  {isAbsentCollapsed ? <AiOutlineDown /> : <AiOutlineUp />}
                </p>
                <h2 className={styles.absent}>Today's Absent Employees</h2>
              </div>
              <input
                type="text"
                className={styles.searchBar}
                placeholder="Search employees..."
                value={absentsearchQuery}
                onChange={(e) => seabsentSearchQuery(e.target.value)}
              />
            </div>

            {/* Add scrollable wrapper */}
            <div className={styles.tableContainer}>
              <table {...getTableProps()} className={styles.table}>
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column, columnIndex) => (
                        <th {...column.getHeaderProps()}>
                          {column.render('Header')}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {/* Render rows only if the table is not collapsed */}
                  {!isAbsentCollapsed &&
                    filteredAbsentRows.map((row) => {
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

          <div className={styles.tables}>
            <div className={styles.searchContainer}>
              <div className={styles.collapseButtonContainer}>
                <p
                  className={styles.collapseButton}
                  onClick={() => setIsTotalCollapsed(!isTotalCollapsed)}
                >
                  {isTotalCollapsed ? <AiOutlineDown /> : <AiOutlineUp />}
                </p>
                <h2>Total Employees</h2>
              </div>
              <input
                type="text"
                className={styles.searchBar}
                placeholder="Search employees..."
                value={totalearchQuery}
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
                        <th {...column.getHeaderProps()}>
                          {column.render('Header')}
                        </th>
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

        </div>
      </div>
    </div>
  )
}

export default ManagerHome