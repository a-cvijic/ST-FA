import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const baseURL = 'http://localhost:3000/exercises/';
const authURL = 'http://localhost:3010/auth';

const ExercisesDetails = () => {
  const { exerciseId } = useParams();
  const [exercise, setExercise] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const fetchData = async () => {
      const isValid = await checkTokenValidity(token);
      if (!isValid) {
        const newToken = await refreshToken(token);
        if (newToken) {
          localStorage.setItem('token', newToken);
          setToken(newToken);
          const refreshedExercise = await getExerciseById(exerciseId, newToken);
          setExercise(refreshedExercise);
        } else {
          console.error('Failed to refresh token');
        }
      } else {
        const exerciseData = await getExerciseById(exerciseId, token);
        setExercise(exerciseData);
      }
    };

    fetchData();
  }, [exerciseId, token]);

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

  const getExerciseById = async (exerciseId, token) => {
    try {
      const response = await axios.get(`${baseURL}${exerciseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching exercise details:', error);
      return null;
    }
  };

  return (
    <div id="exercise-detail">
      {exercise ? (
        <div>
          <div id="exercise-name">{exercise.name}</div>
          <div id="exercise-duration">{exercise.duration}</div>
          <div id="exercise-calories">{exercise.calories}</div>
          <div id="exercise-type">{exercise.type}</div>
          <div id="exercise-difficulty">{exercise.difficulty}</div>
          <div id="exercise-description-content">{exercise.description}</div>
          <div id="exercise-movement-content">{exercise.movement}</div>
          <ul id="exercise-benefits-list">
            {exercise.benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
          <ul id="exercise-tips-list">
            {exercise.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
          <div id="exercise-series">{exercise.series}</div>
          <div id="exercise-repetitions">{exercise.repetitions}</div>
        </div>
      ) : (
        <p>No exercise details found.</p>
      )}
    </div>
  );
};

export default ExercisesDetails;
