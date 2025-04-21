    import React, { useState } from "react";
    import { Link, useNavigate, useLocation } from "react-router-dom";
    import { FaBars, FaTimes, FaTachometerAlt, FaCogs, FaClipboardList, FaBell, FaUser, FaSignOutAlt } from "react-icons/fa";
    import "../styles/adherant.css";

    const AdherantHome = () => {
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
                        <li className={location.pathname === '/AdherantHome' ? 'active' : ''}>
                            <Link to="/AdherantHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
                        </li>
                        <li className={location.pathname === '/EquipmentDisponible' ? 'active' : ''}>
                            <Link to="/EquipmentDisponible"><FaCogs /><span>Équipements Disponibles</span></Link>
                        </li>
                        <li className={location.pathname === '/SuiviDemandeAdherant' ? 'active' : ''}>
                            <Link to="/SuiviDemandeAdherant"><FaClipboardList /><span>Suivi des Demandes</span></Link>
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
                    <h2>Bienvenue, Adhérent</h2>
                    <div className="dashboard-cards">
                        <div className="card">
                            <h3>Équipements Disponibles</h3>
                            <p>50 disponibles</p>
                        </div>
                        <div className="card">
                            <h3>Demandes en cours</h3>
                            <p>3 en attente</p>
                        </div>
                        <div className="card">
                            <h3>Notifications</h3>
                            <p>2 nouvelles</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    };

    export default AdherantHome;