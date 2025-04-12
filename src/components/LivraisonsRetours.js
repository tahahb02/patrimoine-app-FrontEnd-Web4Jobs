import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaBars, FaTimes, FaTachometerAlt, FaCogs, FaClipboardList, FaBell, FaUser, FaSignOutAlt,
  FaSearch, FaEye, FaHistory, FaBoxOpen, FaBox, FaCheckCircle, FaArrowLeft
} from 'react-icons/fa';
import { Pagination, message } from 'antd';
import '../styles/responsable.css';

const API_URL = 'http://localhost:8080/api/demandes';

const LivraisonsRetours = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('livraisons');
  const [livraisons, setLivraisons] = useState([]);
  const [retours, setRetours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      const endpoint = activeTab === 'livraisons' 
        ? `${API_URL}/livraisons-aujourdhui` 
        : `${API_URL}/retours-aujourdhui`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
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
      const formattedData = Array.isArray(data) ? data : [];
      
      if (activeTab === 'livraisons') {
        setLivraisons(formattedData);
      } else {
        setRetours(formattedData);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      message.error("Erreur lors du chargement des données");
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

  const handleValiderLivraison = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/${id}/valider-livraison`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        message.success("Livraison validée avec succès");
        fetchData();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || "Erreur lors de la validation");
      }
    } catch (error) {
      console.error("Erreur:", error);
      message.error("Une erreur est survenue");
    }
  };

  const handleValiderRetour = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/${id}/valider-retour`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        message.success("Retour validé avec succès");
        fetchData();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || "Erreur lors de la validation");
      }
    } catch (error) {
      console.error("Erreur:", error);
      message.error("Une erreur est survenue");
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

  const currentData = activeTab === 'livraisons' ? livraisons : retours;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = currentData.slice(indexOfFirstItem, indexOfLastItem);

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
              <button onClick={handleLogout} className="logout-button">
                <FaSignOutAlt /><span>Déconnexion</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <main className="content">
        <div className="page-header">
          <h2>
            <FaBox /> Gestion des Livraisons et Retours
          </h2>
          <p className="page-description">
            Gestion des équipements à livrer et à récupérer aujourd'hui
          </p>
        </div>

        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'livraisons' ? 'active' : ''}`}
              onClick={() => {
                setCurrentPage(1);
                setActiveTab('livraisons');
              }}
            >
              <FaBoxOpen /> Livraisons aujourd'hui ({livraisons.length})
            </button>
            <button
              className={`tab ${activeTab === 'retours' ? 'active' : ''}`}
              onClick={() => {
                setCurrentPage(1);
                setActiveTab('retours');
              }}
            >
              <FaBox /> Retours aujourd'hui ({retours.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Chargement en cours...</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="demandes-table">
                <thead>
                  <tr>
                    <th>Équipement</th>
                    <th>Adhérent</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    {activeTab === 'livraisons' ? (
                      <th>Date début</th>
                    ) : (
                      <th>Date fin</th>
                    )}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.nomEquipement}</strong>
                          <div className="equipment-details">
                            {item.categorieEquipement} - {item.centreEquipement}
                          </div>
                        </td>
                        <td>
                          {item.prenom} {item.nom}
                        </td>
                        <td>{item.utilisateur?.email || 'N/A'}</td>
                        <td>{item.numeroTelephone}</td>
                        <td>
                          {activeTab === 'livraisons' 
                            ? formatDateTime(item.dateDebut)
                            : formatDateTime(item.dateFin)}
                        </td>
                        <td>
                          {activeTab === 'livraisons' ? (
                            <button
                              className="validate-button"
                              onClick={() => handleValiderLivraison(item.id)}
                              disabled={loading}
                            >
                              <FaCheckCircle /> Valider livraison
                            </button>
                          ) : (
                            <button
                              className="validate-button retour"
                              onClick={() => handleValiderRetour(item.id)}
                              disabled={loading}
                            >
                              <FaCheckCircle /> Valider retour
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">
                        {activeTab === 'livraisons' 
                          ? "Aucune livraison prévue aujourd'hui" 
                          : "Aucun retour prévu aujourd'hui"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {currentData.length > itemsPerPage && (
              <div className="pagination-container">
                <Pagination
                  current={currentPage}
                  total={currentData.length}
                  pageSize={itemsPerPage}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default LivraisonsRetours;