import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaBars, FaTimes, FaTachometerAlt, FaCogs, 
  FaUser, FaSignOutAlt, FaHistory, FaWrench, 
  FaCheckCircle, FaBuilding, FaChartLine, FaUsers 
} from "react-icons/fa";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import "../styles/responsable.css";

Chart.register(...registerables);

const ResponsablePatrimoineHome = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({
        totalEquipments: 0,
        pendingValidation: 0,
        centersCount: 0,
        totalRP: 0,
        maintenanceStats: { inProgress: 0, completed: 0, planned: 0 },
        equipmentStatus: { available: 0, onLoan: 0, maintenance: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userNom = localStorage.getItem("userNom");
        const userPrenom = localStorage.getItem("userPrenom");
        const userRole = localStorage.getItem("userRole");
        
        if (userNom && userPrenom && userRole) {
            setUserData({
                nom: userNom,
                prenom: userPrenom,
                role: userRole
            });
            fetchStatistics(userRole);
        }
    }, []);

    const fetchStatistics = async (userRole) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Token d'authentification manquant");
            }

            const response = await axios.get("http://localhost:8080/api/statistics/patrimoine", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'X-User-Role': userRole
                }
            });
            
            if (response.data) {
                setStats({
                    totalEquipments: response.data.totalEquipments || 0,
                    pendingValidation: response.data.pendingValidation || 0,
                    centersCount: response.data.centersCount || 0,
                    totalRP: response.data.totalRP || 0,
                    maintenanceStats: {
                        inProgress: response.data.maintenanceStats?.inProgress || 0,
                        completed: response.data.maintenanceStats?.completed || 0,
                        planned: response.data.maintenanceStats?.planned || 0
                    },
                    equipmentStatus: {
                        available: response.data.equipmentStatus?.available || 0,
                        onLoan: response.data.equipmentStatus?.onLoan || 0,
                        maintenance: response.data.equipmentStatus?.maintenance || 0
                    }
                });
            }
        } catch (error) {
            console.error("Erreur lors du chargement des statistiques:", error);
            setError(error.response?.data?.message || error.message || "Erreur lors du chargement des statistiques");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const equipmentStatusData = {
        labels: ['Disponibles', 'En prêt', 'En maintenance'],
        datasets: [{
            label: 'Statut des équipements',
            data: [
                stats.equipmentStatus.available,
                stats.equipmentStatus.onLoan,
                stats.equipmentStatus.maintenance
            ],
            backgroundColor: [
                'rgba(75, 192, 192, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 99, 132, 0.7)'
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
        }]
    };

    const maintenanceData = {
        labels: ['En cours', 'Terminées', 'Planifiées'],
        datasets: [{
            label: 'Maintenances',
            data: [
                stats.maintenanceStats.inProgress,
                stats.maintenanceStats.completed,
                stats.maintenanceStats.planned
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
        }]
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
                        <li>
                            <Link to="/Account"><FaUser /><span>Compte</span></Link>
                        </li>
                        <li className="logout">
                            <button onClick={handleLogout}>
                                <FaSignOutAlt /><span>Déconnexion</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </aside>

            <main className="content">
                
                    <h2 >
                        Bienvenue, {userData?.prenom} {userData?.nom}
                    </h2>
                    <span className="welcome-subtitle">Responsable Patrimoine</span>
                
                
                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={() => fetchStatistics(userData?.role)} className="retry-button">
                            Réessayer
                        </button>
                    </div>
                )}

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
                                    <span>À valider: {stats.pendingValidation}</span>
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
                                    <p>{stats.maintenanceStats.inProgress}</p>
                                    <span>En cours</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon members">
                                    <FaUsers />
                                </div>
                                <div className="stat-info">
                                    <h3>Responsables</h3>
                                    <p>{stats.totalRP}</p>
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
                                            scales: {
                                                y: {
                                                    beginAtZero: true
                                                }
                                            }
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