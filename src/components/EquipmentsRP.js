import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaBars, FaTimes, FaCogs, FaClipboardList, FaBell, FaUser, 
  FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, 
  FaCheckCircle, FaBuilding, FaChartLine, FaHistory,FaTachometerAlt, FaBoxOpen 
} from "react-icons/fa";
import { Pagination } from 'antd';
import Swal from 'sweetalert2';
import "../styles/responsable.css";

const EquipmentsRP = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [equipments, setEquipments] = useState([]);
    const [newEquipment, setNewEquipment] = useState({ 
        name: "", 
        category: "", 
        villeCentre: "", 
        description: "", 
        imageUrl: "",
        validated: false
    });
    const [editingEquipment, setEditingEquipment] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [categories, setCategories] = useState([]);
    const [centers, setCenters] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCenter, setNewCenter] = useState("");
    const [showAddCenter, setShowAddCenter] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedCenter, setSelectedCenter] = useState("");
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchEquipments();
        fetchCategories();
        fetchCenters();
    }, []);

    const fetchEquipments = async () => {
        try {
            const token = localStorage.getItem("token");
            const userRole = localStorage.getItem("userRole");
            
            const response = await fetch("http://localhost:8080/api/equipments/responsable/all", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                    'X-User-Role': userRole
                }
            });
    
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                    return;
                }
                if (response.status === 403) {
                    await Swal.fire({
                        title: 'Accès refusé',
                        text: 'Vous n\'avez pas les permissions nécessaires',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                    navigate("/login");
                    return;
                }
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
    
            const data = await response.json();
            setEquipments(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error("Erreur lors du chargement des équipements:", error);
            Swal.fire({
                title: 'Erreur',
                text: 'Impossible de charger les équipements. Veuillez réessayer.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/api/rp/categories", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            setCategories(Array.isArray(data) ? data : ['PC Portable', 'PC Bureau', 'Bureautique', 'Imprimante']);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setCategories(['PC Portable', 'PC Bureau', 'Bureautique', 'Imprimante']);
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
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            setCenters(Array.isArray(data) ? data : [
                'TINGHIR', 'TEMARA','TCHAD', 'ESSAOUIRA', 'DAKHLA', 
                'LAAYOUNE', 'NADOR', 'AIN_EL_AOUDA'
            ]);
        } catch (error) {
            console.error("Error fetching centers:", error);
            setCenters([
                'TINGHIR', 'TEMARA','TCHAD', 'ESSAOUIRA', 'DAKHLA', 
                'LAAYOUNE', 'NADOR', 'AIN_EL_AOUDA'
            ]);
        }
    };

    const formatVilleCentre = (ville) => {
        if (!ville) return "";
        const formatted = ville.replace(/_/g, " ");
        return formatted.charAt(0) + formatted.slice(1).toLowerCase();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEquipment({ ...newEquipment, [name]: value });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("image", file);

            try {
                const response = await fetch("http://localhost:8080/upload", {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    const imageUrl = data.imageUrl;
                    setSelectedImage(imageUrl);
                    setNewEquipment({ ...newEquipment, imageUrl: imageUrl });
                    await Swal.fire({
                        title: 'Succès',
                        text: 'Image téléversée avec succès!',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                } else {
                    await Swal.fire({
                        title: 'Erreur',
                        text: 'Erreur lors du téléversement de l\'image.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                console.error("Erreur réseau:", error);
                await Swal.fire({
                    title: 'Erreur',
                    text: 'Erreur réseau. Veuillez réessayer.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    const handleAddNewCategory = () => {
        if (newCategory.trim()) {
            setCategories([...categories, newCategory]);
            setNewEquipment({ ...newEquipment, category: newCategory });
            setNewCategory("");
            setShowAddCategory(false);
            Swal.fire({
                title: 'Succès',
                text: 'Nouvelle catégorie ajoutée!',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleAddNewCenter = () => {
        if (newCenter.trim()) {
            setCenters([...centers, newCenter]);
            setNewEquipment({ ...newEquipment, villeCentre: newCenter });
            setNewCenter("");
            setShowAddCenter(false);
            Swal.fire({
                title: 'Succès',
                text: 'Nouveau centre ajouté!',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleAddEquipment = async () => {
        if (!newEquipment.name || !newEquipment.category || !newEquipment.villeCentre) {
            await Swal.fire({
                title: 'Champs manquants',
                text: 'Tous les champs sont obligatoires !',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const userEmail = localStorage.getItem("userEmail");
            const userName = localStorage.getItem("userNom") + " " + localStorage.getItem("userPrenom");
            const userCenter = localStorage.getItem("userVilleCentre");

            const response = await fetch("http://localhost:8080/api/equipments/add", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                    'X-User-Email': userEmail,
                    'X-User-Name': userName,
                    'X-User-Center': userCenter
                },
                body: JSON.stringify(newEquipment),
            });

            if (response.ok) {
                await Swal.fire({
                    title: 'Succès',
                    text: 'Équipement ajouté avec succès!',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                fetchEquipments();
                setNewEquipment({ 
                    name: "", 
                    category: "", 
                    villeCentre: "", 
                    description: "", 
                    imageUrl: "",
                    validated: false
                });
                setSelectedImage(null);
                setShowAddModal(false);
            } else {
                const errorData = await response.json();
                await Swal.fire({
                    title: 'Erreur',
                    text: errorData.message || 'Erreur lors de l\'ajout de l\'équipement',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout d'un équipement:", error);
            await Swal.fire({
                title: 'Erreur',
                text: 'Erreur lors de l\'ajout de l\'équipement',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleUpdateEquipment = async () => {
        if (!editingEquipment) return;

        if (!newEquipment.name || !newEquipment.category || !newEquipment.villeCentre) {
            await Swal.fire({
                title: 'Champs manquants',
                text: 'Tous les champs sont obligatoires !',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const userEmail = localStorage.getItem("userEmail");
            const userRole = localStorage.getItem("userRole");

            const response = await fetch(`http://localhost:8080/api/equipments/update/${editingEquipment.id}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                    'X-User-Email': userEmail,
                    'X-User-Role': userRole
                },
                body: JSON.stringify(newEquipment),
            });

            if (response.ok) {
                await Swal.fire({
                    title: 'Succès',
                    text: 'Équipement modifié avec succès!',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                fetchEquipments();
                setEditingEquipment(null);
                setNewEquipment({ 
                    name: "", 
                    category: "", 
                    villeCentre: "", 
                    description: "", 
                    imageUrl: "",
                    validated: false
                });
                setShowEditModal(false);
            } else {
                const errorData = await response.json();
                await Swal.fire({
                    title: 'Erreur',
                    text: errorData.message || 'Erreur lors de la modification de l\'équipement',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'équipement:", error);
            await Swal.fire({
                title: 'Erreur',
                text: 'Erreur lors de la modification de l\'équipement',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleDeleteEquipment = async (id) => {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr?',
            text: "Vous ne pourrez pas revenir en arrière!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, supprimer!',
            cancelButtonText: 'Annuler'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem("token");
                const userEmail = localStorage.getItem("userEmail");
                const userRole = localStorage.getItem("userRole");

                const response = await fetch(`http://localhost:8080/api/equipments/delete/${id}`, { 
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-User-Email': userEmail,
                        'X-User-Role': userRole
                    }
                });

                if (response.ok) {
                    await Swal.fire(
                        'Supprimé!',
                        'L\'équipement a été supprimé.',
                        'success'
                    );
                    fetchEquipments();
                } else {
                    const errorData = await response.json();
                    await Swal.fire(
                        'Erreur!',
                        errorData.message || 'Échec de la suppression',
                        'error'
                    );
                }
            } catch (error) {
                console.error("Erreur lors de la suppression de l'équipement:", error);
                await Swal.fire(
                    'Erreur!',
                    'Erreur réseau. Veuillez réessayer.',
                    'error'
                );
            }
        }
    };

    const handleViewDetails = (equipment) => {
        setSelectedEquipment(equipment);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedEquipment(null);
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

    const filteredEquipments = Array.isArray(equipments) ? equipments.filter((equipment) => {
        const matchesSearch =
            equipment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            equipment.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory
            ? equipment.category === selectedCategory
            : true;

        const matchesCenter = selectedCenter
            ? equipment.villeCentre === selectedCenter
            : true;

        return matchesSearch && matchesCategory && matchesCenter && equipment.validated;
    }) : [];

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEquipments = filteredEquipments.slice(indexOfFirstItem, indexOfLastItem);

    const showTotal = (total) => `Total ${total} équipements`;

    const onChange = (page) => {
        setCurrentPage(page);
    };

    const handleAddButtonClick = () => {
        Swal.fire({
            title: 'Ajouter un nouvel équipement',
            text: 'Remplissez le formulaire pour ajouter un nouvel équipement',
            icon: 'info',
            confirmButtonText: 'Continuer'
        }).then(() => {
            setShowAddModal(true);
        });
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
                    <li className={location.pathname === '/ResponsablePatrimoineHome' ? 'active' : ''}>
                        <Link to="/ResponsablePatrimoineHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
                    </li>
                    <li className={location.pathname === '/EquipmentsRP' ? 'active' : ''}>
                        <Link to="/EquipmentsRP"><FaCogs /><span>Gestion des Équipements</span></Link>
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
                            <Link to="/Account"><FaUser /><span>Compte</span></Link>
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
                <h2>Gestion des Équipements - Responsable Patrimoine</h2>

                <div className="search-and-filters">
                    <div className="search-bar">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Rechercher par titre ou description..."
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

                <button className="add-button" onClick={handleAddButtonClick}>
                    <FaPlus /> Ajouter un équipement
                </button>

                <div className="equipment-grid">
                    {currentEquipments.length > 0 ? (
                        currentEquipments.map((equipment) => (
                            <div key={equipment.id} className="equipment-card">
                                <img src={equipment.imageUrl || "/images/pc.jpg"} alt="Équipement" className="card-image" />
                                <div className="card-content">
                                    <h3>{equipment.name}</h3>
                                    <p><strong>Catégorie:</strong> {equipment.category}</p>
                                    <p><strong>Centre:</strong> {formatVilleCentre(equipment.villeCentre)}</p>
                                    <p><strong>Statut:</strong> 
                                        {equipment.validated ? (
                                            <span className="status-badge acceptee">Validé</span>
                                        ) : (
                                            <span className="status-badge en-attente">En attente</span>
                                        )}
                                    </p>
                                    <p><strong>Date d'ajout:</strong> {new Date(equipment.dateAdded).toLocaleString()}</p>
                                </div>
                                <div className="card-actions">
                                    <button className="view-button" onClick={() => handleViewDetails(equipment)}>
                                        View All
                                    </button>
                                    <button className="edit-button" onClick={() => {
                                        setEditingEquipment(equipment);
                                        setNewEquipment(equipment);
                                        setShowEditModal(true);
                                    }}>
                                        <FaEdit />
                                    </button>
                                    <button className="delete-button" onClick={() => handleDeleteEquipment(equipment.id)}>
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-data">
                            <p>Aucun équipement validé trouvé</p>
                        </div>
                    )}
                </div>

                {filteredEquipments.length > itemsPerPage && (
                    <div className="pagination-container">
                        <Pagination
                            size="small"
                            current={currentPage}
                            total={filteredEquipments.length}
                            pageSize={itemsPerPage}
                            onChange={onChange}
                            showSizeChanger={false}
                            showQuickJumper
                            showTotal={showTotal}
                        />
                    </div>
                )}
            </main>

            {(showAddModal || showEditModal || showDetailsModal) && <div className="modal-backdrop"></div>}

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={() => setShowAddModal(false)}>
                            &times;
                        </button>
                        <h3>Ajouter un équipement</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleAddEquipment();
                        }}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Nom de l'équipement"
                                value={newEquipment.name}
                                onChange={handleInputChange}
                                required
                            />
                            <textarea
                                name="description"
                                placeholder="Description de l'équipement"
                                value={newEquipment.description}
                                onChange={handleInputChange}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {selectedImage && (
                                <img src={selectedImage} alt="Prévisualisation" style={{ width: "100px", height: "100px" }} />
                            )}
                            <select
                                name="category"
                                value={newEquipment.category}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    if (e.target.value === "new") {
                                        setShowAddCategory(true);
                                    } else {
                                        setShowAddCategory(false);
                                    }
                                }}
                                required
                            >
                                <option value="">Sélectionnez une catégorie</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                ))}
                                <option value="new">Ajouter une nouvelle catégorie</option>
                            </select>
                            {showAddCategory && (
                                <div className="add-new-item">
                                    <input
                                        type="text"
                                        placeholder="Entrez le nom de la nouvelle catégorie"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                    />
                                    <button type="button" onClick={handleAddNewCategory}>
                                        <FaPlus /> Ajouter
                                    </button>
                                </div>
                            )}
                            <select
                                name="villeCentre"
                                value={newEquipment.villeCentre}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    if (e.target.value === "new") {
                                        setShowAddCenter(true);
                                    } else {
                                        setShowAddCenter(false);
                                    }
                                }}
                                required
                            >
                                <option value="">Sélectionnez un centre</option>
                                {centers.map((center, index) => (
                                    <option key={index} value={center}>
                                        {formatVilleCentre(center)}
                                    </option>
                                ))}
                                <option value="new">Ajouter un nouveau centre</option>
                            </select>
                            {showAddCenter && (
                                <div className="add-new-item">
                                    <input
                                        type="text"
                                        placeholder="Entrez le nom du nouveau centre"
                                        value={newCenter}
                                        onChange={(e) => setNewCenter(e.target.value)}
                                    />
                                    <button type="button" onClick={handleAddNewCenter}>
                                        <FaPlus /> Ajouter
                                    </button>
                                </div>
                            )}
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="validated"
                                        checked={newEquipment.validated}
                                        onChange={(e) => setNewEquipment({...newEquipment, validated: e.target.checked})}
                                    />
                                    Validé
                                </label>
                            </div>
                            <button type="submit">Ajouter</button>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={() => setShowEditModal(false)}>
                            &times;
                        </button>
                        <h3>Modifier l'équipement</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdateEquipment();
                        }}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Nom de l'équipement"
                                value={newEquipment.name}
                                onChange={handleInputChange}
                                required
                            />
                            <textarea
                                name="description"
                                placeholder="Description de l'équipement"
                                value={newEquipment.description}
                                onChange={handleInputChange}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {selectedImage && (
                                <img src={selectedImage} alt="Prévisualisation" style={{ width: "100px", height: "100px" }} />
                            )}
                            <select
                                name="category"
                                value={newEquipment.category}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    if (e.target.value === "new") {
                                        setShowAddCategory(true);
                                    } else {
                                        setShowAddCategory(false);
                                    }
                                }}
                                required
                            >
                                <option value="">Sélectionnez une catégorie</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                ))}
                                <option value="new">Ajouter une nouvelle catégorie</option>
                                
                            </select>
                            {showAddCategory && (
                                <div className="add-new-item">
                                    <input
                                        type="text"
                                        placeholder="Entrez le nom de la nouvelle catégorie"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                    />
                                    <button type="button" onClick={handleAddNewCategory}>
                                        <FaPlus /> Ajouter
                                    </button>
                                </div>
                            )}  

                            <select
                                name="villeCentre"
                                value={newEquipment.villeCentre}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    if (e.target.value === "new") {
                                        setShowAddCenter(true);
                                    } else {
                                        setShowAddCenter(false);
                                    }
                                }}
                                required
                            >

                                <option value="">Sélectionnez un centre</option>
                                {centers.map((center, index) => (
                                    <option key={index} value={center}>
                                            {formatVilleCentre(center)}
                                    </option>
                                ))}
                                <option value="new">Ajouter un nouveau centre</option>
                            </select>
                            {showAddCenter && (
                                <div className="add-new-item">
                                    <input
                                        type="text"
                                        placeholder="Entrez le nom du nouveau centre"
                                        value={newCenter}
                                        onChange={(e) => setNewCenter(e.target.value)}
                                    />
                                    <button type="button" onClick={handleAddNewCenter}>
                                        <FaPlus /> Ajouter
                                    </button>
                                </div>
                            )}
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="validated"
                                        checked={newEquipment.validated}
                                        onChange={(e) => setNewEquipment({...newEquipment, validated: e.target.checked})}
                                    />
                                    Validé
                                </label>
                            </div>
                            <button type="submit">Modifier</button>
                        </form>
                    </div>
                </div>
            )}

            {showDetailsModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={handleCloseDetailsModal}>
                            &times;
                        </button>
                        <h3>Détails de l'équipement</h3>
                        {selectedEquipment && (
                            <div>
                                <img src={selectedEquipment.imageUrl || "/images/pc.jpg"} alt="Équipement" style={{ width: "200px", height: "200px" }} />
                                <p><strong>Nom:</strong> {selectedEquipment.name}</p>
                                <p><strong>Catégorie:</strong> {selectedEquipment.category}</p>
                                <p><strong>Centre:</strong> {formatVilleCentre(selectedEquipment.villeCentre)}</p>
                                <p><strong>Statut:</strong> 
                                    {selectedEquipment.validated ? (
                                        <span className="status-badge acceptee">Validé</span>
                                    ) : (
                                        <span className="status-badge en-attente">En attente</span>
                                    )}
                                </p>
                                <p><strong>Description:</strong> {selectedEquipment.description}</p>
                                <p><strong>Date d'ajout:</strong> {new Date(selectedEquipment.dateAdded).toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipmentsRP;