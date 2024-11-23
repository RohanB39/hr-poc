import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUserPlus, FaUsers, FaCalendarAlt, FaUserFriends, FaUserTie, FaBars } from 'react-icons/fa';
import styles from './ManagerSidebar.module.css';

const ManagerSidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
        console.log('Sidebar toggle clicked:', !isCollapsed);
    };

    return (
        <>
            <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
                <div className={styles.logo}>
                    Manager !
                </div>
                <ul className={styles.menu}>
                    <p className={styles.toggleicon} onClick={toggleSidebar}>
                        <FaBars />
                    </p>
                    <li className={styles.menuItem}>
                        <NavLink
                            to="/manager-home"
                            end
                            className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
                        >
                            <FaHome className={styles.icon} />
                            <span>Home</span>
                        </NavLink>
                    </li>
                    <li className={styles.menuItem}>
                        <NavLink
                            to="/createEmployee"
                            className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
                        >
                            <FaUserPlus className={styles.icon} />
                            <span>Create Employee</span>
                        </NavLink>
                    </li>
                    <li className={styles.menuItem}>
                        <NavLink
                            to="/ViewEmployee"
                            className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
                        >
                            <FaUserFriends className={styles.icon} />
                            <span>View Employees</span>
                        </NavLink>
                    </li>
                    <li className={styles.menuItem}>
                        <NavLink
                            to="/empattendance"
                            className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
                        >
                            <FaUsers className={styles.icon} />
                            <span>EMP Attendance</span>
                        </NavLink>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default ManagerSidebar;
