import React, { useState, useEffect } from 'react';
import styles from './ViewManagers.module.css';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import { Bell, Power } from 'react-feather';
import { useTable } from 'react-table';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { AiOutlineUp, AiOutlineDown } from 'react-icons/ai';
import { getDocs, collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { fireDB } from '../../Firebase/FirebaseConfig';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../Firebase/FirebaseConfig';

const ViewManagers = () => {
  const [isTotalCollapsed, setIsTotalCollapsed] = useState(false);
  const [totalSearchQuery, setTotalSearchQuery] = useState('');
  const [managers, setManagers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

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
    const fetchManagers = async () => {
      try {
        const q = query(
          collection(fireDB, 'Users'),
          where('role', '==', 'Manager'),
          where('managerStatus', '==', 'Active')
        );
        const querySnapshot = await getDocs(q);
        const managersList = querySnapshot.docs.map((doc, index) => {
          const data = doc.data();
          const employeeName = `${data.firstName} ${data.lastName}`;
          return {
            srNo: index + 1,
            employeeId: doc.id,
            employeeName,
            designation: 'Manager',
            address: data.address || 'N/A',
          };
        });
        setManagers(managersList);
      } catch (error) {
        console.error('Error fetching managers data:', error);
      }
    };

    fetchManagers();
  }, []);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Sr. No',
        accessor: 'srNo',
      },
      {
        Header: 'Manager Username',
        accessor: 'employeeId',
      },
      {
        Header: 'Manager Name',
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
            <span onClick={() => handleEdit(row.original)}>
              <FaEdit />
            </span>
            <span className={styles.trash} onClick={() => handleDelete(row.original)}>
              <FaTrash />
            </span>
          </div>
        ),
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: managers,
  });

  const filteredManagers = rows.filter(row =>
    Object.values(row.original).some(field =>
      String(field).toLowerCase().includes(totalSearchQuery.toLowerCase())
    )
  );

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
          const managerRef = doc(fireDB, 'Users', rowData.employeeId);
          await updateDoc(managerRef, {
            managerStatus: 'InActive',
          });
          setManagers(prevManagers =>
            prevManagers.map(manager =>
              manager.employeeId === rowData.employeeId
                ? { ...manager, managerStatus: 'InActive' }
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

  const handleEdit = (rowData) => {
    setIsEditing(true);
    setEditData({
      employeeId: rowData.employeeId,
      employeeName: rowData.employeeName,
      designation: rowData.designation,
      address: rowData.address,
    });
  };

  const handleSaveEdit = async () => {
    try {
      const managerRef = doc(fireDB, 'Users', editData.employeeId);
      await updateDoc(managerRef, {
        firstName: editData.employeeName.split(' ')[0],
        lastName: editData.employeeName.split(' ')[1],
        designation: editData.designation,
        address: editData.address,
      });
      setManagers(prevManagers =>
        prevManagers.map(manager =>
          manager.employeeId === editData.employeeId
            ? { ...manager, employeeName: editData.employeeName, designation: editData.designation, address: editData.address }
            : manager
        )
      );

      Swal.fire('Updated!', `${editData.employeeName} details have been updated.`, 'success');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating manager:', error);
      Swal.fire('Error!', 'There was an issue updating the manager.', 'error');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
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
            <span className={styles.pageTitle}>View Managers</span>
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

        <div className={styles.tables}>
          <div className={styles.searchContainer}>
            <div className={styles.collapseButtonContainer}>
              <p
                className={styles.collapseButton}
                onClick={() => setIsTotalCollapsed(!isTotalCollapsed)}
              >
                {isTotalCollapsed ? <AiOutlineDown /> : <AiOutlineUp />}
              </p>
              <h2>Total Managers</h2>
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
                    {headerGroup.headers.map((column) => (
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
                  filteredManagers.map((row) => {
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
              <h3>Edit Manager</h3>
              <label>Employee Name</label>
              <input
                type="text"
                value={editData.employeeName}
                onChange={(e) => setEditData({ ...editData, employeeName: e.target.value })}
              />
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
              <div className={styles.editButtons}>
                <button onClick={handleSaveEdit}>Save</button>
                <button onClick={handleCancelEdit}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewManagers;
