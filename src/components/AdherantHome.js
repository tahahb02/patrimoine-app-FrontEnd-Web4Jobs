import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importation de useNavigate
import { FaBars, FaTimes, FaTachometerAlt, FaCogs, FaClipboardList, FaBell, FaUser, FaSignOutAlt } from "react-icons/fa";
import "../styles/ResponsableHome.css"; // Utilisation du même fichier CSS

const AdherantHome = () => {
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
                    <li><Link to="/AdherantHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link></li>
                    <li><Link to="/EquipmentDisponible"><FaCogs /><span>Équipements Disponibles</span></Link></li>
                    <li><Link to="/suivi-demandes"><FaClipboardList /><span>Suivi des Demandes</span></Link></li>
                    <li><Link to="/notifications"><FaBell /><span>Notifications</span></Link></li>
                    
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