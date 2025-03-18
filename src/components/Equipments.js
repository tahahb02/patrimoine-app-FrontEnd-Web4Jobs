import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaTachometerAlt, FaCogs, FaClipboardList, FaBell, FaUser, FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaHome, FaSearch } from "react-icons/fa";
import "../styles/Equipments.css";

const API_URL = "http://localhost:8080/api/equipments"; // URL de l'API Spring Boot

const Equipments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [equipments, setEquipments] = useState([]);
  const [newEquipment, setNewEquipment] = useState({ name: "", category: "", center: "", dateAdded: "", description: "", imageUrl: "" });
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // États pour gérer l'affichage des modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Listes des catégories et centres prédéfinis
  const [categories, setCategories] = useState(["PC Portable", "PC Bureau", "Bureautique", "Imprimante"]);
  const [centers, setCenters] = useState(["A", "B", "C"]);

  // États pour gérer l'ajout de nouvelles catégories et centres
  const [newCategory, setNewCategory] = useState("");
  const [newCenter, setNewCenter] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddCenter, setShowAddCenter] = useState(false);

  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState("");

  // États pour les filtres
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("");

  // Charger les équipements au démarrage
  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      setEquipments(data);
    } catch (error) {
      console.error("Erreur lors du chargement des équipements:", error);
      alert(`Erreur lors du chargement des équipements: ${error.message}`);
    }
  };

  // Gérer les champs de formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEquipment({ ...newEquipment, [name]: value });
  };

  // Gérer la sélection d'une image
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
          const imageUrl = data.imageUrl; // URL permanente de l'image
          setSelectedImage(imageUrl);
          setNewEquipment({ ...newEquipment, imageUrl: imageUrl });
        } else {
          alert("Erreur lors du téléversement de l'image.");
        }
      } catch (error) {
        console.error("Erreur réseau:", error);
        alert("Erreur réseau. Veuillez réessayer.");
      }
    }
  };
  // Ajouter une nouvelle catégorie
  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, newCategory]);
      setNewEquipment({ ...newEquipment, category: newCategory });
      setNewCategory("");
      setShowAddCategory(false);
    }
  };

  // Ajouter un nouveau centre
  const handleAddNewCenter = () => {
    if (newCenter.trim()) {
      setCenters([...centers, newCenter]);
      setNewEquipment({ ...newEquipment, center: newCenter });
      setNewCenter("");
      setShowAddCenter(false);
    }
  };

  // Ajouter un équipement
  const handleAddEquipment = async () => {
    if (!newEquipment.name || !newEquipment.category || !newEquipment.center) {
      alert("Tous les champs sont obligatoires !");
      return;
    }
  
    const currentDate = new Date().toISOString();
    const equipmentWithDate = { ...newEquipment, dateAdded: currentDate };
  
    console.log("Données envoyées au serveur :", equipmentWithDate); // Ajoutez ce log
  
    try {
      const response = await fetch(`${API_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(equipmentWithDate),
      });
  
      if (response.ok) {
        fetchEquipments();
        setNewEquipment({ name: "", category: "", center: "", dateAdded: "", description: "", imageUrl: "" });
        setSelectedImage(null);
        setShowAddModal(false);
        alert("Équipement ajouté avec succès !");
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de l'ajout de l'équipement: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout d'un équipement:", error);
      alert("Erreur réseau. Veuillez réessayer.");
    }
  };

  // Modifier un équipement
  const handleUpdateEquipment = async () => {
    if (!editingEquipment) return;

    if (!newEquipment.name || !newEquipment.category || !newEquipment.center) {
      alert("Tous les champs sont obligatoires !");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/update/${editingEquipment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEquipment),
      });

      if (response.ok) {
        fetchEquipments();
        setEditingEquipment(null);
        setNewEquipment({ name: "", category: "", center: "", dateAdded: "", description: "", imageUrl: "" });
        setShowEditModal(false);
        alert("Équipement modifié avec succès !");
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la modification de l'équipement: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'équipement:", error);
      alert("Erreur réseau. Veuillez réessayer.");
    }
  };

  // Supprimer un équipement
  const handleDeleteEquipment = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet équipement ?")) return;

    try {
      const response = await fetch(`${API_URL}/delete/${id}`, { method: "DELETE" });

      if (response.ok) {
        fetchEquipments();
        alert("Équipement supprimé avec succès !");
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la suppression de l'équipement: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'équipement:", error);
      alert("Erreur réseau. Veuillez réessayer.");
    }
  };

  // Ouvrir la fenêtre modale des détails
  const handleViewDetails = (equipment) => {
    setSelectedEquipment(equipment);
    setShowDetailsModal(true);
  };

  // Fermer la fenêtre modale des détails
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedEquipment(null);
  };

  // Filtrer les équipements en fonction du terme de recherche et des filtres
  const filteredEquipments = equipments.filter((equipment) => {
    const matchesSearch =
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory
      ? equipment.category === selectedCategory
      : true;

    const matchesCenter = selectedCenter
      ? equipment.center === selectedCenter
      : true;

    return matchesSearch && matchesCategory && matchesCenter;
  });

  // Calcul des équipements à afficher pour la page actuelle
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEquipments = filteredEquipments.slice(indexOfFirstItem, indexOfLastItem);

  // Changer de page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className={`dashboard-container ${sidebarOpen ? "sidebar-expanded" : ""}`}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </div>
        <img src="/images/logo-light.png" alt="Logo" className="navbar-logo" />
      </nav>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <ul className="sidebar-menu">
          <li><Link to="/ResponsableHome"><FaHome /><span>Home</span></Link></li>
          <li><Link to="/dashboard"><FaTachometerAlt /><span>Tableau de Bord</span></Link></li>
          <li><Link to="/equipments"><FaCogs /><span>Gestion des Équipements</span></Link></li>
          <li><Link to="/requests"><FaClipboardList /><span>Suivi des Demandes</span></Link></li>
          <li><Link to="/notifications"><FaBell /><span>Notifications</span></Link></li>
        </ul>

        {/* Section en bas du sidebar */}
        <div className="sidebar-bottom">
          <ul>
            <li><Link to="/account"><FaUser /><span>Compte</span></Link></li>
            <li className="logout"><Link to="/logout"><FaSignOutAlt /><span>Déconnexion</span></Link></li>
          </ul>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="content">
        <h2>Gestion des Équipements</h2>

        {/* Barre de recherche et filtres */}
        <div className="search-and-filters">
          {/* Barre de recherche */}
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par titre ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtres */}
          <div className="filters-container">
            <select
              className="filter-select"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              onChange={(e) => setSelectedCenter(e.target.value)}
            >
              <option value="">Tous les centres</option>
              {centers.map((center, index) => (
                <option key={index} value={center}>
                  {center}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bouton pour ouvrir le modal d'ajout */}
        <button className="add-button" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Ajouter un équipement
        </button>

        {/* Grille des cartes */}
        <div className="equipment-grid">
          {currentEquipments.map((equipment) => (
            <div key={equipment.id} className="equipment-card">
              <img src={equipment.imageUrl || "/images/pc.jpg"} alt="Équipement" className="card-image" />
              <div className="card-content">
                <h3>{equipment.name}</h3>
                <p><strong>Catégorie:</strong> {equipment.category}</p>
                <p><strong>Centre:</strong> {equipment.center}</p>
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
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
            Précédent
          </button>
          <span>Page {currentPage}</span>
          <button onClick={() => paginate(currentPage + 1)} disabled={indexOfLastItem >= filteredEquipments.length}>
            Suivant
          </button>
        </div>
      </main>

      {/* Arrière-plan flou lorsque le modal est ouvert */}
      {(showAddModal || showEditModal || showDetailsModal) && <div className="modal-backdrop"></div>}

      {/* Modal d'ajout */}
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
                name="center"
                value={newEquipment.center}
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
                    {center}
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
              <button type="submit">Ajouter</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification */}
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
                name="center"
                value={newEquipment.center}
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
                    {center}
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
              <button type="submit">Modifier</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal des détails */}
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
                <p><strong>Centre:</strong> {selectedEquipment.center}</p>
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

export default Equipments;