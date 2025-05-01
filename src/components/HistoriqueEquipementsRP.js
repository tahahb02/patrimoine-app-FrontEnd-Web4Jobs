import React, { useState, useEffect } from "react";
import { 
  FaBars, FaTimes, FaHistory, FaSearch, FaFilter, 
  FaBuilding, FaCogs, FaUser, FaClock, FaPhone, FaEnvelope
} from "react-icons/fa";
import { Pagination, Select, Modal } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/responsable.css";

const { Option } = Select;

const HistoriqueEquipementsRP = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [equipments, setEquipments] = useState([]);
    const [filteredEquipments, setFilteredEquipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCenter, setSelectedCenter] = useState("all");
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [historique, setHistorique] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [centers, setCenters] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchEquipments();
        fetchCenters();
    }, []);

    useEffect(() => {
        filterEquipments();
    }, [equipments, searchTerm, selectedCenter]);

    const fetchEquipments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/api/rp/equipments", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setEquipments(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching equipments:", error);
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

    const fetchHistorique = async (equipmentId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/rp/historique-equipements/${equipmentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setHistorique(data);
            setIsModalVisible(true);
        } catch (error) {
            console.error("Error fetching historique:", error);
            setHistorique(null);
        }
    };

    const filterEquipments = () => {
        let filtered = [...equipments];

        if (searchTerm) {
            filtered = filtered.filter(equip => 
                equip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                equip.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCenter !== "all") {
            filtered = filtered.filter(equip => equip.villeCentre === selectedCenter);
        }

        setFilteredEquipments(filtered);
    };

    const calculateTotalHours = () => {
        if (!historique || !historique.utilisations) return 0;
        return historique.utilisations.reduce((total, utilisation) => {
            return total + (utilisation.heuresUtilisation || 0);
        }, 0);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

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
                        <a href="/historique-equipements">
                            <FaHistory />
                            <span>Historique Équipements</span>
                        </a>
                    </li>
                    <li>
                        <a href="/gestion-demandes">
                            <FaCogs />
                            <span>Gestion Demandes</span>
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
                    <h1 className="welcome-title">Historique d'Utilisation des Équipements</h1>
                    <span className="welcome-subtitle">
                        Consultez l'historique d'utilisation de tous les équipements
                    </span>
                </div>
                
                <div className="search-and-filters">
                    <div className="search-bar">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou catégorie..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <FaFilter className="filter-icon" />
                        <Select
                            className="filter-select"
                            value={selectedCenter}
                            onChange={(value) => setSelectedCenter(value)}
                        >
                            <Option value="all">Tous les centres</Option>
                            {centers.map(center => (
                                <Option key={center} value={center}>{center}</Option>
                            ))}
                        </Select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                        <p>Chargement en cours...</p>
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
                                            <p><strong>Date ajout:</strong> {new Date(equipment.dateAdded).toLocaleDateString()}</p>
                                            
                                            <button 
                                                className="view-button"
                                                onClick={() => {
                                                    setSelectedEquipment(equipment);
                                                    fetchHistorique(equipment.id);
                                                }}
                                            >
                                                <FaHistory /> Voir l'historique
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data">
                                    <p>Aucun équipement trouvé</p>
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

            {/* Modal d'historique */}
            <Modal
                title={`Historique d'utilisation - ${selectedEquipment?.name}`}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
                className="modal-content"
            >
                {historique ? (
                    <div className="details-content">
                        <div className="stats-container">
                            <div className="stat-card">
                                <h4>Total d'utilisations</h4>
                                <p>{historique.totalUtilisations || 0}</p>
                            </div>
                            <div className="stat-card">
                                <h4>Total heures d'utilisation</h4>
                                <p>{calculateTotalHours()} heures</p>
                            </div>
                            <div className="stat-card">
                                <h4>Centre</h4>
                                <p>{selectedEquipment?.villeCentre}</p>
                            </div>
                        </div>

                        {historique.utilisations && historique.utilisations.length > 0 ? (
                            <div className="historique-table-container">
                                <table className="historique-table">
                                    <thead>
                                        <tr>
                                            <th>Utilisateur</th>
                                            <th>Contact</th>
                                            <th>Heures d'utilisation</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historique.utilisations.map((utilisation, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div className="user-info">
                                                        <FaUser className="user-icon" />
                                                        <span>{utilisation.prenom} {utilisation.nom}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="contact-info">
                                                        <a href={`mailto:${utilisation.email}`}>
                                                            <FaEnvelope /> {utilisation.email}
                                                        </a>
                                                        <a href={`tel:${utilisation.telephone}`}>
                                                            <FaPhone /> {utilisation.telephone}
                                                        </a>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="hours-info">
                                                        <FaClock /> {utilisation.heuresUtilisation} heures
                                                    </div>
                                                </td>
                                                <td>
                                                    {new Date(utilisation.dateUtilisation).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="no-history-message">
                                <p>Aucune utilisation enregistrée pour cet équipement</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                        <p>Chargement de l'historique...</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default HistoriqueEquipementsRP;