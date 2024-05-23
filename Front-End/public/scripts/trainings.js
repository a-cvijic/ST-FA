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

let userTrainings = {};

const fetchUserTrainings = async (token) => {
    try {
        const response = await axios.get(`${baseURL}training`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const trainings = response.data;
        userTrainings = {};
        trainings.forEach(training => {
            if (!userTrainings[training.name]) {
                userTrainings[training.name] = [];
            }
            userTrainings[training.name].push(training.userId);
        });
    } catch (error) {
        console.error('Napaka pri pridobivanju uporabniških treningov:', error);
    }
};

window.onload = () => {
    const token = localStorage.getItem('token');
    if (token) {
        fetchUserTrainings(token);
    }
};

const addToFavourites = async (trainingId, token) => {
    try {
        const isValid = await checkTokenValidity(token);
        if (!isValid) {
            const newToken = await refreshToken(token);
            if (newToken) {
                localStorage.setItem('token', newToken);
                console.log('Žeton osvežen:', newToken);
                return addToFavourites(trainingId, newToken);
            } else {
                console.error('Napaka pri osveževanju žetona');
                return;
            }
        }

        const response = await axios.get(`${baseURL}${trainingId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const trainingData = response.data;
        console.log("Podatki o treningu:", trainingData);

        const userName = await getUsernameFromToken(token);
        console.log("Uporabniško ime:", userName)

        if (!userName) {
            console.error('Napaka pri pridobivanju uporabniškega imena iz žetona');
            return;
        }

        trainingData.userId = userName;

        const saveResponse = await axios.post(`${baseURL}training`, trainingData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Trening dodan med priljubljene:', saveResponse.data);
    } catch (error) {
        if (error.response && error.response.status === 400 && error.response.data.message === 'Vaja je že dodana med všečkane vaje') {
            alert('Vaja je že dodana med všečkane vaje');
        } else {
            console.error('Napaka pri dodajanju med priljubljene:', error);
        }
    }
};

const getAllTrainings = async (token) => {
    try {
        const response = await axios.get(`${baseURL}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Odgovor:', response.data);
        const trainings = response.data;
        const trainingsContainer = document.getElementById('trainings-container');
        trainingsContainer.innerHTML = '';
        trainings.forEach(training => {
            const trainingCard = document.createElement('div');
            trainingCard.classList.add('training-card');

            const trainingHeader = document.createElement('div');
            trainingHeader.classList.add('training-header');

            const trainingNameLink = document.createElement('a');
            trainingNameLink.href = `trainings/training_${training.name.replace(/\s/g, '_').toLowerCase()}.html?trainingId=${training._id}`;
            trainingNameLink.classList.add('training-name-link');
            trainingNameLink.textContent = training.name;

            trainingHeader.appendChild(trainingNameLink);
            trainingCard.appendChild(trainingHeader);

            const trainingBody = document.createElement('div');
            trainingBody.classList.add('training-body');
            trainingBody.innerHTML = `
                <p>Opis: ${training.description}</p>
                <p>Trajanje: ${training.total_duration}</p>
                <p>Kalorije: ${training.total_calories}</p>
                <p>Vaje: ${training.exercise_ids}</p>
            `;
            trainingCard.appendChild(trainingBody);

            const addToFavouritesButton = document.createElement('button');
            addToFavouritesButton.textContent = 'Dodaj med priljubljene';
            addToFavouritesButton.classList.add('add-to-favourites-button');
            addToFavouritesButton.addEventListener('click', () => addToFavourites(training._id, token));

            trainingCard.appendChild(addToFavouritesButton);
            trainingsContainer.appendChild(trainingCard);
        });
        return trainings;
    } catch (error) {
        console.error('Napaka pri pridobivanju treningov:', error);
        return null;
    }
};

const verifyTokenAndFetchTrainings = async () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const isValid = await checkTokenValidity(token);
            if (!isValid) {
                const newToken = await refreshToken(token);
                if (newToken) {
                    localStorage.setItem('token', newToken);
                    console.log('Nov žeton:', newToken);
                    const trainings = await getAllTrainings(newToken);
                    saveTrainingsToLocal(trainings);
                } else {
                    console.error('Napaka pri osveževanju žetona');
                }
            } else {
                console.log('Žeton je veljaven');
                const trainings = await getAllTrainings(token);
                console.log(trainings);
                saveTrainingsToLocal(trainings);
            }
        } catch (error) {
            console.error('Napaka:', error);
        }
    } else {
        console.error('V lokalnem pomnilniku ni najdenega žetona');
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
