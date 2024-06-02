import React, { useState, useEffect } from "react";
import axios from "axios";
import annyang from "annyang";
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

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [searchTerm, setSearchTerm] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    requestNotificationPermission();
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
      const favoriteRecipes = await getFavoriteRecipes(currentToken);
      setFavorites(favoriteRecipes.map((recipe) => recipe._id));
    };

    fetchData();
  }, [token]);

  // Setup or teardown voice commands when voiceEnabled changes
  useEffect(() => {
    if (voiceEnabled) {
      setupVoiceCommands();
    } else {
      if (annyang) {
        annyang.abort();
      }
    }
  }, [voiceEnabled]);

  // Check token validity
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

  // Refresh token
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

  // Fetch all recipes
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

  // Fetch favorite recipes
  const getFavoriteRecipes = async (token) => {
    try {
      const response = await axios.get(`${baseURL}/recipes/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching favorite recipes:", error);
      return [];
    }
  };

  // Toggle favorite status of a recipe
  const handleToggleFavorite = async (recipeId) => {
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
      if (favorites.includes(recipeId)) {
        setFavorites(favorites.filter((id) => id !== recipeId));
        showNotification(
          "Recipe Unfavorited",
          "Recipe has been removed from your favorites."
        );
      } else {
        setFavorites([...favorites, recipeId]);
        showNotification(
          "Recipe Favorited",
          "Recipe has been added to your favorites."
        );
      }
      console.log(response.data.message);
    } catch (error) {
      console.error("Error toggling favorite recipe:", error);
    }
  };

  // Setup voice commands using annyang
  const setupVoiceCommands = () => {
    if (annyang) {
      const commands = {
        "search for *term": (term) => {
          setSearchTerm(term);
          speak(`Searching for ${term}`);
        },
        "clear search": () => {
          setSearchTerm("");
          speak("Search cleared");
        },
        "favorite *name": (name) => {
          const recipe = recipes.find(
            (r) => r.name.toLowerCase() === name.toLowerCase()
          );
          if (recipe) {
            handleToggleFavorite(recipe._id);
            speak(`${name} favorited`);
          } else {
            speak(`${name} not found`);
          }
        },
        "unfavorite *name": (name) => {
          const recipe = recipes.find(
            (r) => r.name.toLowerCase() === name.toLowerCase()
          );
          if (recipe) {
            handleToggleFavorite(recipe._id);
            speak(`${name} unfavorited`);
          } else {
            speak(`${name} not found`);
          }
        },
      };

      annyang.addCommands(commands);
      annyang.start();
    }
  };

  // Text-to-speech function
  const speak = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
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
        </div>
        <div className="voice-toggle">
          <label>
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={() => setVoiceEnabled(!voiceEnabled)}
            />
            Voice Commands
          </label>
        </div>
      </div>
      <div id="recipes-list">
        <h2>Recipes</h2>
        {recipes
          .filter((recipe) =>
            recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .sort((a, b) => favorites.includes(b._id) - favorites.includes(a._id))
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
              <button onClick={() => handleToggleFavorite(recipe._id)}>
                {favorites.includes(recipe._id) ? "Unfavorite" : "Favorite"}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Recipes;
