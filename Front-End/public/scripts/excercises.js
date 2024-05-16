const baseURL = 'http://localhost:3000/exercises/';
const authURL = 'http://localhost:3010/auth'


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
      exercises.forEach(exercise => {
          const exerciseElement = document.createElement('div');
          exerciseElement.classList.add('exercise');
          exerciseElement.innerHTML = `
          <h3>${exercise.name}</h3>
          ID: ${exercise._id}<br>
          Description: ${exercise.description}<br>
          Duration: ${exercise.duration} minutes<br>
          Calories: ${exercise.calories}<br>
          Type: ${exercise.type}<br>
          Difficulty: ${exercise.difficulty}.<br>
      `;
          exercisesContainer.appendChild(exerciseElement);
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
