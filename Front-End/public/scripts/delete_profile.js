const confirmDeleteProfile = async () => {
    // Ask for confirmation
    const confirmation = confirm("Ste prepričani, da želite izbrisati svoj profil?");
    
    // If user confirms, proceed with deletion
    if (confirmation) {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const userId = await getUserIdFromToken(token);
                if (!userId) {
                    console.error('User ID not found in token');
                    return;
                }
                
                const isValid = await checkTokenValidity(token);
                if (!isValid) {
                    const newToken = await refreshToken(token);
                    if (newToken) {
                        localStorage.setItem('token', newToken);
                        console.log('Token refreshed:', newToken);
                        // Retry deleting the user with the new token
                        await deleteUserById(userId, newToken);
                    } else {
                        console.error('Failed to refresh token');
                    }
                } else {
                    // If token is valid, proceed with user deletion
                    await deleteUserById(userId, token);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            console.error('No token found in local storage');
        }
    }
};


const deleteUserById = async (userId, token) => {
    try {
        // Check if token is expired
        const isValid = await checkTokenValidity(token);
        if (!isValid) {
            // If token is expired, attempt to refresh it
            const newToken = await refreshToken(token);
            if (newToken) {
                // If token is successfully refreshed, update the token
                localStorage.setItem('token', newToken);
                console.log('Token refreshed:', newToken);
                // Retry deleting the user with the new token
                return deleteUserById(userId, newToken);
            } else {
                // If token refresh fails, handle the error
                console.error('Failed to refresh token');
                return;
            }
        }

        // If token is valid, proceed to delete the user
        const response = await axios.delete(`${authURL}/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Uporabnik izbrisan:', response.data);
        window.location.href = 'index.html';

    } catch (error) {
        console.error('Error deleting user data by ID:', error);
    }
};


document.getElementById('izbriši-profil').addEventListener('click', confirmDeleteProfile);