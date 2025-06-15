import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaBars, FaTimes, FaTachometerAlt, FaTools, FaWrench, 
  FaHistory, FaBell, FaUser, FaSignOutAlt, FaCogs,FaCheckCircle 
} from "react-icons/fa";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import "../styles/responsable.css";

Chart.register(...registerables);

const TechnicienHome = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({
        diagnostics: 0,
        repairs: 0,
        maintenance: 0,
        centerStats: {}
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userNom = localStorage.getItem("userNom");
        const userPrenom = localStorage.getItem("userPrenom");
        const userVilleCentre = localStorage.getItem("userVilleCentre");
        
        if (userNom && userPrenom && userVilleCentre) {
            setUserData({
                nom: userNom,
                prenom: userPrenom,
                villeCentre: userVilleCentre
            });
            fetchStatistics(userVilleCentre);
        }
    }, []);

    const fetchStatistics = async (center) => {
        try {
            const response = await axios.get(`/api/statistics/technician/${center}`);
            setStats(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching statistics:", error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userVilleCentre");
        navigate("/login");
    };

    const formatVilleCentre = (ville) => {
        if (!ville) return "";
        return ville.charAt(0) + ville.slice(1).toLowerCase().replace(/_/g, " ");
    };

    const diagnosticsData = {
        labels: ['À faire', 'En cours', 'Terminés'],
        datasets: [
            {
                label: 'Diagnostics',
                data: [
                    stats.diagnostics,
                    stats.centerStats.diagnosticsInProgress || 0,
                    stats.centerStats.diagnosticsCompleted || 0
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }
        ]
    };

    const repairsData = {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [
            {
                label: 'Réparations',
                data: [2, 3, 1, 4, 2, 0, 1],
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }
        ]
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
                <h2>
                    Bienvenue, {userData?.prenom} {userData?.nom}<br />
                    <span className="welcome-subtitle">Technicien du centre {formatVilleCentre(userData?.villeCentre)}</span>
                </h2>
                
                {loading ? (
                    <div className="loading">Chargement des statistiques...</div>
                ) : (
                    <>
                        <div className="dashboard-cards">
                            <div className="stat-card">
                                <div className="stat-icon diagnostics">
                                    <FaTools />
                                </div>
                                <div className="stat-info">
                                    <h3>Diagnostics</h3>
                                    <p>{stats.diagnostics}</p>
                                    <span>À faire</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon repairs">
                                    <FaWrench />
                                </div>
                                <div className="stat-info">
                                    <h3>Réparations</h3>
                                    <p>{stats.repairs}</p>
                                    <span>En cours</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon maintenance">
                                    <FaCheckCircle />
                                </div>
                                <div className="stat-info">
                                    <h3>Maintenances</h3>
                                    <p>{stats.maintenance}</p>
                                    <span>Planifiées</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon equipment">
                                    <FaCogs />
                                </div>
                                <div className="stat-info">
                                    <h3>Équipements</h3>
                                    <p>{stats.centerStats.equipments || 0}</p>
                                    <span>En maintenance</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="charts-container">
                            <div className="chart-wrapper">
                                <h3>Statut des diagnostics</h3>
                                <div className="chart">
                                    <Pie 
                                        data={diagnosticsData}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="chart-wrapper">
                                <h3>Activité de réparation</h3>
                                <div className="chart">
                                    <Bar
                                        data={repairsData}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    display: false,
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default TechnicienHome;