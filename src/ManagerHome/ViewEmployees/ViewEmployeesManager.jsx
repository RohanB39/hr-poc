import React from 'react'
import styles from './ViewEmployee.module.css';
import { Bell, Power } from 'react-feather';
import ManagerSidebar from '../ManagerSidebar/ManagerSidebar';

const ViewEmployeesManager = () => {
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
      </div>
    </div>
  )
}

export default ViewEmployeesManager