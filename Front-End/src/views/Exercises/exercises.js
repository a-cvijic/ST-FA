import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './exercises.css';
import annyang from 'annyang';

const baseURL = 'http://localhost:3000/exercises/';
const authURL = 'http://localhost:3010/auth';
const publicKey = 'BHlaMKbhm8ltFEIrkiKA6b2ir4e480SVN7ezJkTQle141xKm7Pn0PUJ6nvSB1xn6cf51vhKjLeI2d_YBZJiZjeo';

const Exercises = () => {
  const [exercises, setExercises] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAnnyangActive, setIsAnnyangActive] = useState(false);
  const navigate = useNavigate();

  const numberMap = {
    'null': 0,
    'one': 1,
    'two': 2,
    'three': 3,
    'four': 4,
    'five': 5,
    'six': 6,
    'seven': 7,
    'eight': 8,
    'nine': 9,
    'ten': 10,
    'eleven': 11,
    'twelve': 12,
    'thirteen': 13,
    'fourteen': 14,
    'fifteen': 15,
    'sixteen': 16
  };
  

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

    if (annyang) {
      if (isAnnyangActive) {
        const commands = {
          'exercise number *number': (number) => {
            console.log('Recognized number:', number); 
          const exercisesString = localStorage.getItem('exercises');
          if (exercisesString) {
            const exercises = JSON.parse(exercisesString);
            const parsedNumber = numberMap[number.toLowerCase()]; // pretvorim besedo v index
            console.log('Parsed number:', parsedNumber);
              if (!isNaN(parsedNumber) && parsedNumber >= 0 && parsedNumber < exercises.length) {
                const selectedExercise = exercises[parsedNumber];
                const msg = new SpeechSynthesisUtterance(
                  `Exercise: ${selectedExercise.name}. Description: ${selectedExercise.description}. Duration: ${selectedExercise.duration} minutes. Calories: ${selectedExercise.calories}. Type: ${selectedExercise.type}. Difficulty: ${selectedExercise.difficulty}.`
                );
                window.speechSynthesis.speak(msg);
              } else {
                const errorMsg = new SpeechSynthesisUtterance('Invalid input. Please provide a valid exercise number.');
                window.speechSynthesis.speak(errorMsg);
              }
            } else {
              const errorMsg = new SpeechSynthesisUtterance('Sorry, could not find exercises in local storage.');
              window.speechSynthesis.speak(errorMsg);
            }
          },
          'exercise data': () => {
            const exercisesString = localStorage.getItem('exercises');
            if (exercisesString) {
              const exercises = JSON.parse(exercisesString);
              if (exercises.length > 0) {
                const exerciseDataMsg = new SpeechSynthesisUtterance('Tukaj je seznam vseh vaj:');
                window.speechSynthesis.speak(exerciseDataMsg);
                exercises.forEach((exercise, index) => {
                  const msg = new SpeechSynthesisUtterance(
                    `Index ${index}: Exercise: ${exercise.name}.`
                  );
                  window.speechSynthesis.speak(msg);
                });
              } else {
                const errorMsg = new SpeechSynthesisUtterance('Se opravičujem, vaje nisem uspel najti.');
                window.speechSynthesis.speak(errorMsg);
              }
            } else {
              const errorMsg = new SpeechSynthesisUtterance('Se opravičujem, nisem uspel najti vaje v lokalni shrambi.');
              window.speechSynthesis.speak(errorMsg);
            }
          },
          'favorite number *number': (number) => {
            console.log('Recognized number:', number);
            const exercisesString = localStorage.getItem('exercises');
            if (exercisesString) {
                const exercises = JSON.parse(exercisesString);
                if (exercises.length > 0) { 
                  const parsedNumber = numberMap[number.toLowerCase()];
                    if (!isNaN(parsedNumber) && parsedNumber >= 0 && parsedNumber < exercises.length) {
                        const selectedExercise = exercises[parsedNumber];
                        console.log(selectedExercise);
                        addToFavourites(selectedExercise._id);
                    } else {
                        const errorMsg = new SpeechSynthesisUtterance('Invalid input. Please provide a valid exercise index.');
                        window.speechSynthesis.speak(errorMsg);
                    }
                } else {
                    const errorMsg = new SpeechSynthesisUtterance('Se opravičujem, vaje nisem uspel najti.');
                    window.speechSynthesis.speak(errorMsg);
                }
            } else {
                const errorMsg = new SpeechSynthesisUtterance('Se opravičujem, nisem uspel najti vaje v lokalni shrambi.');
                window.speechSynthesis.speak(errorMsg);
            }
        }
        };
        annyang.addCommands(commands);
        annyang.start();
      } else {
        annyang.abort();
      }
    }
    // Keyboard shortcut setup
    const handleKeyboardShortcut = (e) => {
      if (e.shiftKey && e.key === 'F') {
        navigate('/exercisesuser');
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcut);

    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcut);
    };
  }, [token, navigate, isAnnyangActive]);

  const toggleAnnyang = () => {
    setIsAnnyangActive(!isAnnyangActive);
  };

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
    <div>
      <label htmlFor="toggleAnnyang">Annyang: </label>
      <input
        id="toggleAnnyang"
        type="checkbox"
        checked={isAnnyangActive}
        onChange={toggleAnnyang}
      />
    <div className="buttons-container">
    <Link to="/exercises" className="buttonAll">Vse vaje</Link>
    <Link to="/exercisesuser" className="buttonAll">Všečkane vaje</Link>
    <div id="exercises-container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {exercises.map((exercise) => (
        <div key={exercise._id} className="exercise-card" style={{
          flex: '1 1 calc(25% - 16px)', // 25% width minus margin for spacing
          margin: '8px',
          boxSizing: 'border-box'
        }}>
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
    </div>
    </div>
  );
};

export default Exercises;
