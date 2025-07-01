import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaBars, FaTimes, FaTachometerAlt, FaUsers, FaCogs, 
  FaClipboardList, FaHistory, FaWrench, FaExclamationTriangle,
  FaUser, FaSignOutAlt, FaSearch, FaFilter, FaSync, FaEye,
  FaRobot, FaUserEdit
} from "react-icons/fa";
import { Pagination } from 'antd';
import Swal from "sweetalert2";
import "../styles/responsable.css";

const DiagnosticsDirecteur = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [diagnostics, setDiagnostics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedCenter, setSelectedCenter] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [centers, setCenters] = useState([
        "TINGHIR", "TEMARA", "TCHAD", "ESSAOUIRA", 
        "DAKHLA", "LAAYOUNE", "NADOR", "AIN_EL_AOUDA"
    ]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDiagnostics();
    }, []);

    const fetchDiagnostics = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const userRole = localStorage.getItem("userRole");

            if (!token || !userRole) {
                throw new Error("Authentification requise");
            }

            console.log("Envoi de la requête GET à /api/diagnostics/all");

            const response = await fetch("http://localhost:8080/api/diagnostics/all", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "X-User-Role": userRole
                },
                credentials: 'include'
            });

            console.log("Réponse reçue, status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Erreur du serveur:", errorText);
                throw new Error(errorText || `Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log("Données reçues:", data);
            setDiagnostics(data);
        } catch (error) {
            console.error("Erreur complète:", error);
            setError(error.message || "Erreur inconnue lors de la récupération des diagnostics");
            Swal.fire({
                title: 'Erreur',
                text: 'Échec de la récupération des diagnostics: ' + (error.message || "Erreur inconnue"),
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const formatVilleCentre = (ville) => {
        if (!ville) return "Non spécifié";
        return ville
            .replace(/_/g, " ")
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    };

    const formatTypeProbleme = (type) => {
        if (!type) return "-";
        return type === "MATERIEL" ? "Matériel" : "Logiciel";
    };

    const formatDegreUrgence = (degre) => {
        if (!degre) return "-";
        switch (degre) {
            case "FAIBLE": return "Faible";
            case "MOYEN": return "Moyen";
            case "ELEVE": return "Élevé";
            default: return degre;
        }
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'Déconnexion',
            text: 'Êtes-vous sûr de vouloir vous déconnecter?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, déconnecter',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                navigate("/login");
            }
        });
    };

    const filteredDiagnostics = diagnostics.filter((diagnostic) => {
        const matchesSearch = 
            diagnostic.nomEquipement?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            diagnostic.descriptionProbleme?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = selectedType ? 
            (selectedType === "AUTO" ? diagnostic.automaticDiagnostic : !diagnostic.automaticDiagnostic) : true;
            
        const matchesCenter = selectedCenter ? diagnostic.villeCentre === selectedCenter : true;
        
        const matchesStatus = selectedStatus ? 
            (selectedStatus === "MAINTENANCE" ? diagnostic.besoinMaintenance : !diagnostic.besoinMaintenance) : true;

        return matchesSearch && matchesType && matchesCenter && matchesStatus;
    });

    const handleViewDetails = (diagnostic) => {
        setSelectedDiagnostic(diagnostic);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedDiagnostic(null);
    };

    const handleRetry = () => {
        setError(null);
        fetchDiagnostics();
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDiagnostics = filteredDiagnostics.slice(indexOfFirstItem, indexOfLastItem);

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-indicator">
                    <div className="spinner"></div>
                    <p>Chargement en cours...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="error-container">
                    <FaExclamationTriangle className="error-icon" size={48} />
                    <h3>Erreur de chargement</h3>
                    <p className="error-message">{error}</p>
                    <div className="error-actions">
                        <button onClick={handleRetry} className="retry-button">
                            <FaSync /> Réessayer
                        </button>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="refresh-button"
                        >
                            Actualiser la page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                        <Link to="/DirecteurHome">
                            <FaTachometerAlt className="icon" />
                            <span>Tableau de Bord</span>
                        </Link>
                    </li>
                    <li className={location.pathname.includes('/DirecteurUtilisateurs') ? 'active' : ''}>
                        <Link to="/DirecteurUtilisateurs">
                            <FaUsers className="icon" />
                            <span>Utilisateurs</span>
                        </Link>
                    </li>
                    <li className={location.pathname === '/EquipementsDirecteur' ? 'active' : ''}>
                        <Link to="/EquipementsDirecteur">
                            <FaCogs className="icon" />
                            <span>Équipements</span>
                        </Link>
                    </li>
                    <li className={location.pathname === '/DiagnosticsDirecteur' ? 'active' : ''}>
                        <Link to="/DiagnosticsDirecteur">
                            <FaWrench className="icon" />
                            <span>Diagnostics</span>
                        </Link>
                    </li>
                    <li className={location.pathname === '/HistoriqueDemandesDirecteur' ? 'active' : ''}>
                        <Link to="/HistoriqueDemandesDirecteur">
                            <FaClipboardList className="icon" />
                            <span>Historique Demandes</span>
                        </Link>
                    </li>
                    <li className={location.pathname === '/HistoriqueEquipementsDirecteur' ? 'active' : ''}>
                        <Link to="/HistoriqueEquipementsDirecteur">
                            <FaHistory className="icon" />
                            <span>Historique Utilisations</span>
                        </Link>
                    </li>
                    <li className={location.pathname === '/DirecteurHistoriqueMaintenances' ? 'active' : ''}>
                        <Link to="/DirecteurHistoriqueMaintenances">
                            <FaWrench className="icon" />
                            <span>Historique Maintenances</span>
                        </Link>
                    </li>
                </ul>

                <div className="sidebar-bottom">
                    <ul>
                        <li className={location.pathname === '/DirecteurAccount' ? 'active' : ''}>
                            <Link to="/DirecteurAccount">
                                <FaUser className="icon" />
                                <span>Compte</span>
                            </Link>
                        </li>
                        <li>
                            <button onClick={handleLogout} className="logout-button">
                                <FaSignOutAlt className="icon" />
                                <span>Déconnexion</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </aside>

            <main className="content">
                <div className="content-header">
                    <h2>Gestion des Diagnostics</h2>
                    <button onClick={fetchDiagnostics} className="refresh-btn">
                        <FaSync /> Actualiser
                    </button>
                </div>

                <div className="search-and-filters">
                    <div className="search-bar">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Rechercher diagnostics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filters-container">
                        <div className="filter-group">
                            <FaFilter className="filter-icon" />
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Tous types</option>
                                <option value="AUTO">Automatique</option>
                                <option value="MANUEL">Manuel</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <FaFilter className="filter-icon" />
                            <select
                                value={selectedCenter}
                                onChange={(e) => setSelectedCenter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Tous centres</option>
                                {centers.map((center, index) => (
                                    <option key={`center-${index}`} value={center}>
                                        {formatVilleCentre(center)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <FaFilter className="filter-icon" />
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Tous statuts</option>
                                <option value="MAINTENANCE">Besoin maintenance</option>
                                <option value="NO_MAINTENANCE">Pas de maintenance</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="table-container">
                    <table className="equipments-table">
                        <thead>
                            <tr>
                                <th>Équipement</th>
                                <th>Centre</th>
                                <th>Type</th>
                                <th>Diagnostic</th>
                                <th>Urgence</th>
                                <th>Maintenance</th>
                                <th>Type Diagnostic</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDiagnostics.length > 0 ? (
                                currentDiagnostics.map((diagnostic) => (
                                    <tr key={`diag-${diagnostic.id}`}>
                                        <td>
                                            <div className="equipment-name">{diagnostic.nomEquipement}</div>
                                            <div className="equipment-details">{diagnostic.categorie}</div>
                                        </td>
                                        <td>{formatVilleCentre(diagnostic.villeCentre)}</td>
                                        <td>{formatTypeProbleme(diagnostic.typeProbleme)}</td>
                                        <td>
                                            {diagnostic.descriptionProbleme ? 
                                                (diagnostic.descriptionProbleme.length > 50 ? 
                                                    `${diagnostic.descriptionProbleme.substring(0, 50)}...` : 
                                                    diagnostic.descriptionProbleme) 
                                                : "-"}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${diagnostic.degreUrgence?.toLowerCase()}`}>
                                                {formatDegreUrgence(diagnostic.degreUrgence)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${diagnostic.besoinMaintenance ? 'maintenance' : 'no-maintenance'}`}>
                                                {diagnostic.besoinMaintenance ? "Oui" : "Non"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="diagnostic-type">
                                                {diagnostic.automaticDiagnostic ? (
                                                    <>
                                                        <FaRobot className="auto-icon" /> Automatique
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaUserEdit className="manual-icon" /> Manuel
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {diagnostic.dateDiagnostic ? 
                                                new Date(diagnostic.dateDiagnostic).toLocaleDateString() : "-"}
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => handleViewDetails(diagnostic)}
                                                className="details-button"
                                            >
                                                <FaEye /> Détails
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="no-results">
                                        {selectedCenter || selectedType || selectedStatus ? (
                                            <>
                                                <FaSearch style={{ marginRight: '10px' }} />
                                                Aucun diagnostic trouvé avec ces critères
                                            </>
                                        ) : (
                                            <>
                                                <FaSearch style={{ marginRight: '10px' }} />
                                                Aucun diagnostic disponible
                                            </>
                                        )}
                                    </td>
                                </tr>
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
                            showQuickJumper
                        />
                    </div>
                )}
            </main>

            {showDetailsModal && selectedDiagnostic && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={handleCloseDetailsModal}>
                            &times;
                        </button>
                        <h3>Détails du diagnostic</h3>
                        <div className="details-content">
                            <div className="detail-row">
                                <span className="detail-label">Équipement:</span>
                                <span className="detail-value">
                                    {selectedDiagnostic.nomEquipement || "-"} ({selectedDiagnostic.idEquipement})
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Catégorie:</span>
                                <span className="detail-value">{selectedDiagnostic.categorie || "-"}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Centre:</span>
                                <span className="detail-value">{formatVilleCentre(selectedDiagnostic.villeCentre)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Type de problème:</span>
                                <span className="detail-value">{formatTypeProbleme(selectedDiagnostic.typeProbleme)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Degré d'urgence:</span>
                                <span className={`detail-value status-badge ${selectedDiagnostic.degreUrgence?.toLowerCase()}`}>
                                    {formatDegreUrgence(selectedDiagnostic.degreUrgence)}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Description:</span>
                                <span className="detail-value">{selectedDiagnostic.descriptionProbleme || "-"}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Durée estimée:</span>
                                <span className="detail-value">
                                    {selectedDiagnostic.dureeEstimee ? `${selectedDiagnostic.dureeEstimee} heures` : "-"}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Besoin maintenance:</span>
                                <span className={`detail-value status-badge ${selectedDiagnostic.besoinMaintenance ? 'maintenance' : 'no-maintenance'}`}>
                                    {selectedDiagnostic.besoinMaintenance ? "Oui" : "Non"}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Maintenance effectuée:</span>
                                <span className={`detail-value status-badge ${selectedDiagnostic.maintenanceEffectuee ? 'validated' : 'not-validated'}`}>
                                    {selectedDiagnostic.maintenanceEffectuee ? "Oui" : "Non"}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Type de diagnostic:</span>
                                <span className="detail-value">
                                    {selectedDiagnostic.automaticDiagnostic ? (
                                        <span className="diagnostic-type">
                                            <FaRobot className="auto-icon" /> Automatique
                                        </span>
                                    ) : (
                                        <span className="diagnostic-type">
                                            <FaUserEdit className="manual-icon" /> Manuel
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Date du diagnostic:</span>
                                <span className="detail-value">
                                    {selectedDiagnostic.dateDiagnostic ? 
                                        new Date(selectedDiagnostic.dateDiagnostic).toLocaleString() : "-"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiagnosticsDirecteur;