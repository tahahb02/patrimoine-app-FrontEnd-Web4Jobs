import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEdit, FaSave, FaTimes, FaArrowLeft, FaCamera } from "react-icons/fa";


const Account = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    phone: "",
    city: ""
  });
  const [profileImage, setProfileImage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          navigate("/login");
          return;
        }

        const response = await fetch(`http://localhost:8080/api/utilisateurs/${userId}`);
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const data = await response.json();
        
        setUserData(data);
        setFormData({
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          phone: data.phone || "",
          city: data.city || ""
        });

        if (data.profileImage) {
          setProfileImage(`data:image/jpeg;base64,${data.profileImage}`);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérification de la taille (2MB max)
    if (file.size > 2_000_000) {
      setError("La taille de l'image ne doit pas dépasser 2MB");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Prévisualisation
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileImage(event.target.result);
    };
    reader.readAsDataURL(file);

    // Envoi au serveur
    const formData = new FormData();
    formData.append("photo", file);

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8080/api/utilisateurs/${localStorage.getItem("userId")}/photo`,
        {
          method: "POST",
          body: formData
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de l'upload de la photo");
      }

      // Recharger les données utilisateur
      const userResponse = await fetch(`http://localhost:8080/api/utilisateurs/${localStorage.getItem("userId")}`);
      const updatedUser = await userResponse.json();
      setUserData(updatedUser);
      
      setSuccessMessage("Photo mise à jour avec succès!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMessage("");
        setError(null);
      }, 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:8080/api/utilisateurs/${localStorage.getItem("userId")}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la mise à jour");
      }

      const updatedUser = await response.json();
      setUserData(updatedUser);
      setIsEditing(false);
      setSuccessMessage("Profil mis à jour avec succès!");
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => {
        setSuccessMessage("");
        setError(null);
      }, 3000);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email,
      phone: userData.phone || "",
      city: userData.city || ""
    });
    if (userData.profileImage) {
      setProfileImage(`data:image/jpeg;base64,${userData.profileImage}`);
    } else {
      setProfileImage("");
    }
  };

  if (loading) return (
    <div className="dashboard-container">
      <nav className="navbar">
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft />
        </button>
        <img src="/images/logo-light.png" alt="Logo" className="navbar-logo" />
      </nav>
      <div className="content">
        <div className="account-loading">Chargement en cours...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="dashboard-container">
      <nav className="navbar">
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft />
        </button>
        <img src="/images/logo-light.png" alt="Logo" className="navbar-logo" />
      </nav>
      <div className="content">
        <div className="account-error">Erreur: {error}</div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft />
        </button>
        <img src="/images/logo-light.png" alt="Logo" className="navbar-logo" />
      </nav>

      <main className="content">
        <div className="account-container">
          <div className="account-header">
            <div className="profile-picture-container">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="profile-picture" />
              ) : (
                <div className="profile-picture-default">
                  <FaUser />
                </div>
              )}
              {isEditing && (
                <>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="change-photo-btn"
                  >
                    <FaCamera />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </>
              )}
            </div>
            <h2>Mon Compte</h2>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)} 
                className="edit-button"
              >
                <FaEdit /> Modifier
              </button>
            ) : (
              <div className="edit-buttons">
                <button 
                  onClick={handleCancelEdit} 
                  className="cancel-button"
                >
                  <FaTimes /> Annuler
                </button>
                <button 
                  onClick={handleSubmit} 
                  className="save-button"
                >
                  <FaSave /> Enregistrer
                </button>
              </div>
            )}
          </div>

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {isEditing ? (
            <form className="account-form">
              <div className="form-group">
                <label>Nom</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Ville</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
            </form>
          ) : (
            <div className="account-details">
              <div className="detail-row">
                <span className="detail-label">Rôle:</span>
                <span className="detail-value">{userData.role}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Nom:</span>
                <span className="detail-value">{userData.nom}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Prénom:</span>
                <span className="detail-value">{userData.prenom}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{userData.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Téléphone:</span>
                <span className="detail-value">
                  {userData.phone || "Non renseigné"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Ville:</span>
                <span className="detail-value">
                  {userData.city || "Non renseignée"}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Account;