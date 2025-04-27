import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaBars, FaTimes, FaTachometerAlt, FaCogs, FaClipboardList,
  FaBell, FaUser, FaSignOutAlt, FaSearch, FaHistory,
  FaPhone, FaEnvelope, FaClock, FaSort, FaSortUp, FaSortDown, FaBoxOpen
} from 'react-icons/fa';
import { Pagination } from 'antd';
import '../styles/responsable.css';

const API_URL = 'http://localhost:8080/api/equipments';
const HISTORIQUE_URL = 'http://localhost:8080/api/historique-equipements';

const HistoriqueEquipements = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [equipments, setEquipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [historique, setHistorique] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'dateAdded', direction: 'desc' });
  const [userCenter, setUserCenter] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const center = localStorage.getItem('userVilleCentre');
    if (center) {
      setUserCenter(center);
      fetchEquipments(center);
    }
  }, []);

  const fetchEquipments = async (villeCentre) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}`, {
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
      // Filtrer les équipements par centre côté client
      const filteredData = data.filter(equip => equip.villeCentre === villeCentre);
      setEquipments(filteredData);
    } catch (error) {
      console.error("Erreur lors du chargement des équipements:", error);
    }
  };

  const fetchHistorique = async (equipmentId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${HISTORIQUE_URL}/${equipmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Center': userCenter,
          'X-User-Role': localStorage.getItem('userRole')
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setHistorique(data);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
      setHistorique(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userVilleCentre");
    navigate("/login");
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const filteredEquipments = useMemo(() => {
    return equipments.filter(equipment =>
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (equipment.villeCentre && equipment.villeCentre.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [equipments, searchTerm]);

  const sortedEquipments = useMemo(() => {
    const sortableItems = [...filteredEquipments];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        // Tri pour les dates
        if (sortConfig.key === 'dateAdded') {
          const aValue = new Date(a[sortConfig.key]);
          const bValue = new Date(b[sortConfig.key]);
          
          if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
        
        // Tri standard pour les autres champs
        const aValue = a[sortConfig.key]?.toString().toLowerCase() || '';
        const bValue = b[sortConfig.key]?.toString().toLowerCase() || '';
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredEquipments, sortConfig]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEquipments = sortedEquipments.slice(indexOfFirstItem, indexOfLastItem);

  const calculateTotalHeures = () => {
    if (!historique || !historique.utilisations) return 0;
    return historique.utilisations.reduce((total, utilisation) => {
      return total + (utilisation.heuresUtilisation || 0);
    }, 0);
  };

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-expanded' : ''}`}>
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
        <h2>Historique d'Utilisation des Équipements</h2>
        <p className="center-info">
          Vous visualisez les équipements du centre : <strong>{userCenter}</strong>
        </p>

        <div className="search-and-filters">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par nom, catégorie ou centre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="demandes-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('name')}>
                  <div className="sortable-header">
                    Nom
                    <span className="sort-icon">
                      {getSortIcon('name')}
                    </span>
                  </div>
                </th>
                <th onClick={() => requestSort('category')}>
                  <div className="sortable-header">
                    Catégorie
                    <span className="sort-icon">
                      {getSortIcon('category')}
                    </span>
                  </div>
                </th>
                <th onClick={() => requestSort('villeCentre')}>
                  <div className="sortable-header">
                    Centre
                    <span className="sort-icon">
                      {getSortIcon('villeCentre')}
                    </span>
                  </div>
                </th>
                <th onClick={() => requestSort('dateAdded')}>
                  <div className="sortable-header">
                    Date d'ajout
                    <span className="sort-icon">
                      {getSortIcon('dateAdded')}
                    </span>
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data-message">
                    Aucun équipement enregistré dans ce centre
                  </td>
                </tr>
              ) : currentEquipments.length > 0 ? (
                currentEquipments.map((equipment) => (
                  <tr key={equipment.id}>
                    <td>{equipment.name}</td>
                    <td>{equipment.category}</td>
                    <td>{equipment.villeCentre || equipment.center}</td>
                    <td className="date-cell">{formatDate(equipment.dateAdded)}</td>
                    <td>
                      <button
                        className={`view-button ${loading && selectedEquipment?.id === equipment.id ? 'loading' : ''}`}
                        onClick={() => {
                          setSelectedEquipment(equipment);
                          fetchHistorique(equipment.id);
                        }}
                        disabled={loading && selectedEquipment?.id === equipment.id}
                      >
                        <FaHistory /> {loading && selectedEquipment?.id === equipment.id ? 'Chargement...' : 'Voir historique'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data-message">
                    Aucun équipement ne correspond à votre recherche
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {sortedEquipments.length > itemsPerPage && (
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              total={sortedEquipments.length}
              pageSize={itemsPerPage}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        )}

        {selectedEquipment && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close" onClick={() => setSelectedEquipment(null)}>
                &times;
              </button>
              <h3>Historique d'utilisation: {selectedEquipment.name}</h3>
              
              {loading ? (
                <div className="loading-message">
                  <p>Chargement de l'historique...</p>
                </div>
              ) : historique ? (
                <div className="details-content">
                  <div className="stats-container">
                    <div className="stat-card">
                      <h4>Total d'utilisations</h4>
                      <p>{historique.totalUtilisations || 0}</p>
                    </div>
                    <div className="stat-card">
                      <h4>Total heures d'utilisation</h4>
                      <p>{calculateTotalHeures()} heures</p>
                    </div>
                  </div>

                  {historique.utilisations && historique.utilisations.length > 0 ? (
                    <div className="historique-table-container">
                      <table className="historique-table">
                        <thead>
                          <tr>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Heures d'utilisation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historique.utilisations.map((utilisation, index) => (
                            <tr key={index}>
                              <td>{utilisation.nom}</td>
                              <td>{utilisation.prenom}</td>
                              <td>
                                <a href={`mailto:${utilisation.email}`}>
                                  <FaEnvelope /> {utilisation.email}
                                </a>
                              </td>
                              <td>
                                <a href={`tel:${utilisation.telephone}`}>
                                  <FaPhone /> {utilisation.telephone}
                                </a>
                              </td>
                              <td>
                                <FaClock /> {utilisation.heuresUtilisation} heures
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="no-history-message">
                      <p>Aucune utilisation enregistrée pour cet équipement.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-history-message">
                  <p>Impossible de charger l'historique pour cet équipement.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoriqueEquipements;