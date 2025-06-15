import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaBars, FaTimes, FaTachometerAlt, FaUsers, FaUserCog, 
  FaBell, FaUser, FaSignOutAlt, FaChartLine, FaBuilding 
} from "react-icons/fa";
import axios from "axios";
import { Line, Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import "../styles/admin.css";

Chart.register(...registerables);

const AdminHome = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAdherants: 0,
        totalResponsables: 0,
        totalTechniciens: 0,
        centersStats: []
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchStatistics();
    }, [timeRange]);

    const fetchStatistics = async () => {
        try {
            const [generalRes, centersRes, evolutionRes] = await Promise.all([
                axios.get("/api/statistics/general"),
                axios.get("/api/statistics/by-center"),
                axios.get(`/api/statistics/new-users?period=${timeRange}`)
            ]);
            
            setStats({
                ...generalRes.data,
                centersStats: centersRes.data,
                evolution: evolutionRes.data
            });
            
            setLoading(false);
        } catch (error) {
            console.error("Error fetching statistics:", error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("userSession");
        navigate("/", { replace: true });
    };

    const evolutionChartData = {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [
            {
                label: 'Nouveaux adhérents',
                data: [12, 19, 3, 5, 2, 3, 7],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const centersChartData = {
        labels: stats.centersStats ? Object.keys(stats.centersStats) : [],
        datasets: [
            {
                label: 'Adhérents',
                data: stats.centersStats ? Object.values(stats.centersStats).map(c => c.adherants) : [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
            {
                label: 'Responsables',
                data: stats.centersStats ? Object.values(stats.centersStats).map(c => c.responsables) : [],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
            {
                label: 'Techniciens',
                data: stats.centersStats ? Object.values(stats.centersStats).map(c => c.techniciens) : [],
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
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
                    <li className={location.pathname === '/Centres' ? 'active' : ''}>
                        <Link to="/Centres"><FaBuilding /><span>Gestion des Centres</span></Link>
                    </li>
                    <li className={location.pathname === '/Analytics' ? 'active' : ''}>
                        <Link to="/Analytics"><FaChartLine /><span>Analytics</span></Link>
                    </li>
                </ul>

                <div className="sidebar-bottom">
                    <ul>    
                        <li className="logout">
                            <button onClick={handleLogout} style={{ background: 'none', border: 'none', padding: '10px', width: '100%', textAlign: 'left' }}>
                                <FaSignOutAlt /><span>Déconnexion</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </aside>

            <main className="content">
                <h2>Tableau de Bord Administrateur</h2>
                
                {loading ? (
                    <div className="loading">Chargement des statistiques...</div>
                ) : (
                    <>
                        <div className="time-range-selector">
                            <button 
                                className={timeRange === 'day' ? 'active' : ''}
                                onClick={() => setTimeRange('day')}
                            >
                                Aujourd'hui
                            </button>
                            <button 
                                className={timeRange === 'week' ? 'active' : ''}
                                onClick={() => setTimeRange('week')}
                            >
                                Cette semaine
                            </button>
                            <button 
                                className={timeRange === 'month' ? 'active' : ''}
                                onClick={() => setTimeRange('month')}
                            >
                                Ce mois
                            </button>
                            <button 
                                className={timeRange === 'year' ? 'active' : ''}
                                onClick={() => setTimeRange('year')}
                            >
                                Cette année
                            </button>
                        </div>

                        <div className="dashboard-cards">
                            <div className="stat-card">
                                <div className="stat-icon users">
                                    <FaUsers />
                                </div>
                                <div className="stat-info">
                                    <h3>Utilisateurs</h3>
                                    <p>{stats.totalUsers}</p>
                                    <span>Total</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon adherants">
                                    <FaUser />
                                </div>
                                <div className="stat-info">
                                    <h3>Adhérents</h3>
                                    <p>{stats.totalAdherants}</p>
                                    <span>+{stats.evolution?.newAdherants || 0} nouveaux</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon responsables">
                                    <FaUserCog />
                                </div>
                                <div className="stat-info">
                                    <h3>Responsables</h3>
                                    <p>{stats.totalResponsables}</p>
                                    <span>+{stats.evolution?.newResponsables || 0} nouveaux</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon techniciens">
                                    <FaUserCog />
                                </div>
                                <div className="stat-info">
                                    <h3>Techniciens</h3>
                                    <p>{stats.totalTechniciens}</p>
                                    <span>+{stats.evolution?.newTechniciens || 0} nouveaux</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="charts-container">
                            <div className="chart-wrapper">
                                <h3>Évolution des nouveaux adhérents</h3>
                                <div className="chart">
                                    <Line 
                                        data={evolutionChartData}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                },
                                                title: {
                                                    display: true,
                                                    text: 'Nouveaux adhérents par jour'
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="chart-wrapper">
                                <h3>Répartition par centre</h3>
                                <div className="chart">
                                    <Bar
                                        data={centersChartData}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                },
                                                title: {
                                                    display: true,
                                                    text: 'Utilisateurs par centre'
                                                },
                                            },
                                            scales: {
                                                x: {
                                                    stacked: true,
                                                },
                                                y: {
                                                    stacked: true,
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

export default AdminHome;