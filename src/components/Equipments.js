import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaBars, FaTimes, FaTachometerAlt, FaCogs, FaClipboardList, 
  FaBell, FaUser, FaSignOutAlt, FaPlus, FaEdit, FaTrash, 
  FaSearch, FaHistory, FaFilter, FaBoxOpen, FaInfoCircle 
} from "react-icons/fa";
import { Pagination } from 'antd';
import Swal from 'sweetalert2';
import "../styles/responsable.css";

const API_URL = "http://localhost:8080/api/equipments";

const Equipments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [equipments, setEquipments] = useState([]);
  const [newEquipment, setNewEquipment] = useState({ 
    name: "", 
    category: "", 
    villeCentre: localStorage.getItem("userVilleCentre") || "TEMARA", 
    description: "", 
    imageUrl: "" 
  });
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categories, setCategories] = useState(["PC Portable", "PC Bureau", "Bureautique", "Imprimante"]);
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchValidatedEquipments();
  }, []);

const fetchValidatedEquipments = async () => {
  try {
    const token = localStorage.getItem("token");
    const userCenter = localStorage.getItem("userVilleCentre");
    const userRole = localStorage.getItem("userRole");
    
    const response = await fetch(`http://localhost:8080/api/equipments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`,
        'X-User-Center': userCenter,
        'X-User-Role': userRole
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      const errorData = await response.json();
      throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    // Normaliser les données pour s'assurer que enMaintenance a toujours une valeur
    const normalizedData = data.map(item => ({
      ...item,
      enMaintenance: item.enMaintenance !== null ? item.enMaintenance : false
    }));
    
    setEquipments(normalizedData);
  } catch (error) {
    console.error("Erreur:", error);
    Swal.fire({
      title: 'Erreur',
      text: error.message || 'Erreur lors du chargement des équipements',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
};

  const fetchMyEquipments = async () => {
    try {
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("userEmail");
      
      const response = await fetch(`${API_URL}/my-equipments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
          'X-User-Email': userEmail
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erreur lors du chargement de mes équipements:", error);
      return [];
    }
  };

  const formatVilleCentre = (ville) => {
    if (!ville) return "TEMARA";
    return ville.charAt(0) + ville.slice(1).toLowerCase().replace(/_/g, " ");
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
        }
      } catch (error) {
        console.error("Erreur réseau:", error);
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

  const handleAddEquipment = async () => {
    if (!newEquipment.name || !newEquipment.category) {
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
      const userName = `${localStorage.getItem("userNom")} ${localStorage.getItem("userPrenom")}`;

      const response = await fetch(`${API_URL}/add`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
          'X-User-Center': localStorage.getItem("userVilleCentre"),
          'X-User-Email': userEmail,
          'X-User-Name': userName
        },
        body: JSON.stringify(newEquipment),
      });

      if (response.ok) {
        await Swal.fire({
          title: 'Succès',
          text: 'Équipement ajouté avec succès! En attente de validation.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        fetchValidatedEquipments();
        setNewEquipment({ 
          name: "", 
          category: "", 
          villeCentre: localStorage.getItem("userVilleCentre") || "TEMARA", 
          description: "", 
          imageUrl: "" 
        });
        setSelectedImage(null);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout d'un équipement:", error);
    }
  };

  const handleUpdateEquipment = async () => {
    if (!editingEquipment) return;

    try {
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("userEmail");
      const userRole = localStorage.getItem("userRole");

      const response = await fetch(`${API_URL}/update/${editingEquipment.id}`, {
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
        fetchValidatedEquipments();
        setShowEditModal(false);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'équipement:", error);
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

        const response = await fetch(`${API_URL}/delete/${id}`, { 
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Email': userEmail,
            'X-User-Role': userRole
          }
        });

        if (response.ok) {
          await Swal.fire('Supprimé!', 'L\'équipement a été supprimé.', 'success');
          fetchValidatedEquipments();
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de l'équipement:", error);
      }
    }
  };

  const handleViewDetails = (equipment) => {
    setSelectedEquipment(equipment);
    setShowDetailsModal(true);
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
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? equipment.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEquipments = filteredEquipments.slice(indexOfFirstItem, indexOfLastItem);

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
          <li className={location.pathname === '/ResponsableHome' ? 'active' : ''}>
            <Link to="/ResponsableHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
          </li>
          <li className={location.pathname === '/Equipments' ? 'active' : ''}>
            <Link to="/Equipments"><FaCogs /><span>Gestion des Équipements</span></Link>
          </li>
          <li className={location.pathname === '/GestionDemandes' ? 'active' : ''}>
            <Link to="/GestionDemandes"><FaClipboardList /><span>Gestion des Demandes</span></Link>
          </li>
          <li className={location.pathname === '/LivraisonsRetours' ? 'active' : ''}>
            <Link to="/LivraisonsRetours"><FaBoxOpen /><span>Livraisons/Retours</span></Link>
          </li>
          <li className={location.pathname === '/HistoriqueDemandes' ? 'active' : ''}>
            <Link to="/HistoriqueDemandes"><FaHistory /><span>Historique des Demandes</span></Link>
          </li>
          <li className={location.pathname === '/HistoriqueEquipements' ? 'active' : ''}>
            <Link to="/HistoriqueEquipements"><FaHistory /><span>Historique des Équipements</span></Link>
          </li>
          <li className={location.pathname === '/Notifications' ? 'active' : ''}>
            <Link to="/Notifications"><FaBell /><span>Notifications</span></Link>
          </li>
        </ul>

        <div className="sidebar-bottom">
          <ul>
            <li className={location.pathname === '/account' ? 'active' : ''}>
              <Link to="/account"><FaUser /><span>Compte</span></Link>
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
        <h2>Gestion des Équipements - Centre {formatVilleCentre(localStorage.getItem("userVilleCentre"))}</h2>

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
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button className="add-button" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Ajouter un équipement
        </button>

        <div className="equipment-grid">
          {currentEquipments.map((equipment) => (
            <div key={equipment.id} className="equipment-card">
              <img src={equipment.imageUrl || "/images/pc.jpg"} alt="Équipement" className="card-image" />
              <div className="card-content">
                <h3>{equipment.name}</h3>
                <p><strong>Catégorie:</strong> {equipment.category}</p>
                <p><strong>Centre:</strong> {formatVilleCentre(equipment.villeCentre)}</p>
                <p><strong>Date d'ajout:</strong> {new Date(equipment.dateAdded).toLocaleString()}</p>
              </div>
              <div className="card-actions">
                <button className="view-button" onClick={() => handleViewDetails(equipment)}>
                  <FaInfoCircle /> Détails
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
          ))}
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
      </main>

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
              <div className="center-display">
                <p><strong>Centre:</strong> {formatVilleCentre(newEquipment.villeCentre)}</p>
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
              <div className="center-display">
                <p><strong>Centre:</strong> {formatVilleCentre(newEquipment.villeCentre)}</p>
              </div>
              <button type="submit">Modifier</button>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedEquipment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
              &times;
            </button>
            <h3>Détails de l'équipement</h3>
            <div className="details-container">
              <img src={selectedEquipment.imageUrl || "/images/pc.jpg"} alt="Équipement" className="detail-image" />
              <div className="details-info">
                <p><strong>Nom:</strong> {selectedEquipment.name}</p>
                <p><strong>Catégorie:</strong> {selectedEquipment.category}</p>
                <p><strong>Centre:</strong> {formatVilleCentre(selectedEquipment.villeCentre)}</p>
                <p><strong>Ajouté par:</strong> {selectedEquipment.addedByName || selectedEquipment.addedBy}</p>
                <p><strong>Date d'ajout:</strong> {new Date(selectedEquipment.dateAdded).toLocaleString()}</p>
                <p><strong>Description:</strong> {selectedEquipment.description || "Aucune description"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipments;