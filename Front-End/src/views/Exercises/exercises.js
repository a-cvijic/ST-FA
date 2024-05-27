import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './exercises.css';

const baseURL = 'http://localhost:3000/exercises/';
const authURL = 'http://localhost:3010/auth';

const Exercises = () => {
  const [exercises, setExercises] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));

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
          console.error('Failed to refresh token');
          return;
        }
      }
      const exercisesData = await getAllExercises(currentToken);
      setExercises(exercisesData);
      saveExercisesToLocal(exercisesData);
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

  const getAllExercises = async (token) => {
    try {
      const response = await axios.get(`${baseURL}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      return [];
    }
  };

  const saveExercisesToLocal = (exercises) => {
    try {
      localStorage.setItem('exercises', JSON.stringify(exercises));
      console.log('Exercises saved to local storage.');
    } catch (error) {
      console.error('Error saving exercises to local storage:', error);
    }
  };

  const addToFavourites = async (exerciseId) => {
    try {
      const isValid = await checkTokenValidity(token);
      if (!isValid) {
        const newToken = await refreshToken(token);
        if (newToken) {
          localStorage.setItem('token', newToken);
          setToken(newToken);
          return addToFavourites(exerciseId);
        } else {
          console.error('Failed to refresh token');
          return;
        }
      }

      const response = await axios.get(`${baseURL}${exerciseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const exerciseData = response.data;
      const userName = await getUsernameFromToken(token);

      if (!userName) {
        console.error('Failed to get user name from token');
        return;
      }

      exerciseData.userId = userName;
      delete exerciseData._id;
      const saveResponse = await axios.post(`${baseURL}excercise`, exerciseData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Exercise added to favorites:', saveResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.message === 'Vaja je že dodana med všečkane vaje') {
        alert('Vaja je že dodana med všečkane vaje');
      } else {
        console.error('Error adding to favorites:', error);
      }
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
      console.error('Error getting name from token:', error);
      return null;
    }
  };

  return (
    <div id="exercises-container">
      <div className="buttons-container">
        <Link to="/exercises" className="buttonAll">Vse vaje</Link>
        <Link to="/exercisesuser" className="buttonAll">Všečkane vaje</Link>
      </div>
      {exercises.map((exercise) => (
        <div key={exercise._id} className="exercise-card">
          <div className="exercise-header">
          <Link to={`/exercise/${exercise._id}`} className="exercise-name-link">
          {exercise.name}
          </Link>
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
          <button className="buttonAll add-to-favourites-button" onClick={() => addToFavourites(exercise._id)}>
            Add to Favourites
          </button>
        </div>
      ))}
    </div>
  );
};

export default Exercises;
