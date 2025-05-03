import React, { useState, useEffect } from "react";
import { 
  FaBars, FaCheckCircle, FaTimesCircle, FaSearch, 
  FaFilter, FaBuilding, FaSpinner, FaUser, FaInfoCircle,
  FaTachometerAlt, FaClipboardList, FaBoxOpen, FaHistory, FaChartLine, FaCogs,FaTimes,FaSignOutAlt
} from "react-icons/fa";
import { Pagination, Modal, message } from "antd";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Swal from 'sweetalert2'; // Ajout de l'import Swal

import "../styles/responsable.css";


const ValidationEquipementRP = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pendingEquipments, setPendingEquipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
    const [selectedCenter, setSelectedCenter] = useState("all");
    const [centers, setCenters] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPendingEquipments();
        fetchCenters();
    }, []);

    const fetchPendingEquipments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/api/rp/equipments/pending", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des équipements");
            }
            
            const data = await response.json();
            setPendingEquipments(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching pending equipments:", error);
            message.error("Erreur lors du chargement des équipements en attente");
            setPendingEquipments([]);
            setLoading(false);
        }
    };

    const fetchCenters = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/api/rp/centers", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des centres");
            }
            
            const data = await response.json();
            setCenters(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching centers:", error);
            setCenters([]);
        }
    };

    const handleValidate = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/rp/equipments/validate/${id}`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                message.success("Équipement validé avec succès");
                fetchPendingEquipments();
            } else {
                message.error("Erreur lors de la validation de l'équipement");
            }
        } catch (error) {
            console.error("Error validating equipment:", error);
            message.error("Erreur lors de la validation de l'équipement");
        }
    };

    const handleReject = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/rp/equipments/reject/${id}`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                message.success("Équipement rejeté avec succès");
                fetchPendingEquipments();
            } else {
                message.error("Erreur lors du rejet de l'équipement");
            }
        } catch (error) {
            console.error("Error rejecting equipment:", error);
            message.error("Erreur lors du rejet de l'équipement");
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
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("userRole");
                localStorage.removeItem("userEmail");
                localStorage.removeItem("userNom");
                localStorage.removeItem("userPrenom");
                localStorage.removeItem("userVilleCentre");
                navigate("/login");
            }
        });
    };

    // Garantir que filteredEquipments est toujours un tableau
    const filteredEquipments = (selectedCenter === "all" 
        ? Array.isArray(pendingEquipments) ? pendingEquipments : []
        : Array.isArray(pendingEquipments) 
            ? pendingEquipments.filter(equip => equip.villeCentre === selectedCenter) 
            : []
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEquipments.slice(indexOfFirstItem, indexOfLastItem);

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
                    <li className={location.pathname === '/ResponsablePatrimoineHome' ? 'active' : ''}>
                        <Link to="/ResponsablePatrimoineHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
                    </li>
                    <li className={location.pathname === '/EquipmentsRP' ? 'active' : ''}>
                        <Link to="/EquipmentsRP"><FaCogs /><span>Gestion des Équipements</span></Link>
                    </li>
                    <li className={location.pathname === '/ValidationEquipementRP' ? 'active' : ''}>
                        <Link to="/ValidationEquipementRP"><FaCheckCircle /><span>Validation Équipements</span></Link>
                    </li>
                    <li className={location.pathname === '/GestionDemandesRP' ? 'active' : ''}>
                        <Link to="/GestionDemandesRP"><FaClipboardList /><span>Gestion des Demandes</span></Link>
                    </li>
                    <li className={location.pathname === '/LivraisonsRetoursRP' ? 'active' : ''}>
                        <Link to="/LivraisonsRetoursRP"><FaBoxOpen /><span>Livraisons/Retours</span></Link>
                    </li>
                    <li className={location.pathname === '/HistoriqueDemandesRP' ? 'active' : ''}>
                        <Link to="/HistoriqueDemandesRP"><FaHistory /><span>Historique des Demandes</span></Link>
                    </li>
                    <li className={location.pathname === '/HistoriqueEquipementsRP' ? 'active' : ''}>
                        <Link to="/HistoriqueEquipementsRP"><FaHistory /><span>Historique des Équipements</span></Link>
                    </li>
                    <li className={location.pathname === '/CentresRP' ? 'active' : ''}>
                        <Link to="/CentresRP"><FaBuilding /><span>Gestion des Centres</span></Link>
                    </li>
                    <li className={location.pathname === '/AnalyticsRP' ? 'active' : ''}>
                        <Link to="/AnalyticsRP"><FaChartLine /><span>Analytics</span></Link>
                    </li>
                </ul>

                <div className="sidebar-bottom">
                    <ul>
                        <li className={location.pathname === '/accountRP' ? 'active' : ''}>
                            <Link to="/accountRP"><FaUser /><span>Compte</span></Link>
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
                <div className="welcome-container">
                    <h1>Validation des Équipements</h1>
                    <span className="welcome-subtitle">
                        Équipements ajoutés par les responsables de centre en attente de validation
                    </span>
                </div>

                <div className="search-and-filters">
                    <div className="filter-group">
                        <FaFilter className="filter-icon" />
                        <select
                            className="filter-select"
                            value={selectedCenter}
                            onChange={(e) => setSelectedCenter(e.target.value)}
                        >
                            <option value="all">Tous les centres</option>
                            {centers.map((center, index) => (
                                <option key={index} value={center}>{center}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                        <p>Chargement des équipements en attente...</p>
                    </div>
                ) : (
                    <>
                        <div className="equipment-grid">
                            {currentItems.length > 0 ? (
                                currentItems.map(equipment => (
                                    <div key={equipment.id} className="equipment-card">
                                        <div className="card-content">
                                            <h3>{equipment.name}</h3>
                                            <p><strong>Catégorie:</strong> {equipment.category}</p>
                                            <p><strong>Centre:</strong> {equipment.villeCentre}</p>
                                            <p><strong>Ajouté par:</strong> {equipment.addedBy || "Responsable centre"}</p>
                                            <p><strong>Date ajout:</strong> {new Date(equipment.dateAdded).toLocaleDateString()}</p>
                                            
                                            <div className="card-actions">
                                                <button 
                                                    className="details-button"
                                                    onClick={() => {
                                                        setSelectedEquipment(equipment);
                                                        setIsDetailModalVisible(true);
                                                    }}
                                                >
                                                    <FaInfoCircle /> Détails
                                                </button>
                                                <div className="validation-buttons">
                                                    <button 
                                                        className="validate-button"
                                                        onClick={() => handleValidate(equipment.id)}
                                                    >
                                                        <FaCheckCircle /> Valider
                                                    </button>
                                                    <button 
                                                        className="reject-button"
                                                        onClick={() => handleReject(equipment.id)}
                                                    >
                                                        <FaTimesCircle /> Rejeter
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data">
                                    <p>Aucun équipement en attente de validation</p>
                                </div>
                            )}
                        </div>

                        {filteredEquipments.length > itemsPerPage && (
                            <div className="pagination-container">
                                <Pagination
                                    current={currentPage}
                                    total={filteredEquipments.length}
                                    pageSize={itemsPerPage}
                                    onChange={(page) => setCurrentPage(page)}
                                    showSizeChanger={false}
                                />
                            </div>
                        )}
                    </>
                )}
            </main>

            <Modal
                title={`Détails de l'équipement - ${selectedEquipment?.name}`}
                visible={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={null}
                className="modal-content"
            >
                {selectedEquipment && (
                    <div className="details-content">
                        <div className="detail-row">
                            <span className="detail-label">Nom:</span>
                            <span className="detail-value">{selectedEquipment.name}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Catégorie:</span>
                            <span className="detail-value">{selectedEquipment.category}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Centre:</span>
                            <span className="detail-value">{selectedEquipment.villeCentre}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Ajouté par:</span>
                            <span className="detail-value">{selectedEquipment.addedBy || "Responsable centre"}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Date ajout:</span>
                            <span className="detail-value">{new Date(selectedEquipment.dateAdded).toLocaleString()}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Description:</span>
                            <span className="detail-value">{selectedEquipment.description || "Aucune description"}</span>
                        </div>
                        {selectedEquipment.imageUrl && (
                            <div className="detail-row">
                                <span className="detail-label">Image:</span>
                                <img 
                                    src={selectedEquipment.imageUrl} 
                                    alt={selectedEquipment.name} 
                                    className="equipment-image"
                                />
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ValidationEquipementRP;