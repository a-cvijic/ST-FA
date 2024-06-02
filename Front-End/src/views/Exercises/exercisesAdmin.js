import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './exercisesAdmin.css';

const baseURL = 'http://localhost:3000/exercises/';
const authURL = 'http://localhost:3010/auth';
const publicKey = 'BHlaMKbhm8ltFEIrkiKA6b2ir4e480SVN7ezJkTQle141xKm7Pn0PUJ6nvSB1xn6cf51vhKjLeI2d_YBZJiZjeo';


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
  
  // Function to send push notification
  async function sendPush(subscription) {
    try {
      console.log("Sending Push...");
      await fetch("http://localhost:3000/exercises/push-notification", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: {
          "content-type": "application/json"
        }
      });
      console.log("Push Sent...");
    } catch (error) {
      console.error("Error sending push:", error);
    }
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

  async function sendUpdate(subscription) {
    try {
      console.log("Sending Delete...");
      await fetch("http://localhost:3000/exercises/update-notification", {
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
  
  const subscribeToPushNotifications = async () => {
    try {
      // Check if push notification is supported
      if ('PushManager' in window) {
        // Get push subscription
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
        console.log('Push subscription:', subscription);
  
        // Send the push subscription to the server
        sendPush(subscription);
      } else {
        console.log('Push notifications are not supported.');
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  };
  
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

  const subscribeToUpdateNotifications = async () => {
    try {
      // preverim, če so push obvestila podprta
      if ('PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({      // dobim subscription
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
        console.log('Push subscription:', subscription);
        sendUpdate(subscription);      // pošljem subscription na server
      } else {
        console.log('Push notifications are not supported.');
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  };

const ExercisesAdmin = () => {
    const [exercises, setExercises] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isEditing, setIsEditing] = useState(false);
    const [currentExercise, setCurrentExercise] = useState(null);

    useEffect(() => {
        const verifyTokenAndFetchExercises = async () => {
            if (token) {
                try {
                    const isValid = await checkTokenValidity(token);
                    if (!isValid) {
                        const newToken = await refreshToken(token);
                        if (newToken) {
                            localStorage.setItem('token', newToken);
                            setToken(newToken);
                            await fetchAllExercises(newToken);
                        } else {
                            console.error('Failed to refresh token');
                        }
                    } else {
                        await fetchAllExercises(token);
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            } else {
                console.error('No token in local storage');
            }
        };

        verifyTokenAndFetchExercises();
        subscribeToFetchNotifications();
    }, [token]);

    const fetchAllExercises = async (token) => {
        try {
            const response = await axios.get(baseURL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExercises(response.data);
        } catch (error) {
            console.error('Error fetching exercises:', error);
        }
    };

    const checkTokenValidity = async (token) => {
        try {
            const response = await axios.get(`${authURL}/verify-token`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.valid;
        } catch (error) {
            console.error('Error verifying token:', error);
            return false;
        }
    };

    const refreshToken = async (oldToken) => {
        try {
            const response = await axios.post(`${authURL}/refresh-token`, { token: oldToken });
            return response.data.newToken;
        } catch (error) {
            console.error('Error refreshing token:', error);
            return null;
        }
    };

    const handleDeleteExercise = async (exerciseId) => {
        try {
            const isValidToken = await checkTokenValidity(token);
            if (!isValidToken) {
                const newToken = await refreshToken(token);
                if (newToken) {
                    setToken(newToken);
                    await handleDeleteExercise(exerciseId);
                    return;
                } else {
                    console.error('Failed to refresh token');
                    return;
                }
            }
            await axios.delete(`${baseURL}${exerciseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchAllExercises(token);
            const subscription = await subscribeToDeleteNotifications();
            if (subscription) {
              await sendDelete(subscription);
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.error('Forbidden: You do not have permission to delete exercises.');
            } else {
                console.error('Error deleting exercise:', error);
            }
        }
    };
    
    const handleCreateExercise = async (exerciseData) => {
        try {
            const isValidToken = await checkTokenValidity(token);
            if (!isValidToken) {
                const newToken = await refreshToken(token);
                if (newToken) {
                    setToken(newToken);
                    await handleCreateExercise(exerciseData);
                    return;
                } else {
                    console.error('Failed to refresh token');
                    return;
                }
            }
            await axios.post(baseURL, exerciseData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchAllExercises(token);
            const subscription = await subscribeToPushNotifications();
            if (subscription) {
              await sendDelete(subscription);
            }
        } catch (error) {
            if (error.response.status === 403) {
                console.error('Forbidden: You do not have permission to create exercises.');
            } else {
                console.error('Error creating exercise:', error);
            }
        }
    };

    const handleUpdateExercise = async (exerciseId, exerciseData) => {
        try {
            const isValidToken = await checkTokenValidity(token);
            if (!isValidToken) {
                const newToken = await refreshToken(token);
                if (newToken) {
                    setToken(newToken);
                    await handleUpdateExercise(exerciseId, exerciseData);
                    return;
                } else {
                    console.error('Failed to refresh token');
                    return;
                }
            }
            await axios.put(`${baseURL}${exerciseId}`, exerciseData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchAllExercises(token);
            const subscription = await subscribeToUpdateNotifications();
            if (subscription) {
              await sendDelete(subscription);
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.error('Forbidden: You do not have permission to update exercises.');
            } else {
                console.error('Error updating exercise:', error);
            }
        }
    };
    

    const handleEditClick = (exercise) => {
        setCurrentExercise(exercise);
        setIsEditing(true);
    };

    const handleCreateClick = () => {
        setCurrentExercise(null);
        setIsEditing(true);
    };

    const renderExerciseTable = () => {
        return exercises.map((exercise) => (
            <tr key={exercise._id}>
                <td>{exercise.name}</td>
                <td>{exercise.description}</td>
                <td>{exercise.duration}</td>
                <td>{exercise.calories}</td>
                <td>{exercise.type}</td>
                <td>{exercise.difficulty}</td>
                <td>{exercise.movement}</td>
                <td>{exercise.series}</td>
                <td>{exercise.repetitions}</td>
                <td>{exercise.benefits.join(', ')}</td>
                <td>{exercise.tips.join(', ')}</td>
                <td>
                  <button className="button-edit" onClick={() => handleEditClick(exercise)}>Uredi</button>
                  <button className="button-delete" onClick={() => handleDeleteExercise(exercise._id)}>Izbriši</button>
                </td>
            </tr>
        ));
    };

    return (
        <div>
            <h1>Exercises Admin</h1>
            {isEditing ? (
                <ExerciseForm
                    exercise={currentExercise}
                    token={token}
                    onSubmit={currentExercise ? handleUpdateExercise : handleCreateExercise}
                    onCancel={() => setIsEditing(false)}
                />
            ) : (
                <>
                    <button className="button-create" onClick={handleCreateClick}>+</button>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Duration</th>
                                <th>Calories</th>
                                <th>Type</th>
                                <th>Difficulty</th>
                                <th>Movement</th>
                                <th>Series</th>
                                <th>Repetitions</th>
                                <th>Benefits</th>
                                <th>Tips</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderExerciseTable()}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

const ExerciseForm = ({ exercise, token, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: exercise?.name || '',
        description: exercise?.description || '',
        duration: exercise?.duration || '',
        calories: exercise?.calories || '',
        type: exercise?.type || '',
        difficulty: exercise?.difficulty || '',
        movement: exercise?.movement || '',
        series: exercise?.series || '',
        repetitions: exercise?.repetitions || '',
        benefits: exercise?.benefits.join(', ') || '',
        tips: exercise?.tips.join(', ') || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleKeyDown = (e) => {
        if (e.shiftKey && e.key === 'C') {
            handleSubmit(e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            benefits: formData.benefits.split(',').map(item => item.trim()),
            tips: formData.tips.split(',').map(item => item.trim())
        };
        if (exercise) {
            await onSubmit(exercise._id, data);
        } else {
            await onSubmit(data);
        }
        onCancel();
    };

    return (
        <div className="modal" onKeyDown={handleKeyDown}>
            <div className="modal-content">
                <h2>{exercise ? 'Edit Exercise' : 'New Exercise'}</h2>
                <form onSubmit={handleSubmit}>
                    <label>Name:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    <label>Description:</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required></textarea>
                    <label>Duration (minutes):</label>
                    <input type="number" name="duration" value={formData.duration} onChange={handleChange} required />
                    <label>Calories:</label>
                    <input type="number" name="calories" value={formData.calories} onChange={handleChange} required />
                    <label>Type:</label>
                    <input type="text" name="type" value={formData.type} onChange={handleChange} required />
                    <label>Difficulty:</label>
                    <input type="text" name="difficulty" value={formData.difficulty} onChange={handleChange} required />
                    <label>Movement:</label>
                    <textarea name="movement" value={formData.movement} onChange={handleChange} required></textarea>
                    <label>Series:</label>
                    <input type="number" name="series" value={formData.series} onChange={handleChange} required />
                    <label>Repetitions:</label>
                    <input type="text" name="repetitions" value={formData.repetitions} onChange={handleChange} required />
                    <label>Benefits (comma-separated):</label>
                    <textarea name="benefits" value={formData.benefits} onChange={handleChange} required></textarea>
                    <label>Tips (comma-separated):</label>
                    <textarea name="tips" value={formData.tips} onChange={handleChange} required></textarea>
                    <button type="submit">{exercise ? 'Update' : 'Create'}</button>
                    <button type="button" onClick={onCancel}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default ExercisesAdmin;
