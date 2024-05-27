const baseURL = 'http://localhost:3000/exercises/';
const authURL = 'http://localhost:3010/auth';
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

const deleteExercise = async (exerciseId, token) => {
    try {
        // Check if token is expired
        const isValid = await checkTokenValidity(token);
        if (!isValid) {
            // If token is expired, attempt to refresh it
            const newToken = await refreshToken(token);
            if (newToken) {
                // If token is successfully refreshed, update the token
                localStorage.setItem('token', newToken);
                console.log('Token refreshed:', newToken);
                // Retry deleting the exercise with the new token
                return deleteExercise(exerciseId, newToken);
            } else {
                // If token refresh fails, handle the error
                console.error('Failed to refresh token');
                return;
            }
        }

        // If token is valid, proceed to delete the exercise
        const response = await axios.delete(`${baseURL}exercise/${exerciseId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Vaja izbrisana:', response.data);
        await verifyTokenAndFetchExercisesForUser(token);
    } catch (error) {
        console.error('Napaka pri brisanju vaje:', error);
    }
};

  
const getExercisesForUser = async (userName, token) => {
    try {
        const response = await axios.get(`${baseURL}exercise/${userName}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Response:', response.data); // Log the response data
        const exercises = response.data;
        const exercisesContainer = document.getElementById('exercises-container');
        exercisesContainer.innerHTML = '';
        exercises.forEach(exercise => {
            const exerciseCard = document.createElement('div');
            exerciseCard.classList.add('exercise-card'); // Add a class for styling

            const exerciseHeader = document.createElement('div');
            exerciseHeader.classList.add('exercise-header'); // Add a class for styling
            
            // Create an anchor tag for the exercise name
            const exerciseNameLink = document.createElement('a');
            exerciseNameLink.href = `exercises/exercise_${exercise.name.replace(/\s/g, '_').toLowerCase()}.html?exerciseId=${exercise._id}`; // Example: exercise_potisk_s_klopi.html
            exerciseNameLink.classList.add('exercise-name-link'); // Add a class for styling
            exerciseNameLink.textContent = exercise.name;
            
            exerciseHeader.appendChild(exerciseNameLink);
            exerciseCard.appendChild(exerciseHeader);
            
            const exerciseBody = document.createElement('div');
            exerciseBody.classList.add('exercise-body'); // Add a class for styling
            exerciseBody.innerHTML = `
                <p>ID: ${exercise._id}</p>
                <p>Description: ${exercise.description}</p>
                <p>Duration: ${exercise.duration} minutes</p>
                <p>Calories: ${exercise.calories}</p>
                <p>Type: ${exercise.type}</p>
                <p>Difficulty: ${exercise.difficulty}</p>
            `;
            exerciseCard.appendChild(exerciseBody);
            // Create "Add to Favourites" button
            const deleteExerciseButton = document.createElement('button');
            deleteExerciseButton.textContent = 'Delete Exercise';
            deleteExerciseButton.classList.add('delete-exercise-button'); // Add a class for styling
            deleteExerciseButton.addEventListener('click', () => deleteExercise(exercise._id, token));

            exerciseCard.appendChild(deleteExerciseButton);
            exercisesContainer.appendChild(exerciseCard);
        });
        return exercises; // Return the fetched exercises data
    } catch (error) {
        console.error('Error fetching exercises:', error);
        return null; // Return null if there's an error
    }
};

const verifyTokenAndFetchExercisesForUser = async () => {
    const token = localStorage.getItem('token'); // Get token from local storage
    if (token) {
        try {
            const isValid = await checkTokenValidity(token); // Check if token is valid
            if (!isValid) {
                const newToken = await refreshToken(token); // Refresh token
                if (newToken) {
                    localStorage.setItem('token', newToken); // Update token in local storage
                    console.log('New token:', newToken);
                    const userName = await getUsernameFromToken(newToken);
                    console.log(userName);
                    await getExercisesForUser(userName, newToken); // Fetch exercises with refreshed token
                } else {
                    console.error('Failed to refresh token');
                }
            } else {
                console.log('Token is valid');
                const userName = await getUsernameFromToken(token);
                console.log(userName);
                await getExercisesForUser(userName, token); // Fetch exercises with existing token
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        console.error('No token found in local storage');
    }
};

// Call the function to display exercises when the page loads
window.onload = verifyTokenAndFetchExercisesForUser;

  