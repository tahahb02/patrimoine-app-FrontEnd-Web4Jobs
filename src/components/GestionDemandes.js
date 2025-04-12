import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  FaExclamationTriangle,
  FaFilter,
  FaBoxOpen
} from "react-icons/fa";
import { Pagination } from 'antd';
import "../styles/responsable.css";

const API_URL = "http://localhost:8080/api/demandes";

const GestionDemandes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demandes, setDemandes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [commentaire, setCommentaire] = useState("");
  const [actionChoisie, setActionChoisie] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'dateDemande', direction: 'desc' });
  const [urgentCount, setUrgentCount] = useState(0);
  const [mediumCount, setMediumCount] = useState(0);
  const [normalCount, setNormalCount] = useState(0);
  const [lateCount, setLateCount] = useState(0);
  const [veryLateCount, setVeryLateCount] = useState(0);
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
    { value: "REFUSEE", label: "Refusée" }
  ];

  useEffect(() => {
    fetchDemandes();
  }, []);

  useEffect(() => {
    if (demandes.length > 0) {
      countUrgencyLevels();
      const { lateCount, veryLateCount } = countDelayedRequests();
      setLateCount(lateCount);
      setVeryLateCount(veryLateCount);
    }
  }, [demandes]);

  const fetchDemandes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/en-attente`, {
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
      console.error("Erreur lors du chargement des demandes:", error);
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

  const calculateDelayStatus = (dateDemande) => {
    if (!dateDemande) return 'no-delay';
    const demandeDate = new Date(dateDemande);
    const now = new Date();
    const diffHours = (now - demandeDate) / (1000 * 60 * 60);
    
    if (diffHours > 48) return 'very-late';
    if (diffHours > 24) return 'late';
    return 'no-delay';
  };

  const countDelayedRequests = () => {
    const now = new Date();
    let lateCount = 0;
    let veryLateCount = 0;

    demandes.forEach(demande => {
      if (!demande.dateDemande) return;
      const demandeDate = new Date(demande.dateDemande);
      const diffHours = (now - demandeDate) / (1000 * 60 * 60);
      
      if (diffHours > 48) veryLateCount++;
      else if (diffHours > 24) lateCount++;
    });

    return { lateCount, veryLateCount };
  };

  const getDelayBadgeClass = (dateDemande) => {
    const status = calculateDelayStatus(dateDemande);
    switch(status) {
      case 'very-late':
        return 'delay-badge very-late';
      case 'late':
        return 'delay-badge late';
      default:
        return 'delay-badge';
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
      const matchesSearch = 
        (demande.nom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (demande.prenom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (demande.centreEquipement?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesUrgency && matchesSearch;
    });
  }, [demandes, selectedStatus, selectedUrgency, searchTerm]);

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

  const handleAction = (demande, action) => {
    setSelectedDemande(demande);
    setActionChoisie(action);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setCommentaire("");
    setActionChoisie(null);
    document.body.style.overflow = 'auto';
  };

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

  const mettreAJourStatut = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/${selectedDemande.id}/statut`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
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

  const UrgencyCircle = () => {
    const total = urgentCount + mediumCount + normalCount;
    const urgentPercent = total > 0 ? (urgentCount / total) * 100 : 0;
    const mediumPercent = total > 0 ? (mediumCount / total) * 100 : 0;
    const normalPercent = total > 0 ? (normalCount / total) * 100 : 0;
  
    const getConicGradient = () => {
      if (total === 0) return '#f5f5f5';
      return `
        #f44336 0 ${urgentPercent}%,
        #ff9800 ${urgentPercent}% ${urgentPercent + mediumPercent}%,
        #4caf50 ${urgentPercent + mediumPercent}% 100%
      `;
    };
  
    return (
      <div className="stats-card">
        <div className="stats-header">
          <FaExclamationTriangle className="stats-icon" />
          <h3>Niveaux d'urgence</h3>
        </div>
        <div className="progress-circle-wrapper">
          <div 
            className="progress-circle"
            style={{ 
              background: `conic-gradient(${getConicGradient()})`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="circle-info">
              <div className="circle-value">{total}</div>
              <div className="circle-label">Total</div>
            </div>
          </div>
          <div className="stats-details">
            <div className="stat-item urgent">
              <div className="stat-value">{urgentCount}</div>
              <div className="stat-label">Urgentes</div>
              <div className="stat-percent">{urgentPercent.toFixed(1)}%</div>
            </div>
            <div className="stat-item medium">
              <div className="stat-value">{mediumCount}</div>
              <div className="stat-label">Moyennes</div>
              <div className="stat-percent">{mediumPercent.toFixed(1)}%</div>
            </div>
            <div className="stat-item normal">
              <div className="stat-value">{normalCount}</div>
              <div className="stat-label">Normales</div>
              <div className="stat-percent">{normalPercent.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const DelayCircle = () => {
    const totalDelayed = lateCount + veryLateCount;
    const totalDemandes = demandes.length;
    const onTimeCount = totalDemandes - totalDelayed;
    
    const latePercent = totalDemandes > 0 ? (lateCount / totalDemandes) * 100 : 0;
    const veryLatePercent = totalDemandes > 0 ? (veryLateCount / totalDemandes) * 100 : 0;
    const onTimePercent = totalDemandes > 0 ? (onTimeCount / totalDemandes) * 100 : 0;
  
    const getConicGradient = () => {
      if (totalDemandes === 0) return '#f5f5f5';
      return `
        #f44336 0 ${veryLatePercent}%,
        #ff9800 ${veryLatePercent}% ${veryLatePercent + latePercent}%,
        #4caf50 ${veryLatePercent + latePercent}% 100%
      `;
    };
  
    return (
      <div className="stats-card">
        <div className="stats-header">
          <FaClock className="stats-icon" />
          <h3>Délais de traitement</h3>
        </div>
        <div className="progress-circle-wrapper">
          <div 
            className="progress-circle"
            style={{ 
              background: `conic-gradient(${getConicGradient()})`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="circle-info">
              <div className="circle-value">{totalDelayed}</div>
              <div className="circle-label">En retard</div>
            </div>
          </div>
          <div className="stats-details">
            <div className="stat-item very-late">
              <div className="stat-value">{veryLateCount}</div>
              <div className="stat-label">Très en retard (+48h)</div>
              <div className="stat-percent">{veryLatePercent.toFixed(1)}%</div>
            </div>
            <div className="stat-item late">
              <div className="stat-value">{lateCount}</div>
              <div className="stat-label">En retard (+24h)</div>
              <div className="stat-percent">{latePercent.toFixed(1)}%</div>
            </div>
            <div className="stat-item on-time">
              <div className="stat-value">{onTimeCount}</div>
              <div className="stat-label">À temps</div>
              <div className="stat-percent">{onTimePercent.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
    );
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
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', padding: '10px', width: '100%', textAlign: 'left' }}>
                <FaSignOutAlt /><span>Déconnexion</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <main className="content">
        <h2>Gestion des Demandes</h2>

        <div className="stats-panels">
          <UrgencyCircle />
          <DelayCircle />
        </div>

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
                <th>Urgence</th>
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
                  <td>
                    <span className={getStatusBadgeClass(demande.statut)}>
                      {demande.statut}
                    </span>
                  </td>
                  <td className="date-cell">
                    <div className="date-with-indicator">
                      {formatDateTime(demande.dateDemande)}
                      {calculateDelayStatus(demande.dateDemande) !== 'no-delay' && (
                        <span className={getDelayBadgeClass(demande.dateDemande)}>
                          {calculateDelayStatus(demande.dateDemande) === 'very-late' 
                            ? 'Très en retard' 
                            : 'En retard'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={getUrgencyBadgeClass(demande.urgence)}>
                      {demande.urgence}
                    </span>
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
            total={sortedDemandes.length}
            pageSize={itemsPerPage}
            onChange={(page) => setCurrentPage(page)}
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
                      <span className="detail-label">Nom:</span>
                      <span className="detail-value">{selectedDetails.nom}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Prénom:</span>
                      <span className="detail-value">{selectedDetails.prenom}</span>
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
                      <span className="detail-label">Date de demande:</span>
                      <span className="detail-value">{formatDateTime(selectedDetails.dateDemande)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Statut:</span>
                      <span className={`detail-value ${getStatusBadgeClass(selectedDetails.statut)}`}>
                        {selectedDetails.statut}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Degré d'urgence:</span>
                      <span className={`detail-value ${getUrgencyBadgeClass(selectedDetails.urgence)}`}>
                        {selectedDetails.urgence}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Commentaire responsable:</span>
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