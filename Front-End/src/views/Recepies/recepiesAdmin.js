import React, { useState, useEffect } from "react";
import axios from "axios";
import "./recipes.css";

// Base URLs for the backend services
const baseURL = "http://localhost:3003";
const authURL = "http://localhost:3010/auth";

// Request permission for notifications
const requestNotificationPermission = () => {
  Notification.requestPermission().then((permission) => {
    console.log("Notification permission:", permission);
    if (permission === "granted") {
      console.log("Permission granted");
    } else {
      console.log("Permission not granted");
    }
  });
};

// Show a notification with the given title and message
const showNotification = (title, message) => {
  if (Notification.permission === "granted") {
    new Notification(title, { body: message });
  }
};

// Subscribe the user to push notifications
const subscribeUserToPush = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js"
      );
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY,
      });
      await axios.post(`${baseURL}/subscribe`, { subscription });
      console.log("Subscribed to push notifications");
    } catch (error) {
      console.error(
        "Error during service worker registration or subscription:",
        error
      );
    }
  } else {
    console.error("Service workers are not supported in this browser");
  }
};

const AdminRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [searchTerm, setSearchTerm] = useState("");
  const [newRecipe, setNewRecipe] = useState({
    name: "",
    ingredients: "",
    calories: 0,
  });
  const [editingRecipe, setEditingRecipe] = useState(null);

  // Effect to fetch data and set up notifications on mount
  useEffect(() => {
    requestNotificationPermission();
    subscribeUserToPush();

    const fetchData = async () => {
      let currentToken = token;
      const isValid = await checkTokenValidity(currentToken);
      if (!isValid) {
        const refreshedToken = await refreshToken(currentToken);
        if (refreshedToken) {
          localStorage.setItem("token", refreshedToken);
          setToken(refreshedToken);
          currentToken = refreshedToken;
        } else {
          console.error("Failed to refresh token");
          return;
        }
      }
      const recipesData = await getAllRecipes(currentToken);
      setRecipes(recipesData);
    };

    fetchData();
  }, [token]);

  // Check if the token is valid
  const checkTokenValidity = async (token) => {
    try {
      const response = await axios.get(`${authURL}/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.valid;
    } catch (error) {
      console.error("Error during authentication:", error);
      return false;
    }
  };

  // Refresh the token if it is expired or invalid
  const refreshToken = async (oldToken) => {
    try {
      const response = await axios.post(`${authURL}/refresh-token`, {
        token: oldToken,
      });
      return response.data.newToken;
    } catch (error) {
      console.error("Error while refreshing token:", error);
      return null;
    }
  };

  // Fetch all recipes from the backend
  const getAllRecipes = async (token) => {
    try {
      const response = await axios.get(`${baseURL}/recipes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching recipes:", error);
      return [];
    }
  };

  // Handle adding a new recipe
  const handleAddRecipe = async () => {
    try {
      const response = await axios.post(`${baseURL}/recipes`, newRecipe, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRecipes([...recipes, response.data.recipe]);
      setNewRecipe({ name: "", ingredients: "", calories: 0 });
      showNotification("Recipe Added", "A new recipe has been added.");
    } catch (error) {
      console.error("Error adding recipe:", error);
    }
  };

  // Handle setting a recipe for editing
  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    setNewRecipe({
      name: recipe.name,
      ingredients: recipe.ingredients.join(", "),
      calories: recipe.calories,
    });
  };

  // Handle updating an existing recipe
  const handleUpdateRecipe = async () => {
    try {
      const response = await axios.put(
        `${baseURL}/recipes/${editingRecipe._id}`,
        {
          name: newRecipe.name,
          ingredients: newRecipe.ingredients.split(","),
          calories: newRecipe.calories,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRecipes(
        recipes.map((recipe) =>
          recipe._id === editingRecipe._id ? response.data.recipe : recipe
        )
      );
      setEditingRecipe(null);
      setNewRecipe({ name: "", ingredients: "", calories: 0 });
      showNotification("Recipe Updated", "The recipe has been updated.");
    } catch (error) {
      console.error("Error updating recipe:", error);
    }
  };

  // Handle deleting a recipe
  const handleDeleteRecipe = async (recipeId) => {
    try {
      await axios.delete(`${baseURL}/recipes/${recipeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRecipes(recipes.filter((recipe) => recipe._id !== recipeId));
      showNotification("Recipe Deleted", "The recipe has been deleted.");
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  return (
    <div id="recipes-container">
      <div className="top-bar">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <p>🔎</p>
        </div>
      </div>
      <div id="recipes-list">
        {recipes
          .filter((recipe) =>
            recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((recipe) => (
            <div key={recipe._id} className="recipe-card">
              <h3>{recipe.name}</h3>
              <p>
                Ingredients:{" "}
                {recipe.ingredients && recipe.ingredients.length > 0
                  ? recipe.ingredients.join(", ")
                  : "No ingredients listed"}
              </p>
              <p>Calories: {recipe.calories}</p>
              <button className="edit" onClick={() => handleEditRecipe(recipe)}>
                Edit
              </button>
              <button
                className="delete"
                onClick={() => handleDeleteRecipe(recipe._id)}
              >
                Delete
              </button>
            </div>
          ))}
      </div>
      <div id="new-recipe-form">
        <h2>{editingRecipe ? "Edit Recipe" : "Add a New Recipe"}</h2>
        <input
          type="text"
          placeholder="Recipe Name"
          value={newRecipe.name}
          onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
        />
        <textarea
          placeholder="Ingredients (comma separated)"
          value={newRecipe.ingredients}
          onChange={(e) =>
            setNewRecipe({
              ...newRecipe,
              ingredients: e.target.value,
            })
          }
        ></textarea>
        <input
          type="number"
          placeholder="Calories"
          value={newRecipe.calories}
          onChange={(e) =>
            setNewRecipe({ ...newRecipe, calories: e.target.value })
          }
        />
        <button onClick={editingRecipe ? handleUpdateRecipe : handleAddRecipe}>
          {editingRecipe ? "Update Recipe" : "Add Recipe"}
        </button>
      </div>
    </div>
  );
};

export default AdminRecipes;
