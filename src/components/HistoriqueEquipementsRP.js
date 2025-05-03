import React, { useState, useEffect } from "react";
import { 
  FaBars, FaTimes, FaHistory, FaSearch, FaFilter, 
  FaUser, FaBuilding, FaCog, FaClock, FaCheckCircle, FaTimesCircle,
  FaTachometerAlt, FaChartLine, FaSignOutAlt, FaBoxOpen, FaPhone, FaEnvelope
} from "react-icons/fa";
import { Pagination, Select, Modal, message } from "antd"; // Ajout de message ici
import { useNavigate, useLocation, Link } from "react-router-dom";
import Swal from 'sweetalert2';
import "../styles/responsable.css";

const { Option } = Select;

const HistoriqueEquipementsRP = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [equipments, setEquipments] = useState([]);
    const [filteredEquipments, setFilteredEquipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCenter, setSelectedCenter] = useState("all");
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [historique, setHistorique] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [centers, setCenters] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();

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
            
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des équipements");
            }
            
            const data = await response.json();
            setEquipments(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching equipments:", error);
            message.error("Erreur lors du chargement des équipements");
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
            setCenters(Array.isArray(data) ? data : ['TEMARA', 'RABAT', 'CASABLANCA', 'TINGHIR', 'ESSAOUIRA', 'DAKHLA', 'LAAYOUNE', 'NADOR', 'AIN_EL_AOUDA']);
        } catch (error) {
            console.error("Error fetching centers:", error);
            message.error("Erreur lors du chargement des centres");
            setCenters(['TEMARA', 'RABAT', 'CASABLANCA', 'TINGHIR', 'ESSAOUIRA', 'DAKHLA', 'LAAYOUNE', 'NADOR', 'AIN_EL_AOUDA']);
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
            
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération de l'historique");
            }
            
            const data = await response.json();
            setHistorique(data);
            setIsModalVisible(true);
        } catch (error) {
            console.error("Error fetching historique:", error);
            message.error("Erreur lors du chargement de l'historique");
            setHistorique(null);
        }
    };

    const filterEquipments = () => {
        let filtered = Array.isArray(equipments) ? [...equipments] : [];

        if (searchTerm) {
            filtered = filtered.filter(equip => 
                equip.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                equip.category?.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <Link to="/EquipmentsRP"><FaCog /><span>Gestion des Équipements</span></Link>
                    </li>
                    <li className={location.pathname === '/ValidationEquipementRP' ? 'active' : ''}>
                        <Link to="/ValidationEquipementRP"><FaCheckCircle /><span>Validation Équipements</span></Link>
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
                    <h1>Historique des Équipements</h1>
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

                    <div className="filters-container">
                        <div className="filter-group">
                            <FaFilter className="filter-icon" />
                            <Select
                                className="filter-select"
                                value={selectedCenter}
                                onChange={(value) => setSelectedCenter(value)}
                            >
                                <Option value="all">Tous les centres</Option>
                                {centers.map((center, index) => (
                                    <Option key={index} value={center}>{center}</Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                        <p>Chargement en cours...</p>
                    </div>
                ) : (
                    <>
                        <div className="table-container">
                            <table className="demandes-table">
                                <thead>
                                    <tr>
                                        <th>Équipement</th>
                                        <th>Catégorie</th>
                                        <th>Centre</th>
                                        <th>Date d'ajout</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? (
                                        currentItems.map(equipment => (
                                            <tr key={equipment.id}>
                                                <td>
                                                    <div className="equipment-info">
                                                        <FaBoxOpen className="equipment-icon" />
                                                        <span>{equipment.name}</span>
                                                    </div>
                                                </td>
                                                <td>{equipment.category}</td>
                                                <td>
                                                    <div className="center-info">
                                                        <FaBuilding className="center-icon" />
                                                        <span>{equipment.villeCentre}</span>
                                                    </div>
                                                </td>
                                                <td>{new Date(equipment.dateAdded).toLocaleDateString()}</td>
                                                <td>
                                                    <button 
                                                        className="view-button"
                                                        onClick={() => {
                                                            setSelectedEquipment(equipment);
                                                            fetchHistorique(equipment.id);
                                                        }}
                                                    >
                                                        <FaHistory /> Voir l'historique
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="no-data">
                                                Aucun équipement trouvé
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