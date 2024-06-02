import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./home.css";

const authURL = "http://localhost:3010/auth";
const trainingsURL = "http://localhost:3004/trainings";
const exercisesURL = "http://localhost:3000/exercises";
const recipesURL = "http://localhost:3003/recipes";

const Home = () => {
  const [userName, setUserName] = useState("");
  const [featuredTrainings, setFeaturedTrainings] = useState([]);
  const [featuredExercises, setFeaturedExercises] = useState([]);
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const userName = await getUserNameFromToken(token);
      setUserName(userName);

      const trainingsData = await getFeaturedItems(trainingsURL, token);
      setFeaturedTrainings(trainingsData);

      const exercisesData = await getFeaturedItems(exercisesURL, token);
      setFeaturedExercises(exercisesData);

      const recipesData = await getFeaturedItems(recipesURL, token);
      setFeaturedRecipes(recipesData);
    };

    fetchData();
  }, []);

  const getUserNameFromToken = async (token) => {
    try {
      const response = await axios.get(`${authURL}/getUsername`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.name;
    } catch (error) {
      console.error("Napaka pri pridobivanju imena iz žetona:", error);
      return "";
    }
  };

  const getFeaturedItems = async (url, token) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.slice(0, 3); // Get top 3 items
    } catch (error) {
      console.error(`Napaka pri pridobivanju podatkov iz ${url}:`, error);
      return [];
    }
  };

  return (
    <div className="home-container">
      <br></br>

      <h2>
        Dobrodošli,{" "}
        <a href="#" onClick={() => navigate(`/profile`)}>
          {userName}
        </a>
        !
      </h2>

      <p>
        Želite živeti bolj zdravo življenje ampak ne veste kje začeti in
        potrebujete pomoč? Predlagamo da preizkusite novo orodje:
      </p>
      <div className="link-button">
        <Link to="/chat" className="quick-link">
          AI Klepet
        </Link>
      </div>

      <br></br>

      <section className="featured-section">
        <h1>Izbrani Treningi</h1>
        <br></br>
        <div className="featured-items">
          {featuredTrainings.length === 0 ? (
            <p style={{ color: "grey" }}>Ni podatkov za prikaz</p>
          ) : (
            featuredTrainings.map((training) => (
              <div key={training._id} className="card-user">
                <h3>{training.name}</h3>
                <p>{training.description}</p>
                <p>
                  <strong>Trajanje:</strong> {training.total_duration} minut
                </p>
                <p>
                  <strong>Kalorije:</strong> {training.total_calories}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <br></br>

      <section className="featured-section">
        <h1>Izbrane Vaje</h1>
        <br></br>
        <div className="featured-items">
          {featuredExercises.length === 0 ? (
            <p style={{ color: "grey" }}>Ni podatkov za prikaz</p>
          ) : (
            featuredExercises.map((exercise) => (
              <div key={exercise._id} className="card-user">
                <h3>{exercise.name}</h3>
                <p>{exercise.description}</p>
                <p>
                  <strong>Trajanje:</strong> {exercise.duration} minut
                </p>
                <p>
                  <strong>Kalorije:</strong> {exercise.calories}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <br></br>

      <section className="featured-section">
        <h1>Izbrani Recepti</h1>
        <br></br>
        <div className="featured-items">
          {featuredRecipes.length === 0 ? (
            <p style={{ color: "grey" }}>Ni podatkov za prikaz</p>
          ) : (
            featuredRecipes.map((recipe) => (
              <div key={recipe._id} className="card-user">
                <h3>{recipe.name}</h3>
                <p>{recipe.description}</p>
                <p>
                  <strong>Sestavine:</strong> {recipe.ingredients.join(", ")}
                </p>
                <p>
                  <strong>Kalorije:</strong> {recipe.calories}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <section
        className="motivational-section"
        style={{ backgroundColor: "white", border: "3px solid #FED467" }}
      >
        <h1>Motivacijski kotek</h1>
        <p>
          <i>"The only bad workout is the one that didn’t happen."</i>
        </p>
        <br></br>
      </section>
    </div>
  );
};

export default Home;
