
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

const getUsernameFromToken = async (token) => {
    try {
        const response = await axios.get(`${authURL}/getUsername`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data.name;
    } catch (error) {
        console.error('Error getting username from token:', error);
        return null;
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

const updateGreeting = async () => {
    const usernameElement = document.getElementById('name');

    // Retrieve token from local storage
    const token = localStorage.getItem('token');
    console.log('Token:', token);

    if (token) {
        try {
            console.log('Verifying token validity...');
            // Verify token validity
            const isValid = await checkTokenValidity(token);
            console.log('Token validity:', isValid);

            if (isValid) {
                console.log('Token is valid. Getting name...');
                // If token is valid, get name from token
                const name = await getUsernameFromToken(token);
                console.log('Name:', name);
                usernameElement.textContent = `Pozdravljeni, ${name}`;
            } else {
                // If token is not valid, refresh token
                console.log('Token is not valid. Refreshing token...');
                const newToken = await refreshToken(token);
                if (newToken) {
                    console.log('New token:', newToken);
                    localStorage.setItem('token', newToken); // Update token in local storage
                    const name = await getUsernameFromToken(newToken);
                    usernameElement.textContent = `Pozdravljeni, ${name}`;
                } else {
                    console.error('Failed to refresh token');
                    usernameElement.textContent = 'Pozdravljeni, Guest';
                }
            }
        } catch (error) {
            console.error('Error verifying token or fetching username:', error);
            usernameElement.textContent = 'Pozdravljeni, Guest';
        }
    } else {
        // If no token found, display as guest
        console.log('No token found in local storage.');
        usernameElement.textContent = 'Pozdravljeni, Guest';
    }
};
// Call the updateGreeting function when the page loads
updateGreeting();