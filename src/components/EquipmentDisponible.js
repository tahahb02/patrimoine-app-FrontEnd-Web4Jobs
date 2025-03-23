import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaTachometerAlt, FaCogs, FaClipboardList, FaBell, FaUser, FaSignOutAlt, FaSearch } from "react-icons/fa";
import "../styles/EquipmentDisponible.css";

const API_URL = "http://localhost:8080/api/equipments"; // URL de l'API Spring Boot

const EquipmentDisponible = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [equipments, setEquipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [requestForm, setRequestForm] = useState({
    equipmentId: "",
    equipmentName: "",
    equipmentCategory: "",
    equipmentCenter: "",
    startDate: "",
    endDate: "",
    remarks: "",
    firstName: "", // Nouveau champ
    lastName: "",  // Nouveau champ
    phoneNumber: "", // Nouveau champ
  });
  const [isBlurred, setIsBlurred] = useState(false); // État pour l'effet flou

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Listes des catégories et centres prédéfinis
  const [categories] = useState(["PC Portable", "PC Bureau", "Bureautique", "Imprimante"]);
  const [centers] = useState(["A", "B", "C"]);

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

  // Ouvrir le modal de demande d'équipement
  const handleRequestEquipment = (equipment) => {
    setSelectedEquipment(equipment);
    setRequestForm({
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      equipmentCategory: equipment.category,
      equipmentCenter: equipment.center,
      startDate: "",
      endDate: "",
      remarks: "",
      firstName: "", // Initialiser les nouveaux champs
      lastName: "",
      phoneNumber: "",
    });
    setShowRequestModal(true);
    setIsBlurred(true); // Activer l'effet flou
  };

  // Ouvrir le modal des détails de l'équipement
  const handleViewDetails = (equipment) => {
    setSelectedEquipment(equipment);
    setShowDetailsModal(true);
    setIsBlurred(true); // Activer l'effet flou
  };

  // Fermer les modals
  const closeModal = () => {
    setShowRequestModal(false);
    setShowDetailsModal(false);
    setIsBlurred(false); // Désactiver l'effet flou
  };

  // Gérer les changements dans le formulaire de demande
  const handleRequestFormChange = (e) => {
    const { name, value } = e.target;
    setRequestForm({ ...requestForm, [name]: value });
  };

  // Soumettre la demande d'équipement
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
  
    if (!requestForm.startDate || !requestForm.endDate) {
      alert("Veuillez spécifier les dates de début et de fin.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:8080/api/demandes/soumettre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idEquipement: requestForm.equipmentId,
          nomEquipement: requestForm.equipmentName,
          categorieEquipement: requestForm.equipmentCategory,
          centreEquipement: requestForm.equipmentCenter,
          prenom: requestForm.firstName,
          nom: requestForm.lastName,
          numeroTelephone: requestForm.phoneNumber,
          dateDebut: requestForm.startDate,
          dateFin: requestForm.endDate,
          remarques: requestForm.remarks,
        }),
      });
  
      if (response.ok) {
        alert("Demande d'équipement soumise avec succès !");
        closeModal();
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la soumission de la demande: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la soumission de la demande:", error);
      alert("Erreur réseau. Veuillez réessayer.");
    }
  };
  

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
          <li><Link to="/AdherantHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link></li>
          <li><Link to="/EquipmentDisponible"><FaCogs /><span>Équipements Disponibles</span></Link></li>
          <li><Link to="/SuiviDemandeAdherant"><FaClipboardList /><span>Suivi des Demandes</span></Link></li>
          <li><Link to="/notifications"><FaBell /><span>Notifications</span></Link></li>
        </ul>

        {/* Section en bas du sidebar */}
                <br></br><br></br><br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br><br></br>
        <div className="sidebar-bottom">
          <ul>
            <li><Link to="/account"><FaUser /><span>Compte</span></Link></li>
            <li className="logout"><Link to="/logout"><FaSignOutAlt /><span>Déconnexion</span></Link></li>
          </ul>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className={`content ${isBlurred ? "blur-background" : ""}`}>
        <h2>Équipements Disponibles</h2>

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

        {/* Grille des cartes */}
        <div className="equipment-grid">
          {currentEquipments.map((equipment) => (
            <div key={equipment.id} className="equipment-card">
              <img src={equipment.imageUrl || "/images/pc.jpg"} alt="Équipement" className="card-image" />
              <div className="card-content">
                <h3>{equipment.name}</h3>
                <p><strong>Catégorie:</strong> {equipment.category}</p>
                <p><strong>Centre:</strong> {equipment.center}</p>
              </div>
              <div className="card-actions">
                <button className="view-button" onClick={() => handleViewDetails(equipment)}>
                  View All
                </button>
                <button className="add-button" onClick={() => handleRequestEquipment(equipment)}>
                  Demander
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

      {/* Modal de demande d'équipement */}
      {showRequestModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>
              &times;
            </button>
            <h3>Demander un équipement</h3>
            <form onSubmit={handleSubmitRequest}>
              <div className="form-group">
                <label>Nom de l'équipement</label>
                <input
                  type="text"
                  value={requestForm.equipmentName}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>Catégorie</label>
                <input
                  type="text"
                  value={requestForm.equipmentCategory}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>Centre</label>
                <input
                  type="text"
                  value={requestForm.equipmentCenter}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input
                  type="text"
                  name="lastName"
                  value={requestForm.lastName}
                  onChange={handleRequestFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  value={requestForm.firstName}
                  onChange={handleRequestFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Numéro de téléphone</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={requestForm.phoneNumber}
                  onChange={handleRequestFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date et heure de début</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={requestForm.startDate}
                  onChange={handleRequestFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date et heure de fin</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={requestForm.endDate}
                  onChange={handleRequestFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Remarques</label>
                <textarea
                  name="remarks"
                  value={requestForm.remarks}
                  onChange={handleRequestFormChange}
                />
              </div>
              <button type="submit">Soumettre la demande</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal des détails de l'équipement */}
      {showDetailsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDisponible;