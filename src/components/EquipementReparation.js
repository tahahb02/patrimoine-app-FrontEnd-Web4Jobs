import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaWrench, FaClock, FaCheckCircle, FaSearch, 
  FaSort, FaSortUp, FaHistory,FaTachometerAlt,FaTools,FaBell,FaTimes,FaBars,FaUser,FaSignOutAlt,FaSortDown 
} from 'react-icons/fa';
import { Pagination } from 'antd';
import "../styles/responsable.css";

const EquipementReparation = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [equipements, setEquipements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [formData, setFormData] = useState({
        actionsRealisees: '',
        dureeReelle: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'nomEquipement', direction: 'asc' });
    const navigate = useNavigate();
    const location = useLocation();
    const userVilleCentre = localStorage.getItem("userVilleCentre");

    useEffect(() => {
        const fetchEquipements = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const simulatedData = [
                    { 
                        id: 1, 
                        nomEquipement: "PC-0245", 
                        idEquipement: "EQ-1001",
                        typeProbleme: "MATERIEL", 
                        degreUrgence: "ELEVE",
                        dureeEstimee: 4,
                        dateDebut: "2023-05-15T09:00:00",
                        descriptionProbleme: "Surchauffe critique"
                    },
                    { 
                        id: 2, 
                        nomEquipement: "Projecteur-012", 
                        idEquipement: "EQ-2045",
                        typeProbleme: "LOGICIEL", 
                        degreUrgence: "MOYEN",
                        dureeEstimee: 2,
                        dateDebut: "2023-05-14T14:30:00",
                        descriptionProbleme: "Problème de firmware"
                    }
                ];
                
                setEquipements(simulatedData);
                setLoading(false);
            } catch (error) {
                console.error("Erreur lors de la récupération des équipements:", error);
                setLoading(false);
            }
        };

        fetchEquipements();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userVilleCentre");
        navigate("/login");
    };

    const handleTerminer = (maintenance) => {
        setSelectedMaintenance(maintenance);
        setFormData({
            actionsRealisees: maintenance.actionsRealisees || '',
            dureeReelle: maintenance.dureeReelle || ''
        });
    };

    const handleSubmit = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const updatedEquipements = equipements.filter(e => e.id !== selectedMaintenance.id);
            setEquipements(updatedEquipements);
            setSelectedMaintenance(null);
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la maintenance:", error);
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

    const filteredEquipements = equipements.filter(equipement =>
        equipement.nomEquipement.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipement.idEquipement.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedEquipements = [...filteredEquipements].sort((a, b) => {
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
    const currentEquipements = sortedEquipements.slice(indexOfFirstItem, indexOfLastItem);

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
                <h2><FaWrench /> Équipements en Réparation</h2>
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
                                <th onClick={() => requestSort('degreUrgence')}>
                                    <div className="sortable-header">
                                        Urgence
                                        <span className="sort-icon">
                                            {getSortIcon('degreUrgence')}
                                        </span>
                                    </div>
                                </th>
                                <th onClick={() => requestSort('dureeEstimee')}>
                                    <div className="sortable-header">
                                        Durée estimée
                                        <span className="sort-icon">
                                            {getSortIcon('dureeEstimee')}
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
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="loading">Chargement en cours...</td>
                                </tr>
                            ) : currentEquipements.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-data-message">
                                        Aucun équipement en réparation pour le moment
                                    </td>
                                </tr>
                            ) : (
                                currentEquipements.map(equipement => (
                                    <tr key={equipement.id}>
                                        <td>{equipement.nomEquipement}</td>
                                        <td>{equipement.idEquipement}</td>
                                        <td>{equipement.typeProbleme}</td>
                                        <td>
                                            <span className={`badge urgency-badge ${equipement.degreUrgence.toLowerCase()}`}>
                                                {equipement.degreUrgence}
                                            </span>
                                        </td>
                                        <td>{equipement.dureeEstimee}h</td>
                                        <td className="date-cell">
                                            {formatDate(equipement.dateDebut)}
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-success"
                                                onClick={() => handleTerminer(equipement)}
                                            >
                                                <FaCheckCircle /> Terminer
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredEquipements.length > itemsPerPage && (
                    <div className="pagination-container">
                        <Pagination
                            current={currentPage}
                            total={filteredEquipements.length}
                            pageSize={itemsPerPage}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                        />
                    </div>
                )}

                {selectedMaintenance && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="modal-close" onClick={() => setSelectedMaintenance(null)}>×</button>
                            <h3>Terminer la maintenance: {selectedMaintenance.nomEquipement}</h3>
                            
                            <div className="form-group">
                                <label>Actions réalisées</label>
                                <textarea 
                                    value={formData.actionsRealisees}
                                    onChange={(e) => setFormData({...formData, actionsRealisees: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label>Durée réelle (heures)</label>
                                <input 
                                    type="number" 
                                    value={formData.dureeReelle}
                                    onChange={(e) => setFormData({...formData, dureeReelle: e.target.value})}
                                />
                            </div>

                            <div className="form-group" style={{ marginTop: '20px' }}>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleSubmit}
                                    style={{ width: '100%' }}
                                >
                                    <FaCheckCircle /> Confirmer la fin de maintenance
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default EquipementReparation;