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
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaChartLine,
  FaCalendarAlt
} from 'react-icons/fa';
import { Pagination, Select, DatePicker } from 'antd';
import moment from 'moment';
import '../styles/responsable.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

const HistoriqueEquipementsDirecteur = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [equipments, setEquipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [historique, setHistorique] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'dateAdded', direction: 'desc' });
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('all');
  const [dateRange, setDateRange] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const API_URL = 'http://localhost:8080/api/equipments/directeur/all';
  const HISTORIQUE_URL = 'http://localhost:8080/api/equipments/directeur/historique';
  const CENTERS_URL = 'http://localhost:8080/api/rp/centers';

  useEffect(() => {
    fetchEquipments();
    fetchCenters();
  }, []);

  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Role': localStorage.getItem('userRole') || 'DIRECTEUR'
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
      setEquipments(data);
    } catch (error) {
      console.error("Erreur lors du chargement des équipements:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCenters = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(CENTERS_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();
      setCenters(data);
    } catch (error) {
      console.error("Erreur lors du chargement des centres:", error);
    }
  };

  const fetchHistorique = async (equipmentId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      let url = `${HISTORIQUE_URL}/${equipmentId}`;
      
      if (dateRange.length === 2) {
        const startDate = moment(dateRange[0]).format('YYYY-MM-DD');
        const endDate = moment(dateRange[1]).format('YYYY-MM-DD');
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Role': localStorage.getItem('userRole') || 'DIRECTEUR'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setHistorique(data);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
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
    let result = [...equipments];
    
    if (selectedCenter !== 'all') {
      result = result.filter(equip => equip.villeCentre === selectedCenter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(equip => 
        equip.name.toLowerCase().includes(term) ||
        equip.category.toLowerCase().includes(term) ||
        (equip.villeCentre && equip.villeCentre.toLowerCase().includes(term))
      );
    }
    
    return result;
  }, [equipments, selectedCenter, searchTerm]);

  const sortedEquipments = useMemo(() => {
    const sortableItems = [...filteredEquipments];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
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
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', padding: '10px', width: '100%', textAlign: 'left' }}>
                <FaSignOutAlt /><span>Déconnexion</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <main className="content">
        <h2>Historique d'Utilisation des Équipements - Tous les centres</h2>

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
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <Select
              className="filter-select"
              value={selectedCenter}
              onChange={(value) => setSelectedCenter(value)}
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
              style={{ width: '250px' }}
              onChange={(dates) => setDateRange(dates ? dates.map(d => d.toISOString()) : [])}
              placeholder={['Date début', 'Date fin']}
              format="DD/MM/YYYY"
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
                    {loading ? 'Chargement...' : 'Aucun équipement enregistré'}
                  </td>
                </tr>
              ) : currentEquipments.length > 0 ? (
                currentEquipments.map((equipment) => (
                  <tr key={equipment.id}>
                    <td>{equipment.name}</td>
                    <td>{equipment.category}</td>
                    <td>{equipment.villeCentre}</td>
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
              
              <div className="date-filter-container">
                <RangePicker
                  onChange={(dates) => {
                    setDateRange(dates ? dates.map(d => d.toISOString()) : []);
                    fetchHistorique(selectedEquipment.id);
                  }}
                  placeholder={['Date début', 'Date fin']}
                  format="DD/MM/YYYY"
                />
              </div>
              
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
                            <th>Centre</th>
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
                              <td>{utilisation.villeCentre || 'N/A'}</td>
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

export default HistoriqueEquipementsDirecteur;