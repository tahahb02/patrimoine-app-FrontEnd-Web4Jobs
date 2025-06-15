import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaBars, FaTimes, FaTachometerAlt, FaCogs, FaClipboardList, 
  FaBell, FaUser, FaSignOutAlt, FaHistory,FaWrench, FaBoxOpen, 
  FaCheckCircle, FaBuilding, FaChartLine, FaUsers 
} from "react-icons/fa";
import axios from "axios";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import "../styles/responsable.css";

Chart.register(...registerables);

const ResponsablePatrimoineHome = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({
        totalEquipments: 0,
        pendingValidations: 0,
        centersCount: 0,
        maintenanceStats: {},
        equipmentStatus: {}
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userNom = localStorage.getItem("userNom");
        const userPrenom = localStorage.getItem("userPrenom");
        
        if (userNom && userPrenom) {
            setUserData({
                nom: userNom,
                prenom: userPrenom
            });
            fetchStatistics();
        }
    }, []);

    const fetchStatistics = async () => {
        try {
            const response = await axios.get("/api/statistics/patrimoine");
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

    const equipmentStatusData = {
        labels: ['Disponibles', 'En maintenance', 'En prêt', 'À valider'],
        datasets: [
            {
                label: 'Statut des équipements',
                data: [
                    stats.equipmentStatus.available || 0,
                    stats.equipmentStatus.maintenance || 0,
                    stats.equipmentStatus.onLoan || 0,
                    stats.pendingValidations
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }
        ]
    };

    const maintenanceData = {
        labels: ['En cours', 'Terminées', 'Planifiées'],
        datasets: [
            {
                label: 'Maintenances',
                data: [
                    stats.maintenanceStats.inProgress || 0,
                    stats.maintenanceStats.completed || 0,
                    stats.maintenanceStats.planned || 0
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 206, 86, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
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
                    <li className={location.pathname === '/ResponsablePatrimoineHome' ? 'active' : ''}>
                        <Link to="/ResponsablePatrimoineHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
                    </li>
                    <li className={location.pathname === '/EquipmentsRP' ? 'active' : ''}>
                        <Link to="/EquipmentsRP"><FaCogs /><span>Gestion des Équipements</span></Link>
                    </li>
                    <li className={location.pathname === '/ValidationEquipementRP' ? 'active' : ''}>
                        <Link to="/ValidationEquipementRP"><FaCheckCircle /><span>Validation Équipements</span></Link>
                    </li>
                    <li className={location.pathname === '/HistoriqueDemandesRP' ? 'active' : ''}>
                        <Link to="/HistoriqueDemandesRP"><FaHistory /><span>Historique des Demandes</span></Link>
                    </li>
                    <li className={location.pathname === '/HistoriqueEquipementsRP' ? 'active' : ''}>
                        <Link to="/HistoriqueEquipementsRP"><FaHistory /><span>Historique des Équipements</span></Link>
                    </li>
                    <li className={location.pathname === '/CentresRP' ? 'active' : ''}>
                        <Link to="/CentresRP"><FaBuilding /><span>Gestion des Centres</span></Link>
                    </li>
                    <li className={location.pathname === '/AnalyticsRP' ? 'active' : ''}>
                        <Link to="/AnalyticsRP"><FaChartLine /><span>Analytics</span></Link>
                    </li>
                </ul>

                <div className="sidebar-bottom">
                    <ul>
                        <li className={location.pathname === '/accountRP' ? 'active' : ''}>
                            <Link to="/Account"><FaUser /><span>Compte</span></Link>
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
                    <span className="welcome-subtitle">Responsable Patrimoine</span>
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
                                    <p>{stats.totalEquipments}</p>
                                    <span>À valider: {stats.pendingValidations}</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon centers">
                                    <FaBuilding />
                                </div>
                                <div className="stat-info">
                                    <h3>Centres</h3>
                                    <p>{stats.centersCount}</p>
                                    <span>Actifs</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon maintenance">
                                    <FaWrench />
                                </div>
                                <div className="stat-info">
                                    <h3>Maintenances</h3>
                                    <p>{stats.maintenanceStats.inProgress || 0}</p>
                                    <span>En cours</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon members">
                                    <FaUsers />
                                </div>
                                <div className="stat-info">
                                    <h3>Utilisateurs</h3>
                                    <p>{stats.totalUsers || 0}</p>
                                    <span>Actifs</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="charts-container">
                            <div className="chart-wrapper">
                                <h3>Statut des équipements</h3>
                                <div className="chart">
                                    <Pie 
                                        data={equipmentStatusData}
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
                                <h3>Activité de maintenance</h3>
                                <div className="chart">
                                    <Bar
                                        data={maintenanceData}
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

export default ResponsablePatrimoineHome;