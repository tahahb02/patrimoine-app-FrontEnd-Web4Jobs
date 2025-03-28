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
  FaEye,
  FaHistory,
} from "react-icons/fa";
import "../styles/HistoriqueDemandes.css";

const API_URL = "http://localhost:8080/api/demandes";

const HistoriqueDemandes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demandes, setDemandes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtres, setFiltres] = useState({
    statut: "TOUS", // Nouveau state pour le filtre par statut
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  useEffect(() => {
    fetchHistoriqueDemandes();
  }, []);

  const fetchHistoriqueDemandes = async () => {
    try {
      const response = await fetch(`${API_URL}/historique`);
      const data = await response.json();
      setDemandes(data);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Gérer les changements dans les filtres
  const handleFiltreChange = (e) => {
    const { name, value } = e.target;
    setFiltres({ ...filtres, [name]: value });
  };

  const filteredDemandes = demandes.filter((demande) => {
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

  const handleDetails = (demande) => {
    setSelectedDetails(demande);
    setShowDetailsModal(true);
  };

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
            <Link to="/GestionDemandes"><FaClipboardList /><span>Gestion des Demandes</span></Link>
          </li>
          <li>
            <Link to="/HistoriqueDemandes"><FaHistory /><span>Historique des Demandes</span></Link>
          </li>
          <li>
            <Link to="/Notifications"><FaBell /><span>Notifications</span></Link>
          </li>
        </ul>

                <br></br><br></br><br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br><br></br>
                <br></br>
        <div className="sidebar-bottom">
          <ul>
            <li><Link to="/account"><FaUser /><span>Compte</span></Link></li>
            <li className="logout"><Link to="/logout"><FaSignOutAlt /><span>Déconnexion</span></Link></li>
          </ul>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="content">
        <h2>Historique des Demandes</h2>

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

          {/* Nouveau filtre de statut */}
          <div className="filtre-group">
            <select
              name="statut"
              value={filtres.statut}
              onChange={handleFiltreChange}
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="ACCEPTEE">Acceptées</option>
              <option value="REFUSEE">Refusées</option>
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
                <th>Détails</th>
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
                      className="details-button"
                      onClick={() => handleDetails(demande)}
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
                  <p><strong>Date de début :</strong> {new Date(selectedDetails.dateDebut).toLocaleString('fr-FR')}</p>
                  <p><strong>Date de fin :</strong> {new Date(selectedDetails.dateFin).toLocaleString('fr-FR')}</p>
                  <p><strong>Remarques :</strong> {selectedDetails.remarques}</p>
                  <p><strong>Statut :</strong> {selectedDetails.statut}</p>
                  <p><strong>Commentaire du responsable :</strong> {selectedDetails.commentaireResponsable || "Aucun commentaire"}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoriqueDemandes;