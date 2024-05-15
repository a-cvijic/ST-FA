
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
    event.preventDefault(); // Prevent default form submission
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const token = await login(username, password);
    if (token) {
        localStorage.setItem('token', token);
        console.log('Token sprejet in shranjen', token);
        window.location.href = 'home.html';
    } else {
        console.log('Neuspešna prijava');
    }
};
// Add event listener to form submission
document.getElementById('login-form').addEventListener('submit', handleFormSubmit);
