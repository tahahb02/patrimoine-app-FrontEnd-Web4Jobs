import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHistory, FaSearch, FaChartBar, FaSort, 
  FaSortUp, FaSortDown, FaSignOutAlt, FaUser, 
  FaWrench, FaBell, FaTachometerAlt, FaTimes, FaBars, FaTools 
} from 'react-icons/fa';
import { Chart, registerables } from 'chart.js';
import { Pagination } from 'antd';
import "../styles/responsable.css";

// Enregistrer tous les composants nécessaires de Chart.js
Chart.register(...registerables);

const HistoriqueReparations = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [historique, setHistorique] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalMaintenances: 0,
        equipementCounts: {},
        problemTypes: {},
        monthlyCounts: {}
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'dateDebut', direction: 'desc' });
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const userVilleCentre = localStorage.getItem("userVilleCentre");

    useEffect(() => {
        const fetchHistorique = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const simulatedData = [
                    {
                        id: 1,
                        nomEquipement: "PC-0245",
                        idEquipement: "EQ-1001",
                        typeProbleme: "MATERIEL",
                        descriptionProbleme: "Surchauffe critique",
                        dureeReelle: 5,
                        dateDebut: "2023-05-10T09:00:00",
                        dateFin: "2023-05-10T14:00:00",
                        actionsRealisees: "Remplacement du ventilateur et application de pâte thermique"
                    },
                    {
                        id: 2,
                        nomEquipement: "Projecteur-012",
                        idEquipement: "EQ-2045",
                        typeProbleme: "LOGICIEL",
                        descriptionProbleme: "Problème de firmware",
                        dureeReelle: 2,
                        dateDebut: "2023-05-05T14:30:00",
                        dateFin: "2023-05-05T16:30:00",
                        actionsRealisees: "Mise à jour du firmware et réinitialisation des paramètres"
                    },
                    {
                        id: 3,
                        nomEquipement: "PC-0246",
                        idEquipement: "EQ-1002",
                        typeProbleme: "MATERIEL",
                        descriptionProbleme: "Problème d'alimentation",
                        dureeReelle: 3,
                        dateDebut: "2023-04-15T10:00:00",
                        dateFin: "2023-04-15T13:00:00",
                        actionsRealisees: "Remplacement de l'alimentation"
                    },
                    {
                        id: 4,
                        nomEquipement: "Projecteur-013",
                        idEquipement: "EQ-2046",
                        typeProbleme: "MATERIEL",
                        descriptionProbleme: "Lampe défectueuse",
                        dureeReelle: 1,
                        dateDebut: "2023-04-10T14:00:00",
                        dateFin: "2023-04-10T15:00:00",
                        actionsRealisees: "Remplacement de la lampe"
                    }
                ];
                
                setHistorique(simulatedData);
                setStats(calculateStats(simulatedData));
                setLoading(false);
            } catch (error) {
                console.error("Erreur lors de la récupération de l'historique:", error);
                setLoading(false);
            }
        };

        fetchHistorique();

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (stats && Object.keys(stats.monthlyCounts).length > 0 && chartRef.current) {
            renderChart();
        }
    }, [stats]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userVilleCentre");
        navigate("/login");
    };

    const calculateStats = (data) => {
        const totalMaintenances = data.length;
        const equipementCounts = {};
        const problemTypes = {};
        const monthlyCounts = {};
        
        data.forEach(maintenance => {
            equipementCounts[maintenance.nomEquipement] = (equipementCounts[maintenance.nomEquipement] || 0) + 1;
            problemTypes[maintenance.typeProbleme] = (problemTypes[maintenance.typeProbleme] || 0) + 1;
            
            const date = new Date(maintenance.dateDebut);
            const monthYear = `${date.getMonth()+1}/${date.getFullYear()}`;
            monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
        });
        
        return {
            totalMaintenances,
            equipementCounts,
            problemTypes,
            monthlyCounts
        };
    };

    const renderChart = () => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }
        
        const ctx = chartRef.current.getContext('2d');
        const labels = Object.keys(stats.monthlyCounts).sort((a, b) => {
            const [monthA, yearA] = a.split('/').map(Number);
            const [monthB, yearB] = b.split('/').map(Number);
            return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
        });
        
        const data = labels.map(label => stats.monthlyCounts[label]);
        
        chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Maintenances par mois',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Nombre de maintenances'
                        },
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Mois/Année'
                        }
                    }
                }
            }
        });
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <FaSort />;
        return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    };

    const filteredHistorique = historique.filter(item =>
        item.nomEquipement.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.idEquipement.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedHistorique = [...filteredHistorique].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentHistorique = sortedHistorique.slice(indexOfFirstItem, indexOfLastItem);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
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
                <h2><FaHistory /> Historique des Réparations</h2>
                <p className="center-info">
                    Centre : <strong>{userVilleCentre}</strong>
                </p>

                <div className="search-and-filters">
                    <div className="search-bar">
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un équipement..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="urgency-stats-panel">
                    <div className="urgency-stat">
                        <div className="stat-icon"><FaHistory /></div>
                        <div className="stat-content">
                            <div className="stat-count">{stats.totalMaintenances}</div>
                            <div className="stat-label">Maintenances totales</div>
                        </div>
                    </div>
                    
                    {Object.entries(stats.problemTypes).map(([type, count]) => (
                        <div className="urgency-stat" key={type}>
                            <div className="stat-content">
                                <div className="stat-count">{count}</div>
                                <div className="stat-label">{type.toLowerCase()}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card" style={{ marginBottom: '20px' }}>
                    <h3><FaChartBar /> Statistiques des maintenances</h3>
                    <canvas ref={chartRef} height="100"></canvas>
                </div>

                <div className="table-container">
                    <table className="demandes-table">
                        <thead>
                            <tr>
                                <th onClick={() => requestSort('nomEquipement')}>
                                    <div className="sortable-header">
                                        Équipement
                                        <span className="sort-icon">
                                            {getSortIcon('nomEquipement')}
                                        </span>
                                    </div>
                                </th>
                                <th onClick={() => requestSort('idEquipement')}>
                                    <div className="sortable-header">
                                        ID
                                        <span className="sort-icon">
                                            {getSortIcon('idEquipement')}
                                        </span>
                                    </div>
                                </th>
                                <th onClick={() => requestSort('typeProbleme')}>
                                    <div className="sortable-header">
                                        Type de problème
                                        <span className="sort-icon">
                                            {getSortIcon('typeProbleme')}
                                        </span>
                                    </div>
                                </th>
                                <th onClick={() => requestSort('descriptionProbleme')}>
                                    <div className="sortable-header">
                                        Description
                                        <span className="sort-icon">
                                            {getSortIcon('descriptionProbleme')}
                                        </span>
                                    </div>
                                </th>
                                <th onClick={() => requestSort('dureeReelle')}>
                                    <div className="sortable-header">
                                        Durée réelle
                                        <span className="sort-icon">
                                            {getSortIcon('dureeReelle')}
                                        </span>
                                    </div>
                                </th>
                                <th onClick={() => requestSort('dateDebut')}>
                                    <div className="sortable-header">
                                        Date début
                                        <span className="sort-icon">
                                            {getSortIcon('dateDebut')}
                                        </span>
                                    </div>
                                </th>
                                <th onClick={() => requestSort('dateFin')}>
                                    <div className="sortable-header">
                                        Date fin
                                        <span className="sort-icon">
                                            {getSortIcon('dateFin')}
                                        </span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="loading">Chargement en cours...</td>
                                </tr>
                            ) : currentHistorique.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-data-message">
                                        Aucun historique de réparation disponible
                                    </td>
                                </tr>
                            ) : (
                                currentHistorique.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.nomEquipement}</td>
                                        <td>{item.idEquipement}</td>
                                        <td>{item.typeProbleme}</td>
                                        <td>{item.descriptionProbleme}</td>
                                        <td>{item.dureeReelle}h</td>
                                        <td className="date-cell">
                                            {formatDate(item.dateDebut)}
                                        </td>
                                        <td className="date-cell">
                                            {item.dateFin ? formatDate(item.dateFin) : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredHistorique.length > itemsPerPage && (
                    <div className="pagination-container">
                        <Pagination
                            current={currentPage}
                            total={filteredHistorique.length}
                            pageSize={itemsPerPage}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default HistoriqueReparations;