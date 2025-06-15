import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaBars, FaTimes, FaTachometerAlt, FaUsers, FaUserCog, 
  FaUser, FaSignOutAlt, FaChartLine, FaBuilding 
} from "react-icons/fa";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import "../styles/admin.css";

Chart.register(...registerables);

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080",
  timeout: 5000
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

const AdminHome = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAdherants: 0,
        totalResponsables: 0,
        totalTechniciens: 0,
        centersStats: {},
        newUsersStats: {
            totalNewUsers: 0,
            newAdherants: 0,
            newResponsables: 0,
            newTechniciens: 0
        },
        evolutionData: []
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchWithRetry = async (url, options = {}, retries = 3) => {
        try {
            const response = await api(url, options);
            return response.data;
        } catch (err) {
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return fetchWithRetry(url, options, retries - 1);
            }
            throw err;
        }
    };

    const formatCenterStats = (data) => {
        const centerMapping = {
            'TINGHIR': 'Tinghir',
            'TEMARA': 'Témara',
            'TCHAD': 'Tchad',
            'ESSAOUIRA': 'Essaouira',
            'DAKHLA': 'Dakhla',
            'LAAYOUNE': 'Laayoune',
            'NADOR': 'Nador',
            'AIN_EL_AOUDA': 'Ain El Aouda'
        };

        const formatted = {};
        Object.entries(centerMapping).forEach(([key, name]) => {
            const centerData = data[key] || {};
            formatted[key] = {
                name,
                total: centerData.total || 0,
                adherants: centerData.adherants || 0,
                responsables: centerData.responsables || 0,
                techniciens: centerData.techniciens || 0
            };
        });
        return formatted;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                if (!localStorage.getItem("token")) {
                    navigate("/login");
                    return;
                }

                const endDate = new Date();
                const startDate = new Date();
                
                switch(timeRange) {
                    case 'day': startDate.setDate(endDate.getDate() - 1); break;
                    case 'week': startDate.setDate(endDate.getDate() - 7); break;
                    case 'month': startDate.setMonth(endDate.getMonth() - 1); break;
                    case 'year': startDate.setFullYear(endDate.getFullYear() - 1); break;
                    default: startDate.setDate(endDate.getDate() - 7);
                }

                const [generalRes, centersRes, newUsersRes, evolutionRes] = await Promise.all([
                    fetchWithRetry("/api/statistics/general"),
                    fetchWithRetry("/api/statistics/by-center"),
                    fetchWithRetry(`/api/statistics/new-users?period=${timeRange}`),
                    fetchWithRetry(
                        `/api/statistics/adherants/evolution?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
                    )
                ]);

                const formattedCenters = formatCenterStats(centersRes || {});

                const formattedEvolutionData = (evolutionRes?.data || []).map(item => {
                    try {
                        return {
                            date: new Date(item.date || item[0]),
                            count: parseInt(item.count || item[1] || 0)
                        };
                    } catch (e) {
                        return null;
                    }
                }).filter(Boolean);

                setStats({
                    totalUsers: generalRes?.totalUsers || 0,
                    totalAdherants: generalRes?.totalAdherants || 0,
                    totalResponsables: generalRes?.totalResponsables || 0,
                    totalTechniciens: generalRes?.totalTechniciens || 0,
                    centersStats: formattedCenters,
                    newUsersStats: {
                        totalNewUsers: newUsersRes?.totalNewUsers || 0,
                        newAdherants: newUsersRes?.newAdherants || 0,
                        newResponsables: newUsersRes?.newResponsables || 0,
                        newTechniciens: newUsersRes?.newTechniciens || 0
                    },
                    evolutionData: formattedEvolutionData
                });

            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.response?.data?.message || 
                       err.message || 
                       "Erreur lors du chargement des données. Veuillez réessayer.");
                
                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timeRange, navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const getEvolutionChartData = () => ({
        labels: stats.evolutionData.map(item => 
            item.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        ),
        datasets: [{
            label: 'Nouveaux adhérents',
            data: stats.evolutionData.map(item => item.count),
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            tension: 0.1
        }]
    });

    const getCentersChartData = () => {
        const activeCenters = Object.entries(stats.centersStats)
            .filter(([_, data]) => data.total > 0);

        return {
            labels: activeCenters.map(([_, data]) => data.name),
            datasets: [
                {
                    label: 'Adhérents',
                    data: activeCenters.map(([_, data]) => data.adherants),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
                {
                    label: 'Responsables',
                    data: activeCenters.map(([_, data]) => data.responsables),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                },
                {
                    label: 'Techniciens',
                    data: activeCenters.map(([_, data]) => data.techniciens),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                }
            ]
        };
    };

    const centerTotals = Object.entries(stats.centersStats)
        .filter(([_, data]) => data.total > 0)
        .map(([key, data]) => ({
            center: key,
            name: data.name,
            ...data
        }));

    const hasCentersData = centerTotals.length > 0;
    const hasEvolutionData = stats.evolutionData.length > 0;

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
                
                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()} className="retry-button">
                            Réessayer
                        </button>
                    </div>
                )}
                
                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                        <span>Chargement des statistiques...</span>
                    </div>
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
                                    <span>+{stats.newUsersStats.newAdherants} nouveaux</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon responsables">
                                    <FaUserCog />
                                </div>
                                <div className="stat-info">
                                    <h3>Responsables</h3>
                                    <p>{stats.totalResponsables}</p>
                                    <span>+{stats.newUsersStats.newResponsables} nouveaux</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon techniciens">
                                    <FaUserCog />
                                </div>
                                <div className="stat-info">
                                    <h3>Techniciens</h3>
                                    <p>{stats.totalTechniciens}</p>
                                    <span>+{stats.newUsersStats.newTechniciens} nouveaux</span>
                                </div>
                            </div>
                        </div>

                        <div className="centers-summary">
                            <h3>Répartition par centre</h3>
                            <div className="centers-grid">
                                {hasCentersData ? (
                                    centerTotals.map(({ center, name, total, adherants, responsables, techniciens }) => (
                                        <div key={center} className="center-card">
                                            <h4>{name}</h4>
                                            <div className="center-stats">
                                                <div>
                                                    <span>Total</span>
                                                    <strong>{total}</strong>
                                                </div>
                                                <div>
                                                    <span>Adhérents</span>
                                                    <strong>{adherants}</strong>
                                                </div>
                                                <div>
                                                    <span>Responsables</span>
                                                    <strong>{responsables}</strong>
                                                </div>
                                                <div>
                                                    <span>Techniciens</span>
                                                    <strong>{techniciens}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-data">Aucune donnée de centre disponible</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="charts-container">
                            <div className="chart-wrapper">
                                <h3>Évolution des nouveaux adhérents</h3>
                                <div className="chart">
                                    {hasEvolutionData ? (
                                        <Line 
                                            data={getEvolutionChartData()}
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: {
                                                        position: 'top',
                                                    },
                                                    title: {
                                                        display: true,
                                                        text: 'Nouveaux adhérents'
                                                    },
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        ticks: {
                                                            precision: 0
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    ) : (
                                        <p className="no-data">Aucune donnée d'évolution disponible pour cette période</p>
                                    )}
                                </div>
                            </div>

                            <div className="chart-wrapper">
                                <h3>Répartition par centre</h3>
                                <div className="chart">
                                    {hasCentersData ? (
                                        <Bar
                                            data={getCentersChartData()}
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
                                                        beginAtZero: true,
                                                        ticks: {
                                                            precision: 0
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    ) : (
                                        <p className="no-data">Aucune donnée de centre disponible</p>
                                    )}
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