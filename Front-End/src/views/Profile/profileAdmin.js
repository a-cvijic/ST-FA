import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './profileAdmin.module.css';

const authURL = 'http://localhost:3010/auth';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    height: '',
    weight: ''
  });
  const [newUser, setNewUser] = useState({
    _id: '',
    name: '',
    surname: '',
    email: '',
    password: '',
    birthdate: '',
    gender: '',
    height: '',
    weight: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Ni žetona, prosim prijavite se znova');
      navigate('/login');
      return;
    }

    fetchUsers(token);

    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, [navigate]);

  const fetchUsers = async (token) => {
    try {
      const response = await axios.get(`${authURL}/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Napaka pri pridobivanju uporabnikov', error);
    }
  };

  const handleEdit = (user) => {
    console.log('Editing user:', user);
    setCurrentUser(user);
    setFormData({
      name: user.name,
      surname: user.surname,
      email: user.email,
      height: user.height,
      weight: user.weight
    });
    setEditMode(true);
    setAddMode(false);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    const confirmDelete = window.confirm("Ali res želite izbrisati tega uporabnika?");
    if (!confirmDelete) return;
    try {
      await axios.delete(`${authURL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchUsers(token);
      showNotification('Uporabnik je bil uspešno izbrisan');
    } catch (error) {
      console.error('Napaka pri brisanju uporabnika', error);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!currentUser || !currentUser._id) {
      console.error('No current user selected for editing');
      return;
    }

    if (!formData.name || !formData.surname || !formData.email || !formData.height || !formData.weight) {
      alert("Vsa polja so obvezna.");
      return;
    }

    try {
      await axios.put(`${authURL}/profile/${currentUser._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setEditMode(false);
      setCurrentUser(null);
      fetchUsers(token);
      showNotification('Profil uspešno posodobljen');
    } catch (error) {
      console.error('Napaka pri posodabljanju uporabnika', error);
      if (error.response && error.response.data) {
        alert(error.response.data.message);
      }
    }
  };

  const handleAddUser = async () => {
    const token = localStorage.getItem('token');

    if (!newUser.name || !newUser.surname || !newUser.email || !newUser.password || !newUser.birthdate || !newUser.gender || !newUser.height || !newUser.weight) {
      alert("Vsa polja so obvezna.");
      return;
    }

    try {
      const response = await axios.post(authURL, newUser, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setNewUser({
        name: '',
        surname: '',
        email: '',
        password: '',
        birthdate: '',
        gender: '',
        height: '',
        weight: ''
      });
      setAddMode(false);
      fetchUsers(token);
      showNotification('Uporabnik uspešno dodan');
    } catch (error) {
      console.error('Napaka pri dodajanju uporabnika', error);
      if (error.response && error.response.data) {
        alert(error.response.data.message);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNewUserChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const showNotification = (message) => {
    if (Notification.permission === "granted") {
      new Notification(message);
    }
  };

  const handleEnableMicrophone = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        alert('Mikrofon omogočen');
        startVoiceRecognition();
      })
      .catch((err) => {
        alert('Dostop do mikrofona zavrnjen');
        console.error('Napaka pri dostopu do mikrofona: ', err);
      });
  };

  const startVoiceRecognition = () => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onstart = () => {
        console.log('Glasovno prepoznavanje se je začelo. Poskusite govoriti v mikrofon.');
      };

      recognition.onspeechend = () => {
        recognition.stop();
        console.log('Glasovno prepoznavanje je končano.');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[event.resultIndex][0].transcript.trim().toLowerCase();
        console.log('Rekli ste: ', transcript);

        if (transcript === 'add new user') {
          setAddMode(true);
          setEditMode(false);
        }
      };

      recognition.start();
    } else {
      alert('Vaš brskalnik ne podpira glasovnega prepoznavanja.');
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.addUserButtonContainer}>
        <button onClick={() => { setAddMode(true); setEditMode(false); }}>Dodaj novega uporabnika</button>
        <button onClick={handleEnableMicrophone}>Omogoči mikrofon</button>
      </div>
      {!editMode && !addMode && (
        <div className={styles.userList}>
          <h2>Vsi uporabniki</h2>
          <ul>
            {users.map(user => (
              <li key={user._id}>
                {user.name} {user.surname} - {user.email}
                <div>
                  <button onClick={() => handleEdit(user)}>Uredi</button>
                  <button onClick={() => handleDelete(user._id)}>Izbriši</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editMode && (
        <div className={styles.editForm}>
          <h2>Uredi uporabnika</h2>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ime"
          />
          <input
            type="text"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            placeholder="Priimek"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-naslov"
          />
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            placeholder="Višina"
          />
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="Teža"
          />
          <button onClick={handleSave}>Shrani</button>
        </div>
      )}

      {addMode && (
        <div className={styles.addUserForm}>
          <h2>Dodaj novega uporabnika</h2>
          <input
            type="text"
            name="name"
            value={newUser.name}
            onChange={handleNewUserChange}
            placeholder="Ime"
          />
          <input
            type="text"
            name="surname"
            value={newUser.surname}
            onChange={handleNewUserChange}
            placeholder="Priimek"
          />
          <input
            type="email"
            name="email"
            value={newUser.email}
            onChange={handleNewUserChange}
            placeholder="E-naslov"
          />
          <input
            type="password"
            name="password"
            value={newUser.password}
            onChange={handleNewUserChange}
            placeholder="Geslo"
          />
          <input
            type="date"
            name="birthdate"
            value={newUser.birthdate}
            onChange={handleNewUserChange}
          />
          <input
            type="text"
            name="gender"
            value={newUser.gender}
            onChange={handleNewUserChange}
            placeholder="Spol"
          />
          <input
            type="number"
            name="height"
            value={newUser.height}
            onChange={handleNewUserChange}
            placeholder="Višina"
          />
          <input
            type="number"
            name="weight"
            value={newUser.weight}
            onChange={handleNewUserChange}
            placeholder="Teža"
          />
          <button onClick={handleAddUser}>Dodaj</button>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
