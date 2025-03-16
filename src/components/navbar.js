import React from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/images/logo-light.png" alt="Logo" className="logo-image" />
      </div>
      <div className="navbar-menu">
        <Link to="/">Accueil</Link>
        <Link to="/services">Services</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/">Connexion</Link>
        <Link to="/register">Inscription</Link>
      </div>
    </nav>
  );
};

export default Navbar;