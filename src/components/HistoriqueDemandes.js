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
  FaFilter
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
  const navigate = useNavigate();
  const location = useLocation();

  const statusOptions = [
    { value: "", label: "Tous les statuts" },
    { value: "ACCEPTEE", label: "Acceptées" },
    { value: "REFUSEE", label: "Refusées" }
  ];

  useEffect(() => {
    fetchHistoriqueDemandes();
  }, []);

  const fetchHistoriqueDemandes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/historique`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          navigate("/login");
          return;
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDemandes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
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
        (demande.centreEquipement?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [demandes, selectedStatus, searchTerm]);

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
    if (statutLower.includes('accept')) 
      return 'status-badge acceptee';
    if (statutLower.includes('refus')) 
      return 'status-badge refusee';
    return 'status-badge';
  };

  const getResponseTimeClass = (statut) => {
    if (!statut) return '';
    const statutLower = statut.toLowerCase();
    if (statutLower.includes('accept')) 
      return 'fast';
    if (statutLower.includes('refus')) 
      return 'slow';
    return '';
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
          <li className={location.pathname === '/HistoriqueDemandes' ? 'active' : ''}>
            <Link to="/HistoriqueDemandes"><FaHistory /><span>Historique des Demandes</span></Link>
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
        <h2>Historique des Demandes</h2>

        <div className="search-and-filters">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou centre..."
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

        <div className="table-container">
          <table className="demandes-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Centre</th>
                <th>Équipement</th>
                <th>Statut</th>
                <th onClick={() => requestSort('dateDemande')}>
                  <div className="sortable-header">
                    Date Demande
                    <span className="sort-icon">
                      {getSortIcon('dateDemande')}
                    </span>
                  </div>
                </th>
                <th onClick={() => requestSort('dateReponse')}>
                  <div className="sortable-header">
                    Date Réponse
                    <span className="sort-icon">
                      {getSortIcon('dateReponse')}
                    </span>
                  </div>
                </th>
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
                  <td>
                    <span className={getStatusBadgeClass(demande.statut)}>
                      {demande.statut}
                    </span>
                  </td>
                  <td className="date-cell">{formatDateTime(demande.dateDemande)}</td>
                  <td className="date-cell">{formatDateTime(demande.dateReponse)}</td>
                  <td>
                    <div className={`response-time ${getResponseTimeClass(demande.statut)}`}>
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
            total={sortedDemandes.length}
            pageSize={itemsPerPage}
            onChange={(page) => setCurrentPage(page)}
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
                  <span className={`detail-value ${getStatusBadgeClass(selectedDetails.statut)}`}>
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