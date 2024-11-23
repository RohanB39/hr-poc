import React, { useState } from "react";
import { auth, fireDB } from "../Firebase/FirebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc, query, where, getDocs } from "firebase/firestore";
import adminStyle from './Admin.module.css';
import RegistrationImage from '../assets/registration.png';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function AdminRegistration() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobileNumber: "",
        username: "",
        role: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();
    const [usernameAvailable, setUsernameAvailable] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "username") {
            checkUsernameAvailability(value);
        }
    };

    const checkUsernameAvailability = async (username) => {
        if (username.length === 0) {
            setUsernameAvailable(null);
            return;
        }

        try {
            const q = query(collection(fireDB, "Users"), where("__name__", "==", username));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setUsernameAvailable(true);
            } else {
                setUsernameAvailable(false);
            }
        } catch (err) {
            setError("Error checking username availability");
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (usernameAvailable === false) {
            setError("Username is not available.");
            return;
        }

        try {
            if (!formData.username) {
                throw new Error("Username is required.");
            }
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const userDetails = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                mobileNumber: formData.mobileNumber,
                role: formData.role,
            };
            await setDoc(doc(collection(fireDB, "Users"), formData.username), userDetails);
            Swal.fire({
                icon: 'success',
                title: 'Registration Successful!',
                text: `${formData.role} Has beed registered successfully..!`,
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                navigate('/');
            });
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                mobileNumber: "",
                username: "",
                role: "",
                password: "",
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Registration Failed!',
                text: err.message,
                showConfirmButton: true
            });
            setError(err.message);
        }
    };

    return (
        <div className={adminStyle.container}>
            <div className={adminStyle.mainContainer}>
                <div className={adminStyle.illustration}>
                    <img src={RegistrationImage} alt="Registration Illustration" className={adminStyle.image} />
                </div>
                <div className={adminStyle.formContainer}>
                    <h4 className={adminStyle.header}>Registration</h4>
                    <form className={adminStyle.form} onSubmit={handleSubmit}>
                        <div className={adminStyle.inputRow}>
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={adminStyle.input}
                                required
                            />
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={adminStyle.input}
                                required
                            />
                        </div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className={adminStyle.input}
                            required
                        />
                        <input
                            type="text"
                            name="mobileNumber"
                            placeholder="Mobile Number"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            className={adminStyle.input}
                            required
                        />
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            className={adminStyle.input}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className={adminStyle.input}
                            required
                        />
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className={adminStyle.select}
                            required
                        >
                            <option value="" disabled>
                                Select Role
                            </option>
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                        </select>
                        <button type="submit" className={adminStyle.button}>
                            Register
                        </button>
                    </form>
                    {usernameAvailable === false && (
                        <p className={adminStyle.error}>Username is not available</p>
                    )}
                    {usernameAvailable === true && (
                        <p className={adminStyle.success}>Username is available</p>
                    )}
                    {error && <p className={adminStyle.error}>{error}</p>}
                    {success && <p className={adminStyle.success}>{success}</p>}
                </div>
            </div>
        </div>
    );
}

export default AdminRegistration;
