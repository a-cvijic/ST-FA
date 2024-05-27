import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './trainings.css';

const baseURL = 'http://localhost:3004/trainings/';
const authURL = 'http://localhost:3010/auth';

const TrainingDetails = () => {
  const { trainingId } = useParams();
  const [training, setTraining] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const fetchData = async () => {
      const isValid = await checkTokenValidity(token);
      if (!isValid) {
        const newToken = await refreshToken(token);
        if (newToken) {
          localStorage.setItem('token', newToken);
          setToken(newToken);
          const refreshedTraining = await getTrainingById(trainingId, newToken);
          setTraining(refreshedTraining);
        } else {
          console.error('Failed to refresh token');
        }
      } else {
        const trainingData = await getTrainingById(trainingId, token);
        setTraining(trainingData);
      }
    };

    fetchData();
  }, [trainingId, token]);

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

  const getTrainingById = async (trainingId, token) => {
    try {
      const response = await axios.get(`${baseURL}${trainingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching training details:', error);
      return null;
    }
  };

  if (!training) {
    return <p>Loading...</p>;
  }

  return (
    <div id="training-detail">
      <h2 id="training-name">{training.name}</h2>
      <p id="training-duration">Duration: {training.total_duration} minutes</p>
      <p id="training-calories">Calories: {training.total_calories}</p>
      <p id="training-description-content">Description: {training.description}</p>
      <p>Exercises: {training.exercise_ids.join(', ')}</p>
    </div>
  );
};

export default TrainingDetails;
