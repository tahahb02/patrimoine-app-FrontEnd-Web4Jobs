import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaBars, FaTimes, FaTachometerAlt, FaUsers, FaCogs, 
  FaClipboardList, FaHistory, FaWrench, FaExclamationTriangle,
  FaUser, FaSignOutAlt, FaSearch, FaFilter, FaSync, FaEye
} from "react-icons/fa";
import { Pagination } from 'antd';
import Swal from "sweetalert2";
import "../styles/responsable.css";

const EquipementsDirecteur = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [equipments, setEquipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedCenter, setSelectedCenter] = useState("");
    const [categories, setCategories] = useState([]);
    const [centers, setCenters] = useState([
        "TINGHIR", "TEMARA", "TCHAD", "ESSAOUIRA", 
        "DAKHLA", "LAAYOUNE", "NADOR", "AIN_EL_AOUDA"
    ]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            await fetchEquipments();
        } catch (error) {
            console.error("Initial fetch error:", error);
            setError(error.message);
        }
    };

    const fetchEquipments = async () => {
    setLoading(true);
    setError(null);
    try {
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("userRole");

        if (!token || !userRole) {
            throw new Error("Authentification requise");
        }

        const response = await fetch("http://localhost:8080/api/equipments/directeur/all", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "X-User-Role": userRole
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        setEquipments(data.map(equip => ({
            ...equip,
            enMaintenance: equip.enMaintenance || false,
            status: equip.status || "Disponible",
            validated: equip.validated || false,
            villeCentre: equip.villeCentre || "Non spécifié"
        })));

        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories.filter(cat => cat));

    } catch (error) {
        console.error("Erreur de récupération:", error);
        setError(error.message);
        Swal.fire({
            title: 'Erreur',
            text: 'Échec de la récupération des équipements: ' + error.message,
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

    const filteredEquipments = equipments.filter((equipment) => {
        const matchesSearch = equipment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            equipment.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory ? equipment.category === selectedCategory : true;
        const matchesCenter = selectedCenter ? equipment.villeCentre === selectedCenter : true;

        return matchesSearch && matchesCategory && matchesCenter;
    });

    const handleViewDetails = (equipment) => {
        setSelectedEquipment(equipment);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedEquipment(null);
    };

    const handleRetry = () => {
        setError(null);
        fetchEquipments();
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEquipments = filteredEquipments.slice(indexOfFirstItem, indexOfLastItem);

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
                                        <Link to="/DirecteurHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
                                    </li>
                                    <li className={location.pathname.includes('/DirecteurUtilisateurs') ? 'active' : ''}>
                                        <Link to="/DirecteurUtilisateurs"><FaUsers /><span>Utilisateurs</span></Link>
                                    </li>
                                    <li className={location.pathname === '/EquipementsDirecteur' ? 'active' : ''}>
                                        <Link to="/EquipementsDirecteur"><FaCogs /><span>Équipements</span></Link>
                                    </li>
                                    <li className={location.pathname === '/HistoriqueDemandesDirecteur' ? 'active' : ''}>
                                        <Link to="/HistoriqueDemandesDirecteur"><FaClipboardList /><span>Historique Demandes</span></Link>
                                    </li>
                                    <li className={location.pathname === '/HistoriqueEquipementsDirecteur' ? 'active' : ''}>
                                        <Link to="/HistoriqueEquipementsDirecteur"><FaHistory /><span>Historique Utilisations</span></Link>
                                    </li>
                                     <li className={location.pathname === '/DiagnosticsDirecteur' ? 'active' : ''}>
                                                            <Link to="/DiagnosticsDirecteur">
                                                                <FaWrench className="icon" />
                                                                <span>Diagnostics</span>
                                                            </Link>
                                                        </li>
                                    <li className={location.pathname === '/DirecteurHistoriqueMaintenances' ? 'active' : ''}>
                                        <Link to="/DirecteurHistoriqueMaintenances"><FaWrench /><span>Historique Maintenances</span></Link>
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
                    <h2>Gestion des Équipements</h2>
                    
                </div>

                <div className="search-and-filters">
                    <div className="search-bar">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Rechercher équipements..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filters-container">
                        <div className="filter-group">
                            <FaFilter className="filter-icon" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Toutes catégories</option>
                                {categories.map((category, index) => (
                                    <option key={`cat-${index}`} value={category}>
                                        {category}
                                    </option>
                                ))}
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
                    </div>
                </div>

                <div className="table-container">
                    <table className="equipments-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Nom</th>
                                <th>Catégorie</th>
                                <th>Centre</th>
                                <th>Statut</th>
                                <th>Validé</th>
                                <th>Maintenance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEquipments.length > 0 ? (
                                currentEquipments.map((equipment) => (
                                    <tr key={`equip-${equipment.id}`}>
                                        <td className="image-cell">
                                            {equipment.imageUrl ? (
                                                <img 
                                                    src={equipment.imageUrl} 
                                                    alt={equipment.name}
                                                    className="equipment-image"
                                                    onError={(e) => {
                                                        e.target.src = '/images/equipment-placeholder.png';
                                                    }}
                                                />
                                            ) : (
                                                <div className="image-placeholder">
                                                    <FaCogs />
                                                </div>
                                            )}
                                        </td>
                                        <td>{equipment.name || "-"}</td>
                                        <td>{equipment.category || "-"}</td>
                                        <td>{formatVilleCentre(equipment.villeCentre)}</td>
                                        <td>
                                            <span className={`status-badge ${equipment.status.toLowerCase().replace(' ', '-')}`}>
                                                {equipment.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${equipment.validated ? 'validated' : 'not-validated'}`}>
                                                {equipment.validated ? "Oui" : "Non"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${equipment.enMaintenance ? 'maintenance' : 'no-maintenance'}`}>
                                                {equipment.enMaintenance ? "Oui" : "Non"}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => handleViewDetails(equipment)}
                                                className="details-button"
                                            >
                                                <FaEye /> Détails
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="no-results">
                                        {selectedCenter ? (
                                            <>
                                                <FaSearch style={{ marginRight: '10px' }} />
                                                Aucun équipement trouvé dans le centre {formatVilleCentre(selectedCenter)}
                                            </>
                                        ) : (
                                            <>
                                                <FaSearch style={{ marginRight: '10px' }} />
                                                Aucun équipement trouvé avec ces critères
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredEquipments.length > itemsPerPage && (
                    <div className="pagination-container">
                        <Pagination
                            current={currentPage}
                            total={filteredEquipments.length}
                            pageSize={itemsPerPage}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                            showQuickJumper
                        />
                    </div>
                )}
            </main>

            {showDetailsModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={handleCloseDetailsModal}>
                            &times;
                        </button>
                        <h3>Détails de l'équipement</h3>
                        {selectedEquipment && (
                            <div className="details-content">
                                <div className="detail-row">
                                    <span className="detail-label">Image:</span>
                                    <span className="detail-value">
                                        {selectedEquipment.imageUrl ? (
                                            <img 
                                                src={selectedEquipment.imageUrl} 
                                                alt={selectedEquipment.name}
                                                className="equipment-image-modal"
                                            />
                                        ) : (
                                            <div className="image-placeholder-modal">
                                                <FaCogs />
                                            </div>
                                        )}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Nom:</span>
                                    <span className="detail-value">{selectedEquipment.name || "-"}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Catégorie:</span>
                                    <span className="detail-value">{selectedEquipment.category || "-"}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Centre:</span>
                                    <span className="detail-value">{formatVilleCentre(selectedEquipment.villeCentre)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Description:</span>
                                    <span className="detail-value">{selectedEquipment.description || "-"}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Statut:</span>
                                    <span className={`detail-value status-badge ${selectedEquipment.status.toLowerCase().replace(' ', '-')}`}>
                                        {selectedEquipment.status}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Validé:</span>
                                    <span className={`detail-value status-badge ${selectedEquipment.validated ? 'validated' : 'not-validated'}`}>
                                        {selectedEquipment.validated ? "Oui" : "Non"}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">En maintenance:</span>
                                    <span className={`detail-value status-badge ${selectedEquipment.enMaintenance ? 'maintenance' : 'no-maintenance'}`}>
                                        {selectedEquipment.enMaintenance ? "Oui" : "Non"}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Date d'ajout:</span>
                                    <span className="detail-value">
                                        {selectedEquipment.dateAdded ? new Date(selectedEquipment.dateAdded).toLocaleString() : "-"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipementsDirecteur;