import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './trainings.css';
import { useNavigate } from 'react-router-dom';

const baseURL = 'http://localhost:3004/trainings/';
const authURL = 'http://localhost:3010/auth';
const exercisesURL = 'http://localhost:3000/exercises/';


const Trainings = () => {
  const [trainings, setTrainings] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [newTraining, setNewTraining] = useState({
    name: '',
    description: '',
    total_duration: 0,
    total_calories: 0,
    exercise_ids: []
  });

  useEffect(() => {
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

  const saveTrainingsToLocal = (trainings) => {
    try {
      localStorage.setItem('trainings', JSON.stringify(trainings));
      console.log('Treningi shranjeni v lokalno shrambo.');
    } catch (error) {
      console.error('Napaka pri shranjevanju treningov v lokalno shrambo:', error);
    }
  };

  const addToFavourites = async (trainingId) => {
    try {
      const isValid = await checkTokenValidity(token);
      if (!isValid) {
        const newToken = await refreshToken(token);
        if (newToken) {
          localStorage.setItem('token', newToken);
          setToken(newToken);
          return addToFavourites(trainingId);
        } else {
          console.error('Neuspešno osveževanje žetona');
          return;
        }
      }

      const response = await axios.put(`${baseURL}f/${trainingId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedTraining = response.data;
      setTrainings(trainings.map(training => training._id === trainingId ? updatedTraining : training));
      console.log('Trening dodan med priljubljene:', updatedTraining);
    } catch (error) {
      console.error('Napaka pri dodajanju med priljubljene:', error);
    }
  };

  const handleAddTraining = async (event) => {
    event.preventDefault();
    try {
      const userName = await getUsernameFromToken(token);
      if (!userName) {
        console.error('Neuspešno pridobivanje imena iz žetona');
        return;
      }

      const trainingToAdd = { ...newTraining, user_id: userName };
      const response = await axios.post(baseURL, trainingToAdd, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTrainings([...trainings, response.data]);
      setNewTraining({
        name: '',
        description: '',
        total_duration: 0,
        total_calories: 0,
        exercise_ids: []
      });
      console.log('Trening dodan:', response.data);
      setShowAddForm(false);
    } catch (error) {
      console.error('Napaka pri dodajanju treninga:', error);
    }
  };

  const getUsernameFromToken = async (token) => {
    try {
      const response = await axios.get(`${authURL}/getUsername`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.name;
    } catch (error) {
      console.error('Napaka pri pridobivanju imena iz žetona:', error);
      return null;
    }
  };

  const handleExerciseChange = (exerciseId) => {
    setNewTraining((prevState) => {
      const exercise_ids = prevState.exercise_ids.includes(exerciseId)
        ? prevState.exercise_ids.filter(id => id !== exerciseId)
        : [...prevState.exercise_ids, exerciseId];

      const selectedExercises = exercises.filter(ex => exercise_ids.includes(ex._id));
      const total_duration = selectedExercises.reduce((sum, ex) => sum + ex.duration, 0);
      const total_calories = selectedExercises.reduce((sum, ex) => sum + ex.calories, 0);

      return { ...prevState, exercise_ids, total_duration, total_calories };
    });
  };

  return (
    <div id="trainings-container" className="trainings-container">
      <button onClick={() => setShowAddForm(!showAddForm)} style={{ float: 'right' }}>
        {showAddForm ? '➖' : '➕'}
      </button>
      {showAddForm && (
        <form className="training-form" onSubmit={handleAddTraining}>
          <h2>Dodaj nov trening</h2>
          <input
            type="text"
            placeholder="Ime"
            value={newTraining.name}
            onChange={(e) => setNewTraining({ ...newTraining, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Opis"
            value={newTraining.description}
            onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })}
            required
          />
          <div className="exercise-selection">
          <h3>Vaje:</h3>
            {exercises.map((exercise) => (
              <div key={exercise._id}>
                <input
                  type="checkbox"
                  value={exercise._id}
                  checked={newTraining.exercise_ids.includes(exercise._id)}
                  onChange={() => handleExerciseChange(exercise._id)}
                />
                {exercise.name}
              </div>
            ))}
          </div>
          <p><b>Trajanje:</b> {newTraining.total_duration} minut</p>
          <p><b>Kalorije:</b> {newTraining.total_calories}</p>
          <button type="submit" style={{ margin: '0px' }}>Dodaj trening</button>
        </form>
      )}
      {trainings.map((training) => (
        training && (
          <div key={training._id} className="training-card">
            <div className="training-header">
              <a
                href="#"
                onClick={() => navigate(`/training/${training._id}`)}
                className="training-name-link"
              >
                {training.name}
              </a>
              <button onClick={() => addToFavourites(training._id)} style={{ float: 'right' }}>
                {training.favourite ? '♥' : '♡'}
              </button>
            </div>
            <div className="training-body">
              <p style={{ color: 'gray' }}>{training.description}</p>
              <p style={{ color: 'gray' }}>{training.total_duration} minut</p>
            </div>
          </div>
        )))}
    </div>
  );
};

export default Trainings;
