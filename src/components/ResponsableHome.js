import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaTachometerAlt, FaCogs, FaClipboardList, FaBell, FaUser, FaSignOutAlt, FaHistory, FaBoxOpen } from "react-icons/fa";
import "../styles/responsable.css";

const ResponsableHome = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Récupérer les données utilisateur depuis localStorage
        const userNom = localStorage.getItem("userNom");
        const userPrenom = localStorage.getItem("userPrenom");
        const userVilleCentre = localStorage.getItem("userVilleCentre");
        
        if (userNom && userPrenom && userVilleCentre) {
            setUserData({
                nom: userNom,
                prenom: userPrenom,
                villeCentre: userVilleCentre
            });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userNom");
        localStorage.removeItem("userPrenom");
        localStorage.removeItem("userVilleCentre");
        navigate("/login");
    };

    const formatVilleCentre = (ville) => {
        if (!ville) return "";
        return ville.charAt(0) + ville.slice(1).toLowerCase().replace(/_/g, " ");
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
                <h2>
                    Bienvenue, {userData?.prenom} {userData?.nom}<br />
                    <span className="welcome-subtitle">Responsable du centre {formatVilleCentre(userData?.villeCentre)}</span>
                </h2>
                <div className="dashboard-cards">
                    <div className="card">
                        <h3>Équipements</h3>
                        <p>120 enregistrés</p>
                    </div>
                    <div className="card">
                        <h3>Demandes en attente</h3>
                        <p>5 nouvelles</p>
                    </div>
                    <div className="card">
                        <h3>Notifications</h3>
                        <p>3 alertes</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ResponsableHome;