import React, { useState, useEffect, useMemo } from "react";
import NotificationDropdown from "../components/NotificationDropdown";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars, FaTimes, FaTachometerAlt, FaClipboardList, FaBell,
  FaUser, FaSignOutAlt, FaEye, FaCogs, FaSort, FaSortUp,
  FaSortDown, FaFilter, FaCalendarAlt, FaClipboardCheck,
  FaInfoCircle, FaCheckCircle, FaTimesCircle, FaTruck, FaClock, FaBoxOpen
} from "react-icons/fa";
import { Pagination, Spin, Alert, message, DatePicker } from "antd";
import dayjs from "dayjs";
import "../styles/adherant.css";

const API_URL = "http://localhost:8080/api/demandes";

const MesDemandes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [sortConfig, setSortConfig] = useState({ key: 'dateDemande', direction: 'desc' });
  const [selectedStatus, setSelectedStatus] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const { RangePicker } = DatePicker;

  const statusOptions = [
    { value: "", label: "Tous les statuts" },
    { value: "ACCEPTEE", label: "Acceptées" },
    { value: "REJETEE", label: "Refusées" },
    { value: "LIVREE", label: "Livrées" },
    { value: "RETOURNEE", label: "Retournées" },
    { value: "EN_ATTENTE", label: "En attente" },
    { value: "EN_COURS", label: "En cours" },
    { value: "ANNULEE", label: "Annulées" }
  ];

  useEffect(() => {
    fetchDemandes();
  }, []);

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

  const getStatusTag = (statut) => {
    if (!statut) return <span className="status-tag">Inconnu</span>;
    
    const statusConfig = {
      'ACCEPTEE': { 
        icon: <FaCheckCircle className="tag-icon" />,
        text: 'Acceptée' 
      },
      'REJETEE': { 
        icon: <FaTimesCircle className="tag-icon" />,
        text: 'Refusée' 
      },
      'LIVREE': { 
        icon: <FaTruck className="tag-icon" />,
        text: 'Livrée' 
      },
      'RETOURNEE': { 
        icon: <FaBoxOpen className="tag-icon" />,
        text: 'Retournée' 
      },
      'EN_ATTENTE': { 
        icon: <FaClock className="tag-icon" />,
        text: 'En attente' 
      },
      'EN_COURS': {
        icon: <FaCogs className="tag-icon" />,
        text: 'En cours'
      },
      'ANNULEE': {
        icon: <FaTimes className="tag-icon" />,
        text: 'Annulée'
      }
    };

    const config = statusConfig[statut] || { 
      icon: <FaInfoCircle className="tag-icon" />,
      text: statut 
    };

    return (
      <span className={`status-tag status-tag-${statut}`}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  const filteredDemandes = useMemo(() => {
    return demandes.filter(demande => {
      const matchesStatus = !selectedStatus || demande.statut === selectedStatus;
      
      let matchesDate = true;
      if (dateRange && dateRange.length === 2) {
        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');
        const demandeDate = dayjs(demande.dateDemande);
        matchesDate = demandeDate.isAfter(startDate) && demandeDate.isBefore(endDate);
      }
      
      return matchesStatus && matchesDate;
    });
  }, [demandes, selectedStatus, dateRange]);

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

  const handleDateChange = (dates) => {
    setDateRange(dates);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Chargement de l'historique..." />
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
        <NotificationDropdown />
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
          <li className={location.pathname === '/MesDemandes' ? 'active' : ''}>
            <Link to="/MesDemandes"><FaClipboardCheck /><span>Mes Demandes</span></Link>
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
        <div className="page-header">
          <h2>Mes Demandes</h2>
          <p className="page-description">
            Historique complet de toutes vos demandes d'équipements
          </p>
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
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
            <FaCalendarAlt className="filter-icon" />
            <RangePicker
              onChange={handleDateChange}
              format="DD/MM/YYYY"
              placeholder={['Date début', 'Date fin']}
              className="date-picker"
            />
          </div>
        </div>

        {filteredDemandes.length === 0 ? (
          <div className="no-data-message">
            <div className="empty-state">
              <h3>Aucune demande trouvée</h3>
              <p>Aucune demande ne correspond aux filtres sélectionnés.</p>
              {selectedStatus || dateRange.length > 0 ? (
                <button 
                  onClick={() => {
                    setSelectedStatus("");
                    setDateRange([]);
                  }}
                  className="clear-filters-button"
                >
                  Effacer les filtres
                </button>
              ) : (
                <Link to="/EquipmentDisponible" className="new-request-link">
                  <FaCogs /> Faire une nouvelle demande
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <div className="table-container">
                <table className="demandes-table">
                  <thead className="table-header-fixed">
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
                      <th onClick={() => requestSort('dateDemande')}>
                        <div className="sortable-header">
                          <FaCalendarAlt /> Date demande
                          <span className="sort-icon">
                            {getSortIcon('dateDemande')}
                          </span>
                        </div>
                      </th>
                      <th onClick={() => requestSort('dateReponse')}>
                        <div className="sortable-header">
                          <FaCalendarAlt /> Date réponse
                          <span className="sort-icon">
                            {getSortIcon('dateReponse')}
                          </span>
                        </div>
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body-scroll">
                    {currentDemandes.map((demande) => (
                      <tr key={demande.id} className={`status-${demande.statut.toLowerCase()}`}>
                        <td className="equipment-cell">
                          <div className="equipment-name">{demande.nomEquipement || 'N/A'}</div>
                          <div className="equipment-id">ID: {demande.idEquipement || 'N/A'}</div>
                        </td>
                        <td>{demande.centreEquipement || 'N/A'}</td>
                        <td>
                          <div className="status-cell">
                            {getStatusTag(demande.statut)}
                          </div>
                        </td>
                        <td>{formatDateTime(demande.dateDemande)}</td>
                        <td>{formatDateTime(demande.dateReponse) || 'En attente'}</td>
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
                  <span className="detail-value">
                    {getStatusTag(selectedDetails.statut)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date de demande:</span>
                  <span className="detail-value">{formatDateTime(selectedDetails.dateDemande)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date de réponse:</span>
                  <span className="detail-value">{formatDateTime(selectedDetails.dateReponse) || 'En attente'}</span>
                </div>
                {selectedDetails.statut === "REJETEE" && (
                  <div className="detail-item full-width">
                    <span className="detail-label">Motif du refus:</span>
                    <span className="detail-value">{selectedDetails.commentaireResponsable || 'Aucun commentaire'}</span>
                  </div>
                )}
                {selectedDetails.statut === "ACCEPTEE" && (
                  <>
                    <div className="detail-item">
                      <span className="detail-label">Date de début:</span>
                      <span className="detail-value">{formatDateTime(selectedDetails.dateDebut)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Date de fin:</span>
                      <span className="detail-value">{formatDateTime(selectedDetails.dateFin)}</span>
                    </div>
                  </>
                )}
                <div className="detail-item full-width">
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

export default MesDemandes;