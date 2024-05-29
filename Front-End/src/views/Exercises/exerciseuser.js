import React, { useEffect, useState } from 'react';
import { Link, useNavigate  } from 'react-router-dom';
import axios from 'axios';
import './exercises.css';

const baseURL = 'http://localhost:3000/exercises/';
const authURL = 'http://localhost:3010/auth';
const publicKey = 'BHlaMKbhm8ltFEIrkiKA6b2ir4e480SVN7ezJkTQle141xKm7Pn0PUJ6nvSB1xn6cf51vhKjLeI2d_YBZJiZjeo';

const checkTokenValidity = async (token) => {
  try {
    const response = await axios.get(`${authURL}/verify-token`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.valid;
  } catch (error) {
    console.error('Error during authentication:', error);
    return false;
  }
};

const refreshToken = async (oldToken) => {
  try {
    const response = await axios.post(`${authURL}/refresh-token`, { token: oldToken });
    return response.data.newToken;
  } catch (error) {
    console.error('Error while refreshing token:', error);
    return null;
  }
};

const getUsernameFromToken = async (token) => {
  try {
    const response = await axios.get(`${authURL}/getUsername`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.name;
  } catch (error) {
    console.error('Error getting name from token:', error);
    return null;
  }
};

const getExercisesForUser = async (userName, token) => {
  try {
    const response = await axios.get(`${baseURL}exercise/${userName}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }
};

const deleteExercise = async (exerciseId, token) => {
  try {
    const isValid = await checkTokenValidity(token);
    if (!isValid) {
      const newToken = await refreshToken(token);
      if (newToken) {
        localStorage.setItem('token', newToken);
        return deleteExercise(exerciseId, newToken);
      } else {
        console.error('Failed to refresh token');
        return;
      }
    }

    const response = await axios.delete(`${baseURL}exercise/${exerciseId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    alert('Vaja odstranjena. Zapustite in znova odprite stran, da vidite spremembe');
    console.log('Odstranjena vaja: ', response.data)
  } catch (error) {
    console.error('Error deleting exercise:', error);
  }
};

const ExercisesUser = () => {
  const [exercises, setExercises] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const currentToken = token;
      const userName = await getUsernameFromToken(currentToken);
      const exercisesData = await getExercisesForUser(userName, currentToken);
      setExercises(exercisesData);
    };

    const verifyTokenAndFetchExercises = async () => {
      if (token) {
        const isValid = await checkTokenValidity(token);
        if (!isValid) {
          const newToken = await refreshToken(token);
          if (newToken) {
            localStorage.setItem('token', newToken);
            setToken(newToken);
          } else {
            console.error('Failed to refresh token');
            return;
          }
        }
        fetchData();
      } else {
        console.error('No token found in local storage');
      }
    };

    verifyTokenAndFetchExercises();

    // Keyboard shortcut setup
    const handleKeyboardShortcut = (e) => {
      if (e.shiftKey && e.key === 'A') {
        navigate('/exercises');
      } 
    };

    document.addEventListener('keydown', handleKeyboardShortcut);

    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcut);
    };
  }, [token, navigate]);

  return (
    <div className="buttons-container">
    <Link to="/exercises" className="buttonAll">Vse vaje</Link>
    <Link to="/exercisesuser" className="buttonAll">Všečkane vaje</Link>
    <div id="exercises-container" style={{ display: 'flex', flexWrap: 'wrap' }}>
      {exercises.map((exercise) => (
        <div key={exercise._id} className="exercise-card" style={{
          flex: '1 1 calc(25% - 16px)', // 25% width minus margin for spacing
          margin: '8px',
          boxSizing: 'border-box'
        }}>
          <div className="exercise-header">
              <h3 className="exercise-name">{exercise.name}</h3>
          </div>
          <div className="exercise-body">
            <p>ID: {exercise._id}</p>
            <p>Description: {exercise.description}</p>
            <p>Duration: {exercise.duration} minutes</p>
            <p>Calories: {exercise.calories}</p>
            <p>Type: {exercise.type}</p>
            <p>Difficulty: {exercise.difficulty}</p>
            <p>Series: {exercise.series}</p>
            <p>Repetitions: {exercise.repetitions}</p>
          </div>
          <button className="buttonAll delete-exercise-button" onClick={() => deleteExercise(exercise._id, token)}>
            Delete Exercise
          </button>
        </div>
      ))}
    </div>
    </div>
  );
};

export default ExercisesUser;
