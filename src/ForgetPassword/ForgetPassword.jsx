import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { fireDB } from '../Firebase/FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import Swal from 'sweetalert2';
import styles from './Forget.module.css';
import forgetIllustration from '../assets/forget.jpg';
import { Link } from 'react-router-dom';
import emailjs from 'emailjs-com';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const ForgetPassword = () => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [otpInput, setOtpInput] = useState('');

    const handleSendOtp = async () => {
        setLoading(true);
        setError('');

        try {
            const usersRef = collection(fireDB, 'Users');
            const userSnapshot = await getDocs(usersRef);
            const userDoc = userSnapshot.docs.find(doc => doc.id === username);
            if (userDoc) {
                const email = userDoc.data().email;
                const firstName = userDoc.data().firstName;
                const lastName = userDoc.data().lastName;
                const userFullName = `${firstName} ${lastName}`;
                setUserEmail(email);
                const otp = Math.floor(100000 + Math.random() * 900000);
                sendOtpEmail(email, userFullName, otp);
                Swal.fire({
                    title: 'Enter OTP',
                    text: `An OTP has been sent to ${email}. Please enter the OTP.`,
                    input: 'text',
                    showCancelButton: true,
                    confirmButtonText: 'Verify',
                    cancelButtonText: 'Cancel',
                    preConfirm: (otpInput) => {
                        setOtpInput(otpInput);
                        if (otpInput !== otp.toString()) {
                            Swal.showValidationMessage('Invalid OTP. Please try again.');
                            return false;
                        }
                        setOtpVerified(true);
                        return true;
                    }
                });
            } else {
                setError('Username not found!');
                setLoading(false);
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };
    const sendOtpEmail = (userEmail, userFullName, otp) => {
        const templateParams = {
            to_email: userEmail,
            to_name: userFullName,
            to_otp: otp,
        };

        emailjs
            .send('service_npxb19n', 'template_98k8q9e', templateParams, '9BlMSdgu7t1eZRCvj')
            .then(
                (response) => {
                    console.log('OTP sent successfully:', response);
                },
                (error) => {
                    console.error('Error sending OTP:', error);
                }
            );
    };

    const handlePasswordUpdate = async () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }
        try {
            if (userEmail) {
                const auth = getAuth();
                await sendPasswordResetEmail(auth, userEmail);
    
                Swal.fire('Password Reset Email Sent', 'Please check your inbox to reset your password.', 'success');
            } else {
                setError('No email found!');
            }
        } catch (error) {
            setError('Error sending password reset email');
            console.error('Error sending password reset email: ', error);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.mainContainer}>
                <div className={styles.illustrationContainer}>
                    <img
                        src={forgetIllustration}
                        alt="Illustration"
                        className={styles.illustration}
                    />
                </div>
                <div className={styles.loginBox}>
                    <h2>Forgot Password</h2>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    {!otpVerified && (
                        <div className={styles.inputGroup}>
                            <FaUser className={styles.icon} />
                            <input
                                type="text"
                                placeholder="Enter Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    )}
                    
                    {!otpVerified && (
                        <div className={styles.forgotPasswordLink}>
                            <Link to="/">Login</Link>
                        </div>
                    )}

                    {!otpVerified && (
                        <button onClick={handleSendOtp} disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    )}

                    {otpVerified && (
                        <>
                            <div className={styles.inputGroup}>
                                <p>{userEmail}</p>
                            </div>
                            <button onClick={handlePasswordUpdate}>Send Link</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgetPassword;