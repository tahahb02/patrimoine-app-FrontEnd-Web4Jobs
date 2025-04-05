import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaTachometerAlt, FaCogs, FaClipboardList, FaBell, FaUser, FaSignOutAlt, FaHistory } from "react-icons/fa";
import "../styles/responsable.css";

const ResponsableHome = () => {
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
                    <li className={location.pathname === '/ResponsableHome' ? 'active' : ''}>
                        <Link to="/ResponsableHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
                    </li>
                    <li className={location.pathname === '/Equipments' ? 'active' : ''}>
                        <Link to="/Equipments"><FaCogs /><span>Gestion des Équipements</span></Link>
                    </li>
                    <li className={location.pathname === '/GestionDemandes' ? 'active' : ''}>
                        <Link to="/GestionDemandes"><FaClipboardList /><span>Gestion des Demandes</span></Link>
                    </li>
                    <li className={location.pathname === '/HistoriqueDemandes' ? 'active' : ''}>
                        <Link to="/HistoriqueDemandes"><FaHistory /><span>Historique des Demandes</span></Link>
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
                <h2>Bienvenue, Responsable du Centre</h2>
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