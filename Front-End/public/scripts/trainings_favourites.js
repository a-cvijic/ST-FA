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
        console.error('Napaka pri pridobivanju imena iz žetona:', error);
        return null;
    }
};

const deleteTraining = async (trainingId, token) => {
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
                // Retry deleting the training with the new token
                return deleteTraining(trainingId, newToken);
            } else {
                // If token refresh fails, handle the error
                console.error('Failed to refresh token');
                return;
            }
        }

        // If token is valid, proceed to delete the training
        const response = await axios.delete(`${baseURL}training/${trainingId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Trening izbrisan:', response.data);
        await verifyTokenAndFetchTrainings(token);
    } catch (error) {
        console.error('Napaka pri brisanju treninga:', error);
    }
};


const getTrainingsForUser = async (userName, token) => {
    try {
        const response = await axios.get(`${baseURL}training/${userName}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Response:', response.data); // Log the response data
        const trainings = response.data;
        const trainingsContainer = document.getElementById('trainings-container');
        trainingsContainer.innerHTML = '';
        trainings.forEach(training => {
            const trainingCard = document.createElement('div');
            trainingCard.classList.add('training-card'); // Add a class for styling

            const trainingHeader = document.createElement('div');
            trainingHeader.classList.add('training-header'); // Add a class for styling
            
            // Create an anchor tag for the training name
            const trainingNameLink = document.createElement('a');
            trainingNameLink.href = `trainings/training_${training.name.replace(/\s/g, '_').toLowerCase()}.html?trainingId=${training._id}`; // Example: training_hiit.html
            trainingNameLink.classList.add('training-name-link'); // Add a class for styling
            trainingNameLink.textContent = training.name;
            
            trainingHeader.appendChild(trainingNameLink);
            trainingCard.appendChild(trainingHeader);
            
            const trainingBody = document.createElement('div');
            trainingBody.classList.add('training-body'); // Add a class for styling
            trainingBody.innerHTML = `
                <p>ID: ${training._id}</p>
                <p>Description: ${training.description}</p>
                <p>Total Duration: ${training.total_duration}</p>
                <p>Total Calories: ${training.total_calories}</p>
                <p>Vaje: ${training.exercise_ids}</p>
            `;
            trainingCard.appendChild(trainingBody);
            // Create "Delete Training" button
            const deleteTrainingButton = document.createElement('button');
            deleteTrainingButton.textContent = 'Delete Training';
            deleteTrainingButton.classList.add('delete-training-button'); // Add a class for styling
            deleteTrainingButton.addEventListener('click', () => deleteTraining(training._id, token));

            trainingCard.appendChild(deleteTrainingButton);
            trainingsContainer.appendChild(trainingCard);
        });
        return trainings; // Return the fetched trainings data
    } catch (error) {
        console.error('Error fetching trainings:', error);
        return null; // Return null if there's an error
    }
};

const verifyTokenAndFetchTrainings = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found in local storage');
            return;
        }
        
        const isValid = await checkTokenValidity(token);
        if (!isValid) {
            const newToken = await refreshToken(token);
            if (!newToken) {
                console.error('Failed to refresh token');
                return;
            }
            localStorage.setItem('token', newToken);
            console.log('New token:', newToken);
            const userName = await getUsernameFromToken(newToken);
            if (!userName) {
                console.error('Failed to get username from token');
                return;
            }
            const trainings = await getTrainingsForUser(userName, newToken);
            saveTrainingsToLocal(trainings);
        } else {
            console.log('Token is valid');
            const userName = await getUsernameFromToken(token);
            if (!userName) {
                console.error('Failed to get username from token');
                return;
            }
            const trainings = await getTrainingsForUser(userName, token);
            saveTrainingsToLocal(trainings);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

window.onload = verifyTokenAndFetchTrainings;


function saveTrainingsToLocal(trainings) {
    try {
        localStorage.setItem('trainings', JSON.stringify(trainings));
        console.log('Treningi shranjeni v lokalnem pomnilniku.');
    } catch (error) {
        console.error('Napaka pri shranjevanju treningov v lokalni pomnilnik:', error);
    }
}
