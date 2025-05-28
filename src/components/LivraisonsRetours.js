import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaBars, FaTimes, FaTachometerAlt, FaCogs, FaClipboardList, FaBell, FaUser, FaSignOutAlt,
  FaSearch, FaEye, FaHistory, FaBoxOpen, FaBox, FaCheckCircle, FaArrowLeft
} from 'react-icons/fa';
import { Pagination } from 'antd';
import Swal from 'sweetalert2';
import '../styles/responsable.css';

const API_URL = 'http://localhost:8080/api/demandes';

const LivraisonsRetours = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('livraisons');
  const [livraisons, setLivraisons] = useState([]);
  const [retours, setRetours] = useState([]);
  const [loading, setLoading] = useState({
    livraisons: false,
    retours: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [userCenter, setUserCenter] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const userVilleCentre = localStorage.getItem("userVilleCentre");

  useEffect(() => {
    const center = localStorage.getItem('userVilleCentre');
    if (center) {
      setUserCenter(center);
      fetchLivraisons(center);
      fetchRetours(center);
    }
  }, []);

  const fetchLivraisons = async (villeCentre) => {
    setLoading(prev => ({...prev, livraisons: true}));
    try {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("userRole");
      
      if (!token) {
        navigate("/login");
        return;
      }
      
      const response = await fetch(`${API_URL}/livraisons-aujourdhui/${villeCentre}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Center': villeCentre,
          'X-User-Role': userRole
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          await Swal.fire({
            title: 'Session expirée',
            text: 'Votre session a expiré. Veuillez vous reconnecter.',
            icon: 'warning',
            confirmButtonText: 'OK'
          });
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setLivraisons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur lors du chargement des livraisons:", error);
      await Swal.fire({
        title: 'Erreur',
        text: 'Une erreur est survenue lors du chargement des livraisons',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(prev => ({...prev, livraisons: false}));
    }
  };

  const fetchRetours = async (villeCentre) => {
    setLoading(prev => ({...prev, retours: true}));
    try {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("userRole");
      
      if (!token) {
        navigate("/login");
        return;
      }
      
      const response = await fetch(`${API_URL}/retours-aujourdhui/${villeCentre}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Center': villeCentre,
          'X-User-Role': userRole
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          await Swal.fire({
            title: 'Session expirée',
            text: 'Votre session a expiré. Veuillez vous reconnecter.',
            icon: 'warning',
            confirmButtonText: 'OK'
          });
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setRetours(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur lors du chargement des retours:", error);
      await Swal.fire({
        title: 'Erreur',
        text: 'Une erreur est survenue lors du chargement des retours',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(prev => ({...prev, retours: false}));
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
    const result = await Swal.fire({
      title: 'Confirmer la validation',
      text: 'Êtes-vous sûr de vouloir valider cette livraison ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, valider',
      cancelButtonText: 'Annuler'
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const villeCentre = localStorage.getItem('userVilleCentre');
      const userRole = localStorage.getItem('userRole');
      
      const response = await fetch(`${API_URL}/${id}/valider-livraison`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Center': villeCentre,
          'X-User-Role': userRole,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await Swal.fire({
          title: 'Succès',
          text: 'Livraison validée avec succès',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        fetchLivraisons(villeCentre);
      } else {
        const errorData = await response.json();
        await Swal.fire({
          title: 'Erreur',
          text: errorData.message || "Erreur lors de la validation",
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
      await Swal.fire({
        title: 'Erreur',
        text: 'Une erreur est survenue',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

 const handleValiderRetour = async (id) => {
  const result = await Swal.fire({
    title: 'Confirmer la validation',
    text: 'Êtes-vous sûr de vouloir valider ce retour ? Un formulaire de feedback sera envoyé à l\'adhérent.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Oui, valider',
    cancelButtonText: 'Annuler'
  });

  if (!result.isConfirmed) return;

  try {
    const token = localStorage.getItem("token");
    const villeCentre = localStorage.getItem('userVilleCentre');
    const userRole = localStorage.getItem('userRole');
    
    // 1. Valider le retour
    const validationResponse = await fetch(`${API_URL}/${id}/valider-retour`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Center': villeCentre,
        'X-User-Role': userRole,
        'Content-Type': 'application/json'
      }
    });
    
    if (validationResponse.ok) {
      // 2. Envoyer le formulaire de feedback
      const demande = retours.find(d => d.id === id);
      if (demande) {
        await fetch('http://localhost:8080/api/notifications/feedback', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: demande.utilisateur.id,
            equipmentId: demande.idEquipement,
            equipmentName: demande.nomEquipement,
            dateUtilisation: demande.dateDebut,
            demandeId: demande.id
          })
        });
      }

      await Swal.fire({
        title: 'Succès',
        text: 'Retour validé avec succès et feedback envoyé',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      fetchRetours(villeCentre);
    } else {
      const errorData = await validationResponse.json();
      await Swal.fire({
        title: 'Erreur',
        text: errorData.message || "Erreur lors de la validation",
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  } catch (error) {
    console.error("Erreur:", error);
    await Swal.fire({
      title: 'Erreur',
      text: 'Une erreur est survenue',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
};

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Déconnexion',
      text: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, déconnecter',
      cancelButtonText: 'Annuler'
    });

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
  };

  const currentData = activeTab === 'livraisons' ? livraisons : retours;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = currentData.slice(indexOfFirstItem, indexOfLastItem);

  const isLoading = activeTab === 'livraisons' ? loading.livraisons : loading.retours;

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
            <FaBox /> Gestion des Livraisons et Retours - Centre {userVilleCentre}
          </h2>
          <p className="page-description">
            Gestion des équipements à livrer et à récupérer aujourd'hui pour le centre: <strong>{userCenter}</strong>
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
              <FaBoxOpen /> Livraisons aujourd'hui
              <span className={`count-badge ${livraisons.length === 0 ? 'zero' : ''}`}>
                {livraisons.length}
              </span>
            </button>
            <button
              className={`tab ${activeTab === 'retours' ? 'active' : ''}`}
              onClick={() => {
                setCurrentPage(1);
                setActiveTab('retours');
              }}
            >
              <FaBox /> Retours aujourd'hui
              <span className={`count-badge retour ${retours.length === 0 ? 'zero' : ''}`}>
                {retours.length}
              </span>
            </button>
          </div>
        </div>

        {isLoading ? (
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
                              disabled={loading.livraisons}
                            >
                              <FaCheckCircle /> Valider livraison
                            </button>
                          ) : (
                            <button
                              className="validate-button retour"
                              onClick={() => handleValiderRetour(item.id)}
                              disabled={loading.retours}
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
                          ? `Aucune livraison prévue aujourd'hui pour le centre ${userCenter}` 
                          : `Aucun retour prévu aujourd'hui pour le centre ${userCenter}`}
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