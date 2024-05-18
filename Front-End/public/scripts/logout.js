// Function to handle logout
const handleLogout = () => {
    localStorage.clear(); // Clear local storage
    window.location.href = 'index.html'; // Redirect to the homepage or login page
};

// Event listener for the logout button
document.getElementById('logout-button').addEventListener('click', handleLogout);