const updateUserById = async (userId, updatedUserData, token) => {
    try {
        const isValid = await checkTokenValidity(token);
        if (!isValid) {
            const newToken = await refreshToken(token);
            if (newToken) {
                localStorage.setItem('token', newToken);
                console.log('Token refreshed:', newToken);
                // Retry updating the user data with the new token
                return updateUserById(userId, updatedUserData, newToken);
            } else {
                console.error('Failed to refresh token');
                return;
            }
        }

        const response = await axios.put(`${authURL}/${userId}`, updatedUserData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        console.log('User data updated:', response.data);
        // For example, redirect to another page
        window.location.reload(); // You missed the parentheses for the reload function
    } catch (error) {
        console.error('Error updating user data:', error);
        throw error; // Propagate the error to the calling function
    }
};



const populateEditForm = (userData) => {//to rabim za to: openModalWithUserData (da imam podatke o uporabniku)
    
    const heightInput = document.getElementById('height-input');
    const weightInput = document.getElementById('weight-input');
    heightInput.value = userData.height;
    weightInput.value = userData.weight;
};


// Function to open the modal and populate it with user data
const openModalWithUserData = async () => {
    const token = localStorage.getItem('token');
    const userId = await getUserIdFromToken(token);
    if (userId) {
        try {
            // Fetch user data based on ID
            const userData = await getUserById(userId, token);
            if (userData) {
                // Open the modal
                const modal = document.getElementById('editModal');
                modal.style.display = 'block';
                // Populate the edit form with fetched user data
                populateEditForm(userData, modal);
            } else {
                console.error('Failed to fetch user data');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    } else {
        console.error('Failed to get user ID from token');
    }
};

// Event listener for the edit icon to open the modal
const editIcon = document.getElementById('edit-icon');
editIcon.addEventListener('click', () => {
    openModalWithUserData(); // Open the modal and populate it with user data
});

// Function to close the modal
const closeModal = () => {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
};

// Event listener for the close button inside the modal
const closeButton = document.querySelector('.modal-content .close');
closeButton.addEventListener('click', closeModal);

const handleEditSubmit = async () => {
    // Get updated user data from the form or modal
    const updatedUserData = {
        height: document.getElementById('height-input').value,
        weight: document.getElementById('weight-input').value
    };

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }

        const userId = await getUserIdFromToken(token);
        console.log(userId)
        if (!userId) {
            throw new Error('Failed to get user ID from token');
        }

        // Send PUT request to update user data
        await updateUserById(userId, updatedUserData, token);
        // Close modal or form after successful update
        closeModal(); // You need to implement a function to close the modal
    } catch (error) {
        console.error('Error updating user data:', error);
        if (error.response && error.response.status === 401) {
            // Token expired or unauthorized, attempt to refresh token
            try {
                const newToken = await refreshToken(token);
                if (newToken) {
                    // Token refreshed successfully, retry the update request
                    localStorage.setItem('token', newToken);
                    console.log('Token refreshed:', newToken);
                    await handleEditSubmit(); // Retry the submission
                } else {
                    console.error('Failed to refresh token');
                }
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
            }
        }
    }
};
const saveChangesButton = document.getElementById('save-changes');
saveChangesButton.addEventListener('click', handleEditSubmit);




