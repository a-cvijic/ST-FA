import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './trainings.css';

const baseURL = 'http://localhost:3004/trainings/';
const authURL = 'http://localhost:3010/auth';

const Trainings = () => {
  const [trainings, setTrainings] = useState([]);
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
      const trainingsData = await getAllTrainings(currentToken);
      setTrainings(trainingsData);
      saveTrainingsToLocal(trainingsData);
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

  const getAllTrainings = async (token) => {
    try {
      const response = await axios.get(baseURL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trainings:', error);
      return [];
    }
  };

  const saveTrainingsToLocal = (trainings) => {
    try {
      localStorage.setItem('trainings', JSON.stringify(trainings));
      console.log('Trainings saved to local storage.');
    } catch (error) {
      console.error('Error saving trainings to local storage:', error);
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
          console.error('Failed to refresh token');
          return;
        }
      }

      const response = await axios.get(`${baseURL}${trainingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const trainingData = response.data;
      const userName = await getUsernameFromToken(token);

      if (!userName) {
        console.error('Failed to get user name from token');
        return;
      }

      trainingData.userId = userName;
      delete trainingData._id;
      const saveResponse = await axios.post(`${baseURL}training`, trainingData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Training added to favorites:', saveResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.message === 'Trening je že dodan med všečkane treninge') {
        alert('Trening je že dodan med priljubljene treninge');
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
    <div id="trainings-container">
      {trainings.map((training) => (
        <div key={training._id} className="training-card">
          <div className="training-header">
            <a href={`/training/${training.name.replace(/\s/g, '_').toLowerCase()}?trainingId=${training._id}`} className="training-name-link">
              {training.name}
            </a>
          </div>
          <div className="training-body">
            <p>Description: {training.description}</p>
            <p>Total Duration: {training.total_duration} minutes</p>
            <p>Total Calories: {training.total_calories}</p>
            <p>Exercises: {training.exercise_ids.join(', ')}</p>
          </div>
          <button className="buttonAll" onClick={() => addToFavourites(training._id)}>
            Add to Favourites
          </button>
        </div>
      ))}
    </div>
  );
};

export default Trainings;
