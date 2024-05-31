import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './trainingsAdmin.css';

const baseURL = 'http://localhost:3004/trainings/';
const authURL = 'http://localhost:3010/auth';
const exercisesURL = 'http://localhost:3000/exercises/';


// Logic for notifications
const requestNotificationPermission = () => {
  Notification.requestPermission().then(permission => {
    console.log('Notification permission:', permission);
    if (permission === "granted") {
      console.log("Permission granted");
    } else {
      console.log("Permission not granted");
    }
  });
};

const showNotification = (title, message) => {
  if (Notification.permission === 'granted') {
    new Notification(title, { body: message });
  }
};


const TrainingsAdmin = () => {
  const [trainings, setTrainings] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [searchTerm, setSearchTerm] = useState('');
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    requestNotificationPermission()
    const fetchData = async () => {
      let currentToken = token;
      const isValid = await checkTokenValidity(currentToken);
      if (!isValid) {
        const newToken = await refreshToken(currentToken);
        if (newToken) {
          localStorage.setItem('token', newToken);
          setToken(newToken);
          currentToken = newToken;
        } else {
          console.error('Neuspešno osveževanje žetona');
          return;
        }
      }
      const trainingsData = await getAllTrainings(currentToken);
      setTrainings(trainingsData);
      saveTrainingsToLocal(trainingsData);

      const exercisesData = await getAllExercises(currentToken);
      setExercises(exercisesData);

    };

    fetchData();
  }, [token]);


  // Logic for security and token management
  const checkTokenValidity = async (token) => {
    try {
      const response = await axios.get(`${authURL}/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.valid;
    } catch (error) {
      console.error('Napaka pri preverjanju avtentičnosti:', error);
      return false;
    }
  };

  const refreshToken = async (oldToken) => {
    try {
      const response = await axios.post(`${authURL}/refresh-token`, { token: oldToken });
      return response.data.newToken;
    } catch (error) {
      console.error('Napaka pri osveževanju žetona:', error);
      return null;
    }
  };


  // Logic for trainings
  const getAllTrainings = async (token) => {
    try {
      const response = await axios.get(baseURL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Napaka pri pridobivanju treningov:', error);
      return [];
    }
  };

  const saveTrainingsToLocal = (trainings) => {
    try {
      localStorage.setItem('trainings', JSON.stringify(trainings));
      console.log('Treningi shranjeni v lokalno shrambo.');
    } catch (error) {
      console.error('Napaka pri shranjevanju treningov v lokalno shrambo:', error);
    }
  };

  const handleDeleteTraining = async (trainingId) => {
    const confirmDelete = window.confirm('Ali ste prepričani da želite izbrisati trening?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${baseURL}${trainingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTrainings(trainings.filter(training => training._id !== trainingId));
      console.log('Trening izbrisan');
      showNotification('Trening uspešno izbrisan', 'Trening je uspešno izbrisan iz sistema.');
    } catch (error) {
      console.error('Napaka pri brisanju treninga:', error);
      showNotification('Napaka', 'Napaka pri brisanju treninga v sistemu. Prosimo poskusite znova.');
    }
  };

  const filteredTrainings = trainings
    .filter(training => training.name.toLowerCase().includes(searchTerm.toLowerCase()))


  // Logic for exercises
  const getAllExercises = async (token) => {
    try {
      const response = await axios.get(exercisesURL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Napaka pri pridobivanju vaj:', error);
      return [];
    }
  };

  const getExerciseNames = (ids) => {
    return ids.map(id => {
      const exercise = exercises.find(ex => ex._id === id);
      return exercise ? exercise.name : id;
    }).join(', ');
  };


  // Render HTML content
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options).replace(/\//g, '.');
  };

  const formatTime = (dateString) => {
    const options = { hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  return (
    <div id="trainings-container" className="trainings-container">

      <div className="search-bar">
        <input
          type="text"
          placeholder="Poišči trening..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <p style={{ float: 'right', marginLeft: '20px' }}>🔎</p>
      </div>

      {filteredTrainings.length === 0 ? (
        <p style={{ color: 'grey' }}>Ni treningov za prikaz</p>
      ) : (
        filteredTrainings.map((training) => (
          training && (
            <div key={training._id} className="training-card">
              <div className="training-header">
                <h3>
                  {training.name}
                </h3>
              </div>
              <div className="training-body">
                <table>
                  <tbody>
                    <tr>
                      <td>ID uporabnika:</td>
                      <td>{training.user_id}</td>
                    </tr>
                    <tr>
                      <td>Opis:</td>
                      <td>{training.description}</td>
                    </tr>
                    <tr>
                      <td>Kalorije:</td>
                      <td>{training.total_calories}</td>
                    </tr>
                    <tr>
                      <td>Trajanje:</td>
                      <td>{training.total_duration} minut</td>
                    </tr>
                    <tr>
                      <td>Vaje:</td>
                      <td>{getExerciseNames(training ? training.exercise_ids : [])}</td>
                    </tr>
                    <tr>
                      <td>Ustvarjeno:</td>
                      <td>{formatDate(training.created)} ob {formatTime(training.created)}</td>
                    </tr>
                    <tr>
                      <td>Zadnja sprememba:</td>
                      <td>{training.updated ? `${formatDate(training.updated)} ob ${formatTime(training.updated)}` : 'Nikoli'}</td>
                    </tr>
                  </tbody>
                </table>
                <br />
                <button onClick={() => handleDeleteTraining(training._id)} style={{ float: 'right', backgroundColor: '#f04646', color: 'white' }}>Izbriši</button>
              </div>
            </div>
          )
        ))
      )}
    </div>
  );
};

export default TrainingsAdmin;
