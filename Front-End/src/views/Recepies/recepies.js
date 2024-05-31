import React, { useState, useEffect } from "react";
import axios from "axios";
import "./recipes.css";

const baseURL = "http://localhost:3003";
const authURL = "http://localhost:3010/auth";

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [newRecipe, setNewRecipe] = useState({ name: "", ingredients: "" });
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
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

  const handleAddRecipe = async () => {
    try {
      const response = await axios.post(`${baseURL}/recipes`, newRecipe, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Assuming response.data contains the newly created recipe object
      setRecipes([...recipes, response.data.recipe]);
      setNewRecipe({ name: "", ingredients: "" });
    } catch (error) {
      console.error("Error adding recipe:", error);
    }
  };

  const handleSubscribe = async () => {
    try {
      const subscription = await subscribeUser();
      if (subscription) {
        await axios.post(`${baseURL}/subscribe`, { subscription });
        console.log("Subscribed to push notifications");
      }
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
    }
  };

  const subscribeUser = async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
          "/service-worker.js"
        );
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY,
        });
        return subscription;
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

  return (
    <div id="recipes-container">
      <div id="new-recipe-form">
        <h2>Add a New Recipe</h2>
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
              ingredients: e.target.value.split(","),
            })
          }
        ></textarea>
        <button onClick={handleAddRecipe}>Add Recipe</button>
      </div>
      <div id="recipes-list">
        <h2>Recipes</h2>
        {recipes.map((recipe) => (
          <div key={recipe._id} className="recipe-card">
            <h3>{recipe.name}</h3>
            <p>
              Ingredients:{" "}
              {recipe.ingredients && recipe.ingredients.length > 0
                ? recipe.ingredients.join(", ")
                : "No ingredients listed"}
            </p>
          </div>
        ))}
      </div>
      <button onClick={handleSubscribe}>Subscribe to Notifications</button>
    </div>
  );
};

export default Recipes;
