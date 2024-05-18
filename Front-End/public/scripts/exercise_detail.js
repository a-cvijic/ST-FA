const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const exerciseId = urlParams.get('exerciseId');

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
        console.error('Error fetching exercise details:', error);
        return null;
    }
};

const displayExerciseDetails = (exercise) => {
    if (exercise) {
        // Populate exercise name
        const exerciseNameElement = document.getElementById('exercise-name');
        exerciseNameElement.textContent = exercise.name;

        // Populate exercise details
        const exerciseDurationElement = document.getElementById('exercise-duration');
        exerciseDurationElement.textContent = exercise.duration;

        const exerciseCaloriesElement = document.getElementById('exercise-calories');
        exerciseCaloriesElement.textContent = exercise.calories;

        const exerciseTypeElement = document.getElementById('exercise-type');
        exerciseTypeElement.textContent = exercise.type;

        const exerciseDifficultyElement = document.getElementById('exercise-difficulty');
        exerciseDifficultyElement.textContent = exercise.difficulty;

        const exerciseDescriptionElement = document.getElementById('exercise-description-content');
        exerciseDescriptionElement.textContent = exercise.description;
    } else {
        // If no exercise details found, display a message
        const exerciseDetailContainer = document.getElementById('exercise-detail');
        exerciseDetailContainer.innerHTML = '<p>No exercise details found.</p>';
        
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
                    // Retry the failed request with the new token
                    const refreshedExercise = await getExerciseById(exerciseId, newToken);
                    displayExerciseDetails(refreshedExercise);
                } else {
                    console.error('Failed to refresh token');
                }
            } else {
                console.log('Token is valid');
                // Token is valid, proceed with the request
                const exercise = await getExerciseById(exerciseId, token);
                displayExerciseDetails(exercise);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        console.error('No token found in local storage');
    }
};


// Call the function to verify token and get exercise by ID
verifyTokenAndGetExerciseById(exerciseId);
