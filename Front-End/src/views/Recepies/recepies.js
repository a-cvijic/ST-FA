import React, { useState, useEffect } from "react";
import axios from "axios";
import "./recipes.css";

const baseURL = "http://localhost:3003";
const authURL = "http://localhost:3010/auth";

// Logic for notifications
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

const showNotification = (title, message) => {
  if (Notification.permission === "granted") {
    new Notification(title, { body: message });
  }
};

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

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleFavoriteRecipe = async (recipeId) => {
    try {
      const response = await axios.post(
        `${baseURL}/recipes/favorite/${recipeId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Recipe added to favorites:", response.data);

      // Update the UI to reflect the favorite status
      const updatedRecipes = recipes.map((recipe) =>
        recipe._id === recipeId ? { ...recipe, favorite: true } : recipe
      );
      setRecipes(updatedRecipes);

      showNotification(
        "Recipe Favorited",
        "Recipe has been added to your favorites."
      );
    } catch (error) {
      console.error("Error favoriting recipe:", error);
    }
  };

  // Sort recipes to put favorites at the top
  const sortedRecipes = [...recipes].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return 0;
  });

  return (
    <div id="recipes-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <p style={{ float: "right", marginLeft: "20px" }}>🔎</p>
      </div>
      <div id="recipes-list">
        <h2>Recipes</h2>
        {sortedRecipes
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
              <button onClick={() => handleFavoriteRecipe(recipe._id)}>
                {recipe.favorite ? "Unfavorite" : "Favorite"}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Recipes;
