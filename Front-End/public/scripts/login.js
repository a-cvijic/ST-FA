
const authURL = 'http://localhost:3010/auth';

const login = async (name, password) => { 
    try {
        const response = await axios.post(`${authURL}/login`, { name, password });
        return response.data.token;
    } catch (error) {
        console.error('Neuspešno pridobivanje tokena', error);
        return null;
    }
};
const handleFormSubmit = async (event) => {
    event.preventDefault();
    const usernameInput = document.getElementById('name');
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
            window.location.href = 'homepageadmin.html'; 
        } else {
            window.location.href = 'homepage.html'; 
        }
    } else {
        alert('Napačno uporabniško ime ali geslo. Poskusite znova.');
    }
};

document.getElementById('login-form').addEventListener('submit', handleFormSubmit);
