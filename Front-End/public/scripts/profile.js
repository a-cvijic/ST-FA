const authURL = 'http://localhost:3010/auth';

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('No token found, please login again');
        return;
    }

    getUserProfile(token).then(profile => {
        if (profile) {
            populateProfile(profile);
        } else {
            alert('Error fetching profile data');
        }
    });

    document.getElementById('password-form').addEventListener('submit', handlePasswordFormSubmit);
});

function populateProfile(profile) {
    document.getElementById('name').textContent = profile.name;
    document.getElementById('surname').textContent = profile.surname;
    document.getElementById('email').textContent = profile.email;
    document.getElementById('height').textContent = profile.height;
    document.getElementById('weight').textContent = profile.weight;
    document.getElementById('name-display').textContent = `Pozdravljeni, ${profile.name}!`;
}

function editField(fieldId) {
    const fieldElement = document.getElementById(fieldId);
    const originalValue = fieldElement.textContent;
    fieldElement.innerHTML = `<input type="text" id="${fieldId}-input" value="${originalValue}">`;
}

function editProfile() {
    const profileFields = ['name', 'surname', 'email', 'height', 'weight'];
    profileFields.forEach(field => {
        editField(field);
    });
    document.getElementById('edit-profile-button').style.display = 'none';
    document.getElementById('save-profile-button').style.display = 'block';
}

async function saveProfile() {
    const profileFields = ['name', 'surname', 'email', 'height', 'weight'];
    const token = localStorage.getItem('token');
    const profileData = {};

    profileFields.forEach(field => {
        const inputElement = document.getElementById(`${field}-input`);
        profileData[field] = inputElement.value;
        document.getElementById(field).textContent = inputElement.value;
    });

    const result = await updateUserProfile(token, profileData);
    if (result) {
        alert('Profile updated successfully');
    } else {
        alert('Error updating profile');
    }

    document.getElementById('edit-profile-button').style.display = 'block';
    document.getElementById('save-profile-button').style.display = 'none';
}

async function updateProfileField(fieldId, value) {
    const token = localStorage.getItem('token');
    const profileData = {};
    profileData[fieldId] = value;

    const result = await updateUserProfile(token, profileData);
    if (!result) {
        alert('Error updating profile');
    }
}

async function handlePasswordFormSubmit(event) {
    event.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    const token = localStorage.getItem('token');
    const profileData = { password: newPassword };

    const result = await updateUserProfile(token, profileData);
    if (result) {
        alert('Password updated successfully');
    } else {
        alert('Error updating password');
    }
}

function showPasswordForm() {
    document.getElementById('password-form-container').style.display = 'block';
}

async function getUserProfile(token) {
    try {
        const response = await axios.get(`${authURL}/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

async function updateUserProfile(token, profileData) {
    try {
        const response = await axios.put(`${authURL}/profile`, profileData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating user profile:', error);
        return null;
    }
}
