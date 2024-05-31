import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './excercise_details.css';
import gifs from './loadGifs.js';// potem kličem to komponento tukaj

const baseURL = 'http://localhost:3000/exercises/';
const authURL = 'http://localhost:3010/auth';

const ExercisesDetails = () => {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const isValid = await checkTokenValidity(token);
        if (!isValid) {
          const newToken = await refreshToken(token);
          if (newToken) {
            localStorage.setItem('token', newToken);
            setToken(newToken);
            const refreshedExercise = await getExerciseById(exerciseId, newToken);
            setExercise(refreshedExercise);
          } else {
            navigate('/login');
            return;
          }
        } else {
          const exerciseData = await getExerciseById(exerciseId, token);
          setExercise(exerciseData);
        }
        setLoading(false);
      } catch (error) {
        navigate('/login');
      }
    };
    fetchData();
  }, [exerciseId, token, navigate]);

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

  const gifUrl = exercise ? gifs[exercise.name.replace(/\s+/g, '_').toLowerCase()] : '';// in jo uporabim tukaj

  return (
    <div id="exercise-detail">
      {loading ? (
        <p>Loading exercise details...</p>
      ) : exercise ? (
        <div>
          <div className="exercise-detail-section">
            <div><strong>Opis vaje:</strong></div>
            <div><strong>Ime:</strong> {exercise.name}</div>
            <div><strong>Trajanje:</strong> {exercise.duration} minutes</div>
            <div><strong>Kalorije:</strong> {exercise.calories}</div>
            <div><strong>Tip:</strong> {exercise.type}</div>
            <div><strong>Težavnost:</strong> {exercise.difficulty}</div>
          </div>
          <div className="exercise-detail-section">
            <div><strong>Opis:</strong></div>
            <div>{exercise.description}</div>
          </div>
          <div className="exercise-detail-section centered-content">
            {gifUrl ? <img src={gifUrl} alt="Exercise GIF" /> : <p>GIF not available</p>}
          </div>
          <div className="exercise-detail-section">
            <div><strong>Gibanje:</strong></div>
            <div>{exercise.movement}</div>
          </div>
          <div className="exercise-detail-section">
            <div><strong>Koristi:</strong></div>
            <ul>
              {exercise.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
          <div className="exercise-detail-section">
            <div><strong>Nasveti:</strong></div>
            <ul>
              {exercise.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
          <div className="exercise-detail-section">
            <div><strong>Št serij:</strong> {exercise.series}</div>
          </div>
          <div className="exercise-detail-section">
            <div><strong>Ponovitve na serijo:</strong> {exercise.repetitions}</div>
          </div>
        </div>
      ) : (
        <p>Nismo našli podatkov o vaji</p>
      )}
    </div>
  );
};

export default ExercisesDetails;
