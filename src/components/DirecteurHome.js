import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaBars, FaTimes, FaTachometerAlt, FaUsers, FaCogs, 
  FaClipboardList, FaHistory, FaWrench, FaStethoscope,
  FaBuilding, FaChartLine, FaUser, FaSignOutAlt
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
        totalEquipments: 0,
        equipmentStatus: {},
        maintenanceStats: {},
        diagnosticStats: {}
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
            const token = localStorage.getItem("token");
            const response = await axios.get("/api/statistics/directeur", {
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
        labels: ['Adhérents', 'Responsables', 'Techniciens', 'RP'],
        datasets: [{
            data: [
                stats.totalAdherants,
                stats.totalResponsables,
                stats.totalTechniciens,
                stats.totalRP || 0
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
            data: [
                stats.equipmentStatus.available || 0,
                stats.equipmentStatus.onLoan || 0,
                stats.maintenanceStats.inProgress || 0,
                stats.diagnosticStats.pending || 0
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
                    
                    <li className={location.pathname === '/DirecteurHistoriqueDemandes' ? 'active' : ''}>
                        <Link to="/DirecteurHistoriqueDemandes"><FaClipboardList /><span>Historique Demandes</span></Link>
                    </li>
                    
                    <li className={location.pathname === '/DirecteurHistoriqueUtilisations' ? 'active' : ''}>
                        <Link to="/DirecteurHistoriqueUtilisations"><FaHistory /><span>Historique Utilisations Des Équipements</span></Link>
                    </li>
                    
                    <li className={location.pathname === '/DirecteurHistoriqueMaintenances' ? 'active' : ''}>
                        <Link to="/DirecteurHistoriqueMaintenances"><FaWrench /><span>Historique Maintenances</span></Link>
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
                <div className="welcome-container">
                    <h2 className="welcome-title">
                        Bienvenue, {userData?.prenom} {userData?.nom}
                    </h2>
                    <span className="welcome-subtitle">Directeur</span>
                </div>
                
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
                                    <FaUser />
                                </div>
                                <div className="stat-info">
                                    <h3>Adhérents</h3>
                                    <p>{stats.totalAdherants}</p>
                                    <span>Actifs</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon responsables">
                                    <FaUser />
                                </div>
                                <div className="stat-info">
                                    <h3>Responsables</h3>
                                    <p>{stats.totalResponsables}</p>
                                    <span>Centres</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon techniciens">
                                    <FaUser />
                                </div>
                                <div className="stat-info">
                                    <h3>Techniciens</h3>
                                    <p>{stats.totalTechniciens}</p>
                                    <span>Actifs</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon equipment">
                                    <FaCogs />
                                </div>
                                <div className="stat-info">
                                    <h3>Équipements</h3>
                                    <p>{stats.totalEquipments}</p>
                                    <span>Validés</span>
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
                                <div className="stat-icon diagnostics">
                                    <FaStethoscope />
                                </div>
                                <div className="stat-info">
                                    <h3>Diagnostics</h3>
                                    <p>{stats.diagnosticStats.pending || 0}</p>
                                    <span>En attente</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon centers">
                                    <FaBuilding />
                                </div>
                                <div className="stat-info">
                                    <h3>Centres</h3>
                                    <p>{stats.totalCenters || 0}</p>
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
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default DirecteurHome;