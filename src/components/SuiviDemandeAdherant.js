import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  FaSort,
  FaSortUp,
  FaSortDown,
  FaExclamationTriangle
} from "react-icons/fa";
import { Pagination, Spin, Alert } from "antd";
import "../styles/SuiviDemandeAdherant.css";

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
  const location = useLocation();
  const navigate = useNavigate();

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

      const response = await fetch(`${API_URL}/utilisateur/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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
      
      if (!Array.isArray(data)) {
        throw new Error("Format de données invalide reçu du serveur");
      }

      setDemandes(data);
    } catch (err) {
      console.error("Erreur lors du chargement des demandes:", err);
      setError(err.message || "Erreur lors de la récupération des données");
    } finally {
      setLoading(false);
    }
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
      return 'Format invalide';
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

  const sortedDemandes = useMemo(() => {
    const sortableDemandes = [...demandes];
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
  }, [demandes, sortConfig]);

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
    if (statutLower.includes('accept')) return 'status-badge acceptee';
    if (statutLower.includes('refus')) return 'status-badge refusee';
    return 'status-badge en_attente';
  };

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

        {demandes.length === 0 ? (
          <div className="no-data-message">
            <p>Aucune demande trouvée.</p>
            <Link to="/EquipmentDisponible" className="new-request-link">
              Faire une nouvelle demande
            </Link>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="demandes-table">
                <thead>
                  <tr>
                    <th>Équipement</th>
                    <th>Centre</th>
                    <th>Statut</th>
                    <th>Commentaire</th>
                    <th onClick={() => requestSort('dateDemande')}>
                      <div className="sortable-header">
                        Date Demande
                        <span className="sort-icon">
                          {getSortIcon('dateDemande')}
                        </span>
                      </div>
                    </th>
                    <th>Détails</th>
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
                      <td>{demande.commentaireResponsable || 'Aucun commentaire'}</td>
                      <td className="date-cell">{formatDateTime(demande.dateDemande)}</td>
                      <td>
                        <button
                          className="details-button"
                          onClick={() => handleDetails(demande)}
                          aria-label="Voir détails"
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
              <h3>Détails de la demande</h3>
              <div className="details-content">
                <div className="detail-row">
                  <span className="detail-label">Équipement :</span>
                  <span className="detail-value">{selectedDetails.nomEquipement || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Centre :</span>
                  <span className="detail-value">{selectedDetails.centreEquipement || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Catégorie :</span>
                  <span className="detail-value">{selectedDetails.categorieEquipement || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Statut :</span>
                  <span className={`detail-value ${getStatusBadgeClass(selectedDetails.statut)}`}>
                    {selectedDetails.statut || 'EN_ATTENTE'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Commentaire :</span>
                  <span className="detail-value">{selectedDetails.commentaireResponsable || 'Aucun commentaire'}</span>
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
                  <span className="detail-label">Remarques :</span>
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

export default SuiviDemandeAdherant;