import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaTachometerAlt, FaTools, FaWrench, FaHistory, FaBell, FaUser, FaSignOutAlt } from "react-icons/fa";
import "../styles/adherant.css";

const TechnicienHome = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("userSession");
        navigate("/", { replace: true });
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
                <h2>Bienvenue, Technicien</h2>
                <div className="dashboard-cards">
                    <div className="card">
                        <h3>Diagnostics à faire</h3>
                        <p>5 en attente</p>
                    </div>
                    <div className="card">
                        <h3>Équipements en réparation</h3>
                        <p>3 en cours</p>
                    </div>
                    <div className="card">
                        <h3>Notifications</h3>
                        <p>4 nouvelles</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TechnicienHome;