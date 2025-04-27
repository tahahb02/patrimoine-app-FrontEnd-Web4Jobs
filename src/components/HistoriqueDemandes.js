import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaBoxOpen
} from 'react-icons/fa';
import { Pagination } from 'antd';
import '../styles/responsable.css';

const API_URL = 'http://localhost:8080/api/demandes';

const HistoriqueDemandes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demandes, setDemandes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'dateDemande', direction: 'desc' });
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [userCenter, setUserCenter] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const statusOptions = [
    { value: "", label: "Tous les statuts" },
    { value: "ACCEPTEE", label: "Acceptées" },
    { value: "REFUSEE", label: "Refusées" },
    { value: "EN_ATTENTE", label: "En attente" }
  ];

  useEffect(() => {
    const center = localStorage.getItem('userVilleCentre');
    if (center) {
      setUserCenter(center);
      fetchHistoriqueDemandes(center);
    }
  }, []);

  useEffect(() => {
    countStatus();
  }, [demandes]);

  const fetchHistoriqueDemandes = async (villeCentre) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/historique/${villeCentre}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Center': villeCentre,
          'X-User-Role': localStorage.getItem('userRole')
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDemandes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
    } finally {
      setLoading(false);
    }
  };

  const countStatus = () => {
    const accepted = demandes.filter(d => d.statut === "ACCEPTEE").length;
    const rejected = demandes.filter(d => d.statut === "REFUSEE").length;
    setAcceptedCount(accepted);
    setRejectedCount(rejected);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Non disponible';
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
      return dateTime;
    }
  };

  const calculateResponseTime = (demande) => {
    if (!demande.dateReponse) return 'Non répondu';
    const start = new Date(demande.dateDemande);
    const end = new Date(demande.dateReponse);
    const diff = end - start;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days > 0 ? days + 'j ' : ''}${hours}h ${minutes}m`;
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
      const matchesSearch = 
        (demande.nom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (demande.prenom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (demande.centreEquipement?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (demande.nomEquipement?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [demandes, selectedStatus, searchTerm]);

  const sortedDemandes = useMemo(() => {
    const sortableDemandes = [...filteredDemandes];
    if (sortConfig.key) {
      sortableDemandes.sort((a, b) => {
        if (sortConfig.key.includes('date')) {
          const aValue = new Date(a[sortConfig.key]);
          const bValue = new Date(b[sortConfig.key]);
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aValue = a[sortConfig.key]?.toString().toLowerCase() || '';
        const bValue = b[sortConfig.key]?.toString().toLowerCase() || '';
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
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
    document.body.style.overflow = 'hidden';
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedDetails(null);
    document.body.style.overflow = 'auto';
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userNom");
    localStorage.removeItem("userPrenom");
    localStorage.removeItem("userVilleCentre");
    navigate("/login");
  };

  const getStatusBadgeClass = (statut) => {
    if (!statut) return 'status-badge';
    const statutLower = statut.toLowerCase();
    if (statutLower.includes('accept')) return 'status-badge acceptee';
    if (statutLower.includes('refus')) return 'status-badge refusee';
    if (statutLower.includes('attente')) return 'status-badge en-attente';
    return 'status-badge';
  };

  const getResponseTimeClass = (demande) => {
    if (!demande.statut) return '';
    if (demande.statut === "ACCEPTEE") return 'fast';
    if (demande.statut === "REFUSEE") return 'slow';
    return '';
  };

  const StatusStatsPanel = () => (
    <div className="status-stats-panel">
      <div className="status-stat accepted">
        <FaCheckCircle className="stat-icon" />
        <div className="stat-content">
          <span className="stat-count">{acceptedCount}</span>
          <span className="stat-label">Acceptées</span>
        </div>
      </div>
      <div className="status-stat rejected">
        <FaTimesCircle className="stat-icon" />
        <div className="stat-content">
          <span className="stat-count">{rejectedCount}</span>
          <span className="stat-label">Refusées</span>
        </div>
      </div>
      <div className="center-info">
        Centre: <strong>{userCenter}</strong>
      </div>
    </div>
  );

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-expanded' : ''}`}>
      <nav className="navbar">
        <div className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </div>
        <img src="/images/logo-light.png" alt="Logo" className="navbar-logo" />
      </nav>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <ul className="sidebar-menu">
          <li className={location.pathname === '/ResponsableHome' ? 'active' : ''}>
            <Link to="/ResponsableHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
          </li>
          <li className={location.pathname === '/Equipments' ? 'active' : ''}>
            <Link to="/Equipments"><FaCogs /><span>Gestion des Équipements</span></Link>
          </li>
          <li className={location.pathname === '/GestionDemandes' ? 'active' : ''}>
            <Link to="/GestionDemandes"><FaClipboardList /><span>Gestion des Demandes</span></Link>
          </li>
          <li className={location.pathname === '/LivraisonsRetours' ? 'active' : ''}>
            <Link to="/LivraisonsRetours"><FaBoxOpen /><span>Livraisons/Retours</span></Link>
          </li>
          <li className={location.pathname === '/HistoriqueDemandes' ? 'active' : ''}>
            <Link to="/HistoriqueDemandes"><FaHistory /><span>Historique des Demandes</span></Link>
          </li>
          <li className={location.pathname === '/HistoriqueEquipements' ? 'active' : ''}>
            <Link to="/HistoriqueEquipements"><FaHistory /><span>Historique des Équipements</span></Link>
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
              <button onClick={handleLogout}>
                <FaSignOutAlt /><span>Déconnexion</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <main className="content">
        <h2>Historique des Demandes</h2>

        <StatusStatsPanel />

        <div className="search-and-filters">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, centre ou équipement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

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
        </div>

        {loading ? (
          <div className="loading-message">
            <p>Chargement des demandes...</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="demandes-table">
                <thead>
                  <tr>
                    <th onClick={() => requestSort('nom')}>
                      <div className="sortable-header">
                        Nom
                        <span className="sort-icon">{getSortIcon('nom')}</span>
                      </div>
                    </th>
                    <th onClick={() => requestSort('prenom')}>
                      <div className="sortable-header">
                        Prénom
                        <span className="sort-icon">{getSortIcon('prenom')}</span>
                      </div>
                    </th>
                    <th onClick={() => requestSort('centreEquipement')}>
                      <div className="sortable-header">
                        Centre
                        <span className="sort-icon">{getSortIcon('centreEquipement')}</span>
                      </div>
                    </th>
                    <th onClick={() => requestSort('nomEquipement')}>
                      <div className="sortable-header">
                        Équipement
                        <span className="sort-icon">{getSortIcon('nomEquipement')}</span>
                      </div>
                    </th>
                    <th onClick={() => requestSort('statut')}>
                      <div className="sortable-header">
                        Statut
                        <span className="sort-icon">{getSortIcon('statut')}</span>
                      </div>
                    </th>
                    <th onClick={() => requestSort('dateDemande')}>
                      <div className="sortable-header">
                        Date Demande
                        <span className="sort-icon">{getSortIcon('dateDemande')}</span>
                      </div>
                    </th>
                    <th onClick={() => requestSort('dateReponse')}>
                      <div className="sortable-header">
                        Date Réponse
                        <span className="sort-icon">{getSortIcon('dateReponse')}</span>
                      </div>
                    </th>
                    <th>Temps Réponse</th>
                    <th>Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {demandes.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="no-data-message">
                        Aucune demande enregistrée pour ce centre
                      </td>
                    </tr>
                  ) : currentDemandes.length > 0 ? (
                    currentDemandes.map((demande) => (
                      <tr key={demande.id}>
                        <td>{demande.nom}</td>
                        <td>{demande.prenom}</td>
                        <td>{demande.centreEquipement}</td>
                        <td>{demande.nomEquipement}</td>
                        <td>
                          <span className={getStatusBadgeClass(demande.statut)}>
                            {demande.statut}
                          </span>
                        </td>
                        <td className="date-cell">{formatDateTime(demande.dateDemande)}</td>
                        <td className="date-cell">{formatDateTime(demande.dateReponse)}</td>
                        <td>
                          <div className={`response-time ${getResponseTimeClass(demande)}`}>
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="no-data-message">
                        Aucune demande ne correspond à votre recherche
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {sortedDemandes.length > itemsPerPage && (
              <div className="pagination-container">
                <Pagination
                  current={currentPage}
                  total={sortedDemandes.length}
                  pageSize={itemsPerPage}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}

        {showDetailsModal && selectedDetails && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close" onClick={closeDetailsModal}>
                &times;
              </button>
              <h3>Détails de la demande</h3>
              <div className="details-content">
                <div className="detail-row">
                  <span className="detail-label">Nom:</span>
                  <span className="detail-value">{selectedDetails.nom}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Prénom:</span>
                  <span className="detail-value">{selectedDetails.prenom}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Téléphone:</span>
                  <span className="detail-value">{selectedDetails.numeroTelephone}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Centre:</span>
                  <span className="detail-value">{selectedDetails.centreEquipement}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Équipement:</span>
                  <span className="detail-value">{selectedDetails.nomEquipement}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Catégorie:</span>
                  <span className="detail-value">{selectedDetails.categorieEquipement}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date de début:</span>
                  <span className="detail-value">{formatDateTime(selectedDetails.dateDebut)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date de fin:</span>
                  <span className="detail-value">{formatDateTime(selectedDetails.dateFin)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Urgence:</span>
                  <span className="detail-value">{selectedDetails.urgence}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Statut:</span>
                  <span className={`detail-value ${getStatusBadgeClass(selectedDetails.statut)}`}>
                    {selectedDetails.statut}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Commentaire:</span>
                  <span className="detail-value">{selectedDetails.commentaireResponsable || 'Aucun commentaire'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Remarques:</span>
                  <span className="detail-value">{selectedDetails.remarques || 'Aucune remarque'}</span>
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