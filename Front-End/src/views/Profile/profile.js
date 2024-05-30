import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './profile.module.css';

const authURL = 'http://localhost:3010/auth';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      surname: '',
      email: '',
      height: '',
      weight: ''
    });
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showInstructions, setShowInstructions] = useState(false);
    const [activeForm, setActiveForm] = useState('profile');
    const [showSettings, setShowSettings] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Ni žetona! Prosimo, da se prijavite.');
            navigate('/login');
            return;
        }
        getUserProfile(token).then(profileData => {
            if (profileData) {
                setProfile(profileData);
                setFormData({
                    name: profileData.name,
                    surname: profileData.surname,
                    email: profileData.email,
                    height: profileData.height,
                    weight: profileData.weight
                });
            } else {
                alert('Napaka pri pridobivanju podatkov o profilu! Prosimo, da se ponovno prijavite.');
            }
        });
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        if (name === 'newPassword') setNewPassword(value);
        if (name === 'confirmPassword') setConfirmPassword(value);
    };

    const handleEditProfile = () => {
        setEditMode(true);
        setActiveForm('profile');
        setShowSettings(false);
    };

    const handleSaveProfile = async () => {
        const token = localStorage.getItem('token');
        const result = await updateUserProfile(token, formData);
        if (result) {
            setProfile(formData);
            alert('Profil posodobljen!');
            setEditMode(false);
            setActiveForm('profile');
            showNotification('Profil posodobljen!');
        } else {
            alert('Napaka pri posodabljanju profila!');
        }
    };

    const handlePasswordFormSubmit = async (event) => {
        event.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        const token = localStorage.getItem('token');
        const result = await updateUserProfile(token, { password: newPassword });
        if (result) {
            alert('Geslo uspešno posodobljeno!');
            setNewPassword('');
            setConfirmPassword('');
            setActiveForm('profile');
            showNotification('Geslo uspešno posodobljeno!');
        } else {
            alert('Napaka pri posodabljanju gesla!');
        }
    };

    const handleClosePasswordForm = () => {
        setActiveForm('profile');
    };

    const handleStartVoiceRecognition = () => {
        if (window.SpeechRecognition || window.webkitSpeechRecognition) {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.onstart = () => {
                console.log('Začetek prepoznavanja glasu.');
            };
            recognition.onspeechend = () => {
                recognition.stop();
                console.log('Konec prepoznavanja glasu.');
            };
            recognition.onresult = (event) => {
                const transcript = event.results[event.resultIndex][0].transcript.trim().toLowerCase();
                console.log('Rekli ste:', transcript);
                if (transcript === 'edit profile') {
                    document.getElementById('edit-profile-button').click();
                } else if (transcript === 'change password') {
                    document.getElementById('change-password-button').click();
                }
            };
            recognition.start();
        } else {
            alert('Vaš brskalnik ne podpira prepoznavanja glasu! Prosimo, da poskusite z drugim brskalnikom.');
        }
    };

    const handleEnableMicrophone = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => {
                alert('Mikrofon omogočen! Začnite govoriti, ko vidite rdeči krog v zgornjem desnem kotu.');
                setShowInstructions(true);
                setActiveForm('instructions');
            })
            .catch((err) => {
                alert('Mikrofon ni omogočen! Prosimo, da omogočite mikrofon v nastavitvah brskalnika.');
                console.error('Error accessing microphone: ', err);
            });
    };

    const showNotification = (message) => {
        if (Notification.permission === "granted") {
            new Notification(message);
        }
    };

    const getUserProfile = async (token) => {
        try {
            const response = await axios.get(`${authURL}/profile`, { headers: { Authorization: `Bearer ${token}` } });
            return response.data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    };

    const updateUserProfile = async (token, profileData) => {
        try {
            const response = await axios.put(`${authURL}/profile`, profileData, { headers: { Authorization: `Bearer ${token}` } });
            return response.data;
        } catch (error) {
            console.error('Error updating user profile:', error);
            return null;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!profile) return <div>Loading...</div>;

    return (
        <div className={styles.profileContainer}>
            <div className={styles.content}>
                {activeForm === 'profile' && !editMode && (
                    <div className={styles.profileInfo} id="profile-display">
                        <h2>Tvoje podrobnosti</h2>
                        <div><strong>Ime:</strong> <span id="name">{profile.name}</span></div>
                        <div><strong>Priimek:</strong> <span id="surname">{profile.surname}</span></div>
                        <div><strong>E-naslov:</strong> <span id="email">{profile.email}</span></div>
                        <div><strong>Trenutna višina:</strong> <span id="height">{profile.height} cm</span></div>
                        <div><strong>Trenutna teža:</strong> <span id="weight">{profile.weight} kg</span></div>
                    </div>
                )}
                {activeForm === 'profile' && editMode && (
                    <div className={styles.profileInfo}>
                        <h2>Uredi podrobnosti</h2>
                        <div><strong>Ime:</strong> <input type="text" name="name" value={formData.name} onChange={handleChange} /></div>
                        <div><strong>Priimek:</strong> <input type="text" name="surname" value={formData.surname} onChange={handleChange} /></div>
                        <div><strong>E-naslov:</strong> <input type="email" name="email" value={formData.email} onChange={handleChange} /></div>
                        <div><strong>Trenutna višina:</strong> <input type="number" name="height" value={formData.height} onChange={handleChange} /></div>
                        <div><strong>Trenutna teža:</strong> <input type="number" name="weight" value={formData.weight} onChange={handleChange} /></div>
                        <button id="save-profile-button" onClick={handleSaveProfile}>Shrani</button>
                    </div>
                )}
                {activeForm === 'password' && (
                    <div id="password-form-container">
                        <h3>Spremeni geslo</h3>
                        <form id="password-form" onSubmit={handlePasswordFormSubmit}>
                            <input type="password" name="newPassword" placeholder="Novo geslo" value={newPassword} onChange={handlePasswordChange} required />
                            <input type="password" name="confirmPassword" placeholder="Potrdi novo geslo" value={confirmPassword} onChange={handlePasswordChange} required />
                            <button type="submit">Spremeni geslo</button>
                            <button className="close-btn" onClick={handleClosePasswordForm}>×</button>
                        </form>
                    </div>
                )}
                {activeForm === 'instructions' && showInstructions && (
                    <div className={styles.instructions}>
                        <h3>Navodila za glasovne ukaze</h3>
                        <p>Uporabite naslednje ukaze:</p>
                        <ul>
                            <li><strong>"edit profile"</strong> - odpre urejanje profila</li>
                            <li><strong>"change password"</strong> - odpre obrazec za spremembo gesla</li>
                        </ul>
                        <button onClick={() => setActiveForm('profile')}>Zapri navodila</button>
                        <button onClick={handleStartVoiceRecognition}>Začni snemanje glasu</button>
                    </div>
                )}
            </div>
            <button className={styles.settingsButton} onClick={() => setShowSettings(!showSettings)}>Nastavitve</button>
            {showSettings && (
                <div className={styles.dropdownMenu}>
                    <button id="edit-profile-button" onClick={handleEditProfile}>Uredi profil</button>
                    <button id="change-password-button" onClick={() => setActiveForm('password')}>Spremeni geslo</button>
                    <button onClick={handleEnableMicrophone}>Omogoči mikrofon</button>
                    <button onClick={handleLogout}>Odjava</button>
                </div>
            )}
        </div>
    );
};

export default Profile;
