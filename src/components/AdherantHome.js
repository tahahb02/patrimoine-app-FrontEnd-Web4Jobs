import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaBars, FaTimes, FaTachometerAlt, FaCogs, FaClipboardList, 
  FaBell, FaUser, FaSignOutAlt, FaClipboardCheck, FaCheckCircle, FaHistory 
} from "react-icons/fa";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import NotificationDropdown from "../components/NotificationDropdown";
import "../styles/adherant.css";

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

const AdherantHome = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({
        availableEquipments: 0,
        pendingRequests: 0,
        completedRequests: 0,
        centerStats: {
            accepted: 0,
            rejected: 0,
            onLoan: 0,
            inMaintenance: 0
        }
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
                const userId = localStorage.getItem("userId");
                const userRole = localStorage.getItem("userRole");
                
                if (!userNom || !userPrenom || !userVilleCentre || !userId || !userRole) {
                    navigate("/login");
                    return;
                }

                // Vérifier que l'utilisateur a bien le rôle ADHERANT
                if (userRole !== "ADHERANT") {
                    navigate("/unauthorized");
                    return;
                }

                setUserData({
                    nom: userNom,
                    prenom: userPrenom,
                    villeCentre: userVilleCentre,
                    id: userId,
                    role: userRole
                });

                // Fetch all statistics
                const [
                    equipmentsRes, 
                    demandesRes
                ] = await Promise.all([
                    fetchWithRetry(`/api/equipments/validated?villeCentre=${userVilleCentre}`),
                    fetchWithRetry(`/api/demandes/by-user/${userId}`)
                ]);

                // Calculate statistics
                const pendingRequests = demandesRes.filter(d => d.statut === "EN_ATTENTE").length;
                const completedRequests = demandesRes.filter(d => d.statut === "RETOURNEE").length;
                const acceptedRequests = demandesRes.filter(d => d.statut === "ACCEPTEE").length;
                const rejectedRequests = demandesRes.filter(d => d.statut === "REFUSEE").length;

                // Get equipment stats from the equipments list
                const onLoan = equipmentsRes.filter(e => e.status === "EN_PRÊT").length;
                const inMaintenance = equipmentsRes.filter(e => e.enMaintenance).length;

                setStats({
                    availableEquipments: equipmentsRes.length - onLoan - inMaintenance,
                    pendingRequests,
                    completedRequests,
                    centerStats: {
                        accepted: acceptedRequests,
                        rejected: rejectedRequests,
                        onLoan,
                        inMaintenance
                    }
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

    const requestsData = {
        labels: ['En attente', 'Acceptées', 'Refusées', 'Terminées'],
        datasets: [
            {
                label: 'Mes demandes',
                data: [
                    stats.pendingRequests,
                    stats.centerStats.accepted,
                    stats.centerStats.rejected,
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
                borderWidth: 1
            }
        ]
    };

    const equipmentData = {
        labels: ['Disponibles', 'En prêt', 'En maintenance'],
        datasets: [
            {
                label: 'Équipements',
                data: [
                    stats.availableEquipments,
                    stats.centerStats.onLoan,
                    stats.centerStats.inMaintenance
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 159, 64, 1)'
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
                <NotificationDropdown />
            </nav>

            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                <ul className="sidebar-menu">
                    <li className={location.pathname === '/AdherantHome' ? 'active' : ''}>
                        <Link to="/AdherantHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
                    </li>
                    <li className={location.pathname === '/EquipmentDisponible' ? 'active' : ''}>
                        <Link to="/EquipmentDisponible"><FaCogs /><span>Équipements Disponibles</span></Link>
                    </li>
                    <li className={location.pathname === '/SuiviDemandeAdherant' ? 'active' : ''}>
                        <Link to="/SuiviDemandeAdherant"><FaClipboardList /><span>Suivi des Demandes</span></Link>
                    </li>
                    <li className={location.pathname === '/HistoriqueDemandeAdherant' ? 'active' : ''}>
                        <Link to="/MesDemandes"><FaClipboardCheck /><span>Mes Demandes</span></Link>
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
                    <span className="welcome-subtitle">Adhérent du centre {formatVilleCentre(userData?.villeCentre)}</span>
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
                                    <p>{stats.availableEquipments}</p>
                                    <span>Disponibles</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon pending">
                                    <FaClipboardList />
                                </div>
                                <div className="stat-info">
                                    <h3>Demandes</h3>
                                    <p>{stats.pendingRequests}</p>
                                    <span>En attente</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon completed">
                                    <FaCheckCircle />
                                </div>
                                <div className="stat-info">
                                    <h3>Terminées</h3>
                                    <p>{stats.completedRequests}</p>
                                    <span>Demandes</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon history">
                                    <FaHistory />
                                </div>
                                <div className="stat-info">
                                    <h3>Activité</h3>
                                    <p>{stats.completedRequests + stats.pendingRequests}</p>
                                    <span>Total demandes</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="charts-container">
                            <div className="chart-wrapper">
                                <h3>Statut de mes demandes</h3>
                                <div className="chart">
                                    <Pie 
                                        data={requestsData}
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
                                <h3>Disponibilité des équipements</h3>
                                <div className="chart">
                                    <Bar
                                        data={equipmentData}
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

export default AdherantHome;