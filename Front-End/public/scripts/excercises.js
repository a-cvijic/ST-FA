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

let userExercises = {}; // Object to store user's existing exercises

// Function to fetch user's existing exercises
const fetchUserExercises = async (token) => {
    try {
        const response = await axios.get(`${baseURL}exercise`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const exercises = response.data;
        userExercises = {};
        exercises.forEach(exercise => {
            if (!userExercises[exercise.name]) {
                userExercises[exercise.name] = [];
            }
            userExercises[exercise.name].push(exercise.userId);
        });
    } catch (error) {
        console.error('Error fetching user exercises:', error);
    }
};

// Call fetchUserExercises when the page loads
window.onload = () => {
    const token = localStorage.getItem('token');
    if (token) {
        fetchUserExercises(token);
    }
};

// Modify addToFavourites function to check for existing exercise
const addToFavourites = async (exerciseId, token) => {
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
                // Retry adding to favourites with the new token
                return addToFavourites(exerciseId, newToken);
            } else {
                // If token refresh fails, handle the error
                console.error('Failed to refresh token');
                return;
            }
        }

        // If token is valid, proceed to add to favourites
        // Fetch exercise data from exercises database using the exerciseId
        const response = await axios.get(`${baseURL}${exerciseId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const exerciseData = response.data;
        console.log("Exercise data:", exerciseData);
  
        // Extract user name from token
        const userName = await getUsernameFromToken(token);
        console.log("User name:", userName)
  
        if (!userName) {
            console.error('Failed to get user name from token');
            return;
        }

        // Check if the exercise already exists for the current user
        if (userExercises[exerciseData.name] && userExercises[exerciseData.name].includes(userName)) {
            alert('Exercise already exists in favourites for this user');
            return;
        }
  
        // Add user name and exercise name to exercise data
        exerciseData.userId = userName;
  
        // Save new document to ExerciseUser database
        const saveResponse = await axios.post(`${baseURL}excercise`, exerciseData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Exercise added to favorites:', saveResponse.data);

        // Update userExercises with the newly added exercise
        if (!userExercises[exerciseData.name]) {
            userExercises[exerciseData.name] = [];
        }
        userExercises[exerciseData.name].push(userName);
    } catch (error) {
        console.error('Error adding to favorites:', error);
    }
};



  
  // Function to fetch all exercises from the server
  const getAllExercises = async (token) => {
    try {
        const response = await axios.get(`${baseURL}`, {
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
            const addToFavouritesButton = document.createElement('button');
            addToFavouritesButton.textContent = 'Add to Favourites';
            addToFavouritesButton.classList.add('add-to-favourites-button'); // Add a class for styling
            addToFavouritesButton.addEventListener('click', () => addToFavourites(exercise._id, token));
  
            exerciseCard.appendChild(addToFavouritesButton);
            exercisesContainer.appendChild(exerciseCard);
        });
        return exercises; // Return the fetched exercises data
    } catch (error) {
        console.error('Error fetching exercises:', error);
        return null; // Return null if there's an error
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
