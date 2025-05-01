import React, { useState, useEffect } from "react";
import { 
  FaBars, FaCheckCircle, FaTimesCircle, FaSearch, 
  FaFilter, FaBuilding, FaSpinner, FaUser ,FaInfoCircle
} from "react-icons/fa";
import { Pagination, Modal, message } from "antd";
import { useNavigate } from "react-router-dom";
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
            const data = await response.json();
            setPendingEquipments(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching pending equipments:", error);
            message.error("Erreur lors du chargement des équipements en attente");
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
            const data = await response.json();
            setCenters(data);
        } catch (error) {
            console.error("Error fetching centers:", error);
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
        localStorage.clear();
        navigate("/login");
    };

    const filteredEquipments = selectedCenter === "all" 
        ? pendingEquipments 
        : pendingEquipments.filter(equip => equip.villeCentre === selectedCenter);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEquipments.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                <ul className="sidebar-menu">
                    <li>
                        <a href="/responsable-home">
                            <FaBuilding />
                            <span>Tableau de bord</span>
                        </a>
                    </li>
                    <li className="active">
                        <a href="/validation-equipements">
                            <FaCheckCircle />
                            <span>Validation Équipements</span>
                        </a>
                    </li>
                    <li>
                        <a href="/historique-equipements">
                            <FaInfoCircle />
                            <span>Historique Équipements</span>
                        </a>
                    </li>
                </ul>
                <div className="sidebar-bottom">
                    <ul>
                        <li className="logout" onClick={handleLogout}>
                            <a>
                                <FaUser />
                                <span>Déconnexion</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Navbar */}
            <nav className="navbar">
                <FaBars 
                    className="menu-icon" 
                    onClick={() => setSidebarOpen(!sidebarOpen)} 
                />
                <img src="/logo.png" alt="Logo" className="navbar-logo" />
            </nav>

            {/* Main Content */}
            <main className={`content ${sidebarOpen ? "sidebar-expanded" : ""}`}>
                <div className="welcome-container">
                    <h1 className="welcome-title">Validation des Équipements</h1>
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
                            {centers.map(center => (
                                <option key={center} value={center}>{center}</option>
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

            {/* Modal de détails */}
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