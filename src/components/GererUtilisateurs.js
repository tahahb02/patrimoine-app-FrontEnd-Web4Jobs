import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Pagination } from 'antd';
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaUsers,
  FaUserCog,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaFilter
} from "react-icons/fa";

const API_URL = "http://localhost:8080/api/utilisateurs";

const GererUtilisateurs = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedVilleCentre, setSelectedVilleCentre] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUtilisateur, setSelectedUtilisateur] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    villeCentre: "TINGHIR",
    role: "ADHERANT",
  });
  const location = useLocation();

  // Liste des villes centres disponibles
  const villesCentre = [
    "TINGHIR", "TEMARA", "ESSAOUIRA", 
    "DAKHLA", "LAAYOUNE", "NADOR", "AIN_EL_AOUDA"
  ];

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  const fetchUtilisateurs = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Erreur lors de la récupération des utilisateurs");
      const data = await response.json();
      setUtilisateurs(data);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      setUtilisateurs([]);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredUtilisateurs = utilisateurs.filter((utilisateur) => {
    const matchesSearch =
      `${utilisateur.nom} ${utilisateur.prenom} ${utilisateur.email} ${utilisateur.city}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole
      ? utilisateur.role === selectedRole
      : true;

    const matchesVilleCentre = selectedVilleCentre
      ? utilisateur.villeCentre === selectedVilleCentre
      : true;

    return matchesSearch && matchesRole && matchesVilleCentre;
  });

  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentUsers = filteredUtilisateurs.slice(indexOfFirstItem, indexOfLastItem);

  const showTotal = (total) => `Total ${total} utilisateurs`;

  const onChange = (page) => {
    setCurrentPage(page);
  };

  const toggleDetails = (id) => {
    setShowDetails(showDetails === id ? null : id);
  };

  const handleOpenModal = (utilisateur = null) => {
    setSelectedUtilisateur(utilisateur);
    if (utilisateur) {
      setFormData({ 
        ...utilisateur,
        password: "" // Ne pas afficher le mot de passe crypté
      });
    } else {
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        phone: "",
        city: "",
        villeCentre: "TINGHIR",
        role: "ADHERANT",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUtilisateur(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedUtilisateur
        ? `${API_URL}/${selectedUtilisateur.id}`
        : API_URL;
      const method = selectedUtilisateur ? "PUT" : "POST";
      
      // Ne pas envoyer le mot de passe vide pour les modifications
      const dataToSend = selectedUtilisateur && !formData.password
        ? { ...formData, password: undefined }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      if (response.ok) {
        alert(
          selectedUtilisateur
            ? "Utilisateur modifié avec succès !"
            : "Utilisateur ajouté avec succès !"
        );
        closeModal();
        fetchUtilisateurs();
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.message || "Une erreur est survenue"}`);
      }
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      alert("Erreur réseau. Veuillez réessayer.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (response.ok) {
          alert("Utilisateur supprimé avec succès !");
          fetchUtilisateurs();
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur réseau. Veuillez réessayer.");
      }
    }
  };

  // Fonction pour formater l'affichage de la ville centre
  const formatVilleCentre = (ville) => {
    if (!ville) return "";
    return ville.charAt(0) + ville.slice(1).toLowerCase().replace("_", " ");
  };

  return (
    <div className={`dashboard-container ${sidebarOpen ? "sidebar-expanded" : ""}`}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </div>
        <img src="/images/logo-light.png" alt="Logo" className="navbar-logo" />
      </nav>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <ul className="sidebar-menu">
          <li className={location.pathname === '/AdminHome' ? 'active' : ''}>
            <Link to="/AdminHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
          </li>
          <li className={location.pathname === '/GererUtilisateurs' ? 'active' : ''}>
            <Link to="/GererUtilisateurs"><FaUsers /><span>Gérer les Utilisateurs</span></Link>
          </li>
          <li className={location.pathname === '/GererAdherants' ? 'active' : ''}>
            <Link to="/GererAdherants"><FaUserCog /><span>Gérer les Adhérents</span></Link>
          </li>
          <li className={location.pathname === '/Notifications' ? 'active' : ''}>
            <Link to="/Notifications"><FaBell /><span>Notifications</span></Link>
          </li>
        </ul>

        <div className="sidebar-bottom">
          <ul>
            <li className="logout"><Link to="/logout"><FaSignOutAlt /><span>Déconnexion</span></Link></li>
          </ul>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="content">
        <h2>Gérer les Utilisateurs</h2>

        {/* Barre de recherche et filtres */}
        <div className="search-and-filters">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, email ou ville..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select
              className="filter-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">Tous les rôles</option>
              <option value="ADHERANT">Adhérent</option>
              <option value="RESPONSABLE">Responsable</option>
              <option value="DIRECTEUR">Directeur</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select
              className="filter-select"
              value={selectedVilleCentre}
              onChange={(e) => setSelectedVilleCentre(e.target.value)}
            >
              <option value="">Tous les centres</option>
              {villesCentre.map((ville) => (
                <option key={ville} value={ville}>
                  {formatVilleCentre(ville)}
                </option>
              ))}
            </select>
          </div>
          
          <button className="add-button" onClick={() => handleOpenModal()}>
            <span>+</span> Ajouter un Utilisateur
          </button>
        </div>

        {/* Tableau des utilisateurs */}
        <div className="table-container">
          <table className="utilisateurs-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Ville</th>
                <th>Centre</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((utilisateur) => (
                  <React.Fragment key={utilisateur.id}>
                    <tr>
                      <td>
                        {utilisateur.profileImage ? (
                          <img 
                            src={`data:image/jpeg;base64,${utilisateur.profileImage}`} 
                            alt="Profile" 
                            className="profile-image"
                          />
                        ) : (
                          <div className="profile-placeholder">
                            <FaUser />
                          </div>
                        )}
                      </td>
                      <td>{utilisateur.nom}</td>
                      <td>{utilisateur.prenom}</td>
                      <td>{utilisateur.email}</td>
                      <td>{utilisateur.phone}</td>
                      <td>{utilisateur.city}</td>
                      <td>{formatVilleCentre(utilisateur.villeCentre)}</td>
                      <td>{utilisateur.role}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="details-button"
                            onClick={() => toggleDetails(utilisateur.id)}
                          >
                            <FaEye />
                          </button>
                          <button
                            className="edit-button"
                            onClick={() => handleOpenModal(utilisateur)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDelete(utilisateur.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {showDetails === utilisateur.id && (
                      <tr className="details-row">
                        <td colSpan="9">
                          <div className="user-details-card">
                            <div className="details-header">
                              <h3>Détails de l'utilisateur</h3>
                            </div>
                            <div className="details-body">
                              <div className="details-image">
                                {utilisateur.profileImage ? (
                                  <img 
                                    src={`data:image/jpeg;base64,${utilisateur.profileImage}`} 
                                    alt="Profile" 
                                    className="profile-image-large"
                                  />
                                ) : (
                                  <div className="profile-placeholder-large">
                                    <FaUser />
                                  </div>
                                )}
                              </div>
                              <div className="details-info">
                                <p><strong>Nom complet:</strong> {utilisateur.prenom} {utilisateur.nom}</p>
                                <p><strong>Email:</strong> {utilisateur.email}</p>
                                <p><strong>Téléphone:</strong> {utilisateur.phone}</p>
                                <p><strong>Ville:</strong> {utilisateur.city}</p>
                                <p><strong>Centre:</strong> {formatVilleCentre(utilisateur.villeCentre)}</p>
                                <p><strong>Rôle:</strong> {utilisateur.role}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
                                                                                        
        {/* Pagination */}
        {filteredUtilisateurs.length > 0 && (
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              total={filteredUtilisateurs.length}
              pageSize={pageSize}
              onChange={onChange}
              showTotal={showTotal}
              showSizeChanger={false}
              showQuickJumper
            />
          </div>
        )}

        {/* Modal pour ajouter/modifier un utilisateur */}
        {showModal && (
          <>
            <div className="modal-backdrop"></div>
            <div className="modal-overlay">
              <div className="modal-content">
                <button className="modal-close" onClick={closeModal}>
                  &times;
                </button>
                <h3>{selectedUtilisateur ? "Modifier l'Utilisateur" : "Ajouter un Utilisateur"}</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nom</label>
                      <input
                        type="text"
                        name="nom"
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
                        value={formData.prenom}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
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
                        value={formData.password}
                        onChange={handleChange}
                        required={!selectedUtilisateur}
                        placeholder={selectedUtilisateur ? "Laisser vide pour ne pas modifier" : ""}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Téléphone</label>
                      <input
                        type="text"
                        name="phone"
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
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Centre</label>
                      <select
                        name="villeCentre"
                        value={formData.villeCentre}
                        onChange={handleChange}
                        required
                      >
                        {villesCentre.map((ville) => (
                          <option key={ville} value={ville}>
                            {formatVilleCentre(ville)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Rôle</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                      >
                        <option value="ADHERANT">Adhérent</option>
                        <option value="RESPONSABLE">Responsable</option>
                        <option value="DIRECTEUR">Directeur</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="save-button">
                      {selectedUtilisateur ? "Modifier" : "Ajouter"}
                    </button>
                    <button type="button" className="cancel-button" onClick={closeModal}>
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default GererUtilisateurs;