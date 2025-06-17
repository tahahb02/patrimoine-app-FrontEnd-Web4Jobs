import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaBars, FaTimes, FaTachometerAlt, FaCogs, FaClipboardList, 
  FaBell, FaUser, FaSignOutAlt, FaHistory, FaBoxOpen,FaCheckCircle,FaUsers, FaChartLine 
} from "react-icons/fa";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import NotificationDropdown from "../components/NotificationDropdown";
import "../styles/responsable.css";

Chart.register(...registerables);

const ResponsableHome = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({
        equipments: 0,
        pendingRequests: 0,
        completedRequests: 0,
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
            const response = await axios.get(`/api/statistics/center/${center}`);
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

    const requestsChartData = {
        labels: ['En attente', 'Acceptées', 'Refusées', 'Terminées'],
        datasets: [
            {
                label: 'Demandes',
                data: [
                    stats.pendingRequests,
                    stats.centerStats.accepted || 0,
                    stats.centerStats.rejected || 0,
                    stats.completedRequests
                ],
                backgroundColor: [
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className={`dashboard-container ${sidebarOpen ? "sidebar-expanded" : ""}`}>
            <nav className="navbar">
                <div className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <FaTimes /> : <FaBars />}
                </div>
                <img src="/images/logo-light.png" alt="Logo" className="navbar-logo" />
                <NotificationDropdown />
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
                
                {loading ? (
                    <div className="loading">Chargement des statistiques...</div>
                ) : (
                    <>
                        <div className="dashboard-cards">
                            <div className="stat-card">
                                <div className="stat-icon equipment">
                                    <FaCogs />
                                </div>
                                <div className="stat-info">
                                    <h3>Équipements</h3>
                                    <p>{stats.equipments}</p>
                                    <span>Disponibles: {stats.centerStats.availableEquipments || 0}</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon pending">
                                    <FaClipboardList />
                                </div>
                                <div className="stat-info">
                                    <h3>Demandes en attente</h3>
                                    <p>{stats.pendingRequests}</p>
                                    <span>Urgentes: {stats.centerStats.urgentRequests || 0}</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon completed">
                                    <FaCheckCircle />
                                </div>
                                <div className="stat-info">
                                    <h3>Demandes terminées</h3>
                                    <p>{stats.completedRequests}</p>
                                    <span>Ce mois</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon members">
                                    <FaUsers />
                                </div>
                                <div className="stat-info">
                                    <h3>Adhérents</h3>
                                    <p>{stats.centerStats.adherants || 0}</p>
                                    <span>Actifs</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="charts-container">
                            <div className="chart-wrapper">
                                <h3>Statut des demandes</h3>
                                <div className="chart">
                                    <Pie 
                                        data={requestsChartData}
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
                                <h3>Activité récente</h3>
                                <div className="chart">
                                    <Bar
                                        data={{
                                            labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                                            datasets: [
                                                {
                                                    label: 'Demandes',
                                                    data: [12, 19, 3, 5, 2, 3, 7],
                                                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                                                }
                                            ]
                                        }}
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

export default ResponsableHome;