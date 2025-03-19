import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importation de useNavigate
import { FaBars, FaTimes, FaTachometerAlt, FaCogs, FaClipboardList, FaBell, FaUser, FaSignOutAlt } from "react-icons/fa";
import "../styles/ResponsableHome.css";

const ResponsableHome = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate(); // Déclarer le hook de navigation

    // Fonction de déconnexion
    const handleLogout = () => {
        // Supprimer les informations de session (par exemple, localStorage)
        localStorage.removeItem("userSession");

        // Redirection vers la page de connexion
        navigate("/", { replace: true });
    };

    return (
        <div className={`dashboard-container ${sidebarOpen ? "sidebar-expanded" : ""}`}>
            {/* Navbar */}
            <nav className="navbar">
                <div className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <FaTimes /> : <FaBars />}
                </div>
                <img src="/images/logo-light.png" alt="Logo" className="navbar-logo" />
            </nav>

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                <ul className="sidebar-menu">
                    <li>
                        <Link to="/ResponsableHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
                    </li>
                    <li>
                        <Link to="/Equipments"><FaCogs /><span>Gestion des Équipements</span></Link>
                    </li>
                    <li>
                        <Link to="/GestionDemandes"><FaClipboardList /><span>Suivi des Demandes</span></Link>
                    </li>
                    <li>
                        <Link to="/Notifications"><FaBell /><span>Notifications</span></Link>
                    </li>
                </ul>

                {/* Section en bas du sidebar */}
                <br></br><br></br><br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br><br></br>
                <div className="sidebar-bottom">
                    <ul>
                        <li>
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

            {/* Contenu principal */}
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