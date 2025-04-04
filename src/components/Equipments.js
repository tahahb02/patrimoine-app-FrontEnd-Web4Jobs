import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaTachometerAlt, FaCogs, FaClipboardList, FaBell, FaUser, FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaSearch, FaHistory, FaFilter } from "react-icons/fa";
import { Pagination } from 'antd';
import "../styles/Equipments.css";

const API_URL = "http://localhost:8080/api/equipments";

const Equipments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [equipments, setEquipments] = useState([]);
  const [newEquipment, setNewEquipment] = useState({ name: "", category: "", center: "", dateAdded: "", description: "", imageUrl: "" });
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categories, setCategories] = useState(["PC Portable", "PC Bureau", "Bureautique", "Imprimante"]);
  const [centers, setCenters] = useState(["A", "B", "C"]);
  const [newCategory, setNewCategory] = useState("");
  const [newCenter, setNewCenter] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddCenter, setShowAddCenter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          navigate("/login");
          return;
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      setEquipments(data);
    } catch (error) {
      console.error("Erreur lors du chargement des équipements:", error);
    }
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
        } else {
          alert("Erreur lors du téléversement de l'image.");
        }
      } catch (error) {
        console.error("Erreur réseau:", error);
        alert("Erreur réseau. Veuillez réessayer.");
      }
    }
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, newCategory]);
      setNewEquipment({ ...newEquipment, category: newCategory });
      setNewCategory("");
      setShowAddCategory(false);
    }
  };

  const handleAddNewCenter = () => {
    if (newCenter.trim()) {
      setCenters([...centers, newCenter]);
      setNewEquipment({ ...newEquipment, center: newCenter });
      setNewCenter("");
      setShowAddCenter(false);
    }
  };

  const handleAddEquipment = async () => {
    if (!newEquipment.name || !newEquipment.category || !newEquipment.center) {
      alert("Tous les champs sont obligatoires !");
      return;
    }

    const currentDate = new Date().toISOString();
    const equipmentWithDate = { ...newEquipment, dateAdded: currentDate };

    try {
      const response = await fetch(`${API_URL}/add`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(equipmentWithDate),
      });

      if (response.ok) {
        fetchEquipments();
        setNewEquipment({ name: "", category: "", center: "", dateAdded: "", description: "", imageUrl: "" });
        setSelectedImage(null);
        setShowAddModal(false);
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de l'ajout de l'équipement: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout d'un équipement:", error);
    }
  };

  const handleUpdateEquipment = async () => {
    if (!editingEquipment) return;

    if (!newEquipment.name || !newEquipment.category || !newEquipment.center) {
      alert("Tous les champs sont obligatoires !");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/update/${editingEquipment.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(newEquipment),
      });

      if (response.ok) {
        fetchEquipments();
        setEditingEquipment(null);
        setNewEquipment({ name: "", category: "", center: "", dateAdded: "", description: "", imageUrl: "" });
        setShowEditModal(false);
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la modification de l'équipement: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'équipement:", error);
    }
  };

  const handleDeleteEquipment = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet équipement ?")) return;

    try {
      const response = await fetch(`${API_URL}/delete/${id}`, { 
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.ok) {
        fetchEquipments();
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la suppression de l'équipement: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'équipement:", error);
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
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userNom");
    localStorage.removeItem("userPrenom");
    navigate("/login");
  };

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEquipments = filteredEquipments.slice(indexOfFirstItem, indexOfLastItem);

  const showTotal = (total) => `Total ${total} équipements`;

  const onChange = (page) => {
    setCurrentPage(page);
  };

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
          <li className={location.pathname === '/HistoriqueDemandes' ? 'active' : ''}>
            <Link to="/HistoriqueDemandes"><FaHistory /><span>Historique des Demandes</span></Link>
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
        <h2>Gestion des Équipements</h2>

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
                    {center}
                  </option>
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