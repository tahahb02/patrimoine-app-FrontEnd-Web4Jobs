import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTools, FaClock, FaExclamationTriangle, FaCheckCircle, 
  FaSearch, FaSort, FaSortUp, FaTachometerAlt, FaWrench, 
  FaHistory, FaBell, FaUser, FaSignOutAlt, FaBars, FaTimes, 
  FaSortDown, FaRobot, FaEye, FaInfoCircle
} from 'react-icons/fa';
import { Pagination, Tag, Tooltip, Modal, message } from 'antd';
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
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [detailDiagnostic, setDetailDiagnostic] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const userVilleCentre = localStorage.getItem("userVilleCentre") || "";
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchDiagnostics = async () => {
            try {
                setLoading(true);
                
                if (!token || !userVilleCentre) {
                    throw new Error("Authentification ou ville centre manquante");
                }

                const normalizedVille = userVilleCentre.toUpperCase().replace(" ", "_");
                
                const response = await fetch(`http://localhost:8080/api/diagnostics/ville/${normalizedVille}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Role': 'TECHNICIEN',
                        'X-User-Center': normalizedVille,
                        'Authorization': `Bearer ${token}`
                    },
                    credentials: 'include'
                });

                if (response.status === 403) {
                    navigate('/login');
                    return;
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
                }

                const data = await response.json();
                
                if (!Array.isArray(data)) {
                    throw new Error("Format de données invalide");
                }

                const formattedData = data.map(diagnostic => ({
                    id: diagnostic.id,
                    nomEquipement: diagnostic.nomEquipement || 'Non spécifié',
                    categorie: diagnostic.categorie || 'Non spécifié',
                    idEquipement: diagnostic.idEquipement || 'Non spécifié',
                    dateDiagnostic: diagnostic.dateDiagnostic ? 
                        new Date(diagnostic.dateDiagnostic).toLocaleString() : 'Non spécifié',
                    typeProbleme: diagnostic.typeProbleme || 'Non spécifié',
                    degreUrgence: diagnostic.degreUrgence || 'Non spécifié',
                    descriptionProbleme: diagnostic.descriptionProbleme || 'Aucune description',
                    dureeEstimee: diagnostic.dureeEstimee || 0,
                    besoinMaintenance: Boolean(diagnostic.besoinMaintenance),
                    maintenanceEffectuee: Boolean(diagnostic.maintenanceEffectuee),
                    automaticDiagnostic: Boolean(diagnostic.automaticDiagnostic),
                    villeCentre: diagnostic.villeCentre || userVilleCentre
                }));
                
                setDiagnostics(formattedData);
            } catch (error) {
                console.error("Erreur fetch diagnostics:", error);
                message.error(error.message || 'Erreur de chargement');
                
                if (error.message.includes("Authentification") || error.message.includes("403")) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDiagnostics();
    }, [userVilleCentre, navigate, token]);

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
            if (!selectedDiagnostic) return;

            const response = await fetch(`http://localhost:8080/api/diagnostics/${selectedDiagnostic.id}/evaluation`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-User-Role': 'TECHNICIEN'
                },
                body: JSON.stringify({
                    besoinMaintenance: formData.besoinMaintenance,
                    typeProbleme: formData.typeProbleme,
                    degreUrgence: formData.degreUrgence,
                    description: formData.description,
                    dureeEstimee: parseInt(formData.dureeEstimee)
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur de mise à jour');
            }

            const updatedDiagnostic = await response.json();
            
            setDiagnostics(diagnostics.map(d => 
                d.id === updatedDiagnostic.id ? {
                    ...d,
                    besoinMaintenance: Boolean(updatedDiagnostic.besoinMaintenance),
                    typeProbleme: updatedDiagnostic.typeProbleme || d.typeProbleme,
                    degreUrgence: updatedDiagnostic.degreUrgence || d.degreUrgence,
                    descriptionProbleme: updatedDiagnostic.descriptionProbleme || d.descriptionProbleme,
                    dureeEstimee: updatedDiagnostic.dureeEstimee || d.dureeEstimee
                } : d
            ));
            
            message.success('Diagnostic mis à jour');
            setSelectedDiagnostic(null);
        } catch (error) {
            console.error("Erreur update diagnostic:", error);
            message.error(error.message || "Erreur de mise à jour");
        }
    };

    const showDetails = (diagnostic) => {
        setDetailDiagnostic(diagnostic);
        setIsModalVisible(true);
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

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'ELEVE': return 'red';
            case 'MOYEN': return 'orange';
            case 'FAIBLE': return 'green';
            default: return 'gray';
        }
    };

    const filteredDiagnostics = diagnostics.filter(diagnostic => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
            (diagnostic.nomEquipement?.toLowerCase().includes(searchTermLower)) ||
            (diagnostic.categorie?.toLowerCase().includes(searchTermLower)) ||
            (diagnostic.idEquipement?.toLowerCase().includes(searchTermLower))
        );
    });

    const sortedDiagnostics = [...filteredDiagnostics].sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
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
                    <div className="alert info-alert">
                        <FaInfoCircle />
                        <span>
                            Les diagnostics sont générés automatiquement par le système ou manuellement par les techniciens.
                            <br />
                            Les diagnostics automatiques sont marqués par l'icône <FaRobot />.
                        </span>
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
                                <th onClick={() => requestSort('idEquipement')}>
                                    <div className="sortable-header">
                                        ID Équipement
                                        <span className="sort-icon">
                                            {getSortIcon('idEquipement')}
                                        </span>
                                    </div>
                                </th>
                                <th>
                                    <div className="sortable-header">
                                        Type de Diagnostic
                                    </div>
                                </th>
                                <th>
                                    <div className="sortable-header">
                                        Urgence
                                    </div>
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="loading">Chargement en cours...</td>
                                </tr>
                            ) : currentDiagnostics.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="no-data-message">
                                        {diagnostics.length === 0 ? 
                                            "Aucun diagnostic disponible pour le moment" : 
                                            "Aucun résultat trouvé pour votre recherche"}
                                    </td>
                                </tr>
                            ) : (
                                currentDiagnostics.map(diagnostic => (
                                    <tr key={diagnostic.id}>
                                        <td>{diagnostic.nomEquipement}</td>
                                        <td>{diagnostic.categorie}</td>
                                        <td>{diagnostic.idEquipement}</td>
                                        <td>
                                            {diagnostic.automaticDiagnostic ? (
                                                <Tag icon={<FaRobot />} color="blue">
                                                    Automatique
                                                </Tag>
                                            ) : (
                                                <Tag color="geekblue">Manuel</Tag>
                                            )}
                                        </td>
                                        <td>
                                            {diagnostic.degreUrgence && diagnostic.degreUrgence !== 'Non spécifié' ? (
                                                <Tag color={getUrgencyColor(diagnostic.degreUrgence)}>
                                                    {diagnostic.degreUrgence}
                                                </Tag>
                                            ) : (
                                                <Tag color="gray">Non évalué</Tag>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Tooltip title="Voir les détails">
                                                    <button 
                                                        className="btn btn-view"
                                                        onClick={() => showDetails(diagnostic)}
                                                    >
                                                        <FaEye /> Détails
                                                    </button>
                                                </Tooltip>
                                                <button 
                                                    className="btn btn-primary"
                                                    onClick={() => handleEvaluate(diagnostic)}
                                                >
                                                    Évaluer
                                                </button>
                                            </div>
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

                <Modal
                    title={`Détails du diagnostic - ${detailDiagnostic?.nomEquipement || 'Non spécifié'}`}
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                    width={700}
                >
                    {detailDiagnostic && (
                        <div className="diagnostic-details">
                            <div className="detail-row">
                                <span className="detail-label">ID Équipement:</span>
                                <span className="detail-value">{detailDiagnostic.idEquipement}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Nom:</span>
                                <span className="detail-value">{detailDiagnostic.nomEquipement}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Catégorie:</span>
                                <span className="detail-value">{detailDiagnostic.categorie}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Type de diagnostic:</span>
                                <span className="detail-value">
                                    {detailDiagnostic.automaticDiagnostic ? (
                                        <Tag icon={<FaRobot />} color="blue">Automatique</Tag>
                                    ) : (
                                        <Tag color="geekblue">Manuel</Tag>
                                    )}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Date du diagnostic:</span>
                                <span className="detail-value">
                                    {detailDiagnostic.dateDiagnostic}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Besoin de maintenance:</span>
                                <span className="detail-value">
                                    {detailDiagnostic.besoinMaintenance ? (
                                        <Tag color="red">Oui</Tag>
                                    ) : (
                                        <Tag color="green">Non</Tag>
                                    )}
                                </span>
                            </div>
                            {detailDiagnostic.besoinMaintenance && (
                                <>
                                    <div className="detail-row">
                                        <span className="detail-label">Type de problème:</span>
                                        <span className="detail-value">
                                            {detailDiagnostic.typeProbleme}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Degré d'urgence:</span>
                                        <span className="detail-value">
                                            {detailDiagnostic.degreUrgence && detailDiagnostic.degreUrgence !== 'Non spécifié' ? (
                                                <Tag color={getUrgencyColor(detailDiagnostic.degreUrgence)}>
                                                    {detailDiagnostic.degreUrgence}
                                                </Tag>
                                            ) : (
                                                <Tag color="gray">Non évalué</Tag>
                                            )}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Durée estimée:</span>
                                        <span className="detail-value">
                                            {detailDiagnostic.dureeEstimee} heures
                                        </span>
                                    </div>
                                    <div className="detail-row full-width">
                                        <span className="detail-label">Description du problème:</span>
                                        <div className="detail-value description-box">
                                            {detailDiagnostic.descriptionProbleme}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </Modal>

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
                                            required
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
                                            required
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
                                            placeholder="Décrivez le problème en détail..."
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Durée estimée (heures)</label>
                                        <input 
                                            type="number" 
                                            value={formData.dureeEstimee}
                                            onChange={(e) => setFormData({...formData, dureeEstimee: e.target.value})}
                                            min="1"
                                            required
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