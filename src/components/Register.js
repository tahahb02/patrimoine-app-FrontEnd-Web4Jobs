import React, { useState } from "react";
import Navbar from "./navbar";
import Footer from "./Footer";
import "../styles/Register.css";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
    villeCentre: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    const isValidEmail = /\S+@\S+\.\S+/;
    if (!isValidEmail.test(formData.email)) {
      alert("L'email est invalide.");
      return;
    }

    const phoneRegex = /^0[6-7]\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Le numéro de téléphone est invalide.");
      return;
    }

    if (!formData.villeCentre) {
      alert("Veuillez sélectionner votre ville centre.");
      return;
    }

    const params = new URLSearchParams();
    params.append('nom', formData.nom);
    params.append('prenom', formData.prenom);
    params.append('email', formData.email);
    params.append('password', formData.password);
    params.append('phone', formData.phone);
    params.append('city', formData.city);
    params.append('villeCentre', formData.villeCentre);

    try {
      const response = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Inscription réussie !");
        window.location.href = "/";
      } else {
        alert(result.message || "Erreur lors de l'inscription.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion avec le serveur.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="auth-box">
          <h1>Inscription</h1>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                name="nom"
                placeholder="Entrer votre nom ici..."
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                name="prenom"
                placeholder="Entrer votre prénom ici..."
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Adresse Email</label>
              <input
                type="email"
                name="email"
                placeholder="Entrer votre adresse email ici..."
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                name="password"
                placeholder="Entrer votre mot de passe ici..."
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmation du mot de passe</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Retaper votre mot de passe ici..."
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input
                type="text"
                name="phone"
                placeholder="06XXXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Ville</label>
              <input
                type="text"
                name="city"
                placeholder="Entrez votre ville"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Ville Centre</label>
              <select
                name="villeCentre"
                value={formData.villeCentre}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionnez votre ville centre</option>
                <option value="TINGHIR">Tinghir</option>
                <option value="TEMARA">Temara</option>
                <option value="ESSAOUIRA">Essaouira</option>
                <option value="DAKHLA">Dakhla</option>
                <option value="LAAYOUNE">Laayoune</option>
                <option value="NADOR">Nador</option>
                <option value="AIN_EL_AOUDA">Ain El Aouda</option>
              </select>
            </div>

            <button type="submit" className="register-button">
              S'inscrire
            </button>
          </form>
          <p className="login-link">
            Avez-vous déjà un compte ? <a href="/">Connectez-vous !</a>
          </p>
        </div>

        <div className="auth-image">
          <img src="/images/image2.jpg" alt="Programmation et éducation" />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RegisterPage;