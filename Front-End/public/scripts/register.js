const authURL = 'http://localhost:3010/auth';


  
  const register = async (userDetails) => {
    try {
        const response = await axios.post(`${authURL}/register`, userDetails);
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
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(username);
};

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password.length >= 8;
};

const handleFormSubmit = async (event) => {
    event.preventDefault();
    const name = sanitizeInput(document.getElementById('name').value);
    const surname = sanitizeInput(document.getElementById('surname').value);
    const email = sanitizeInput(document.getElementById('email').value);
    const password = sanitizeInput(document.getElementById('password').value);
    const confirmPassword = sanitizeInput(document.getElementById('confirm-password').value);
    const birthdate = sanitizeInput(document.getElementById('birthdate').value);
    const gender = sanitizeInput(document.getElementById('gender').value);
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);

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

    const userDetails = {
        name,
        surname,
        email,
        password,
        birthdate,
        gender,
        height,
        weight
    };

    const registrationResult = await register(userDetails);
    if (registrationResult) {
        alert('Uspešna registracija');
        window.location.href = 'index.html'; // Redirect to login page after successful registration
    } else {
        alert('Neuspešna registracija');
    }
};

// Add event listener to form submission
document.getElementById('registration-form').addEventListener('submit', handleFormSubmit);

