import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars, FaTimes, FaTachometerAlt, FaClipboardList, FaBell,
  FaUser, FaSignOutAlt, FaEye, FaCogs, FaSort, FaSortUp,
  FaSortDown, FaExclamationTriangle, FaFilter, FaCalendarAlt,
  FaInfoCircle
} from "react-icons/fa";
import { Pagination, Spin, Alert, message } from "antd";
import "../styles/adherant.css";

const API_URL = "http://localhost:8080/api/demandes";

const SuiviDemandeAdherant = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'dateDemande', direction: 'desc' });
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState("");
  const [urgentCount, setUrgentCount] = useState(0);
  const [mediumCount, setMediumCount] = useState(0);
  const [normalCount, setNormalCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const urgencyOptions = [
    { value: "", label: "Tous les niveaux" },
    { value: "ELEVEE", label: "Urgent" },
    { value: "MOYENNE", label: "Moyen" },
    { value: "NORMALE", label: "Normal" }
  ];

  const statusOptions = [
    { value: "", label: "Tous les statuts" },
    { value: "EN_ATTENTE", label: "En attente" },
    { value: "ACCEPTEE", label: "Acceptée" },
    { value: "REJETEE", label: "Rejetée" },
    { value: "EN_COURS", label: "En cours" },
    { value: "TERMINEE", label: "Terminée" },
    { value: "ANNULEE", label: "Annulée" }
  ];

  useEffect(() => {
    fetchDemandes();
  }, []);

  useEffect(() => {
    if (demandes.length > 0) {
      countUrgencyLevels();
    }
  }, [demandes]);

  const fetchDemandes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        throw new Error("Session invalide. Veuillez vous reconnecter.");
      }

      const response = await fetch(`${API_URL}/by-user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          message.error("Session expirée. Veuillez vous reconnecter.");
          localStorage.clear();
          navigate("/login");
          return;
        }
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error("Format de données invalide reçu du serveur");
      }

      setDemandes(data);
    } catch (err) {
      console.error("Erreur lors du chargement des demandes:", err);
      setError(err.message || "Erreur lors de la récupération des données");
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const countUrgencyLevels = () => {
    const urgent = demandes.filter(d => d.urgence === "ELEVEE").length;
    const medium = demandes.filter(d => d.urgence === "MOYENNE").length;
    const normal = demandes.filter(d => d.urgence === "NORMALE").length;
    
    setUrgentCount(urgent);
    setMediumCount(medium);
    setNormalCount(normal);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Non spécifié';
    try {
      const date = new Date(dateTime);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const filteredDemandes = useMemo(() => {
    return demandes.filter(demande => {
      const matchesStatus = !selectedStatus || demande.statut === selectedStatus;
      const matchesUrgency = !selectedUrgency || demande.urgence === selectedUrgency;
      return matchesStatus && matchesUrgency;
    });
  }, [demandes, selectedStatus, selectedUrgency]);

  const sortedDemandes = useMemo(() => {
    const sortableDemandes = [...filteredDemandes];
    if (sortConfig.key) {
      sortableDemandes.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableDemandes;
  }, [filteredDemandes, sortConfig]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDemandes = sortedDemandes.slice(indexOfFirstItem, indexOfLastItem);

  const handleDetails = (demande) => {
    setSelectedDetails(demande);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedDetails(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userNom");
    localStorage.removeItem("userPrenom");
    navigate("/login");
  };

  const getStatusBadgeClass = (statut) => {
    if (!statut) return 'status-badge';
    const statutLower = statut.toLowerCase();
    if (statutLower.includes('accept') || statutLower.includes('approuv')) 
      return 'status-badge acceptee';
    if (statutLower.includes('refus') || statutLower.includes('rejet')) 
      return 'status-badge refusee';
    if (statutLower.includes('termine')) 
      return 'status-badge terminee';
    if (statutLower.includes('annul')) 
      return 'status-badge annulee';
    if (statutLower.includes('cours')) 
      return 'status-badge en-cours';
    return 'status-badge en-attente';
  };

  const getUrgencyBadgeClass = (urgence) => {
    if (!urgence) return 'urgency-badge';
    switch(urgence) {
      case 'ELEVEE':
        return 'urgency-badge urgent';
      case 'MOYENNE':
        return 'urgency-badge medium';
      case 'NORMALE':
        return 'urgency-badge normal';
      default:
        return 'urgency-badge';
    }
  };

  const UrgencyStatsPanel = () => (
    <div className="urgency-stats-panel">
      <div className="urgency-stat urgent">
        <FaExclamationTriangle className="stat-icon" />
        <div className="stat-content">
          <span className="stat-count">{urgentCount}</span>
          <span className="stat-label">Urgentes</span>
        </div>
      </div>
      <div className="urgency-stat medium">
        <FaExclamationTriangle className="stat-icon" />
        <div className="stat-content">
          <span className="stat-count">{mediumCount}</span>
          <span className="stat-label">Moyennes</span>
        </div>
      </div>
      <div className="urgency-stat normal">
        <FaExclamationTriangle className="stat-icon" />
        <div className="stat-content">
          <span className="stat-count">{normalCount}</span>
          <span className="stat-label">Normales</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Chargement des demandes..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Alert
          message="Erreur"
          description={error}
          type="error"
          showIcon
          icon={<FaExclamationTriangle />}
        />
        <button onClick={() => window.location.reload()} className="retry-button">
          Réessayer
        </button>
      </div>
    );
  }

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
          <li className={location.pathname === '/AdherantHome' ? 'active' : ''}>
            <Link to="/AdherantHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
          </li>
          <li className={location.pathname === '/EquipmentDisponible' ? 'active' : ''}>
            <Link to="/EquipmentDisponible"><FaCogs /><span>Équipements Disponibles</span></Link>
          </li>
          <li className={location.pathname === '/SuiviDemandeAdherant' ? 'active' : ''}>
            <Link to="/SuiviDemandeAdherant"><FaClipboardList /><span>Suivi des Demandes</span></Link>
          </li>
          <li className={location.pathname === '/Notifications' ? 'active' : ''}>
            <Link to="/Notifications"><FaBell /><span>Notifications</span></Link>
          </li>
        </ul>

        <div className="sidebar-bottom">
          <ul>
            <li className={location.pathname === '/account' ? 'active' : ''}>
              <Link to="/account"><FaUser /><span>Compte</span></Link>
            </li>
            <li className="logout">
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', padding: '10px', width: '100%', textAlign: 'left' }}>
                <FaSignOutAlt /><span>Déconnexion</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <main className="content">
        <h2>Suivi des Demandes</h2>
        <p className="page-description">
          Visualisez l'état de vos demandes d'équipements et suivez leur progression
        </p>

        <UrgencyStatsPanel />

        <div className="filters-container">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="filter-select"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="filter-select"
            >
              {urgencyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredDemandes.length === 0 ? (
          <div className="no-data-message">
            <p>Aucune demande trouvée.</p>
            <Link to="/EquipmentDisponible" className="new-request-link">
              <FaCogs /> Faire une nouvelle demande
            </Link>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="demandes-table">
                <thead>
                  <tr>
                    <th>Équipement</th>
                    <th>Centre</th>
                    <th onClick={() => requestSort('statut')}>
                      <div className="sortable-header">
                        Statut
                        <span className="sort-icon">
                          {getSortIcon('statut')}
                        </span>
                      </div>
                    </th>
                    <th onClick={() => requestSort('urgence')}>
                      <div className="sortable-header">
                        Urgence
                        <span className="sort-icon">
                          {getSortIcon('urgence')}
                        </span>
                      </div>
                    </th>
                    <th onClick={() => requestSort('dateDemande')}>
                      <div className="sortable-header">
                        <FaCalendarAlt /> Date
                        <span className="sort-icon">
                          {getSortIcon('dateDemande')}
                        </span>
                      </div>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDemandes.map((demande) => (
                    <tr key={demande.id}>
                      <td>{demande.nomEquipement || 'N/A'}</td>
                      <td>{demande.centreEquipement || 'N/A'}</td>
                      <td>
                        <span className={getStatusBadgeClass(demande.statut)}>
                          {demande.statut || 'EN_ATTENTE'}
                        </span>
                      </td>
                      <td>
                        <span className={getUrgencyBadgeClass(demande.urgence)}>
                          {demande.urgence || 'NORMALE'}
                        </span>
                      </td>
                      <td>{formatDateTime(demande.dateDemande)}</td>
                      <td>
                        <button
                          className="details-button"
                          onClick={() => handleDetails(demande)}
                          title="Voir détails"
                        >
                          <FaEye /> Détails
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
                total={sortedDemandes.length}
                pageSize={itemsPerPage}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showQuickJumper
              />
            </div>
          </>
        )}

        {showDetailsModal && selectedDetails && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close" onClick={closeDetailsModal}>
                &times;
              </button>
              <h3>
                <FaInfoCircle /> Détails de la demande
              </h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Équipement:</span>
                  <span className="detail-value">{selectedDetails.nomEquipement || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">ID Équipement:</span>
                  <span className="detail-value">{selectedDetails.idEquipement || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Centre:</span>
                  <span className="detail-value">{selectedDetails.centreEquipement || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Catégorie:</span>
                  <span className="detail-value">{selectedDetails.categorieEquipement || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Statut:</span>
                  <span className={`detail-value ${getStatusBadgeClass(selectedDetails.statut)}`}>
                    {selectedDetails.statut || 'EN_ATTENTE'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Urgence:</span>
                  <span className={`detail-value ${getUrgencyBadgeClass(selectedDetails.urgence)}`}>
                    {selectedDetails.urgence || 'NORMALE'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date de demande:</span>
                  <span className="detail-value">{formatDateTime(selectedDetails.dateDemande)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date de début:</span>
                  <span className="detail-value">{formatDateTime(selectedDetails.dateDebut)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date de fin:</span>
                  <span className="detail-value">{formatDateTime(selectedDetails.dateFin)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date de réponse:</span>
                  <span className="detail-value">{formatDateTime(selectedDetails.dateReponse) || 'En attente'}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Remarques:</span>
                  <span className="detail-value">{selectedDetails.remarques || 'Aucune remarque'}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Commentaire responsable:</span>
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

export default SuiviDemandeAdherant;  