  // Function to fetch exercise details by ID
  const getUserById = async (userId, token) => {
      try {
          const response = await axios.get(`${authURL}/${userId}`, {
              headers: {
                  Authorization: `Bearer ${token}`
              }
          });
          return response.data;
      } catch (error) {
          console.error('Napaka pri pridobivanju vaje:', error);
          return null;
      }
  };

// Brisanje vaje glede na id
const deleteUser = async (userId, token) => {
    try {
      const response = await axios.delete(`${authURL}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Vaja izbrisana:', response.data);
      await getAllUsers(token);
    } catch (error) {
      console.error('Napaka pri brisanju vaje:', error);
    }
  };

  // Posodabljanje vaje
  const updateUser = async (userId, userData, token) => {
    try {
      const response = await axios.put(`${authURL}/${userId}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      handleError(error);
      return null;
    }
  };
  
  // ustvarjanje vaje
  const createUser = async (userData, token) => {
    try {
      const response = await axios.post(`${authURL}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  
  
  // pridobivanje vseh vaj iz baze
  const getAllUsers = async (token) => {
      try {
          const response = await axios.get(`${authURL}/`, {
              headers: {
                  Authorization: `Bearer ${token}`
              }
          });
          console.log('Response:', response.data); // logiranje
          const users = response.data;
          const usersContainer = document.getElementById('users-container');
          usersContainer.innerHTML = '';
          // dinamična izgradnja tabele
          const table = document.createElement('table');
          table.classList.add('user-table');
          const tableHeader = document.createElement('tr');//glava tabele
          tableHeader.innerHTML = `
          <th>Name</th>
          <th>ID</th>
          <th>Email</th>
          <th>Password</th>
          <th>Birthdate</th>
          <th>Gender</th>
          <th>Height</th>
          <th>Weight</th>
          <th>Actions</th>
          `;
          table.appendChild(tableHeader);
          users.forEach(user => { // grem skozi tabele, da naredim vrstice
              const row = document.createElement('tr');
              row.innerHTML = `
              <td>${user.name} ${user.surname}</td>
              <td>${user._id}</td>
              <td>${user.email}</td>
              <td>${user.password}</td>
              <td>${user.birthdate}</td>
              <td>${user.gender}</td>
              <td>${user.height}</td>
              <td>${user.weight}</td>
                  <td>
                      <button onclick="verifyTokenAndGetUserById('${user._id}')">Edit</button>
                      <button onclick="verifyTokenAndDeleteUsers('${user._id}')">Delete</button>
                  </td>
              `;
              table.appendChild(row);
          });
    
          usersContainer.appendChild(table);
          
          return users;
      } catch (error) {
          console.error('Napaka pri pridobivanju vaj:', error);
          return null;
      }
    };

    const verifyTokenAndFetchUsers = async () => {
        const token = localStorage.getItem('token'); // pridobimo token iz lokalne shrambe
        if (token) {
          try {
            const isValid = await checkTokenValidity(token); // preverjanje veljavnosti tokena
            if (!isValid) {
              const newToken = await refreshToken(token); // osvežimo, če ni veljaven
              if (newToken) {
                localStorage.setItem('token', newToken); // posodobimo lokalno shrambo
                console.log('Nov token:', newToken);
                const users = await getAllUsers(newToken); // pridobim vaje z osveženim tokenom
                saveUsersToLocal(users); // vaje shranimo v lokalno shrambo
              } else {
                console.error('Neuspešno posodabljanje tokena');
              }
            } else {
              console.log('Token je veljaven');//če je token veljaven (preskočimo refresh in izvedemo fetch in shranjevanje v lokalno bazo)
              const users = await getAllUsers(token);
              console.log(users);
              saveUsersToLocal(users);
            }
          } catch (error) {
            console.error('Napaka:', error);
          }
        } else {
          console.error('V lokalni shrambi ni tokena');
        }
      };
      window.onload = verifyTokenAndFetchUsers;

    const showPostForm = () => {
    const formContainer = document.getElementById('post-form-container');
    formContainer.innerHTML = `
        <h2>New User</h2>
        <form id="post-form">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required>
            <label for="surname">Surname:</label>
            <input type="text" id="surname" name="surname" required>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
            <label for="birthdate">Birthdate:</label>
            <input type="date" id="birthdate" name="birthdate" required>
            <label for="gender">Gender:</label>
            <select id="gender" name="gender" required>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
            </select>
            <label for="height">Height:</label>
            <input type="number" id="height" name="height" required>
            <label for="weight">Weight:</label>
            <input type="number" id="weight" name="weight" required>
            <button type="submit">Create User</button>
        </form>
    `;
    const postForm = document.getElementById('post-form');
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const isValid = await checkTokenValidity(token);
                if (!isValid) {
                    const newToken = await refreshToken(token);
                    if (newToken) {
                        localStorage.setItem('token', newToken);
                        console.log('New token:', newToken);
                        const newUser = {
                            name: document.getElementById('name').value,
                            surname: document.getElementById('surname').value,
                            email: document.getElementById('email').value,
                            password: document.getElementById('password').value,
                            birthdate: document.getElementById('birthdate').value,
                            gender: document.getElementById('gender').value,
                            height: document.getElementById('height').value,
                            weight: document.getElementById('weight').value
                        };
                        await createUser(newUser, newToken);
                        await getAllUsers(newToken);
                    } else {
                        console.error('Failed to update token');
                    }
                } else {
                    console.log('Token is valid');
                    const newUser = {
                        name: document.getElementById('name').value,
                        surname: document.getElementById('surname').value,
                        email: document.getElementById('email').value,
                        password: document.getElementById('password').value,
                        birthdate: document.getElementById('birthdate').value,
                        gender: document.getElementById('gender').value,
                        height: document.getElementById('height').value,
                        weight: document.getElementById('weight').value
                    };
                    await createUser(newUser, token);
                    await getAllUsers(token);
                }
                location.reload();
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            console.error('Token not found in local storage');
        }
    });
    formContainer.style.display = 'block';
};

document.getElementById('dodaj-uporabnika').addEventListener('click', showPostForm);

    function saveUsersToLocal(users) {
        try {
          // Convert users to JSON and store in local storage
          localStorage.setItem('users', JSON.stringify(users));
          console.log('Vaje shranjene v lokalno shrambo.');
        } catch (error) {
          console.error('Napaka pri shranjevanju vaj v lokalno shrambo:', error);
        }
      }