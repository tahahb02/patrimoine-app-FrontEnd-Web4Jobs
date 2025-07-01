import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaBars, FaTimes, FaTachometerAlt, FaUsers, FaCogs, 
  FaClipboardList, FaHistory, FaWrench, FaBuilding,
  FaChartLine, FaUser, FaSignOutAlt, FaUserTie,
  FaUserGraduate, FaUserShield, FaUserAlt, FaUserCog
} from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import axios from "axios";
import "../styles/responsable.css";

Chart.register(...registerables);

const DirecteurHome = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAdherants: 0,
        totalResponsables: 0,
        totalTechniciens: 0,
        totalRP: 0,
        totalEquipments: 0,
        equipmentStatus: {
            available: 0,
            onLoan: 0,
            maintenance: 0,
            diagnostic: 0
        },
        maintenanceStats: {
            inProgress: 0,
            completed: 0,
            planned: 0
        },
        diagnosticStats: {
            pending: 0,
            completed: 0
        },
        totalCenters: 0
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userNom = localStorage.getItem("userNom");
        const userPrenom = localStorage.getItem("userPrenom");
        const userRole = localStorage.getItem("userRole");
        
        if (userNom && userPrenom && userRole === "DIRECTEUR") {
            setUserData({
                nom: userNom,
                prenom: userPrenom
            });
            fetchStatistics();
        } else {
            navigate("/login");
        }
    }, []);

    const fetchStatistics = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8080/api/statistics/directeur", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-User-Role': 'DIRECTEUR'
                }
            });
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

    const usersByRoleData = {
        labels: ['Adhérents', 'Responsables', 'Techniciens', 'Responsables Patrimoine'],
        datasets: [{
            data: [
                stats.totalAdherants,
                stats.totalResponsables,
                stats.totalTechniciens,
                stats.totalRP
            ],
            backgroundColor: [
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(255, 99, 132, 0.7)',
                'rgba(75, 192, 192, 0.7)'
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
        }]
    };

    const equipmentStatusData = {
        labels: ['Disponibles', 'En prêt', 'En maintenance', 'En diagnostic'],
        datasets: [{
            label: 'Statut des équipements',
            data: [
                stats.equipmentStatus?.available || 0,
                stats.equipmentStatus?.onLoan || 0,
                stats.equipmentStatus?.maintenance || 0,
                stats.equipmentStatus?.diagnostic || 0
            ],
            backgroundColor: [
                'rgba(75, 192, 192, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 99, 132, 0.7)',
                'rgba(255, 206, 86, 0.7)'
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 206, 86, 1)'
            ],
            borderWidth: 1
        }]
    };

    const maintenanceActivityData = {
        labels: ['En cours', 'Terminées', 'Planifiées'],
        datasets: [{
            label: 'Activité de maintenance',
            data: [
                stats.maintenanceStats?.inProgress || 0,
                stats.maintenanceStats?.completed || 0,
                stats.maintenanceStats?.planned || 0
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
                    <li className={location.pathname === '/DirecteurHome' ? 'active' : ''}>
                        <Link to="/DirecteurHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
                    </li>
                    <li className={location.pathname.includes('/DirecteurUtilisateurs') ? 'active' : ''}>
                        <Link to="/DirecteurUtilisateurs"><FaUsers /><span>Utilisateurs</span></Link>
                    </li>
                    <li className={location.pathname === '/EquipementsDirecteur' ? 'active' : ''}>
                        <Link to="/EquipementsDirecteur"><FaCogs /><span>Équipements</span></Link>
                    </li>
                    <li className={location.pathname === '/HistoriqueDemandesDirecteur' ? 'active' : ''}>
                        <Link to="/HistoriqueDemandesDirecteur"><FaClipboardList /><span>Historique Demandes</span></Link>
                    </li>
                    <li className={location.pathname === '/HistoriqueEquipementsDirecteur' ? 'active' : ''}>
                        <Link to="/HistoriqueEquipementsDirecteur"><FaHistory /><span>Historique Utilisations</span></Link>
                    </li>
                     <li className={location.pathname === '/DiagnosticsDirecteur' ? 'active' : ''}>
                                            <Link to="/DiagnosticsDirecteur">
                                                <FaWrench className="icon" />
                                                <span>Diagnostics</span>
                                            </Link>
                                        </li>
                    <li className={location.pathname === '/DirecteurHistoriqueMaintenances' ? 'active' : ''}>
                        <Link to="/DirecteurHistoriqueMaintenances"><FaWrench /><span>Historique Maintenances</span></Link>
                    </li>
                    <li className={location.pathname === '/DirecteurAnalytics' ? 'active' : ''}>
                        <Link to="/DirecteurAnalytics"><FaChartLine /><span>Analytics</span></Link>
                    </li>
                </ul>

                <div className="sidebar-bottom">
                    <ul>
                        <li className={location.pathname === '/DirecteurAccount' ? 'active' : ''}>
                            <Link to="/DirecteurAccount"><FaUser /><span>Compte</span></Link>
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
                    <span className="welcome-subtitle">Directeur Exécutif</span>
                </h2>
                
                {loading ? (
                    <div className="loading">Chargement des statistiques...</div>
                ) : (
                    <>
                        <div className="dashboard-cards">
                            <div className="stat-card">
                                <div className="stat-icon users">
                                    <FaUsers />
                                </div>
                                <div className="stat-info">
                                    <h3>Utilisateurs</h3>
                                    <p>{stats.totalUsers}</p>
                                    <span>Total enregistrés</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon adherants">
                                    <FaUserGraduate />
                                </div>
                                <div className="stat-info">
                                    <h3>Adhérents</h3>
                                    <p>{stats.totalAdherants}</p>
                                    <span>Membres actifs</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon responsables">
                                    <FaUserAlt />
                                </div>
                                <div className="stat-info">
                                    <h3>Responsables Centres</h3>
                                    <p>{stats.totalResponsables}</p>
                                    <span>Gestion Centre</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon techniciens">
                                    <FaUserCog />
                                </div>
                                <div className="stat-info">
                                    <h3>Techniciens</h3>
                                    <p>{stats.totalTechniciens}</p>
                                    <span>Maintenance</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon rp">
                                    <FaUserTie />
                                </div>
                                <div className="stat-info">
                                    <h3>Responsables Patrimoine</h3>
                                    <p>{stats.totalRP}</p>
                                    <span>Gestion Globale</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon equipment">
                                    <FaCogs />
                                </div>
                                <div className="stat-info">
                                    <h3>Équipements</h3>
                                    <p>{stats.totalEquipments}</p>
                                    <span>Total</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon centers">
                                    <FaBuilding />
                                </div>
                                <div className="stat-info">
                                    <h3>Centres</h3>
                                    <p>{stats.totalCenters}</p>
                                    <span>Actifs</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="charts-container">
                            <div className="chart-wrapper">
                                <h3>Répartition des utilisateurs</h3>
                                <div className="chart">
                                    <Pie 
                                        data={usersByRoleData}
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
                                <h3>Statut des équipements</h3>
                                <div className="chart">
                                    <Bar
                                        data={equipmentStatusData}
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

                            <div className="chart-wrapper">
                                <h3>Activité de maintenance</h3>
                                <div className="chart">
                                    <Bar
                                        data={maintenanceActivityData}
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

export default DirecteurHome;