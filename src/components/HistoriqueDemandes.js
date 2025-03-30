import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaClock
} from 'react-icons/fa';
import { Pagination } from 'antd';
import '../styles/HistoriqueDemandes.css';

const API_URL = 'http://localhost:8080/api/demandes';

const HistoriqueDemandes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demandes, setDemandes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtres, setFiltres] = useState({
    statut: 'TOUS'
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistoriqueDemandes();
  }, []);

  const fetchHistoriqueDemandes = async () => {
    try {
      const response = await fetch(`${API_URL}/historique`);
      if (!response.ok) {
        throw new Error('Erreur réseau');
      }
      const data = await response.json();
      setDemandes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
      setDemandes([]);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Non disponible';
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
    if (!demande.dateReponse) return 'Non répondu';
    const start = new Date(demande.dateDemande);
    const end = new Date(demande.dateReponse);
    const diff = end - start;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}j ${hours}h ${minutes}m`;
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFiltreChange = (e) => {
    const { name, value } = e.target;
    setFiltres({ ...filtres, [name]: value });
  };

  const filteredDemandes = demandes.filter((demande) => {
    if (filtres.statut !== 'TOUS' && demande.statut !== filtres.statut) {
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

  const handleDetails = (demande) => {
    setSelectedDetails(demande);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedDetails(null);
  };

  // Fonction pour naviguer
  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-expanded' : ''}`}>
      <nav className="navbar">
        <div className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </div>
        <img src="/images/logo-light.png" alt="Logo" className="navbar-logo" />
      </nav>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-menu">
          <div className="menu-item" onClick={() => navigateTo('/ResponsableHome')}>
            <FaTachometerAlt />
            <span>Tableau de Bord</span>
          </div>
          <div className="menu-item" onClick={() => navigateTo('/Equipments')}>
            <FaCogs />
            <span>Gestion des Équipements</span>
          </div>
          <div className="menu-item" onClick={() => navigateTo('/GestionDemandes')}>
            <FaClipboardList />
            <span>Gestion des Demandes</span>
          </div>
          <div className="menu-item active" onClick={() => navigateTo('/HistoriqueDemandes')}>
            <FaHistory />
            <span>Historique des Demandes</span>
          </div>
          <div className="menu-item" onClick={() => navigateTo('/Notifications')}>
            <FaBell />
            <span>Notifications</span>
          </div>
        </div>
        <div className="sidebar-bottom">
          <div className="menu-item" onClick={() => navigateTo('/account')}>
            <FaUser />
            <span>Compte</span>
          </div>
          <div className="menu-item logout" onClick={() => navigateTo('/logout')}>
            <FaSignOutAlt />
            <span>Déconnexion</span>
          </div>
        </div>
      </aside>

      <main className="content">
        <h2>Historique des Demandes</h2>

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
                <th>Date Réponse</th>
                <th>Temps Réponse</th>
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
                  <td className={`status-${demande.statut.toLowerCase()}`}>
                    {demande.statut}
                  </td>
                  <td className="date-cell">{formatDateTime(demande.dateDemande)}</td>
                  <td className="date-cell">{formatDateTime(demande.dateReponse)}</td>
                  <td>
                    <div className={`response-time ${demande.statut === 'ACCEPTEE' ? 'fast' : demande.statut === 'REFUSEE' ? 'slow' : ''}`}>
                      <FaClock /> {calculateResponseTime(demande)}
                    </div>
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

        {showDetailsModal && selectedDetails && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close" onClick={closeDetailsModal}>
                &times;
              </button>
              <h3>Détails de la demande</h3>
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
                <div className="detail-row">
                  <span className="detail-label">Date de réponse :</span>
                  <span className="detail-value">{formatDateTime(selectedDetails.dateReponse)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Temps de réponse :</span>
                  <span className="detail-value">
                    <FaClock /> {calculateResponseTime(selectedDetails)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Remarques :</span>
                  <span className="detail-value">{selectedDetails.remarques || 'Aucune remarque'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Statut :</span>
                  <span className={`detail-value status-${selectedDetails.statut.toLowerCase()}`}>
                    {selectedDetails.statut}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Commentaire responsable :</span>
                  <span className="detail-value">{selectedDetails.commentaireResponsable || 'Aucun commentaire'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoriqueDemandes;