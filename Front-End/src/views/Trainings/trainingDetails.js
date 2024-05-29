import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './trainingDetails.css';

const baseURL = 'http://localhost:3004/trainings/';
const authURL = 'http://localhost:3010/auth';
const exercisesURL = 'http://localhost:3000/exercises/';

const TrainingDetails = () => {
    const { trainingId } = useParams();
    console.log('ID treninga:', trainingId);
    const navigate = useNavigate();

    const [training, setTraining] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [editMode, setEditMode] = useState(false);
    const [editTraining, setEditTraining] = useState(null);
    const [exercises, setExercises] = useState([]);

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
                    setEditTraining(refreshedTraining);
                } else {
                    console.error('Napaka pri osveževanju žetona');
                }
            } else {
                const trainingData = await getTrainingById(trainingId, token);
                setTraining(trainingData);
                setEditTraining(trainingData);
            }
            const exercisesData = await getAllExercises(token);
            setExercises(exercisesData);
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
            console.error('Napaka med overjanjem pristnosti:', error);
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

    const getTrainingById = async (trainingId, token) => {
        try {
            const response = await axios.get(`${baseURL}${trainingId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Podrobnosti treninga:', response.data);
            return response.data;
        } catch (error) {
            console.error('Napaka pri pridobivanju podrobnosti treninga:', error);
            return null;
        }
    };

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

    const handleUpdateTraining = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.put(`${baseURL}${editTraining._id}`, editTraining, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTraining(response.data);
            setEditMode(false);
            console.log('Trening posodobljen:', response.data);
        } catch (error) {
            console.error('Napaka pri posodabljanju treninga:', error);
        }
    };

    const handleDeleteTraining = async () => {
        try {
            await axios.delete(`${baseURL}${training._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Trening izbrisan');
            navigate('/trainings');
        } catch (error) {
            console.error('Napaka pri brisanju treninga:', error);
        }
    };

    const handleExerciseChange = (exerciseId) => {
        setEditTraining((prevState) => {
            const exercise_ids = prevState.exercise_ids.includes(exerciseId)
                ? prevState.exercise_ids.filter(id => id !== exerciseId)
                : [...prevState.exercise_ids, exerciseId];

            const selectedExercises = exercises.filter(ex => exercise_ids.includes(ex._id));
            const total_duration = selectedExercises.reduce((sum, ex) => sum + ex.duration, 0);
            const total_calories = selectedExercises.reduce((sum, ex) => sum + ex.calories, 0);

            return { ...prevState, exercise_ids, total_duration, total_calories };
        });
    };

    const getExerciseNames = (ids) => {
        return ids.map(id => {
            const exercise = exercises.find(ex => ex._id === id);
            return exercise ? exercise.name : id;
        }).join(', ');
    };

    const exerciseNames = getExerciseNames(training ? training.exercise_ids : []);

    if (!training) {
        return <p>Nalaganje...</p>;
    }

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options).replace(/\//g, '.');
    };

    const formatTime = (dateString) => {
        const options = { hour: 'numeric', minute: 'numeric' };
        return new Date(dateString).toLocaleTimeString(undefined, options);
    };

    return (
        <div>
            {editMode && (
                <div id="edit-training-container">
                    <form className="edit-training-form" onSubmit={handleUpdateTraining}>
                        <h2>Uredi trening</h2>
                        <input
                            type="text"
                            placeholder="Ime"
                            value={editTraining ? editTraining.name : training.name}
                            onChange={(e) => setEditTraining({ ...editTraining, name: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Opis"
                            value={editTraining ? editTraining.description : training.description}
                            onChange={(e) => setEditTraining({ ...editTraining, description: e.target.value })}
                            required
                        />
                        <div className="exercise-selection">
                            <label>Izberite vaje:</label>
                            {exercises.map((exercise) => (
                                <div key={exercise._id}>
                                    <input
                                        type="checkbox"
                                        value={exercise._id}
                                        checked={editTraining.exercise_ids.includes(exercise._id)}
                                        onChange={() => handleExerciseChange(exercise._id)}
                                    />
                                    {exercise.name}
                                </div>
                            ))}
                        </div>
                        <p>Skupno trajanje: {editTraining.total_duration} minut</p>
                        <p>Skupne kalorije: {editTraining.total_calories}</p>
                        <button type="submit">Shrani</button>
                    </form>
                </div>
            )}
            <div id="training-detail">
                <h2>{training.name}</h2>
                <table>
                    <tbody>
                        <tr>
                            <td><b>Opis</b></td>
                            <td>{training.description}</td>
                        </tr>
                        <tr>
                            <td><b>Trajanje</b></td>
                            <td>{training.total_duration} minut</td>
                        </tr>
                        <tr>
                            <td><b>Kalorije</b></td>
                            <td>{training.total_calories}</td>
                        </tr>
                        <tr>
                            <td><b>Vaje</b></td>
                            <td>{exerciseNames}</td>
                        </tr>
                        <tr>
                            <td><b>Ustvarjeno</b></td>
                            <td>{formatDate(training.created)} ob {formatTime(training.created)}</td>
                        </tr>
                        <tr>
                            <td><b>Zadnje spremembe</b></td>
                            <td>{formatDate(training.updated)} ob {formatTime(training.updated)}</td>
                        </tr>
                    </tbody>
                </table>
                <button onClick={() => setEditMode(true)}>Uredi</button>
                <button onClick={handleDeleteTraining} style={{ float: 'right', backgroundColor: '#f04646' }}>Izbriši</button>
            </div>
        </div>
    );
};

export default TrainingDetails;
