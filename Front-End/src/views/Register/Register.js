import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './register.css'; // Ensure this path is correct

const authURL = 'http://localhost:3010/auth';

const register = async (userDetails) => {
    try {
        const response = await axios.post(`${authURL}/register`, userDetails);
        return response.data;
    } catch (error) {
        alert('E-naslov že obstaja!');
        return null;
    }
};

const sanitizeInput = (input) => {
    return input.trim();
};

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password.length >= 8;
};

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
        confirmPassword: '',
        birthdate: '',
        gender: '',
        height: '',
        weight: ''
    });

    useEffect(() => {
        document.body.classList.add('register-page');
        return () => {
            document.body.classList.remove('register-page');
        };
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        const { name, surname, email, password, confirmPassword, birthdate, gender, height, weight } = formData;

        if (!validateEmail(email)) {
            alert("Nepravilen e-naslov!");
            return;
        }

        if (!validatePassword(password)) {
            alert("Geslo mora biti dolgo vsaj 8 znakov!");
            return;
        }

        if (password !== confirmPassword) {
            alert("Gesla se ne ujemata!");
            return;
        }

        const userDetails = {
            name: sanitizeInput(name),
            surname: sanitizeInput(surname),
            email: sanitizeInput(email),
            password: sanitizeInput(password),
            birthdate: sanitizeInput(birthdate),
            gender: sanitizeInput(gender),
            height: parseFloat(height),
            weight: parseFloat(weight)
        };

        const registrationResult = await register(userDetails);
        if (registrationResult) {
            alert('Uspešna registracija!');
            window.location.href = '/login';
        } else {
            alert('Neuspešna registracija!');
        }
    };

    return (
        <div className="register-container">
            <h2>Registracija</h2>
            <form id="registration-form" onSubmit={handleFormSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Ime:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="surname">Priimek:</label>
                    <input
                        type="text"
                        id="surname"
                        name="surname"
                        required
                        value={formData.surname}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">E-naslov:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Geslo:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Potrdi geslo:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="birthdate">Datum rojstva:</label>
                    <input
                        type="date"
                        id="birthdate"
                        name="birthdate"
                        required
                        value={formData.birthdate}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="gender">Spol:</label>
                    <select
                        id="gender"
                        name="gender"
                        required
                        value={formData.gender}
                        onChange={handleChange}
                    >
                        <option value="">Izberi spol</option>
                        <option value="male">Moški</option>
                        <option value="female">Ženska</option>
                        <option value="other">Drugo</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="height">Višina (cm):</label>
                    <input
                        type="number"
                        id="height"
                        name="height"
                        required
                        value={formData.height}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="weight">Teža (kg):</label>
                    <input
                        type="number"
                        id="weight"
                        name="weight"
                        required
                        value={formData.weight}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <button type="submit">Registracija</button>
                </div>
            </form>
        </div>
    );
};

export default Register;
