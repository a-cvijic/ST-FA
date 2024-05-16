const baseURL = 'http://localhost:3000/exercises/';
const authURL = 'http://localhost:3010/auth';

const editExercise = async (exerciseId) => {
    window.location.href = `edit_exercise.html?id=${exerciseId}`;
};



const checkTokenValidity = async (token) => {
  try {
      const response = await axios.get(`${authURL}/verify-token`, {
          headers: {
              Authorization: `Bearer ${token}`
          }
      });
      return response.data.valid;
  } catch (error) {
      console.error('Napaka pri avtentikaciji', error);
      return false;
  }
};

const refreshToken = async (oldToken) => {
  try {
      const response = await axios.post(`${authURL}/refresh-token`, { token: oldToken });
      return response.data.newToken;
  } catch (error) {
      console.error('Napaka pri osveževanju tokena', error);
      return null;
  }
};

// Function to fetch exercise details by ID
const getExerciseById = async (exerciseId, token) => {
    try {
        const response = await axios.get(`${baseURL}${exerciseId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data; // Return the exercise data
    } catch (error) {
        console.error('Error fetching exercise by ID:', error);
        return null; // Return null if there's an error
    }
};

// Function to fetch all exercises from the server
const getAllExercises = async (token) => {
    try {
        const response = await axios.get(`${baseURL}/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Response:', response.data); // Log the response data
        const exercises = response.data;
        const exercisesContainer = document.getElementById('exercises-container');
        exercisesContainer.innerHTML = '';
  
        // Create a table element
        const table = document.createElement('table');
        table.classList.add('exercise-table');
  
        // Create table header
        const tableHeader = document.createElement('tr');
        tableHeader.innerHTML = `
            <th>Name</th>
            <th>ID</th>
            <th>Description</th>
            <th>Duration (minutes)</th>
            <th>Calories</th>
            <th>Type</th>
            <th>Difficulty</th>
            <th>Actions</th>
        `;
        table.appendChild(tableHeader);
  
        // Loop through exercises to create table rows
        exercises.forEach(exercise => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${exercise.name}</td>
                <td>${exercise._id}</td>
                <td>${exercise.description}</td>
                <td>${exercise.duration}</td>
                <td>${exercise.calories}</td>
                <td>${exercise.type}</td>
                <td>${exercise.difficulty}</td>
                <td>
                    <button onclick="verifyTokenAndGetExerciseById('${exercise._id}')">Edit</button>
                    <button onclick="verifyTokenAndDeleteExercises('${exercise._id}')">Delete</button>
                </td>
            `;
            table.appendChild(row);
        });
  
        exercisesContainer.appendChild(table);
        
        return exercises; // Return the fetched exercises data
    } catch (error) {
        console.error('Error fetching exercises:', error);
        return null; // Return null if there's an error
    }
  };

// Function to delete an exercise by ID
const deleteExercise = async (exerciseId, token) => {
    try {
      const response = await axios.delete(`${baseURL}${exerciseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Exercise deleted:', response.data);
      await getAllExercises(token);
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const updateExercise = async (exerciseId, exerciseData, token) => {
    try {
      const response = await axios.put(`${baseURL}${exerciseId}`, exerciseData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      handleError(error);
      return null;
    }
  };
  

const verifyTokenAndFetchExercises = async () => {
  const token = localStorage.getItem('token'); // Get token from local storage
  if (token) {
    try {
      const isValid = await checkTokenValidity(token); // Check if token is valid
      if (!isValid) {
        const newToken = await refreshToken(token); // Refresh token
        if (newToken) {
          localStorage.setItem('token', newToken); // Update token in local storage
          console.log('New token:', newToken);
          const exercises = await getAllExercises(newToken); // Fetch exercises with refreshed token
          saveExercisesToLocal(exercises); // Save exercises to local storage
        } else {
          console.error('Failed to refresh token');
        }
      } else {
        console.log('Token is valid');
        const exercises = await getAllExercises(token); // Fetch exercises with existing token
        console.log(exercises);
        saveExercisesToLocal(exercises); // Save exercises to local storage
      }
    } catch (error) {
      console.error('Error:', error);
    }
  } else {
    console.error('No token found in local storage');
  }
};

const showEditForm = async (exerciseId) => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const exercise = await getExerciseById(exerciseId, token);
            if (exercise) {
                const formContainer = document.getElementById('edit-form-container');
                formContainer.innerHTML = `
                    <h2>Edit Exercise</h2>
                    <form id="edit-form">
                        <label for="name">Name:</label>
                        <input type="text" id="name" name="name" value="${exercise.name}">
                        <label for="description">Description:</label>
                        <textarea id="description" name="description">${exercise.description}</textarea>
                        <label for="duration">Duration (minutes):</label>
                        <input type="number" id="duration" name="duration" value="${exercise.duration}">
                        <label for="calories">Calories:</label>
                        <input type="number" id="calories" name="calories" value="${exercise.calories}">
                        <label for="type">Type:</label>
                        <input type="text" id="type" name="type" value="${exercise.type}">
                        <label for="difficulty">Difficulty:</label>
                        <input type="text" id="difficulty" name="difficulty" value="${exercise.difficulty}">
                        <button type="submit">Update Exercise</button>
                    </form>
                `;
                const editForm = document.getElementById('edit-form');
                editForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const isValid = await checkTokenValidity(token);
                    if (!isValid) {
                        const newToken = await refreshToken(token);
                        if (newToken) {
                            localStorage.setItem('token', newToken);
                            console.log('New token:', newToken);
                            // Retrieve the updated exercise data here
                            const updatedExerciseData = {
                                name: document.getElementById('name').value,
                                description: document.getElementById('description').value,
                                duration: document.getElementById('duration').value,
                                calories: document.getElementById('calories').value,
                                type: document.getElementById('type').value,
                                difficulty: document.getElementById('difficulty').value
                            };
                            await updateExercise(exerciseId, updatedExerciseData, newToken);
                            await verifyTokenAndFetchExercises();
                        } else {
                            console.error('Failed to refresh token');
                        }
                    } else {
                        console.log('Token is valid');
                        // Retrieve the updated exercise data here
                        const updatedExerciseData = {
                            name: document.getElementById('name').value,
                            description: document.getElementById('description').value,
                            duration: document.getElementById('duration').value,
                            calories: document.getElementById('calories').value,
                            type: document.getElementById('type').value,
                            difficulty: document.getElementById('difficulty').value
                        };
                        await updateExercise(exerciseId, updatedExerciseData, token);
                        await verifyTokenAndFetchExercises();
                    }
                });
            } else {
                console.error('Exercise not found');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        console.error('No token found in local storage');
    }
};



const verifyTokenAndGetExerciseById = async (exerciseId) => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const isValid = await checkTokenValidity(token);
            if (!isValid) {
                const newToken = await refreshToken(token);
                if (newToken) {
                    localStorage.setItem('token', newToken);
                    console.log('New token:', newToken);
                    await showEditForm(exerciseId);
                } else {
                    console.error('Failed to refresh token');
                }
            } else {
                console.log('Token is valid');
                await showEditForm(exerciseId);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        console.error('No token found in local storage');
    }
};


const verifyTokenAndDeleteExercises = async (exerciseId) => {
    const token = localStorage.getItem('token'); // Get token from local storage
    if (token) {
        try {
            const isValid = await checkTokenValidity(token); // Check if token is valid
            if (!isValid) {
                const newToken = await refreshToken(token); // Refresh token
                if (newToken) {
                    localStorage.setItem('token', newToken); // Update token in local storage
                    console.log('New token:', newToken);
                    await deleteExercise(exerciseId, newToken); // Delete exercise with refreshed token
                } else {
                    console.error('Failed to refresh token');
                }
            } else {
                console.log('Token is valid');
                await deleteExercise(exerciseId, token); // Delete exercise with existing token
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        console.error('No token found in local storage');
    }
};

// Call the function to display exercises when the page loads
window.onload = verifyTokenAndFetchExercises;


function saveExercisesToLocal(exercises) {
  try {
    // Convert exercises to JSON and store in local storage
    localStorage.setItem('exercises', JSON.stringify(exercises));
    console.log('Exercises saved to local storage.');
  } catch (error) {
    console.error('Error saving exercises to local storage:', error);
  }
}
