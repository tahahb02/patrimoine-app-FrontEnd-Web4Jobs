import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaBars, FaTimes, FaTachometerAlt, FaUsers, FaCogs, 
  FaClipboardList, FaHistory, FaWrench, FaStethoscope,
  FaBuilding, FaChartLine, FaUser, FaSignOutAlt,
  FaEdit, FaTrash, FaSearch, FaFilter, FaPlus
} from "react-icons/fa";
import Swal from "sweetalert2";
import "../styles/responsable.css";

const EquipementsDirecteur = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [equipments, setEquipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedCenter, setSelectedCenter] = useState("");
    const [categories, setCategories] = useState([]);
    const [centers, setCenters] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchEquipments();
        fetchCategories();
        fetchCenters();
    }, []);

    const fetchEquipments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/api/equipments/all", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "X-User-Role": "DIRECTEUR"
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            setEquipments(data);
        } catch (error) {
            console.error("Erreur de récupération:", error);
            Swal.fire({
                title: 'Erreur',
                text: 'Échec de la récupération des équipements',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            // Récupérer toutes les catégories uniques depuis les équipements
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/api/equipments/all", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "X-User-Role": "DIRECTEUR"
                }
            });

            if (response.ok) {
                const data = await response.json();
                const uniqueCategories = [...new Set(data.map(item => item.category))];
                setCategories(uniqueCategories.filter(cat => cat));
            }
        } catch (error) {
            console.error("Erreur de récupération des catégories:", error);
        }
    };

    const fetchCenters = () => {
        // Utiliser les centres définis dans l'enum VilleCentre
        const allCenters = [
            "TINGHIR", "TEMARA", "TCHAD", "ESSAOUIRA", 
            "DAKHLA", "LAAYOUNE", "NADOR", "AIN_EL_AOUDA"
        ];
        setCenters(allCenters);
    };

    const formatVilleCentre = (ville) => {
        if (!ville) return "";
        const formatted = ville.replace(/_/g, " ");
        return formatted.charAt(0) + formatted.slice(1).toLowerCase();
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

    const filteredEquipments = equipments.filter((equipment) => {
        const matchesSearch =
            equipment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            equipment.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory
            ? equipment.category === selectedCategory
            : true;

        const matchesCenter = selectedCenter
            ? equipment.villeCentre === selectedCenter
            : true;

        return matchesSearch && matchesCategory && matchesCenter;
    });

    const handleViewDetails = (equipment) => {
        navigate(`/DirecteurEquipementDetails/${equipment.id}`);
    };

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
                               
                               <li className={location.pathname === '/DirecteurHistoriqueDemandes' ? 'active' : ''}>
                                   <Link to="/DirecteurHistoriqueDemandes"><FaClipboardList /><span>Historique Demandes</span></Link>
                               </li>
                               
                               <li className={location.pathname === '/DirecteurHistoriqueUtilisations' ? 'active' : ''}>
                                   <Link to="/DirecteurHistoriqueUtilisations"><FaHistory /><span>Historique Utilisations Des Équipements</span></Link>
                               </li>
                               
                               <li className={location.pathname === '/DirecteurHistoriqueMaintenances' ? 'active' : ''}>
                                   <Link to="/DirecteurHistoriqueMaintenances"><FaWrench /><span>Historique Maintenances</span></Link>
                               </li>
                               
                           </ul>
           
                           <div className="sidebar-bottom">
                               <ul>
                                   <li className={location.pathname === '/DirecteurAccount' ? 'active' : ''}>
                                       <Link to="/DirecteurAccount"><FaUser /><span>Compte</span></Link>
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
                <h2>Gestion des Équipements - Directeur</h2>
                
                <div className="search-and-filters">
                    <div className="search-bar">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filters-container">
                        <div className="filter-group">
                            <FaFilter className="filter-icon" />
                            <select
                                className="filter-select"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">Toutes les catégories</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <FaFilter className="filter-icon" />
                            <select
                                className="filter-select"
                                value={selectedCenter}
                                onChange={(e) => setSelectedCenter(e.target.value)}
                            >
                                <option value="">Tous les centres</option>
                                {centers.map((center, index) => (
                                    <option key={index} value={center}>
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
                                <th>En maintenance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEquipments.length > 0 ? (
                                filteredEquipments.map((equipment) => (
                                    <tr key={equipment.id}>
                                        <td>
                                            <img 
                                                src={equipment.imageUrl || "/images/pc.jpg"} 
                                                alt={equipment.name} 
                                                className="table-image"
                                            />
                                        </td>
                                        <td>{equipment.name}</td>
                                        <td>{equipment.category}</td>
                                        <td>{formatVilleCentre(equipment.villeCentre)}</td>
                                        <td>
                                            <span className={`status-badge ${equipment.status?.toLowerCase() || 'disponible'}`}>
                                                {equipment.status || 'Disponible'}
                                            </span>
                                        </td>
                                        <td>
                                            {equipment.validated ? (
                                                <span className="status-badge acceptee">Oui</span>
                                            ) : (
                                                <span className="status-badge en-attente">Non</span>
                                            )}
                                        </td>
                                        <td>
                                            {equipment.enMaintenance ? (
                                                <span className="status-badge en-maintenance">Oui</span>
                                            ) : (
                                                <span className="status-badge disponible">Non</span>
                                            )}
                                        </td>
                                        <td className="actions-cell">
                                            <button 
                                                className="view-button"
                                                onClick={() => handleViewDetails(equipment)}
                                            >
                                                Détails
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="no-data">
                                        Aucun équipement trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default EquipementsDirecteur;