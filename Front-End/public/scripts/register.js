const authURL = 'http://localhost:3010/auth';

const register = async (username, email, password) => {
    try {
        const response = await axios.post(`${authURL}/register`, { username, email, password });
        return response.data;
    } catch (error) {
        alert('Username ali Email že obstajata');
        return null;
    }
};

const sanitizeInput = (input) => {
    return input.trim(); 
};

const validateUsername = (username) => {
    // Perform validation checks for username
    // Example: Ensure username contains only alphanumeric characters
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(username);
};

const validateEmail = (email) => {
    // Regular expression pattern for validating email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Test the email against the regex pattern
    return emailRegex.test(email);
};


const validatePassword = (password) => {
    // Perform validation checks for password
    // Example: Ensure password meets minimum length requirements
    return password.length >= 8;
};

const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    const username = sanitizeInput(document.getElementById('username').value);
    const email = sanitizeInput(document.getElementById('email').value);
    const password = sanitizeInput(document.getElementById('password').value);
    const confirmPassword = sanitizeInput(document.getElementById('confirm-password').value);

    // Validate username
    if (!validateUsername(username)) {
        alert("Invalid username. Please use only alphanumeric characters.");
        return;
    }

    // Validate email
    if (!validateEmail(email)) {
        alert("Invalid email address.");
        return;
    }

    // Validate password
    if (!validatePassword(password)) {
        alert("Password must be at least 8 characters long.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    const registrationResult = await register(username, email, password);
    if (registrationResult) {
        alert('Uspešna registriracija');
        window.location.href = 'index.html'; // Redirect to login page after successful registration
    } else {
        alert('Neuspešna registracija');
    }
};

// Add event listener to form submission
document.getElementById('registration-form').addEventListener('submit', handleFormSubmit);

