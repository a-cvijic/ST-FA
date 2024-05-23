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
        return response.data;
    } catch (error) {
        console.error('Napaka pri pridobivanju vaje:', error);
        return null;
    }
};

// pridobivanje vseh vaj iz baze
const getAllExercises = async (token) => {
    try {
        const response = await axios.get(`${baseURL}/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Response:', response.data); // logiranje
        const exercises = response.data;
        const exercisesContainer = document.getElementById('exercises-container');
        exercisesContainer.innerHTML = '';
        // dinamična izgradnja tabele
        const table = document.createElement('table');
        table.classList.add('exercise-table');
        const tableHeader = document.createElement('tr');//glava tabele
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
        exercises.forEach(exercise => { // grem skozi tabele, da naredim vrstice
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
        
        return exercises; // vrnem vaje
    } catch (error) {
        console.error('Napaka pri pridobivanju vaj:', error);
        return null;
    }
  };

// Brisanje vaje glede na id
const deleteExercise = async (exerciseId, token) => {
    try {
      const response = await axios.delete(`${baseURL}${exerciseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Vaja izbrisana:', response.data);
      await getAllExercises(token);
    } catch (error) {
      console.error('Napaka pri brisanju vaje:', error);
    }
  };

  // Posodabljanje vaje
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
  
  // ustvarjanje vaje
  const createExercise = async (exerciseData, token) => {
    try {
      const response = await axios.post(`${baseURL}`, exerciseData, {
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
  const token = localStorage.getItem('token'); // pridobimo token iz lokalne shrambe
  if (token) {
    try {
      const isValid = await checkTokenValidity(token); // preverjanje veljavnosti tokena
      if (!isValid) {
        const newToken = await refreshToken(token); // osvežimo, če ni veljaven
        if (newToken) {
          localStorage.setItem('token', newToken); // posodobimo lokalno shrambo
          console.log('Nov token:', newToken);
          const exercises = await getAllExercises(newToken); // pridobim vaje z osveženim tokenom
          saveExercisesToLocal(exercises); // vaje shranimo v lokalno shrambo
        } else {
          console.error('Neuspešno posodabljanje tokena');
        }
      } else {
        console.log('Token je veljaven');//če je token veljaven (preskočimo refresh in izvedemo fetch in shranjevanje v lokalno bazo)
        const exercises = await getAllExercises(token);
        console.log(exercises);
        saveExercisesToLocal(exercises);
      }
    } catch (error) {
      console.error('Napaka:', error);
    }
  } else {
    console.error('V lokalni shrambi ni tokena');
  }
};

const showPostForm = () => {
    const formContainer = document.getElementById('post-form-container');//modal za vstavljanje vaje
    formContainer.innerHTML = `
        <h2>New Exercise</h2>
        <form id="post-form">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required>
            <label for="description">Description:</label>
            <textarea id="description" name="description" required></textarea>
            <label for="duration">Duration (minutes):</label>
            <input type="number" id="duration" name="duration" required>
            <label for="calories">Calories:</label>
            <input type="number" id="calories" name="calories" required>
            <label for="type">Type:</label>
            <input type="text" id="type" name="type" required>
            <label for="difficulty">Difficulty:</label>
            <input type="text" id="difficulty" name="difficulty" required>
            <button type="submit">Create Exercise</button>
        </form>
    `;
    const postForm = document.getElementById('post-form');
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const isValid = await checkTokenValidity(token);
                if (!isValid) {
                    const newToken = await refreshToken(token);
                    if (newToken) {
                        localStorage.setItem('token', newToken);
                        console.log('Nov token:', newToken);
                        const newExerciseData = {
                            name: document.getElementById('name').value,
                            description: document.getElementById('description').value,
                            duration: document.getElementById('duration').value,
                            calories: document.getElementById('calories').value,
                            type: document.getElementById('type').value,
                            difficulty: document.getElementById('difficulty').value
                        };
                        await createExercise(newExerciseData, newToken);
                        await verifyTokenAndFetchExercises();
                    } else {
                        console.error('Napaka pri posodabljanju tokena');
                    }
                } else {
                    console.log('Token je veljaven');
                    const newExerciseData = {
                        name: document.getElementById('name').value,
                        description: document.getElementById('description').value,
                        duration: document.getElementById('duration').value,
                        calories: document.getElementById('calories').value,
                        type: document.getElementById('type').value,
                        difficulty: document.getElementById('difficulty').value
                    };
                    await createExercise(newExerciseData, token);
                    await verifyTokenAndFetchExercises();
                }
                location.reload();
            } catch (error) {
                console.error('Napaka:', error);
            }
        } else {
            console.error('V lokalni shrambi ni tokena');
        }
    });
    // Show the modal
    formContainer.style.display = 'block';
};

// Event listener for the new exercise button
document.getElementById('dodaj-vajo').addEventListener('click', showPostForm);

const closeModal = () => {
    document.getElementById('edit-form-container').style.display = 'none';
    document.getElementById('post-form-container').style.display = 'none';
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
                            console.log('Nov token:', newToken);
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
                            console.error('Neuspešno posodabljanje tokena');
                        }
                    } else {
                        console.log('Token je veljaven');
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
                        location.reload();
                    }
                });
            } else {
                console.error('Vaja ni bila najdena');
            }
            location.reload();
        } catch (error) {
            console.error('Napaka:', error);
        }
    } else {
        console.error('V lokalni shrambi ni tokena');
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
                    console.log('Nov token:', newToken);
                    await showEditForm(exerciseId);
                } else {
                    console.error('Neuspešno posodabljanje tokena');
                }
            } else {
                console.log('Token je veljaven');
                await showEditForm(exerciseId);
            }
        } catch (error) {
            console.error('Napaka:', error);
        }
    } else {
        console.error('V lokalni shrambi ni tokena');
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
                    console.log('Nov token:', newToken);
                    await deleteExercise(exerciseId, newToken); // Delete exercise with refreshed token
                } else {
                    console.error('Neuspešno posodabljanje tokena');
                }
            } else {
                console.log('Token je veljaven');
                await deleteExercise(exerciseId, token); // Delete exercise with existing token
            }
        } catch (error) {
            console.error('Napaka:', error);
        }
    } else {
        console.error('V lokalni shrambi ni tokena');
    }
};

// Call the function to display exercises when the page loads
window.onload = verifyTokenAndFetchExercises;


function saveExercisesToLocal(exercises) {
  try {
    // Convert exercises to JSON and store in local storage
    localStorage.setItem('exercises', JSON.stringify(exercises));
    console.log('Vaje shranjene v lokalno shrambo.');
  } catch (error) {
    console.error('Napaka pri shranjevanju vaj v lokalno shrambo:', error);
  }
}
