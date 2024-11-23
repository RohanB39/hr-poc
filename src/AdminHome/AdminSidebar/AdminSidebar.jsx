import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUserPlus, FaUsers, FaCalendarAlt, FaUserFriends, FaUserTie, FaBars } from 'react-icons/fa';
import styles from './AdminSidebar.module.css';

const AdminSidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
        console.log('Sidebar toggle clicked:', !isCollapsed);
    };

    return (
        <>
            <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
                <div className={styles.logo}>
                    ADMIN !
                </div>
                <ul className={styles.menu}>
                    <p className={styles.toggleicon} onClick={toggleSidebar}>
                        <FaBars />
                    </p>
                    <li className={styles.menuItem}>
                        <NavLink
                            to="/admin-home"
                            end
                            className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
                        >
                            <FaHome className={styles.icon} />
                            <span>Home</span>
                        </NavLink>
                    </li>
                    <li className={styles.menuItem}>
                        <NavLink
                            to="/invite-manager"
                            className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
                        >
                            <FaUserTie className={styles.icon} />
                            <span>Invite Manager</span>
                        </NavLink>
                    </li>
                    <li className={styles.menuItem}>
                        <NavLink
                            to="/create-employee"
                            className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
                        >
                            <FaUserPlus className={styles.icon} />
                            <span>Create Employee</span>
                        </NavLink>
                    </li>
                    <li className={styles.menuItem}>
                        <NavLink
                            to="/create-leaves"
                            className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
                        >
                            <FaCalendarAlt className={styles.icon} />
                            <span>Create Leaves</span>
                        </NavLink>
                    </li>
                    <li className={styles.menuItem}>
                        <NavLink
                            to="/view-managers"
                            className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
                        >
                            <FaUserFriends className={styles.icon} />
                            <span>View Managers</span>
                        </NavLink>
                    </li>
                    <li className={styles.menuItem}>
                        <NavLink
                            to="/view-employees"
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

export default AdminSidebar;
