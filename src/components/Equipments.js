import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaTachometerAlt, FaCogs, FaClipboardList, FaBell, FaUser, FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaHome } from "react-icons/fa";
import "../styles/Equipments.css";

const API_URL = "http://localhost:8080/api/equipments"; // URL de l'API Spring Boot

const Equipments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [equipments, setEquipments] = useState([]);
  const [newEquipment, setNewEquipment] = useState({ name: "", category: "", center: "", dateAdded: "" });
  const [editingEquipment, setEditingEquipment] = useState(null); // Stocke l'équipement en cours de modification

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Nombre d'équipements par page

  // Listes des catégories et centres prédéfinis
  const [categories, setCategories] = useState(["PC Portable", "PC Bureau", "Bureautique", "Imprimante"]);
  const [centers, setCenters] = useState(["A", "B", "C"]);

  // États pour gérer l'ajout de nouvelles catégories et centres
  const [newCategory, setNewCategory] = useState("");
  const [newCenter, setNewCenter] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddCenter, setShowAddCenter] = useState(false);

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
      console.log("Données reçues:", data); // 👉 Vérifie les données récupérées
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

    const currentDate = new Date().toISOString(); // Utiliser ISOString pour la date
    const equipmentWithDate = { ...newEquipment, dateAdded: currentDate };

    try {
      const response = await fetch(`${API_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(equipmentWithDate),
      });

      if (response.ok) {
        fetchEquipments();
        setNewEquipment({ name: "", category: "", center: "", dateAdded: "" });
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
  const handleEditEquipment = (equipment) => {
    setEditingEquipment(equipment);
    setNewEquipment(equipment);
  };

  // Enregistrer la modification
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
        setNewEquipment({ name: "", category: "", center: "", dateAdded: "" });
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

  // Calcul des équipements à afficher pour la page actuelle
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEquipments = equipments.slice(indexOfFirstItem, indexOfLastItem);

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
        <br></br><br></br><br></br><br></br><br></br>
        <br></br><br></br><br></br><br></br><br></br>
        <br></br>

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

        {/* Formulaire d'ajout/modification */}
        <div className="equipment-form">
          <input type="text" name="name" placeholder="Nom de l'équipement" value={newEquipment.name} onChange={handleInputChange} />

          {/* Liste déroulante pour les catégories */}
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
              <button className="add-button" onClick={handleAddNewCategory}><FaPlus /> Ajouter</button>
            </div>
          )}

          {/* Liste déroulante pour les centres */}
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
              <button className="add-button" onClick={handleAddNewCenter}><FaPlus /> Ajouter</button>
            </div>
          )}

          {/* Bouton d'ajout ou de modification */}
          {editingEquipment ? (
            <button className="edit-button" onClick={handleUpdateEquipment}><FaEdit /> Modifier</button>
          ) : (
            <button className="add-button" onClick={handleAddEquipment}><FaPlus /> Ajouter</button>
          )}
        </div>

        {/* Grille des cartes */}
        <div className="equipment-grid">
          {currentEquipments.map((equipment) => (
            <div key={equipment.id} className="equipment-card">
              <img src="/images/pc.jpg" alt="Équipement" className="card-image" />
              <div className="card-content">
                <h3>{equipment.name}</h3>
                <p><strong>Catégorie:</strong> {equipment.category}</p>
                <p><strong>Centre:</strong> {equipment.center}</p>
                <p><strong>Date d'ajout:</strong> {new Date(equipment.dateAdded).toLocaleString()}</p>
              </div>
              <div className="card-actions">
                <button className="edit-button" onClick={() => handleEditEquipment(equipment)}><FaEdit /></button>
                <button className="delete-button" onClick={() => handleDeleteEquipment(equipment.id)}><FaTrash /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Précédent
          </button>
          <span>Page {currentPage}</span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastItem >= equipments.length}
          >
            Suivant
          </button>
        </div>
      </main>
    </div>
  );
};

export default Equipments;