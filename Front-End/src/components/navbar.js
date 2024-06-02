import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';

const Navbar = () => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  return (
    <nav style={{ backgroundColor: '#FED467', color: 'black' }}>
      <ul>
        <li><Link to="/">Domov</Link></li>
        {isAdmin ? (
          <>
            <li><Link to="/users">Uporabniki</Link></li>
            <li><Link to="/trainings">Treningi</Link></li>
            <li><Link to="/recipes">Recepti</Link></li>
            <li><Link to="/exercises">Vaje</Link></li>
            <li><Link to="/chat">Klepet</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/trainings">Treningi</Link></li>
            <li><Link to="/recipes">Recepti</Link></li>
            <li><Link to="/exercises">Vaje</Link></li>
            <li><Link to="/chat">Klepet</Link></li>
            <li><Link to="/profile">Profil</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
