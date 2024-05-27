const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const trainingId = urlParams.get('trainingId');

const baseURL = 'http://localhost:3004/trainings/';
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

// Function to fetch training details by ID
const getTrainingById = async (trainingId, token) => {
    try {
        const response = await axios.get(`${baseURL}${trainingId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching training details:', error);
        return null;
    }
};

const displayTrainingDetails = (training) => {
    if (training) {
        // Populate training name
        const trainingNameElement = document.getElementById('training-name');
        trainingNameElement.textContent = training.name;

        // Populate training details
        const trainingDurationElement = document.getElementById('training-duration');
        trainingDurationElement.textContent = training.duration;

        const trainingCaloriesElement = document.getElementById('training-calories');
        trainingCaloriesElement.textContent = training.calories;

        const trainingDescriptionElement = document.getElementById('training-description-content');
        trainingDescriptionElement.textContent = training.description;
    } else {
        const trainingDetailContainer = document.getElementById('training-detail');
        trainingDetailContainer.innerHTML = '<p>No training details found.</p>';
        
    }
};


const verifyTokenAndGetTrainingById = async (trainingId) => {
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
                    const refreshedTraining = await getTrainingById(trainingId, newToken);
                    displayTrainingDetails(refreshedTraining);
                } else {
                    console.error('Failed to refresh token');
                }
            } else {
                console.log('Token is valid');
                // Token is valid, proceed with the request
                const training = await getTrainingById(trainingId, token);
                displayTrainingDetails(training);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        console.error('No token found in local storage');
    }
};


// Call the function to verify token and get training by ID
verifyTokenAndGetTrainingById(trainingId);
