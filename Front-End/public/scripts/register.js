const authURL = 'http://localhost:3010/auth';


  
  const register = async (userDetails) => {
    try {
        const response = await axios.post(`${authURL}/register`, userDetails);
        return response.data;
    } catch (error) {
        alert('E-naslov že obstaja!');
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

    if (!validateEmail(email)) {
        alert("Nepravilen e-naslov!");
        return;
    }

    if (!validatePassword(password)) {
        alert("Gešlo mora biti dolgo vsaj 8 znakov!");
        return;
    }

    if (password !== confirmPassword) {
        alert("Gesla se ne ujemata!");
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
        alert('Uspešna registracija!');
        window.location.href = 'index.html';
    } else {
        alert('Neuspešna registracija!');
    }
};


document.getElementById('registration-form').addEventListener('submit', handleFormSubmit);

