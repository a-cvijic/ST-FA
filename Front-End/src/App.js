import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';

import Home from './views/Home/home';

import Trainings from './views/Trainings/trainings';
import TrainingDetails from './views/Trainings/trainingDetails';

import Recipes from './views/Recepies/recepies';

import Exercises from './views/Exercises/exercises';
import ExercisesDetails from './views/Exercises/exercisesDetails';

import Chat from './views/Chat/chat';
import Profile from './views/Profile/profile';
import Login from './views/Login/login';
import Register from './views/Register/Register';
import Navbar from './components/navbar';


import HomeAdmin from './views/Home/homeAdmin';
import TrainingsAdmin from './views/Trainings/trainingsAdmin';
import RecipesAdmin from './views/Recepies/recepiesAdmin';
import ExercisesAdmin from './views/Exercises/exercisesAdmin';
import ChatAdmin from './views/Chat/chatAdmin';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const admin = localStorage.getItem('isAdmin') === 'true';
    if (token) {
      setIsAuthenticated(true);
      setIsAdmin(admin);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <ConditionalNavbar isAuthenticated={isAuthenticated} />
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={isAuthenticated ? <AuthenticatedRoutes isAdmin={isAdmin} /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
};

const ConditionalNavbar = ({ isAuthenticated }) => {
  const location = useLocation();
  const hideNavbarPaths = ['/login', '/register'];

  return !hideNavbarPaths.includes(location.pathname) && isAuthenticated ? <Navbar /> : null;
};

const AuthenticatedRoutes = ({ isAdmin }) => (
  <Routes>
    {isAdmin ? (
      <>
        <Route path="/" element={<HomeAdmin />} />
        <Route path="/home" element={<HomeAdmin />} />
        <Route path="/trainings" element={<TrainingsAdmin />} />
        <Route path="/recipes" element={<RecipesAdmin />} />
        <Route path="/exercises" element={<ExercisesAdmin />} />
        <Route path="/chat" element={<ChatAdmin />} />
        <Route path="/profile" element={<Profile />} />
      </>
    ) : (
      <>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/trainings" element={<Trainings />} />
        <Route path="/training/:trainingId" element={<TrainingDetails />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/exercise/:exerciseId" component={ExercisesDetails} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
      </>
    )}
  </Routes>
);

export default App;
