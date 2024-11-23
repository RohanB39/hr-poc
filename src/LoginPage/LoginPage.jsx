import React, { useState } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { fireDB, auth, signInWithEmailAndPassword } from '../Firebase/FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import styles from './Login.module.css';
import Loginillustration from '../../public/assets/login.jpg';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(fireDB, 'Users'));
      let userFound = false;
      let userEmail = '';
      let userRole = '';
      let managerStatus = '';

      querySnapshot.forEach((doc) => {
        if (doc.id === username) {
          userFound = true;
          userEmail = doc.data().email;
          userRole = doc.data().role;
          managerStatus = doc.data().managerStatus;
        }
      });

      if (!userFound) {
        setError('Username not found');
        setLoading(false);
        return;
      }
      await signInWithEmailAndPassword(auth, userEmail, password);
      setLoading(false);

      if (userRole === 'Admin') {
        navigate('/admin-home');
      } else if (userRole === 'Manager') {
        if (!managerStatus) {
          navigate('/manager-error');
        } else if (managerStatus === 'Active') {
          navigate('/manager-home');
        }
      } else {
        setError('Invalid role');
        setLoading(false);
      }
      console.log('Login successful');
    } catch (err) {
      setError('Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.mainContainer}>
        <div className={styles.loginBox}>
          <h2>Login</h2>
          {error && <p className={styles.errorMessage}>{error}</p>}
          <div className={styles.inputGroup}>
            <FaUser className={styles.icon} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <FaLock className={styles.icon} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className={styles.sign}>
            <div className={styles.forgotPasswordLink}>
              <Link to="/registration">SignUp?</Link>
            </div>
            <div className={styles.forgotPasswordLink}>
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          </div>
          <button onClick={handleLogin} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
        <div className={styles.illustrationContainer}>
          <img
            src={Loginillustration}
            alt="Illustration"
            className={styles.illustration}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
