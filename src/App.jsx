import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminRegistration from './AdminRegistration/AdminRegistration';
import AdminHome from './AdminHome/AdminHome';
import ManagerHome from './ManagerHome/ManagerHome';
import EmployeeHome from './EmployeeHome/EmployeeHome';
import LoginPage from './LoginPage/LoginPage';
import './App.css';
import ForgetPassword from './ForgetPassword/ForgetPassword';
import ManagerError from './ManagerError/ManagerError';
import CreateEmployee from './AdminHome/CreateEmployee/CreateEmployee';
import InviteManager from './AdminHome/InviteManager/InviteManager';
import CreateLeaves from './AdminHome/CreateLeaves/CreateLeaves';
import ViewManagers from './AdminHome/ViewManagers/ViewManagers';
import ViewEmployee from './AdminHome/ViewEmployee/ViewEmployee';
import CreateEmployeeManager from './ManagerHome/createEmployeeManager/CreateEmployeeManager';
import ViewEmployeesManager from './ManagerHome/ViewEmployees/ViewEmployeesManager';
import EmployeeAttendanceManager from './ManagerHome/EmployeeAttendance/EmployeeAttendanceManager';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/registration" element={<AdminRegistration />} />
          <Route path="/admin-home" element={<AdminHome />} />
          <Route path="/manager-home" element={<ManagerHome />} />
          <Route path="/employee-home" element={<EmployeeHome />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/manager-error" element={<ManagerError />} />
          <Route path="/create-employee" element={<CreateEmployee />} />
          <Route path="/invite-manager" element={<InviteManager />} />
          <Route path="/create-leaves" element={<CreateLeaves />} />
          <Route path="/view-managers" element={<ViewManagers />} />
          <Route path="/view-employees" element={<ViewEmployee />} />
          <Route path="/createEmployee" element={<CreateEmployeeManager />} />
          <Route path="/ViewEmployee" element={<ViewEmployeesManager />} />
          <Route path="/empattendance" element={<EmployeeAttendanceManager />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
