import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import "../styles/Login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Gestion des erreurs
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Réinitialiser les erreurs

    // Vérification de l'admin statique
    if (email === "admin@gmail.com" && password === "admin") {
      localStorage.setItem("userRole", "ADMIN");
      navigate("/AdminHome");
      return;
    }

    // Vérification des autres utilisateurs via l'API
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Email ou mot de passe incorrect.");
      }

      // Stocker les infos utilisateur
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userId", data.id);
      localStorage.setItem("userEmail", data.email);

      console.log("Connexion réussie : ", data);

      // Redirection en fonction du rôle
      switch (data.role) {
        case "ADHERANT":
          navigate("/AdherantHome");
          break;
        case "RESPONSABLE":
          navigate("/ResponsableHome");
          break;
        case "DIRECTEUR":
          navigate("/DirecteurHome");
          break;
        case "ADMIN":
          navigate("/AdminHome");
          break;
        default:
          setErrorMessage("Accès refusé. Rôle non reconnu.");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      setErrorMessage("Email ou mot de passe incorrect.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="form-section">
          <h1>Connexion</h1>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Adresse Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Entrer votre adresse email ici ..."
                required
              />
            </div>

            <div className="input-group">
              <label>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrer votre mot de passe ici ..."
                required
              />
            </div>

            <div className="remember-forgot">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Rester connecté
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Mot de passe oublié?
              </Link>
            </div>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <button type="submit" className="auth-button">
              Se connecter
            </button>
          </form>

          <p className="auth-switch">
            Nouveau sur notre plateforme?{" "}
            <Link to="/register">Créer un compte</Link>
          </p>
        </div>

        <div className="auth-image">
          <img src="/images/image2.jpg" alt="Illustration éducation" />
        </div>
      </div>
      <Footer />
    </>
  );
}