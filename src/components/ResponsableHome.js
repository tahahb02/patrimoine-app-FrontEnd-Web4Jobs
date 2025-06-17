import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaBars, FaTimes, FaTachometerAlt, FaCogs, FaClipboardList, 
  FaBell, FaUser, FaSignOutAlt, FaHistory, FaBoxOpen, FaCheckCircle, 
  FaUsers, FaChartLine 
} from "react-icons/fa";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import NotificationDropdown from "../components/NotificationDropdown";
import "../styles/responsable.css";

Chart.register(...registerables);

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080",
  timeout: 5000
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-User-Role'] = localStorage.getItem("userRole");
    config.headers['X-User-Center'] = localStorage.getItem("userVilleCentre");
    config.headers['X-User-Id'] = localStorage.getItem("userId");
  }
  return config;
}, error => {
  return Promise.reject(error);
});

const ResponsableHome = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({
        equipments: 0,
        pendingRequests: 0,
        completedRequests: 0,
        urgentRequests: 0,
        availableEquipments: 0,
        adherants: 0,
        recentActivity: [0, 0, 0, 0, 0, 0, 0]
    });
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const userNom = localStorage.getItem("userNom");
                const userPrenom = localStorage.getItem("userPrenom");
                const userVilleCentre = localStorage.getItem("userVilleCentre");
                const userRole = localStorage.getItem("userRole");
                
                if (!userNom || !userPrenom || !userVilleCentre || !userRole) {
                    navigate("/login");
                    return;
                }

                // Vérifier que l'utilisateur a bien le rôle RESPONSABLE
                if (userRole !== "RESPONSABLE") {
                    navigate("/unauthorized");
                    return;
                }

                setUserData({
                    nom: userNom,
                    prenom: userPrenom,
                    villeCentre: userVilleCentre,
                    role: userRole
                });

                // Fetch all statistics
                const [
                    equipmentsRes, 
                    pendingRes, 
                    completedRes, 
                    urgentRes, 
                    availableRes, 
                    adherantsRes
                ] = await Promise.all([
                    fetchWithRetry(`/api/equipments/validated`),
                    fetchWithRetry(`/api/demandes/en-attente/${userVilleCentre}`),
                    fetchWithRetry(`/api/demandes/historique/${userVilleCentre}`),
                    fetchWithRetry(`/api/demandes/urgentes/${userVilleCentre}`),
                    fetchWithRetry(`/api/equipments/validated?villeCentre=${userVilleCentre}`),
                    fetchWithRetry(`/api/utilisateurs/role/ADHERANT/ville/${userVilleCentre}`)
                ]);

                // Calculate recent activity (last 7 days)
                const today = new Date();
                const activityData = [0, 0, 0, 0, 0, 0, 0];
                
                if (completedRes && Array.isArray(completedRes)) {
                    completedRes.forEach(demande => {
                        if (demande.dateDemande) {
                            const demandeDate = new Date(demande.dateDemande);
                            const diffDays = Math.floor((today - demandeDate) / (1000 * 60 * 60 * 24));
                            
                            if (diffDays >= 0 && diffDays < 7) {
                                activityData[6 - diffDays]++;
                            }
                        }
                    });
                }

                setStats({
                    equipments: equipmentsRes?.length || 0,
                    pendingRequests: pendingRes?.length || 0,
                    completedRequests: completedRes?.length || 0,
                    urgentRequests: urgentRes?.length || 0,
                    availableEquipments: availableRes?.length || 0,
                    adherants: adherantsRes?.length || 0,
                    recentActivity: activityData
                });

            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.response?.data?.message || 
                       err.message || 
                       "Erreur lors du chargement des données. Veuillez réessayer.");
                
                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                } else if (err.response?.status === 403) {
                    navigate("/unauthorized");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

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
        return ville.split('_').map(word => 
            word.charAt(0) + word.slice(1).toLowerCase()
        ).join(' ');
    };

    const requestsChartData = {
        labels: ['En attente', 'Urgentes', 'Terminées'],
        datasets: [
            {
                label: 'Demandes',
                data: [
                    stats.pendingRequests,
                    stats.urgentRequests,
                    stats.completedRequests
                ],
                backgroundColor: [
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(75, 192, 192, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)'
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
                        <div className="dashboard-cards">
                            <div className="stat-card">
                                <div className="stat-icon equipment">
                                    <FaCogs />
                                </div>
                                <div className="stat-info">
                                    <h3>Équipements</h3>
                                    <p>{stats.equipments}</p>
                                    <span>Disponibles: {stats.availableEquipments}</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon pending">
                                    <FaClipboardList />
                                </div>
                                <div className="stat-info">
                                    <h3>Demandes en attente</h3>
                                    <p>{stats.pendingRequests}</p>
                                    <span>Urgentes: {stats.urgentRequests}</span>
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
                                    <p>{stats.adherants}</p>
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
                                                    data: stats.recentActivity,
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