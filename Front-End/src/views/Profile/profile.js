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
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found, please login again');
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
        alert('Error fetching profile data');
      }
    });
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
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');
    const result = await updateUserProfile(token, formData);
    if (result) {
      setProfile(formData);
      alert('Profile updated successfully');
      setEditMode(false);
    } else {
      alert('Error updating profile');
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
      alert('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      alert('Error updating password');
    }
  };

  const getUserProfile = async (token) => {
    try {
      const response = await axios.get(`${authURL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const updateUserProfile = async (token, profileData) => {
    try {
      const response = await axios.put(`${authURL}/profile`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className={styles.profileContainer}>
      <h2>Tvoje podrobnosti</h2>
      <div className={styles.profileInfo} id="profile-display">
        <div><strong>Ime:</strong> {editMode ? <input type="text" name="name" value={formData.name} onChange={handleChange} /> : <span id="name">{profile.name}</span>}</div>
        <div><strong>Priimek:</strong> {editMode ? <input type="text" name="surname" value={formData.surname} onChange={handleChange} /> : <span id="surname">{profile.surname}</span>}</div>
        <div><strong>E-naslov:</strong> {editMode ? <input type="email" name="email" value={formData.email} onChange={handleChange} /> : <span id="email">{profile.email}</span>}</div>
        <div><strong>Trenutna višina:</strong> {editMode ? <input type="number" name="height" value={formData.height} onChange={handleChange} /> : <span id="height">{profile.height} cm</span>}</div>
        <div><strong>Trenutna teža:</strong> {editMode ? <input type="number" name="weight" value={formData.weight} onChange={handleChange} /> : <span id="weight">{profile.weight} kg</span>}</div>
      </div>
      <div className={styles.editButtons}>
        {editMode ? (
          <button id="save-profile-button" onClick={handleSaveProfile}>Shrani</button>
        ) : (
          <button id="edit-profile-button" onClick={handleEditProfile}>Spremeni račun</button>
        )}
        <button id="change-password-button" onClick={() => document.getElementById('password-form-container').style.display = 'block'}>Spremeni geslo</button>
      </div>
      <div id="password-form-container" style={{ display: 'none' }}>
        <h3>Spremeni geslo</h3>
        <form id="password-form" onSubmit={handlePasswordFormSubmit}>
          <input type="password" name="newPassword" placeholder="Novo geslo" value={newPassword} onChange={handlePasswordChange} required />
          <input type="password" name="confirmPassword" placeholder="Potrdi novo geslo" value={confirmPassword} onChange={handlePasswordChange} required />
          <button type="submit">Spremeni geslo</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
