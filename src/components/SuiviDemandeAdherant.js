import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaClipboardList,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaEye,
  FaCogs,
} from "react-icons/fa";
import "../styles/SuiviDemandeAdherant.css";

const API_URL = "http://localhost:8080/api/demandes"; // URL de l'API Spring Boot

const SuiviDemandeAdherant = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demandes, setDemandes] = useState([]); // Initialisé avec un tableau vide
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  // Charger les demandes au démarrage
  useEffect(() => {
    fetchDemandes();
  }, []);

  // Charger toutes les demandes de l'adhérent
  const fetchDemandes = async () => {
    try {
      const adherantId = localStorage.getItem("adherantId"); // Récupérer l'ID de l'adhérent
      if (!adherantId) {
        throw new Error("Adhérent non connecté");
      }

      const response = await fetch(`${API_URL}/mes-demandes?adherantId=${adherantId}`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des demandes");
      }
      const data = await response.json();
      setDemandes(data || []); // Utilisez un tableau vide si data est undefined
    } catch (error) {
      console.error("Erreur lors du chargement des demandes:", error);
      setDemandes([]); // En cas d'erreur, initialisez avec un tableau vide
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
            <Link to="/AdherantHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
          </li>

          <li>
            <Link to="/EquipmentDisponible"><FaCogs /><span>Équipements Disponibles</span></Link>
          </li>
          <li>
            <Link to="/SuiviDemandeAdherant"><FaClipboardList /><span>Suivi des Demandes</span></Link>
          </li>
          <li>
            <Link to="/Notifications"><FaBell /><span>Notifications</span></Link>
          </li>
        </ul>


        <br></br><br></br><br></br><br></br><br></br>
        <br></br><br></br><br></br><br></br><br></br>
        <br></br><br></br><br></br><br></br><br></br>
        {/* Section en bas du sidebar */}
        <div className="sidebar-bottom">
          <ul>
            <li><Link to="/account"><FaUser /><span>Compte</span></Link></li>
            <li className="logout"><Link to="/logout"><FaSignOutAlt /><span>Déconnexion</span></Link></li>
          </ul>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="content">
        <h2>Suivi des Demandes</h2>

        {/* Tableau des demandes */}
        <div className="table-container">
          <table className="demandes-table">
            <thead>
              <tr>
                <th>Équipement</th>
                <th>Centre</th>
                <th>Statut</th>
                <th>Commentaire du Responsable</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(demandes) && demandes.map((demande) => (
                <tr key={demande.id}>
                  <td>{demande.nomEquipement}</td>
                  <td>{demande.centreEquipement}</td>
                  <td>{demande.statut}</td>
                  <td>{demande.commentaireResponsable}</td>
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
                  <p><strong>Équipement :</strong> {selectedDetails.nomEquipement}</p>
                  <p><strong>Centre :</strong> {selectedDetails.centreEquipement}</p>
                  <p><strong>Statut :</strong> {selectedDetails.statut}</p>
                  <p><strong>Commentaire du responsable :</strong> {selectedDetails.commentaireResponsable}</p>
                  <p><strong>Date de début :</strong> {new Date(selectedDetails.dateDebut).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</p>
                  <p><strong>Date de fin :</strong> {new Date(selectedDetails.dateFin).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</p>
                  <p><strong>Remarques :</strong> {selectedDetails.remarques}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SuiviDemandeAdherant;