import React, { useEffect, useState } from 'react';
import { Link, useNavigate  } from 'react-router-dom';
import axios from 'axios';
import './exercises.css';
import annyang from 'annyang';

// Function to convert base64 string to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Function to send fetch notification
async function sendFetch(subscription) {
  try {
    console.log("Sending Fetch...");
    await fetch("http://localhost:3000/exercises/fetch-notification", {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: {
        "content-type": "application/json"
      }
    });
    console.log("Fetch Sent...");
  } catch (error) {
    console.error("Error sending fetch:", error);
  }
}

// Function to send delete notification
async function sendDelete(subscription) {
  try {
    console.log("Sending Delete...");
    await fetch("http://localhost:3000/exercises/delete-notification", {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: {
        "content-type": "application/json"
      }
    });
    console.log("Delete Sent...");
  } catch (error) {
    console.error("Error sending delete:", error);
  }
}

const subscribeToFetchNotifications = async () => {
  try {
    // preverim, če so push obvestila podprta
    if ('PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({      // dobim subscription
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
      console.log('Push subscription:', subscription);
      sendFetch(subscription);      // pošljem subscription na server
    } else {
      console.log('Push notifications are not supported.');
    }
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
  }
};

const subscribeToDeleteNotifications = async () => {
  try {
    // preverim, če so push obvestila podprta
    if ('PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({      // dobim subscription
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
      console.log('Push subscription:', subscription);
      sendDelete(subscription);      // pošljem subscription na server
    } else {
      console.log('Push notifications are not supported.');
    }
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
  }
};

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
    console.log('Odstranjena vaja: ', response.data);
    const subscription = await subscribeToDeleteNotifications();
    if (subscription) {
      await sendDelete(subscription);
    }
  } catch (error) {
    console.error('Error deleting exercise:', error);
  }
};

const ExercisesUser = () => {
  const [exercises, setExercises] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAnnyangActive, setIsAnnyangActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const startPeriodicSync = () => {
      function isOnline() {
        return navigator.onLine;
      }
      function handleOnline() {
        console.log('Connection established.');
        synchronizeData(); // Synchronize data upon reconnection
      }
      function handleOffline() {
        console.log('Connection lost.');
      }
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      setInterval(async () => {
        console.log("Performing periodic synchronization...");
        if (isOnline()) {
          await verifyTokenAndFetchExercises();
        } else {
          console.log('No internet connection. Synchronization will be attempted upon reconnection.');
        }
      }, 15000); 
    };
  
    const fetchData = async () => {
      const currentToken = token;
      const userName = await getUsernameFromToken(currentToken);
      const exercisesData = await getExercisesForUser(userName, currentToken);
      setExercises(exercisesData);
      saveFavouritesToLocal(exercisesData);
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
    const synchronizeData = async () => {
      await fetchData();
    };
  
    startPeriodicSync();
    fetchData();
    subscribeToFetchNotifications();

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

    if (annyang) {
      if (isAnnyangActive) {
        const commands = {
          'favorite data': () => {
            const exercisesString = localStorage.getItem('favourite_exercises');
            if (exercisesString) {
              const exercises = JSON.parse(exercisesString);
              if (exercises.length > 0) {
                const exerciseDataMsg = new SpeechSynthesisUtterance('Tukaj je seznam všečkanih vaj:');
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
          'remove number *number': (number) => {
            console.log('Recognized number:', number);
            const exercisesString = localStorage.getItem('favourite_exercises');
            if (exercisesString) {
                const exercises = JSON.parse(exercisesString);
                if (exercises.length > 0) {
                  const parsedNumber = numberMap[number.toLowerCase()];
                    if (!isNaN(parsedNumber) && parsedNumber >= 0 && parsedNumber < exercises.length) {
                        const selectedExercise = exercises[parsedNumber];
                        console.log(selectedExercise);
                        deleteExercise(selectedExercise._id, token);
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
      if (e.shiftKey && e.key === 'A') {
        navigate('/exercises');
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

  const saveFavouritesToLocal = (exercises) => {
    try {
      localStorage.setItem('favourite_exercises', JSON.stringify(exercises));
      console.log('Exercises saved to local storage.');
    } catch (error) {
      console.error('Error saving exercises to local storage:', error);
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
    </div>
  );
};

export default ExercisesUser;
