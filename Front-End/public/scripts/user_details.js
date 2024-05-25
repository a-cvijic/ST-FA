
const authURL = 'http://localhost:3010/auth'

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
                usernameElement.textContent = `${name}`;
            } else {
                // If token is not valid, refresh token
                console.log('Token is not valid. Refreshing token...');
                const newToken = await refreshToken(token);
                if (newToken) {
                    console.log('New token:', newToken);
                    localStorage.setItem('token', newToken); // Update token in local storage
                    const name = await getUsernameFromToken(newToken);
                    usernameElement.textContent = `${name}`;
                } else {
                    console.error('Failed to refresh token');
                    usernameElement.textContent = 'Guest';
                }
            }
        } catch (error) {
            console.error('Error verifying token or fetching username:', error);
            usernameElement.textContent = 'Guest';
        }
    } else {
        // If no token found, display as guest
        console.log('No token found in local storage.');
        usernameElement.textContent = 'Guest';
    }
};

const getUserIdFromToken = async (token) => {
    try {
        const response = await axios.get(`${authURL}/getId`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data.userId;
    } catch (error) {
        console.error('Error getting user ID from token:', error);
        return null;
    }
};

const getUserById = async (userId, token) => {
    try {
        const response = await axios.get(`${authURL}/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error getting user data by ID:', error);
        return null;
    }
};

const updateUserDetails = (userData) => {
    // Access DOM elements
    const nameElement = document.getElementById('name');
    const emailElement = document.getElementById('email');
    const birthdateElement = document.getElementById('birthdate');
    const genderElement = document.getElementById('gender');
    const heightElement = document.getElementById('height');
    const weightElement = document.getElementById('weight');

    // Update content with user data
    if (userData) {
        nameElement.textContent = userData.name;
        emailElement.value = userData.email;
        birthdateElement.value = formatDate(userData.birthdate);
        genderElement.value = userData.gender;
        heightElement.value = userData.height;
        weightElement.value = userData.weight;
    } else {
        // If no user data found, display a message or handle it as per your requirement
        nameElement.textContent = 'User Data Not Available';
    }
};

const verifyTokenAndGetUserData = async () => {
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
                    const userId = await getUserIdFromToken(newToken);
                    if (userId) {
                        const userData = await getUserById(userId, newToken);
                        updateUserDetails(userData); // Update user details in HTML
                    } else {
                        console.error('Failed to get user ID from token');
                    }
                } else {
                    console.error('Failed to refresh token');
                }
            } else {
                console.log('Token is valid');
                // Token is valid, proceed with the request
                const userId = await getUserIdFromToken(token);
                if (userId) {
                    const userData = await getUserById(userId, token); // Pass token to getUserById
                    updateUserDetails(userData); // Update user details in HTML
                } else {
                    console.error('Failed to get user ID from token');
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        console.error('No token found in local storage');
    }
};





updateGreeting();
verifyTokenAndGetUserData();

