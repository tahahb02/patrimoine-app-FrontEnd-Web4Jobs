import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaBars, FaTimes, FaBell, FaUser, FaSignOutAlt, FaCheck, 
  FaArrowRight, FaHistory, FaClipboardCheck, FaStar,
  FaTachometerAlt, FaCogs, FaClipboardList, FaBoxOpen,
  FaExclamationTriangle, FaInfoCircle
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import "../styles/responsable.css";
import "../styles/adherant.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      let url = `http://localhost:8080/api/notifications/user/${userId}`;
      const params = new URLSearchParams();

      if (userRole === 'ADHERANT') {
        params.append('types', 'FEEDBACK,REPONSE');
      } else if (userRole === 'RESPONSABLE') {
        params.append('types', 'DEMANDE');
        const userCenter = localStorage.getItem('userVilleCentre');
        if (userCenter) {
          params.append('villeCentre', userCenter);
        }
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        throw new Error('Erreur lors du chargement des notifications');
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de charger les notifications',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId, navigate, userRole]);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:8080/api/notifications/${id}/marquer-lue`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setNotifications(notifications.map(notif => 
        notif.id === id ? {...notif, lue: true} : notif
      ));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const userRole = localStorage.getItem("userRole");

      let url = `http://localhost:8080/api/notifications/user/${userId}/marquer-toutes-lues`;
      const params = new URLSearchParams();

      if (userRole === 'RESPONSABLE') {
        params.append('types', 'DEMANDE');
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setNotifications(notifications.map(notif => ({
        ...notif,
        lue: true
      })));
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de marquer toutes les notifications comme lues',
        icon: 'error'
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

  const formatDate = (dateString) => {
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'FEEDBACK':
        return <FaStar className="feedback-icon" />;
      case 'REPONSE':
        return <FaCheck className="response-icon" />;
      case 'DEMANDE':
        return <FaClipboardList className="request-icon" />;
      case 'ALERTE':
        return <FaExclamationTriangle className="alert-icon" />;
      default:
        return <FaBell className="default-icon" />;
    }
  };

  const getNotificationLink = (notification) => {
    if (userRole === 'ADHERANT') {
      return notification.type === 'FEEDBACK' 
        ? `/FormulaireFeedback/${notification.relatedId || notification.id}`
        : '/MesDemandes';
    } else {
      return notification.type === 'DEMANDE' 
        ? `/demandes/${notification.relatedId || notification.id}`
        : '/GestionDemandes';
    }
  };

  const renderResponsableSidebar = () => (
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
  );

  const renderAdherantSidebar = () => (
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
      <li className={location.pathname === '/HistoriqueDemandeAdherant' ? 'active' : ''}>
        <Link to="/MesDemandes"><FaClipboardCheck /><span>Mes Demandes</span></Link>
      </li>
      <li className={location.pathname === '/Notifications' ? 'active' : ''}>
        <Link to="/Notifications"><FaBell /><span>Notifications</span></Link>
      </li>
    </ul>
  );

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-expanded' : ''}`}>
      <nav className="navbar">
        <div className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
        </div>
        <img src="/images/logo-light.png" alt="Logo" className="navbar-logo" />
      </nav>

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {userRole === 'RESPONSABLE' ? renderResponsableSidebar() : renderAdherantSidebar()}
        
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
        <div className="notifications-header">
          <h2><FaBell /> Mes Notifications</h2>
          <p>
            {userRole === 'ADHERANT' 
              ? "Retrouvez ici toutes vos notifications et demandes de feedback" 
              : "Gestion des notifications et alertes concernant les demandes des equipements"}
          </p>
          
          {notifications.length > 0 && (
            <button 
              onClick={markAllAsRead}
              className="mark-all-read-btn"
              disabled={notifications.every(n => n.lue)}
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Chargement des notifications...</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>Vous n'avez aucune notification pour le moment</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.lue ? 'read' : 'unread'} ${notification.type.toLowerCase()}`}
                  onClick={() => {
                    markAsRead(notification.id);
                    navigate(getNotificationLink(notification));
                  }}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <h3>{notification.titre}</h3>
                    <p>{notification.message}</p>
                    
                    {userRole === 'RESPONSABLE' && notification.demandeurNom && (
                      <p className="notification-meta">
                        <FaUser /> {notification.demandeurPrenom} {notification.demandeurNom}
                      </p>
                    )}
                    
                    {notification.statutDemande && (
                      <p className="notification-meta">
                        <FaInfoCircle /> Statut: {notification.statutDemande}
                      </p>
                    )}
                    
                    {notification.equipmentName && (
                      <p className="notification-meta">
                        <FaCogs /> Équipement: {notification.equipmentName}
                      </p>
                    )}
                    
                    <div className="notification-footer">
                      <span>{formatDate(notification.dateCreation)}</span>
                      {!notification.lue && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="mark-read-btn"
                          title="Marquer comme lue"
                        >
                          <FaCheck /> Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="notification-action">
                    <FaArrowRight />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;