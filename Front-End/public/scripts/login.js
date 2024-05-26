const authURL = 'http://localhost:3010/auth';

const login = async (email, password) => { 
    try {
        const response = await axios.post(`${authURL}/login`, { email, password });
        return response.data.token;
    } catch (error) {
        console.error('Neuspešno pridobivanje tokena', error);
        return null;
    }
};

const handleFormSubmit = async (event) => {
    event.preventDefault();
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    if (!email || !password) {
        console.log('Email and password are required');
        return;
    }
    const token = await login(email, password); 
    if (token) {
        localStorage.setItem('token', token);
        console.log('Token accepted and stored:', token);
        if (email === 'admin@gmail.com') {
            window.location.href = 'homepageadmin.html'; 
        } else {
            window.location.href = 'homepage.html'; 
        }
    } else {
        alert('Napačno uporabniško ime ali geslo. Poskusite znova.');
    }
};

document.getElementById('login-form').addEventListener('submit', handleFormSubmit);
