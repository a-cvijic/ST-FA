import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import annyang from 'annyang';
import axios from 'axios';
import './trainings.css';

const baseURL = 'http://localhost:3004/trainings/';
const authURL = 'http://localhost:3010/auth';
const exercisesURL = 'http://localhost:3000/exercises/';


// Logic for notifications
const requestNotificationPermission = () => {
  Notification.requestPermission().then(permission => {
    console.log('Notification permission:', permission);
    if (permission === "granted") {
      console.log("Permission granted");
    } else {
      console.log("Permission not granted");
    }
  });
};

const showNotification = (title, message) => {
  if (Notification.permission === 'granted') {
    new Notification(title, { body: message });
  }
};


const Trainings = () => {
  const [trainings, setTrainings] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [newTraining, setNewTraining] = useState({
    name: '',
    description: '',
    total_duration: 0,
    total_calories: 0,
    exercise_ids: [],
    user_id: '',
  });

  useEffect(() => {    
    requestNotificationPermission();
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
          console.error('Neuspešno osveževanje žetona');
          return;
        }
      }
      const trainingsData = await getAllTrainings(currentToken);
      setTrainings(trainingsData);
      saveTrainingsToLocal(trainingsData);

      const exercisesData = await getAllExercises(currentToken);
      setExercises(exercisesData);

      const userId = await getUserIdFromToken(currentToken);
      setUserId(userId);
    };

    fetchData();
  }, [token]);


  // Logic for security and token management
  const checkTokenValidity = async (token) => {
    try {
      const response = await axios.get(`${authURL}/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.valid;
    } catch (error) {
      console.error('Napaka pri preverjanju avtentičnosti:', error);
      return false;
    }
  };

  const refreshToken = async (oldToken) => {
    try {
      const response = await axios.post(`${authURL}/refresh-token`, { token: oldToken });
      return response.data.newToken;
    } catch (error) {
      console.error('Napaka pri osveževanju žetona:', error);
      return null;
    }
  };

  const getUserIdFromToken = async (token) => {
    try {
      const response = await axios.get(`${authURL}/getId`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.id;
    } catch (error) {
      console.error('Napaka pri pridobivanju ID-ja uporabnika iz žetona:', error);
      return null;
    }
  };


  // Logic for trainings
  const getAllTrainings = async (token) => {
    try {
      const response = await axios.get(baseURL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Napaka pri pridobivanju treningov:', error);
      return [];
    }
  };

  const saveTrainingsToLocal = (trainings) => {
    try {
      localStorage.setItem('trainings', JSON.stringify(trainings));
      console.log('Treningi shranjeni v lokalno shrambo.');
    } catch (error) {
      console.error('Napaka pri shranjevanju treningov v lokalno shrambo:', error);
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
          console.error('Neuspešno osveževanje žetona');
          return;
        }
      }

      const response = await axios.put(`${baseURL}f/${trainingId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedTraining = response.data;
      setTrainings(trainings.map(training => training._id === trainingId ? updatedTraining : training));
      if (updatedTraining.favourite === true) {
        console.log('Trening dodan med priljubljene:', updatedTraining);
        showNotification('Dodano v priljubljene', 'Vaš trening je uspešno dodan v priljubljene.');
      }
      else {
        console.log('Trening odstranjen iz priljubljenih:', updatedTraining);
        showNotification('Odstranjeno iz priljubljenih', 'Vaš trening je uspešno odstranjen iz priljubljenih.');
      }
    } catch (error) {
      console.error('Napaka pri dodajanju med priljubljene:', error);
      showNotification('Napaka', 'Napaka pri dodajanju treninga v prilubljene. Prosimo poskusite znova.');
    }
  };

  const handleAddTraining = async (event) => {
    event.preventDefault();
    try {
      if (!userId) {
        console.error('Neuspešno pridobivanje ID-ja uporabnika iz žetona');
        return;
      }

      const trainingToAdd = { ...newTraining, user_id: userId };
      const response = await axios.post(baseURL, trainingToAdd, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTrainings([...trainings, response.data]);
      setNewTraining({
        name: '',
        description: '',
        total_duration: 0,
        total_calories: 0,
        exercise_ids: [],
        user_id: '',
      });
      console.log('Trening dodan:', response.data);
      showNotification('Trening uspešno dodan', 'Vaš trening je uspešno dodan v aplikaciji.');
      setShowAddForm(false);
    } catch (error) {
      console.error('Napaka pri dodajanju treninga:', error);
      showNotification('Napaka', 'Napaka pri dodajanju treninga v aplikacijo. Prosimo poskusite znova.');
    }
  };

  const filteredTrainings = trainings
    .filter(training => training.user_id === userId.toString())
    .filter(training => training.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(training => !showLikedOnly || training.favourite);


  // Logic for exercises
  const getAllExercises = async (token) => {
    try {
      const response = await axios.get(exercisesURL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Napaka pri pridobivanju vaj:', error);
      return [];
    }
  };

  const handleExerciseChange = (exerciseId) => {
    setNewTraining((prevState) => {
      const exercise_ids = prevState.exercise_ids.includes(exerciseId)
        ? prevState.exercise_ids.filter(id => id !== exerciseId)
        : [...prevState.exercise_ids, exerciseId];

      const selectedExercises = exercises.filter(ex => exercise_ids.includes(ex._id));
      const total_duration = selectedExercises.reduce((sum, ex) => sum + ex.duration, 0);
      const total_calories = selectedExercises.reduce((sum, ex) => sum + ex.calories, 0);

      return { ...prevState, exercise_ids, total_duration, total_calories };
    });
  };


  // Logic for speech recognition
  useEffect(() => {
    if (annyang) {
      const commands = {
        'add training': () => {
          setShowAddForm(true);
          speak('Add new training window opened');
        },
        'like *name': (name) => {
          const training = trainings.find(t => t.name.toLowerCase() === name.toLowerCase());
          if (training && !training.favourite) {
            addToFavourites(training._id);
            speak(`${name} liked`);
          }
          if (training && training.favourite) {
            speak(`${name} is already liked`);
          }
          if (!training) {
            speak(`${name} not found`);
          }
        },
        'dislike *name': (name) => {
          const training = trainings.find(t => t.name.toLowerCase() === name.toLowerCase());
          if (training && training.favourite) {
            addToFavourites(training._id);
            speak(`${name} disliked`);
          }
          if (training && !training.favourite) {
            speak(`${name} is not liked`);
          }
          if (!training) {
            speak(`${name} not found`);
          }
        },
        'go to *name': (name) => {
          const training = trainings.find(t => t.name.toLowerCase() === name.toLowerCase());
          if (training) {
            navigate(`/training/${training._id}`);
            speak(`Showing ${name} details`);
          } else {
            speak(`${name} not found`);
          }
        },
        'show liked': () => {
          setShowLikedOnly(true);
          speak('Showing favourite trainings');
        },
        'show all': () => {
          setShowLikedOnly(false);
          speak('Showing all trainings');
        },
        'search for *name': (name) => {
          if (name === 'all') {
            setSearchTerm('');
            speak('Showing all trainings');
          }
          else {
            setSearchTerm(name);
            speak(`Searching for ${name}`);
          }
        }
      };

      annyang.addCommands(commands);
      annyang.start();
      return () => {
        annyang.removeCommands(Object.keys(commands));
        annyang.abort();
      }
    }
  }, [trainings, navigate, addToFavourites]);

  const speak = (text) => {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    const desiredVoice = voices.find(voice =>
      voice.name === 'Samantha' && voice.lang === 'en-US'
    );

    if (desiredVoice) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = desiredVoice;
      synth.speak(utterance);
    } else {
      console.error('Desired voice not found');
    }
  };

  // Render HTML content
  if (!trainings) {
    return <p>Nalaganje...</p>;
  }

  return (
    <div id="trainings-container" className="trainings-container">

      <h2>Treningi</h2>

      <button onClick={() => setShowAddForm(!showAddForm)}>
        {showAddForm ? '➖' : 'Prikaži obrazec za dodajanje treninga'}
      </button>

      {showAddForm && (
        <form className="training-form" onSubmit={handleAddTraining}>
          <h2>Dodaj nov trening</h2>
          <input
            type="text"
            placeholder="Ime"
            value={newTraining.name}
            onChange={(e) => setNewTraining({ ...newTraining, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Opis"
            value={newTraining.description}
            onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })}
            required
          />
          <div className="exercise-selection">
            <h3>Vaje:</h3>
            {exercises.map((exercise) => (
              <div key={exercise._id}>
                <input
                  type="checkbox"
                  value={exercise._id}
                  checked={newTraining.exercise_ids.includes(exercise._id)}
                  onChange={() => handleExerciseChange(exercise._id)}
                />
                {exercise.name}
              </div>
            ))}
          </div>
          <p><b>Trajanje:</b> {newTraining.total_duration} minut</p>
          <p><b>Kalorije:</b> {newTraining.total_calories}</p>
          <button type="submit" style={{ margin: '0px' }}>Dodaj trening</button>
        </form>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Poišči trening..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <p style={{ float: 'right', marginLeft: '20px' }}>🔎</p>
        <button onClick={() => setShowLikedOnly(!showLikedOnly)} style={{ marginLeft: '20px' }}>
          {showLikedOnly ? 'Vsi' : 'Priljubljeni'}
        </button>
      </div>

      {filteredTrainings.length === 0 ? (
        <p style={{ color: 'grey' }}>Ni treningov za prikaz</p>
      ) : (
        filteredTrainings.map((training) => (
          training && (
            <div key={training._id} className="training-card">
              <div className="training-header">
                <a
                  href="#"
                  onClick={() => navigate(`/training/${training._id}`)}
                  className="training-name-link"
                >
                  {training.name}
                </a>
                <button onClick={() => addToFavourites(training._id)} style={{ float: 'right' }}>
                  {training.favourite ? '♥' : '♡'}
                </button>
              </div>
              <div className="training-body">
                <p style={{ color: 'gray' }}>{training.description}</p>
                <br />
                <p style={{ color: 'gray', float: 'right' }}><b><i>{training.total_duration} minut</i></b></p>
              </div>
            </div>
          )
        ))
      )}
    </div>
  );
};

export default Trainings;
