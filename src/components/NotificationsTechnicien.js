import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaBell, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, 
  FaSearch, FaSort, FaSortUp,FaSignOutAlt,FaUser,FaHistory,FaWrench,FaTools,FaTachometerAlt,FaTimes,FaBars, FaSortDown 
} from 'react-icons/fa';
import { Pagination } from 'antd';
import "../styles/responsable.css";

const NotificationsTechnicien = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const navigate = useNavigate();
    const location = useLocation();
    const userVilleCentre = localStorage.getItem("userVilleCentre");

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 800));
                
                const simulatedNotifications = [
                    {
                        id: 1,
                        type: 'URGENT',
                        message: 'PC-0245 en surchauffe critique',
                        date: new Date(),
                        read: false
                    },
                    {
                        id: 2,
                        type: 'INFO',
                        message: 'Nouveau diagnostic disponible pour Projecteur-012',
                        date: new Date(Date.now() - 3600000),
                        read: true
                    },
                    {
                        id: 3,
                        type: 'SUCCESS',
                        message: 'Maintenance PC-0245 terminée avec succès',
                        date: new Date(Date.now() - 86400000),
                        read: true
                    }
                ];
                
                setNotifications(simulatedNotifications);
                setLoading(false);
            } catch (error) {
                console.error("Erreur lors de la récupération des notifications:", error);
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userVilleCentre");
        navigate("/login");
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(notif => 
            notif.id === id ? { ...notif, read: true } : notif
        ));
    };

    const getIconForType = (type) => {
        switch(type) {
            case 'URGENT': return <FaExclamationTriangle className="urgent-icon" />;
            case 'INFO': return <FaInfoCircle className="info-icon" />;
            case 'SUCCESS': return <FaCheckCircle className="success-icon" />;
            default: return <FaBell />;
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

    const filteredNotifications = notifications.filter(notification =>
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedNotifications = [...filteredNotifications].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentNotifications = sortedNotifications.slice(indexOfFirstItem, indexOfLastItem);

    const formatDate = (date) => {
        return date.toLocaleDateString() + ' à ' + date.toLocaleTimeString();
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
                    <li className={location.pathname === '/TechnicienHome' ? 'active' : ''}>
                        <Link to="/TechnicienHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
                    </li>
                    <li className={location.pathname === '/DiagnostiqueEquipements' ? 'active' : ''}>
                        <Link to="/DiagnostiqueEquipements"><FaTools /><span>Diagnostique Équipements</span></Link>
                    </li>
                    <li className={location.pathname === '/EquipementReparation' ? 'active' : ''}>
                        <Link to="/EquipementReparation"><FaWrench /><span>Équipements en Réparation</span></Link>
                    </li>
                    <li className={location.pathname === '/HistoriqueReparations' ? 'active' : ''}>
                        <Link to="/HistoriqueReparations"><FaHistory /><span>Historique des Réparations</span></Link>
                    </li>
                    <li className={location.pathname === '/NotificationsTechnicien' ? 'active' : ''}>
                        <Link to="/NotificationsTechnicien"><FaBell /><span>Notifications</span></Link>
                    </li>
                </ul>

                <div className="sidebar-bottom">
                    <ul>
                        <li className={location.pathname === '/account-technicien' ? 'active' : ''}>
                            <Link to="/account-technicien"><FaUser /><span>Compte</span></Link>
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
                <h2><FaBell /> Notifications</h2>
                <p className="center-info">
                    Centre : <strong>{userVilleCentre}</strong>
                </p>

                <div className="search-and-filters">
                    <div className="search-bar">
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Rechercher une notification..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table className="demandes-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th onClick={() => requestSort('message')}>
                                    <div className="sortable-header">
                                        Message
                                        <span className="sort-icon">
                                            {getSortIcon('message')}
                                        </span>
                                    </div>
                                </th>
                                <th onClick={() => requestSort('date')}>
                                    <div className="sortable-header">
                                        Date
                                        <span className="sort-icon">
                                            {getSortIcon('date')}
                                        </span>
                                    </div>
                                </th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="loading">Chargement en cours...</td>
                                </tr>
                            ) : currentNotifications.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="no-data-message">
                                        Aucune notification pour le moment
                                    </td>
                                </tr>
                            ) : (
                                currentNotifications.map(notification => (
                                    <tr key={notification.id}>
                                        <td>
                                            <div className="notification-icon">
                                                {getIconForType(notification.type)}
                                            </div>
                                        </td>
                                        <td>{notification.message}</td>
                                        <td className="date-cell">
                                            {formatDate(notification.date)}
                                        </td>
                                        <td>
                                            {notification.read ? (
                                                <span className="badge read-badge">Lu</span>
                                            ) : (
                                                <span className="badge unread-badge">Non lu</span>
                                            )}
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-primary"
                                                onClick={() => markAsRead(notification.id)}
                                                disabled={notification.read}
                                            >
                                                Marquer comme lu
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredNotifications.length > itemsPerPage && (
                    <div className="pagination-container">
                        <Pagination
                            current={currentPage}
                            total={filteredNotifications.length}
                            pageSize={itemsPerPage}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default NotificationsTechnicien;