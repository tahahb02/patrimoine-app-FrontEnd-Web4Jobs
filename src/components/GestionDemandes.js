import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaCogs,
  FaClipboardList,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaSearch,
  FaEye, // Icône d'œil pour les détails
} from "react-icons/fa";
import "../styles/GestionDemandes.css";

const API_URL = "http://localhost:8080/api/demandes"; // URL de l'API Spring Boot

const GestionDemandes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demandes, setDemandes] = useState([]);
  const [filtres, setFiltres] = useState({
    statut: "TOUS", // Filtre par statut
  });
  const [searchTerm, setSearchTerm] = useState(""); // Barre de recherche globale
  const [showModal, setShowModal] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [commentaire, setCommentaire] = useState("");
  const [actionChoisie, setActionChoisie] = useState(null); // Nouvel état pour suivre l'action
  const [showDetailsModal, setShowDetailsModal] = useState(false); // Modal pour les détails
  const [selectedDetails, setSelectedDetails] = useState(null); // Détails de la demande sélectionnée

  // Charger les demandes au démarrage
  useEffect(() => {
    fetchDemandes();
  }, []);

  // Charger toutes les demandes (sans filtre)
  const fetchDemandes = async () => {
    try {
      const response = await fetch(`${API_URL}/filtrer`); // Charger toutes les demandes
      const data = await response.json();
      setDemandes(data); // Stocker toutes les demandes dans le state
    } catch (error) {
      console.error("Erreur lors du chargement des demandes:", error);
    }
  };

  // Gérer les changements dans les filtres
  const handleFiltreChange = (e) => {
    const { name, value } = e.target;
    setFiltres({ ...filtres, [name]: value });
    // Pas besoin de recharger les données depuis le backend
  };

  // Gérer la recherche globale
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrer les demandes en fonction du terme de recherche et du statut
  const filteredDemandes = demandes
    .filter((demande) => {
      // Filtre par statut
      if (filtres.statut !== "TOUS" && demande.statut !== filtres.statut) {
        return false;
      }
      // Filtre par recherche globale
      return (
        demande.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        demande.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        demande.centreEquipement.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  // Ouvrir le modal pour accepter/refuser une demande
  const handleAction = (demande, action) => {
    setSelectedDemande(demande);
    setActionChoisie(action); // Définir l'action choisie
    setShowModal(true);
  };

  // Fermer le modal
  const closeModal = () => {
    setShowModal(false);
    setCommentaire("");
    setActionChoisie(null); // Réinitialiser l'action choisie
  };

  // Mettre à jour le statut de la demande
  const mettreAJourStatut = async () => {
    try {
      const url = `${API_URL}/${selectedDemande.id}/statut?statut=${actionChoisie}${
        commentaire ? `&commentaire=${encodeURIComponent(commentaire)}` : ""
      }`;
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        alert(`Demande ${actionChoisie.toLowerCase()} avec succès !`);
        closeModal();
        fetchDemandes(); // Recharger les demandes
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la mise à jour du statut: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      alert("Erreur réseau. Veuillez réessayer.");
    }
  };

  // Ouvrir le modal des détails
  const handleDetails = (demande) => {
    setSelectedDetails(demande);
    setShowDetailsModal(true);
  };

  // Fermer le modal des détails
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedDetails(null);
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
          <li>
            <Link to="/ResponsableHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
          </li>
          <li>
            <Link to="/Equipments"><FaCogs /><span>Gestion des Équipements</span></Link>
          </li>
          <li>
            <Link to="/GestionDemandes"><FaClipboardList /><span>Suivi des Demandes</span></Link>
          </li>
          <li>
            <Link to="/Notifications"><FaBell /><span>Notifications</span></Link>
          </li>
        </ul>

        {/* Section en bas du sidebar */}

        <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
        <br></br><br></br><br></br><br></br><br></br><br></br><br></br>
        <div className="sidebar-bottom">
          <ul>
            <li><Link to="/account"><FaUser /><span>Compte</span></Link></li>
            <li className="logout"><Link to="/logout"><FaSignOutAlt /><span>Déconnexion</span></Link></li>
          </ul>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="content">
        <h2>Gestion des Demandes</h2>

        {/* Barre de recherche et filtre */}
        <div className="search-and-filter-container">
          {/* Barre de recherche globale */}
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou centre..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          {/* Filtre de statut */}
          <div className="filtre-group">
            <select
              name="statut"
              value={filtres.statut}
              onChange={handleFiltreChange}
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="ACCEPTEE">Acceptée</option>
              <option value="REFUSEE">Refusée</option>
            </select>
          </div>
        </div>

        {/* Tableau des demandes */}
        <div className="table-container">
          <table className="demandes-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Centre</th>
                <th>Équipement</th>
                <th>Statut</th>
                <th>Actions</th>
                <th>Détails</th> {/* Nouvelle colonne pour l'icône d'œil */}
              </tr>
            </thead>
            <tbody>
              {filteredDemandes.map((demande) => (
                <tr key={demande.id}>
                  <td>{demande.nom}</td>
                  <td>{demande.prenom}</td>
                  <td>{demande.centreEquipement}</td>
                  <td>{demande.nomEquipement}</td>
                  <td>{demande.statut}</td>
                  <td>
                    <button
                      className="accepter"
                      onClick={() => handleAction(demande, "ACCEPTEE")}
                    >
                      Accepter
                    </button>
                    <button
                      className="refuser"
                      onClick={() => handleAction(demande, "REFUSEE")}
                    >
                      Refuser
                    </button>
                  </td>
                  <td>
                    <button
                      className="details-button"
                      onClick={() => handleDetails(demande)}
                    >
                      <FaEye /> {/* Icône d'œil */}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal pour accepter/refuser une demande */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close" onClick={closeModal}>
                &times;
              </button>
              <h3>Commentaire</h3>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Ajouter un commentaire..."
              />
              <div className="modal-actions">
                {actionChoisie === "ACCEPTEE" && (
                  <button
                    className="accepter"
                    onClick={mettreAJourStatut}
                  >
                    Accepter
                  </button>
                )}
                {actionChoisie === "REFUSEE" && (
                  <button
                    className="refuser"
                    onClick={mettreAJourStatut}
                  >
                    Refuser
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal pour afficher les détails de la demande */}
        {showDetailsModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close" onClick={closeDetailsModal}>
                &times;
              </button>
              <h3>Détails de la demande</h3>
              {selectedDetails && (
                <div className="details-content">
                  <p><strong>Nom :</strong> {selectedDetails.nom}</p>
                  <p><strong>Prénom :</strong> {selectedDetails.prenom}</p>
                  <p><strong>Centre :</strong> {selectedDetails.centreEquipement}</p>
                  <p><strong>Équipement :</strong> {selectedDetails.nomEquipement}</p>
                  <p><strong>Catégorie :</strong> {selectedDetails.categorieEquipement}</p>
                  <p><strong>Date de début :</strong> {new Date(selectedDetails.dateDebut).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</p>
                  <p><strong>Date de fin :</strong> {new Date(selectedDetails.dateFin).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</p>
                  <p><strong>Remarques :</strong> {selectedDetails.remarques}</p>
                  <p><strong>Statut :</strong> {selectedDetails.statut}</p>
                  <p><strong>Commentaire du responsable :</strong> {selectedDetails.commentaireResponsable}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GestionDemandes;