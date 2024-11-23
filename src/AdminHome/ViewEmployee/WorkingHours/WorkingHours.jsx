import React, { useState, useEffect } from 'react';
import { collection, doc, getDoc } from 'firebase/firestore';
import { fireDB } from '../../../Firebase/FirebaseConfig';
import styles from './WorkingHours.module.css';
import { AiOutlineDown, AiOutlineUp } from 'react-icons/ai';

const WorkingHours = ({ employeeIds }) => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [totalSearchQuery, setTotalSearchQuery] = useState('');

    useEffect(() => {
        const fetchAttendance = async () => {
            const data = [];
            const today = new Date().toISOString().split('T')[0]; // Format date as "YYYY-MM-DD"
            // Create an object to hold employee names for faster lookup
            const employeeNames = {};

            // Fetch employee details (firstName + lastName) for each employeeId
            for (const employeeId of employeeIds) {
                const employeeRef = doc(fireDB, 'EmployeeData', employeeId);
                const employeeDocSnap = await getDoc(employeeRef);
                if (employeeDocSnap.exists()) {
                    const employeeData = employeeDocSnap.data();
                    const fullName = `${employeeData.firstName} ${employeeData.lastName}`;
                    employeeNames[employeeId] = fullName; // Store full name in the object
                } else {
                    employeeNames[employeeId] = 'No Name'; // Default value if no employee data
                }
            }

            // Now fetch attendance data for each employeeId
            for (const employeeId of employeeIds) {
                const docRef = doc(collection(fireDB, 'AttendanceData'), employeeId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const attendance = docSnap.data();
                    const todayData = attendance[today]; // Get today's attendance object

                    // Fetch the employee name from the employeeNames object or default to 'No Name'
                    const employeeName = employeeNames[employeeId] || 'No Name';

                    if (todayData) {
                        // Extract signInTime and signOutTime, if available
                        const signInTime = todayData.signInTime ? new Date(todayData.signInTime).toLocaleTimeString() : null;
                        const signOutTime = todayData.signOutTime ? new Date(todayData.signOutTime).toLocaleTimeString() : null;

                        // Initialize working hours
                        let workingHours = '0 hrs';

                        // Calculate working hours if both signInTime and signOutTime are available
                        if (signInTime && signOutTime) {
                            const signInDate = new Date(todayData.signInTime);
                            const signOutDate = new Date(todayData.signOutTime);
                            const hours = Math.abs(signOutDate - signInDate) / 36e5; // Calculate hours difference
                            workingHours = `${hours.toFixed(2)} hrs`;
                        }

                        // Push data for today's attendance
                        data.push({
                            employeeId,
                            employeeName, // Add employee name here
                            signIn: signInTime || 'Not Signed In',
                            signOut: signOutTime || 'Not Signed Out',
                            workingHours,
                        });
                    } else {
                        // If no attendance data for today
                        data.push({
                            employeeId,
                            employeeName, // Add employee name here
                            signIn: 'Not Signed In',
                            signOut: 'Not Signed Out',
                            workingHours: '0 hrs',
                        });
                    }
                } else {
                    // If no document found in 'AttendanceData' for the employeeId
                    data.push({
                        employeeId,
                        employeeName: employeeNames[employeeId] || 'No Data', // Add employee name here
                        signIn: 'No Data',
                        signOut: 'No Data',
                        workingHours: '0 hrs',
                    });
                }
            }


            setAttendanceData(data);
        };

        fetchAttendance();
    }, [employeeIds]);

    const columns = React.useMemo(
        () => [
            { Header: 'Employee ID', accessor: 'employeeId' },
            { Header: 'Employee Name', accessor: 'employeeName' }, // Employee Name column
            { Header: 'Sign In', accessor: 'signIn' },
            { Header: 'Sign Out', accessor: 'signOut' },
            { Header: 'Working Hours', accessor: 'workingHours' },
            {
                Header: 'Action',
                accessor: 'action',
                Cell: ({ row }) => (
                    <button
                        onClick={() => handleMarkAbsent(row.original.employeeId)}
                        className={styles.absentButton}
                    >
                        Mark as Absent
                    </button>
                ),
            },
        ],
        []
    );

    const filteredTotRowals = attendanceData.filter(row =>
        row && Object.values(row).some(field =>
            String(field).toLowerCase().includes(totalSearchQuery.toLowerCase())
        )
    );


    return (
        <div className={styles.tableContainer}>
        <h4>Working Hours</h4>
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    className={styles.searchBar}
                    placeholder="Search employees..."
                    value={totalSearchQuery}
                    onChange={(e) => setTotalSearchQuery(e.target.value)}
                />
            </div>
            <table className={styles.table}>
                <thead className={styles.thead}>
                    <tr className={styles.tr}>
                        {columns.map((col, index) => (
                            <th key={index} className={styles.th}>{col.Header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filteredTotRowals && filteredTotRowals.map((row, index) => (
                        <tr key={index} className={styles.tr}>
                            {columns.map((col, colIndex) => (
                                <td key={colIndex} className={styles.td} data-label={col.Header}>
                                    {row[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>

            </table>
        </div>
    );
};

export default WorkingHours;
