import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaBars, FaTimes, FaTachometerAlt, FaCogs, FaHistory,
  FaUser, FaSignOutAlt, FaSearch, FaEye, FaClock,
  FaSort, FaSortUp, FaSortDown, FaFilter, FaBuilding,
  FaChartLine, FaBoxOpen, FaPhone, FaEnvelope, FaCheckCircle
} from 'react-icons/fa';
import { Pagination, Select, Modal } from 'antd';
import Swal from 'sweetalert2';
import '../styles/responsable.css';

const { Option } = Select;

const HistoriqueEquipementsRP = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [equipments, setEquipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [historique, setHistorique] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'dateAdded', direction: 'desc' });
  const [centers, setCenters] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const API_URL = 'http://localhost:8080/api/rp/equipments/all';
  const HISTORIQUE_URL = 'http://localhost:8080/api/rp/historique-equipements';
  const CENTERS_URL = 'http://localhost:8080/api/rp/centers';

  useEffect(() => {
    fetchEquipments();
    fetchCenters();
  }, []);

  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Role': localStorage.getItem('userRole') || ''
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();
      setEquipments(data);
    } catch (error) {
      console.error("Erreur:", error);
      Swal.fire('Erreur', 'Chargement des équipements échoué', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCenters = async () => {
    try {
      const token = localStorage.getItem("token");
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
      console.error("Erreur:", error);
    }
  };

  const fetchHistorique = async (equipmentId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${HISTORIQUE_URL}/${equipmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();
      setHistorique(data);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Erreur:", error);
      Swal.fire('Erreur', 'Chargement de l\'historique échoué', 'error');
    } finally {
      setLoading(false);
    }
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

  const filteredEquipments = useMemo(() => {
    let result = [...equipments];
    
    if (selectedCenter !== 'all') {
      result = result.filter(equip => equip.villeCentre === selectedCenter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(equip => (
        equip.name.toLowerCase().includes(term) ||
        equip.category.toLowerCase().includes(term) ||
        (equip.villeCentre && equip.villeCentre.toLowerCase().includes(term))
      ));
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
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aValue = a[sortConfig.key]?.toString().toLowerCase() || '';
        const bValue = b[sortConfig.key]?.toString().toLowerCase() || '';
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
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

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <ul className="sidebar-menu">
          <li className={location.pathname === '/ResponsablePatrimoineHome' ? 'active' : ''}>
            <Link to="/ResponsablePatrimoineHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
          </li>
          <li className={location.pathname === '/EquipmentsRP' ? 'active' : ''}>
            <Link to="/EquipmentsRP"><FaCogs /><span>Gestion des Équipements</span></Link>
          </li>
          <li className={location.pathname === '/ValidationEquipementRP' ? 'active' : ''}>
            <Link to="/ValidationEquipementRP"><FaCheckCircle /><span>Validation Équipements</span></Link>
          </li>
          <li className={location.pathname === '/HistoriqueDemandesRP' ? 'active' : ''}>
            <Link to="/HistoriqueDemandesRP"><FaHistory /><span>Historique des Demandes</span></Link>
          </li>
          <li className={location.pathname === '/HistoriqueEquipementsRP' ? 'active' : ''}>
            <Link to="/HistoriqueEquipementsRP"><FaHistory /><span>Historique des Équipements</span></Link>
          </li>
          <li className={location.pathname === '/CentresRP' ? 'active' : ''}>
            <Link to="/CentresRP"><FaBuilding /><span>Gestion des Centres</span></Link>
          </li>
          <li className={location.pathname === '/AnalyticsRP' ? 'active' : ''}>
            <Link to="/AnalyticsRP"><FaChartLine /><span>Analytics</span></Link>
          </li>
        </ul>

        <div className="sidebar-bottom">
          <ul>
            <li className={location.pathname === '/accountRP' ? 'active' : ''}>
              <Link to="/accountRP"><FaUser /><span>Compte</span></Link>
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
        </div>

        {loading ? (
          <div className="loading-message">
            <p>Chargement des équipements...</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="demandes-table">
                <thead>
                  <tr>
                    <th onClick={() => requestSort('name')}>
                      <div className="sortable-header">
                        Nom
                        <span className="sort-icon">{getSortIcon('name')}</span>
                      </div>
                    </th>
                    <th onClick={() => requestSort('category')}>
                      <div className="sortable-header">
                        Catégorie
                        <span className="sort-icon">{getSortIcon('category')}</span>
                      </div>
                    </th>
                    <th onClick={() => requestSort('villeCentre')}>
                      <div className="sortable-header">
                        Centre
                        <span className="sort-icon">{getSortIcon('villeCentre')}</span>
                      </div>
                    </th>
                    <th onClick={() => requestSort('dateAdded')}>
                      <div className="sortable-header">
                        Date d'ajout
                        <span className="sort-icon">{getSortIcon('dateAdded')}</span>
                      </div>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {equipments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="no-data-message">
                        Aucun équipement enregistré
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
          </>
        )}

        <Modal
          title={`Historique d'utilisation: ${selectedEquipment?.name || ''}`}
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={800}
        >
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
                <div className="stat-card">
                  <h4>Centre</h4>
                  <p>{selectedEquipment?.villeCentre || 'N/A'}</p>
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
                            <FaClock /> {utilisation.heuresUtilisation || 0} heures
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
        </Modal>
      </main>
    </div>
  );
};

export default HistoriqueEquipementsRP;