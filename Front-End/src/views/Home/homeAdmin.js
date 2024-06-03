import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './homeAdmin.css';

const authURL = 'http://localhost:3010/auth';
const trainingsURL = 'http://localhost:3004/trainings';
const exercisesURL = 'http://localhost:3000/exercises';
const recipesURL = 'http://localhost:3003/recipes';
const usersURL = 'http://localhost:3010/auth';

const HomeAdmin = () => {
  const [userName, setUserName] = useState('');
  const [analytics, setAnalytics] = useState({
    totalTrainings: 0,
    totalExercises: 0,
    totalRecipes: 0,
    totalUsers: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const userName = await getUserNameFromToken(token);
      setUserName(userName);

      const totalTrainings = await getCount(trainingsURL, token);
      const totalExercises = await getCount(exercisesURL, token);
      const totalRecipes = await getCount(recipesURL, token);
      const totalUsers = await getCount(usersURL, token);

      setAnalytics({
        totalTrainings,
        totalExercises,
        totalRecipes,
        totalUsers,
      });
    };

    fetchData();
  }, []);

  const getUserNameFromToken = async (token) => {
    try {
      const response = await axios.get(`${authURL}/getUsername`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.name;
    } catch (error) {
      console.error('Napaka pri pridobivanju imena iz žetona:', error);
      return '';
    }
  };

  const getCount = async (url, token) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.length;
    } catch (error) {
      console.error(`Napaka pri pridobivanju podatkov iz ${url}:`, error);
      return 0;
    }
  };

  return (
    <div className="home-container-admin">
      <br></br>
      <h2>Dobrodošli, <a href='#' onClick={() => navigate(`/profile`)}>{userName}</a>!</h2>

      <section className="analytics-section">
        <h1>Analitika</h1>
        <p style={{ color: 'grey' }}>Tukaj lahko vidite število zapisov v podatkovni bazi za vsako tabelo.</p>

        <br></br> <br></br>

        <div className="analytics-items">
          <div className="card">
            <h3>Treningi</h3>
            <p>{analytics.totalTrainings}</p>
          </div>

          <div className="card">
            <h3>Uporabniki</h3>
            <p>{analytics.totalUsers}</p>
          </div>

          <div className="card">
            <h3>Recepti</h3>
            <p>{analytics.totalRecipes}</p>
          </div>

          <div className="card">
            <h3>Vaje</h3>
            <p>{analytics.totalExercises}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeAdmin;
