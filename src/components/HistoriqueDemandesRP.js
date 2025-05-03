import React, { useState, useEffect } from "react";
import { 
  FaBars, FaTimes, FaClipboardList, FaSearch, FaFilter, 
  FaUser, FaBuilding, FaCog, FaClock, FaCheckCircle, FaTimesCircle,
  FaTachometerAlt, FaHistory, FaChartLine, FaSignOutAlt, FaBoxOpen
} from "react-icons/fa";
import { Pagination, Select, DatePicker, message } from "antd"; 
import { useNavigate, useLocation, Link } from "react-router-dom";
import Swal from 'sweetalert2';
import "../styles/responsable.css";

const { Option } = Select;
const { RangePicker } = DatePicker;

const HistoriqueDemandesRP = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [demandes, setDemandes] = useState([]);
    const [filteredDemandes, setFilteredDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCenter, setSelectedCenter] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [dateRange, setDateRange] = useState([]);
    const [centers, setCenters] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDemandes();
        fetchCenters();
    }, []);

    useEffect(() => {
        filterDemandes();
    }, [demandes, searchTerm, selectedCenter, selectedStatus, dateRange]);

    const fetchDemandes = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/api/rp/demandes", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des demandes");
            }
            
            const data = await response.json();
            setDemandes(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching demandes:", error);
            message.error("Erreur lors du chargement des demandes");
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
            setCenters(['TEMARA', 'RABAT', 'CASABLANCA', 'TINGHIR', 'ESSAOUIRA', 'DAKHLA', 'LAAYOUNE', 'NADOR', 'AIN_EL_AOUDA']);
        }
    };

    const filterDemandes = () => {
        let filtered = Array.isArray(demandes) ? [...demandes] : [];

        if (searchTerm) {
            filtered = filtered.filter(demande => 
                demande.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                demande.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                demande.nomEquipement?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCenter !== "all") {
            filtered = filtered.filter(demande => demande.centreEquipement === selectedCenter);
        }

        if (selectedStatus !== "all") {
            filtered = filtered.filter(demande => demande.statut === selectedStatus);
        }

        if (dateRange?.length === 2) {
            const startDate = new Date(dateRange[0]);
            const endDate = new Date(dateRange[1]);
            
            filtered = filtered.filter(demande => {
                const demandeDate = new Date(demande.dateDemande);
                return demandeDate >= startDate && demandeDate <= endDate;
            });
        }

        setFilteredDemandes(filtered);
    };

    const getStatusBadge = (statut) => {
        switch(statut) {
            case "ACCEPTEE":
                return <span className="status-badge accepted"><FaCheckCircle /> Acceptée</span>;
            case "REFUSEE":
                return <span className="status-badge rejected"><FaTimesCircle /> Refusée</span>;
            case "EN_ATTENTE":
                return <span className="status-badge en-attente"><FaClock /> En attente</span>;
            default:
                return <span className="status-badge">{statut}</span>;
        }
    };

    const calculateResponseTime = (dateDemande, dateReponse) => {
        if (!dateReponse) return "Non répondu";
        
        const start = new Date(dateDemande);
        const end = new Date(dateReponse);
        const diff = end - start;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${days > 0 ? days + 'j ' : ''}${hours}h ${minutes}m`;
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
    const currentItems = filteredDemandes.slice(indexOfFirstItem, indexOfLastItem);

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
                    <h1>Historique des Demandes</h1>
                    <span className="welcome-subtitle">
                        Consultez l'historique des demandes de tous les centres
                    </span>
                </div>

                <div className="search-and-filters">
                    <div className="search-bar">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, prénom ou équipement..."
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

                        <div className="filter-group">
                            <FaFilter className="filter-icon" />
                            <Select
                                className="filter-select"
                                value={selectedStatus}
                                onChange={(value) => setSelectedStatus(value)}
                            >
                                <Option value="all">Tous les statuts</Option>
                                <Option value="ACCEPTEE">Acceptées</Option>
                                <Option value="REFUSEE">Refusées</Option>
                                <Option value="EN_ATTENTE">En attente</Option>
                            </Select>
                        </div>

                        <div className="filter-group">
                            <FaFilter className="filter-icon" />
                            <RangePicker 
                                onChange={(dates) => setDateRange(dates)}
                                className="date-picker"
                            />
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
                                        <th>Demandeur</th>
                                        <th>Équipement</th>
                                        <th>Centre</th>
                                        <th>Statut</th>
                                        <th>Date Demande</th>
                                        <th>Date Réponse</th>
                                        <th>Temps Réponse</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? (
                                        currentItems.map(demande => (
                                            <tr key={demande.id}>
                                                <td>
                                                    <div className="user-info">
                                                        <FaUser className="user-icon" />
                                                        <span>{demande.prenom} {demande.nom}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="equipment-info">
                                                        <FaCog className="equipment-icon" />
                                                        <span>{demande.nomEquipement}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="center-info">
                                                        <FaBuilding className="center-icon" />
                                                        <span>{demande.centreEquipement}</span>
                                                    </div>
                                                </td>
                                                <td>{getStatusBadge(demande.statut)}</td>
                                                <td>{new Date(demande.dateDemande).toLocaleString()}</td>
                                                <td>
                                                    {demande.dateReponse 
                                                        ? new Date(demande.dateReponse).toLocaleString() 
                                                        : "-"}
                                                </td>
                                                <td>
                                                    <div className="response-time">
                                                        <FaClock /> 
                                                        {calculateResponseTime(demande.dateDemande, demande.dateReponse)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="no-data">
                                                Aucune demande trouvée
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {filteredDemandes.length > itemsPerPage && (
                            <div className="pagination-container">
                                <Pagination
                                    current={currentPage}
                                    total={filteredDemandes.length}
                                    pageSize={itemsPerPage}
                                    onChange={(page) => setCurrentPage(page)}
                                    showSizeChanger={false}
                                />
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default HistoriqueDemandesRP;