
const authURL = 'http://localhost:3010/auth';

const login = async (username, password) => {
    try {
        const response = await axios.post(`${authURL}/login`, { username, password });
        return response.data.token;
    } catch (error) {
        console.error('Neupešno pridobivanje tokena', error);
        return null;
    }
};
const handleFormSubmit = async (event) => {
    event.preventDefault();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if (!username || !password) {
        console.log('Username and password are required');
        return;
    }
    const token = await login(username, password);
    if (token) {
        localStorage.setItem('token', token);
        console.log('Token accepted and stored:', token);
        if (username === 'Admin') {
            window.location.href = 'homepageadmin.html'; // Redirect to admin homepage
        } else {
            window.location.href = 'homepage.html'; // Redirect to regular homepage
        }
    } else {
        alert('Incorrect username or password. Please try again.');
    }
};
// Add event listener to form submission
document.getElementById('login-form').addEventListener('submit', handleFormSubmit);
