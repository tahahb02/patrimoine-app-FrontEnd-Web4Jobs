import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTools, FaClock, FaExclamationTriangle, FaCheckCircle, 
  FaSearch, FaSort, FaSortUp,FaTachometerAlt,FaWrench,FaHistory,FaBell,FaUser,FaSignOutAlt,FaBars,FaTimes, FaSortDown 
} from 'react-icons/fa';
import { Pagination } from 'antd';
import "../styles/responsable.css";

const DiagnostiqueEquipements = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [diagnostics, setDiagnostics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);
    const [formData, setFormData] = useState({
        besoinMaintenance: false,
        typeProbleme: '',
        degreUrgence: '',
        description: '',
        dureeEstimee: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'nomEquipement', direction: 'asc' });
    const navigate = useNavigate();
    const location = useLocation();
    const userVilleCentre = localStorage.getItem("userVilleCentre");

    useEffect(() => {
        const fetchDiagnostics = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const simulatedData = [
                    { id: 1, nomEquipement: "PC-0245", categorie: "Ordinateur", heuresUtilisation: 1250, nbDemandes: 22 },
                    { id: 2, nomEquipement: "Projecteur-012", categorie: "Projecteur", heuresUtilisation: 1580, nbDemandes: 18 },
                    { id: 3, nomEquipement: "Imprimante-045", categorie: "Imprimante", heuresUtilisation: 980, nbDemandes: 15 }
                ];
                
                setDiagnostics(simulatedData);
                setLoading(false);
            } catch (error) {
                console.error("Erreur lors de la récupération des diagnostics:", error);
                setLoading(false);
            }
        };

        fetchDiagnostics();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userVilleCentre");
        navigate("/login");
    };

    const handleEvaluate = (diagnostic) => {
        setSelectedDiagnostic(diagnostic);
        setFormData({
            besoinMaintenance: diagnostic.besoinMaintenance || false,
            typeProbleme: diagnostic.typeProbleme || '',
            degreUrgence: diagnostic.degreUrgence || '',
            description: diagnostic.descriptionProbleme || '',
            dureeEstimee: diagnostic.dureeEstimee || ''
        });
    };

    const handleSubmit = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const updatedDiagnostics = diagnostics.map(d => 
                d.id === selectedDiagnostic.id ? { ...d, ...formData } : d
            );
            setDiagnostics(updatedDiagnostics);
            setSelectedDiagnostic(null);
        } catch (error) {
            console.error("Erreur lors de la mise à jour du diagnostic:", error);
        }
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

    const filteredDiagnostics = diagnostics.filter(diagnostic =>
        diagnostic.nomEquipement.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diagnostic.categorie.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedDiagnostics = [...filteredDiagnostics].sort((a, b) => {
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
    const currentDiagnostics = sortedDiagnostics.slice(indexOfFirstItem, indexOfLastItem);

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
                <h2><FaTools /> Diagnostics des Équipements</h2>
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

                <div className="alert-panel">
                    <div className="alert urgent-alert">
                        <FaExclamationTriangle />
                        <span>Les équipements sont ajoutés automatiquement lorsqu'ils atteignent 1000h d'utilisation (PC) ou 1500h (autres), ou après 20/40 demandes.</span>
                    </div>
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
                                <th onClick={() => requestSort('categorie')}>
                                    <div className="sortable-header">
                                        Catégorie
                                        <span className="sort-icon">
                                            {getSortIcon('categorie')}
                                        </span>
                                    </div>
                                </th>
                                <th onClick={() => requestSort('heuresUtilisation')}>
                                    <div className="sortable-header">
                                        Heures d'utilisation
                                        <span className="sort-icon">
                                            {getSortIcon('heuresUtilisation')}
                                        </span>
                                    </div>
                                </th>
                                <th onClick={() => requestSort('nbDemandes')}>
                                    <div className="sortable-header">
                                        Demandes
                                        <span className="sort-icon">
                                            {getSortIcon('nbDemandes')}
                                        </span>
                                    </div>
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="loading">Chargement en cours...</td>
                                </tr>
                            ) : currentDiagnostics.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="no-data-message">
                                        Aucun équipement nécessitant un diagnostic pour le moment
                                    </td>
                                </tr>
                            ) : (
                                currentDiagnostics.map(diagnostic => (
                                    <tr key={diagnostic.id}>
                                        <td>{diagnostic.nomEquipement}</td>
                                        <td>{diagnostic.categorie}</td>
                                        <td>{diagnostic.heuresUtilisation.toLocaleString()}h</td>
                                        <td>{diagnostic.nbDemandes}</td>
                                        <td>
                                            <button 
                                                className="btn btn-primary"
                                                onClick={() => handleEvaluate(diagnostic)}
                                            >
                                                Évaluer
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredDiagnostics.length > itemsPerPage && (
                    <div className="pagination-container">
                        <Pagination
                            current={currentPage}
                            total={filteredDiagnostics.length}
                            pageSize={itemsPerPage}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                        />
                    </div>
                )}

                {selectedDiagnostic && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="modal-close" onClick={() => setSelectedDiagnostic(null)}>×</button>
                            <h3>Évaluation de l'équipement: {selectedDiagnostic.nomEquipement}</h3>
                            
                            <div className="form-group">
                                <label>
                                    <input 
                                        type="checkbox" 
                                        checked={formData.besoinMaintenance}
                                        onChange={(e) => setFormData({...formData, besoinMaintenance: e.target.checked})}
                                    />
                                    Nécessite une maintenance
                                </label>
                            </div>

                            {formData.besoinMaintenance && (
                                <>
                                    <div className="form-group">
                                        <label>Type de problème</label>
                                        <select 
                                            className="filter-select"
                                            value={formData.typeProbleme}
                                            onChange={(e) => setFormData({...formData, typeProbleme: e.target.value})}
                                        >
                                            <option value="">Sélectionner</option>
                                            <option value="MATERIEL">Matériel</option>
                                            <option value="LOGICIEL">Logiciel</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Degré d'urgence</label>
                                        <select 
                                            className="filter-select"
                                            value={formData.degreUrgence}
                                            onChange={(e) => setFormData({...formData, degreUrgence: e.target.value})}
                                        >
                                            <option value="">Sélectionner</option>
                                            <option value="FAIBLE">Faible</option>
                                            <option value="MOYEN">Moyen</option>
                                            <option value="ELEVE">Élevé</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Description du problème</label>
                                        <textarea 
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Durée estimée (heures)</label>
                                        <input 
                                            type="number" 
                                            value={formData.dureeEstimee}
                                            onChange={(e) => setFormData({...formData, dureeEstimee: e.target.value})}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="form-group" style={{ marginTop: '20px' }}>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleSubmit}
                                    style={{ width: '100%' }}
                                >
                                    <FaCheckCircle /> Enregistrer l'évaluation
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DiagnostiqueEquipements;