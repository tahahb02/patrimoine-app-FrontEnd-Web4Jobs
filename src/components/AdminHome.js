import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaTachometerAlt, FaUsers, FaUserCog, FaBell, FaUser, FaSignOutAlt } from "react-icons/fa";
import "../styles/AdminHome.css";

const AdminHome = () => {
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
                    <li className={location.pathname === '/AdminHome' ? 'active' : ''}>
                        <Link to="/AdminHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
                    </li>
                    <li className={location.pathname === '/GererUtilisateurs' ? 'active' : ''}>
                        <Link to="/GererUtilisateurs"><FaUsers /><span>Gérer les Utilisateurs</span></Link>
                    </li>
                    <li className={location.pathname === '/GererAdherants' ? 'active' : ''}>
                        <Link to="/GererAdherants"><FaUserCog /><span>Gérer les Adhérents</span></Link>
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
                <h2>Bienvenue, Admin</h2>
                <div className="dashboard-cards">
                    <div className="card">
                        <h3>Utilisateurs</h3>
                        <p>150 utilisateurs</p>
                    </div>
                    <div className="card">
                        <h3>Adhérents</h3>
                        <p>50 adhérents</p>
                    </div>
                    <div className="card">
                        <h3>Notifications</h3>
                        <p>5 nouvelles</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminHome;