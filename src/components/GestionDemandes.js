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
  FaClock,
} from "react-icons/fa";
import { Pagination } from 'antd';
import "../styles/GestionDemandes.css";

const API_URL = "http://localhost:8080/api/demandes";

const GestionDemandes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demandes, setDemandes] = useState([]);
  const [filtres, setFiltres] = useState({
    statut: "TOUS",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [commentaire, setCommentaire] = useState("");
  const [actionChoisie, setActionChoisie] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    try {
      const response = await fetch(`${API_URL}/en-attente`);
      if (!response.ok) {
        throw new Error('Erreur réseau');
      }
      const data = await response.json();
      setDemandes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur lors du chargement des demandes:", error);
      setDemandes([]);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "Non disponible";
    const date = new Date(dateTime);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateResponseTime = (demande) => {
    if (!demande.dateReponse) return "En attente";
    const start = new Date(demande.dateDemande);
    const end = new Date(demande.dateReponse);
    const diff = end - start;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}j ${hours}h ${minutes}m`;
  };

  const handleFiltreChange = (e) => {
    const { name, value } = e.target;
    setFiltres({ ...filtres, [name]: value });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredDemandes = (Array.isArray(demandes) ? demandes : []).filter((demande) => {
    if (filtres.statut !== "TOUS" && demande.statut !== filtres.statut) {
      return false;
    }
    return (
      (demande.nom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (demande.prenom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (demande.centreEquipement?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDemandes = filteredDemandes.slice(indexOfFirstItem, indexOfLastItem);

  const showTotal = (total) => `Total ${total} demandes`;

  const onChange = (page) => {
    setCurrentPage(page);
  };

  const handleAction = (demande, action) => {
    setSelectedDemande(demande);
    setActionChoisie(action);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCommentaire("");
    setActionChoisie(null);
  };

  const mettreAJourStatut = async () => {
    try {
      const response = await fetch(`${API_URL}/${selectedDemande.id}/statut`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          statut: actionChoisie,
          commentaire: commentaire,
          dateReponse: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        alert(`Demande ${actionChoisie.toLowerCase()} avec succès !`);
        closeModal();
        fetchDemandes();
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la mise à jour du statut: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      alert("Erreur réseau. Veuillez réessayer.");
    }
  };

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
      <nav className="navbar">
        <div className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </div>
        <img src="/images/logo-light.png" alt="Logo" className="navbar-logo" />
      </nav>

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <ul className="sidebar-menu">
          <li><Link to="/ResponsableHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link></li>
          <li><Link to="/Equipments"><FaCogs /><span>Gestion des Équipements</span></Link></li>
          <li><Link to="/GestionDemandes"><FaClipboardList /><span>Gestion des Demandes</span></Link></li>
          <li><Link to="/HistoriqueDemandes"><FaHistory /><span>Historique des Demandes</span></Link></li>
          <li><Link to="/Notifications"><FaBell /><span>Notifications</span></Link></li>
        </ul>
        <div className="sidebar-bottom">
          <ul>
            <li><Link to="/account"><FaUser /><span>Compte</span></Link></li>
            <li className="logout"><Link to="/logout"><FaSignOutAlt /><span>Déconnexion</span></Link></li>
          </ul>
        </div>
      </aside>

      <main className="content">
        <h2>Gestion des Demandes</h2>

        <div className="search-and-filter-container">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou centre..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="demandes-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Centre</th>
                <th>Équipement</th>
                <th>Statut</th>
                <th>Date Demande</th>
                <th>Temps Réponse</th>
                <th>Actions</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              {currentDemandes.map((demande) => (
                <tr key={demande.id}>
                  <td>{demande.nom}</td>
                  <td>{demande.prenom}</td>
                  <td>{demande.centreEquipement}</td>
                  <td>{demande.nomEquipement}</td>
                  <td>{demande.statut}</td>
                  <td className="date-cell">{formatDateTime(demande.dateDemande)}</td>
                  <td>
                    <div className={`response-time ${!demande.dateReponse ? 'waiting' : ''}`}>
                      <FaClock /> {calculateResponseTime(demande)}
                    </div>
                  </td>
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
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-container">
          <Pagination
            current={currentPage}
            total={filteredDemandes.length}
            pageSize={itemsPerPage}
            onChange={onChange}
            showTotal={showTotal}
            showSizeChanger={false}
            showQuickJumper
          />
        </div>

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
                required
              />
              <div className="modal-actions">
                {actionChoisie === "ACCEPTEE" && (
                  <button className="accepter" onClick={mettreAJourStatut}>
                    Confirmer l'acceptation
                  </button>
                )}
                {actionChoisie === "REFUSEE" && (
                  <button className="refuser" onClick={mettreAJourStatut}>
                    Confirmer le refus
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {showDetailsModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close" onClick={closeDetailsModal}>
                &times;
              </button>
              <h3>Détails de la demande</h3>
              {selectedDetails && (
                <div className="details-content">
                  <div className="detail-row">
                    <span className="detail-label">Nom :</span>
                    <span className="detail-value">{selectedDetails.nom}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Prénom :</span>
                    <span className="detail-value">{selectedDetails.prenom}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Centre :</span>
                    <span className="detail-value">{selectedDetails.centreEquipement}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Équipement :</span>
                    <span className="detail-value">{selectedDetails.nomEquipement}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Catégorie :</span>
                    <span className="detail-value">{selectedDetails.categorieEquipement}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date de début :</span>
                    <span className="detail-value">{formatDateTime(selectedDetails.dateDebut)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date de fin :</span>
                    <span className="detail-value">{formatDateTime(selectedDetails.dateFin)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date de demande :</span>
                    <span className="detail-value">{formatDateTime(selectedDetails.dateDemande)}</span>
                  </div>
                  {selectedDetails.dateReponse && (
                    <div className="detail-row">
                      <span className="detail-label">Date de réponse :</span>
                      <span className="detail-value">{formatDateTime(selectedDetails.dateReponse)}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Temps de réponse :</span>
                    <span className="detail-value">
                      <FaClock /> {calculateResponseTime(selectedDetails)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Remarques :</span>
                    <span className="detail-value">{selectedDetails.remarques || "Aucune remarque"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Statut :</span>
                    <span className={`detail-value status-${selectedDetails.statut.toLowerCase()}`}>
                      {selectedDetails.statut}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Commentaire responsable :</span>
                    <span className="detail-value">{selectedDetails.commentaireResponsable || "Aucun commentaire"}</span>
                  </div>
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