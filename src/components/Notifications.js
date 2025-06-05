import React, { useState, useEffect } from 'react';
import NotificationDropdown from "../components/NotificationDropdown";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaBars, FaTimes, FaBell, FaUser, FaSignOutAlt, FaCheck, 
  FaArrowRight, FaHistory, FaClipboardCheck, FaStar,
  FaTachometerAlt, FaCogs, FaClipboardList
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import "../styles/adherant.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`http://localhost:8080/api/notifications/user/${userId}`, {
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

    fetchNotifications();
  }, [userId, navigate]);

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

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-expanded' : ''}`}>
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
          <li className={location.pathname === '/HistoriqueDemandeAdherant' ? 'active' : ''}>
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
        <div className="notifications-header">
          <h2><FaBell /> Mes Notifications</h2>
          <p>Retrouvez ici toutes vos notifications et demandes de feedback</p>
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
                  className={`notification-item ${notification.lue ? 'read' : 'unread'}`}
                >
                  <div className="notification-icon">
                    {notification.type === 'FEEDBACK' ? <FaStar /> : <FaBell />}
                  </div>
                  <div className="notification-content">
                    <h3>{notification.titre}</h3>
                    <p>{notification.message}</p>
                    <div className="notification-meta">
                      <span>{formatDate(notification.dateCreation)}</span>
                      {notification.equipmentName && (
                        <span>Équipement: {notification.equipmentName}</span>
                      )}
                    </div>
                  </div>
                  <div className="notification-actions">
                    {!notification.lue && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="mark-read-btn"
                        title="Marquer comme lue"
                      >
                        <FaCheck />
                      </button>
                    )}
                    <Link 
                      to={`/FormulaireFeedback/${notification.relatedId || notification.id}`} 
                      className="action-btn"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <FaArrowRight />
                    </Link>
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