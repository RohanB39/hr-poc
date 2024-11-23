import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { fireDB } from '../Firebase/FirebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Swal from 'sweetalert2';
import styles from './Forget.module.css';
import forgetIllustration from '../../public/assets/forget.jpg';
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
    const [otp, setOtp] = useState('');

    const handleSendOtp = async () => {
        setLoading(true);
        setError('');

        try {
            // Check if username exists in Firestore
            const usersRef = collection(fireDB, 'Users');
            const q = query(usersRef, where("username", "==", username));  // Query by username field
            const userSnapshot = await getDocs(q);

            if (!userSnapshot.empty) {
                const userDoc = userSnapshot.docs[0];
                const email = userDoc.data().email;
                const firstName = userDoc.data().firstName;
                const lastName = userDoc.data().lastName;
                const userFullName = `${firstName} ${lastName}`;
                setUserEmail(email);

                // Generate OTP
                const generatedOtp = Math.floor(100000 + Math.random() * 900000);
                setOtp(generatedOtp);  // Store OTP to verify later
                sendOtpEmail(email, userFullName, generatedOtp);

                Swal.fire({
                    title: 'Enter OTP',
                    text: `An OTP has been sent to ${email}. Please enter the OTP.`,
                    input: 'text',
                    showCancelButton: true,
                    confirmButtonText: 'Verify',
                    cancelButtonText: 'Cancel',
                    preConfirm: (otpInput) => {
                        setOtpInput(otpInput);
                        if (otpInput !== generatedOtp.toString()) {
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
            console.error('Error fetching user data:', error);
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
                    
                    {/* Input for username */}
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

                    {/* Link to Login page */}
                    {!otpVerified && (
                        <div className={styles.forgotPasswordLink}>
                            <Link to="/">Login</Link>
                        </div>
                    )}

                    {/* Send OTP Button */}
                    {!otpVerified && (
                        <button onClick={handleSendOtp} disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    )}

                    {/* Display email and send reset link if OTP is verified */}
                    {otpVerified && (
                        <>
                            <div className={styles.inputGroup}>
                                <p>{userEmail}</p>
                            </div>
                            <button onClick={handlePasswordUpdate}>Send Reset Link</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgetPassword;
