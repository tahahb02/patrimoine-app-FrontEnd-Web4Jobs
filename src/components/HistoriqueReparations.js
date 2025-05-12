import React, { useState, useEffect, useRef } from 'react';
import { FaHistory, FaSearch, FaChartBar } from 'react-icons/fa';
import axios from 'axios';
import { Chart } from 'chart.js';

const HistoriqueReparations = () => {
    const [historique, setHistorique] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalMaintenances: 0,
        equipementCounts: {},
        problemTypes: {},
        monthlyCounts: {}
    });
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        const fetchHistorique = async () => {
            try {
                const response = await axios.get('/api/maintenances/historique/ville/TINGHIR', {
                    headers: {
                        'X-User-Role': 'TECHNICIEN',
                        'X-User-Center': 'TINGHIR'
                    }
                });
                setHistorique(response.data);
                setStats(calculateStats(response.data));
                setLoading(false);
            } catch (error) {
                console.error("Erreur lors de la récupération de l'historique:", error);
                setLoading(false);
            }
        };

        fetchHistorique();
    }, []);

    useEffect(() => {
        if (stats && chartRef.current) {
            renderChart();
        }
        
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [stats]);

    const calculateStats = (data) => {
        const totalMaintenances = data.length;
        const equipementCounts = {};
        const problemTypes = {};
        const monthlyCounts = {};
        
        data.forEach(maintenance => {
            // Comptage par équipement
            equipementCounts[maintenance.nomEquipement] = (equipementCounts[maintenance.nomEquipement] || 0) + 1;
            
            // Comptage par type de problème
            problemTypes[maintenance.typeProbleme] = (problemTypes[maintenance.typeProbleme] || 0) + 1;
            
            // Comptage mensuel
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
        const labels = Object.keys(stats.monthlyCounts);
        const data = Object.values(stats.monthlyCounts);
        
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
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Nombre de maintenances'
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

    const filteredHistorique = historique.filter(item =>
        item.nomEquipement.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.idEquipement.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="content">
            <h2><FaHistory /> Historique des Réparations</h2>
            
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

            {loading ? (
                <div className="loading">Chargement en cours...</div>
            ) : (
                <>
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
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Équipement</th>
                                    <th>ID</th>
                                    <th>Type de problème</th>
                                    <th>Description</th>
                                    <th>Durée réelle</th>
                                    <th>Date début</th>
                                    <th>Date fin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistorique.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.nomEquipement}</td>
                                        <td>{item.idEquipement}</td>
                                        <td>{item.typeProbleme}</td>
                                        <td>{item.descriptionProbleme}</td>
                                        <td>{item.dureeReelle}h</td>
                                        <td className="date-cell">
                                            {new Date(item.dateDebut).toLocaleDateString()}
                                        </td>
                                        <td className="date-cell">
                                            {item.dateFin ? new Date(item.dateFin).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default HistoriqueReparations;