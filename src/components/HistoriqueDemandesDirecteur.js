import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaCogs,
  FaHistory,
  FaUser,
  FaSignOutAlt,
  FaSearch,
  FaEye,
  FaClock,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaWrench,
  FaClipboardList,
  FaUsers,
  FaBuilding,
  FaChartLine,
  FaCalendarAlt
} from 'react-icons/fa';
import { Pagination, Select, DatePicker, message } from 'antd';
import moment from 'moment';
import Swal from 'sweetalert2';
import '../styles/responsable.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

const HistoriqueDemandesDirecteur = () => {
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
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('all');
  const navigate = useNavigate();
  const location = useLocation();

  const API_URL = 'http://localhost:8080/api/demandes';
  const CENTERS_URL = 'http://localhost:8080/api/statistics/centers';

  const statusOptions = [
    { value: "", label: "Tous les statuts" },
    { value: "ACCEPTEE", label: "Acceptées" },
    { value: "REFUSEE", label: "Refusées" },
    { value: "EN_ATTENTE", label: "En attente" },
    { value: "LIVREE", label: "Livrées" },
    { value: "RETOURNEE", label: "Retournées" }
  ];

  useEffect(() => {
    fetchCenters();
    fetchAllDemandes();
  }, []);

  useEffect(() => {
    countStatus();
  }, [demandes]);

  const fetchCenters = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(CENTERS_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Role': localStorage.getItem('userRole'),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      setCenters(data);
    } catch (error) {
      console.error("Erreur lors du chargement des centres:", error);
      message.error('Impossible de charger les centres');
    }
  };

  const fetchAllDemandes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/directeur/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Role': localStorage.getItem('userRole'),
          'Content-Type': 'application/json'
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
      console.error("Erreur lors du chargement des demandes:", error);
      message.error('Impossible de charger l\'historique des demandes');
    } finally {
      setLoading(false);
    }
  };

  const countStatus = () => {
    const accepted = demandes.filter(d => d.statut === "ACCEPTEE" || d.statut === "LIVREE").length;
    const rejected = demandes.filter(d => d.statut === "REFUSEE" || d.statut === "RETOURNEE").length;
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
      console.error("Erreur de formatage de date:", e);
      return dateTime;
    }
  };

  const calculateResponseTime = (demande) => {
    if (!demande.dateReponse) return 'Non répondu';
    try {
      const start = new Date(demande.dateDemande);
      const end = new Date(demande.dateReponse);
      const diff = end - start;
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${days > 0 ? days + 'j ' : ''}${hours}h ${minutes}m`;
    } catch (e) {
      console.error("Erreur de calcul du temps de réponse:", e);
      return 'Erreur';
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
      const matchesStatus = !selectedStatus || 
                           demande.statut === selectedStatus || 
                           (selectedStatus === "ACCEPTEE" && demande.statut === "LIVREE") || 
                           (selectedStatus === "REFUSEE" && demande.statut === "RETOURNEE");
      
      const matchesSearch = 
        (demande.nom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (demande.prenom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (demande.centreEquipement?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (demande.nomEquipement?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesCenter = selectedCenter === 'all' || demande.villeCentre === selectedCenter;
      
      const matchesDate = dateRange.length === 0 || (
        new Date(demande.dateDemande) >= new Date(dateRange[0]) && 
        new Date(demande.dateDemande) <= new Date(dateRange[1])
      );
      
      return matchesStatus && matchesSearch && matchesCenter && matchesDate;
    });
  }, [demandes, selectedStatus, searchTerm, selectedCenter, dateRange]);

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
    Swal.fire({
      title: 'Déconnexion',
      text: 'Êtes-vous sûr de vouloir vous déconnecter?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, déconnecter',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userNom");
        localStorage.removeItem("userPrenom");
        localStorage.removeItem("userVilleCentre");
        navigate("/login");
      }
    });
  };

  const getStatusBadgeClass = (statut) => {
    if (!statut) return 'status-badge';
    const statutLower = statut.toLowerCase();
    if (statutLower.includes('accept') || statutLower.includes('livre')) return 'status-badge acceptee';
    if (statutLower.includes('refus') || statutLower.includes('retour')) return 'status-badge refusee';
    if (statutLower.includes('attente')) return 'status-badge en-attente';
    return 'status-badge';
  };

  const getResponseTimeClass = (demande) => {
    if (!demande.statut) return '';
    if (demande.statut === "ACCEPTEE" || demande.statut === "LIVREE") return 'fast';
    if (demande.statut === "REFUSEE" || demande.statut === "RETOURNEE") return 'slow';
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
                           <li className={location.pathname === '/DirecteurHome' ? 'active' : ''}>
                               <Link to="/DirecteurHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
                           </li>
                           <li className={location.pathname.includes('/DirecteurUtilisateurs') ? 'active' : ''}>
                               <Link to="/DirecteurUtilisateurs"><FaUsers /><span>Utilisateurs</span></Link>
                           </li>
                           <li className={location.pathname === '/EquipementsDirecteur' ? 'active' : ''}>
                               <Link to="/EquipementsDirecteur"><FaCogs /><span>Équipements</span></Link>
                           </li>
                           <li className={location.pathname === '/HistoriqueDemandesDirecteur' ? 'active' : ''}>
                               <Link to="/HistoriqueDemandesDirecteur"><FaClipboardList /><span>Historique Demandes</span></Link>
                           </li>
                           <li className={location.pathname === '/HistoriqueEquipementsDirecteur' ? 'active' : ''}>
                               <Link to="/HistoriqueEquipementsDirecteur"><FaHistory /><span>Historique Utilisations</span></Link>
                           </li>
                            <li className={location.pathname === '/DiagnosticsDirecteur' ? 'active' : ''}>
                                                   <Link to="/DiagnosticsDirecteur">
                                                       <FaWrench className="icon" />
                                                       <span>Diagnostics</span>
                                                   </Link>
                                               </li>
                           <li className={location.pathname === '/DirecteurHistoriqueMaintenances' ? 'active' : ''}>
                               <Link to="/DirecteurHistoriqueMaintenances"><FaWrench /><span>Historique Maintenances</span></Link>
                           </li>
                           
                       </ul>

        <div className="sidebar-bottom">
          <ul>
            <li className={location.pathname === '/accountDirecteur' ? 'active' : ''}>
              <Link to="/Account"><FaUser /><span>Compte</span></Link>
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
        <h2>Historique des Demandes - Tous les centres</h2>

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

          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <Select
              value={selectedCenter}
              onChange={setSelectedCenter}
              className="filter-select"
              style={{ width: 180 }}
            >
              <Option value="all">Tous les centres</Option>
              {centers.map((center, index) => (
                <Option key={index} value={center}>{center}</Option>
              ))}
            </Select>
          </div>

          <div className="filter-group">
            <FaCalendarAlt className="filter-icon" />
            <RangePicker
              style={{ width: 250 }}
              onChange={(dates) => setDateRange(dates ? dates.map(d => d.toISOString()) : [])}
              placeholder={['Date début', 'Date fin']}
              format="DD/MM/YYYY"
            />
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
                        Aucune demande enregistrée
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

export default HistoriqueDemandesDirecteur;