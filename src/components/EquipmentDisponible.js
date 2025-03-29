import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaTachometerAlt, FaCogs, FaClipboardList, FaBell, FaUser, FaSignOutAlt, FaSearch } from "react-icons/fa";
import { Pagination } from 'antd';
import "../styles/EquipmentDisponible.css";

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
    startDate: "",
    endDate: "",
    remarks: ""
  });
  const [isBlurred, setIsBlurred] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Changé à 12 équipements par page
  const [activeSection, setActiveSection] = useState("request");
  const navigate = useNavigate();

  const [categories] = useState(["PC Portable", "PC Bureau", "Bureautique", "Imprimante"]);
  const [centers] = useState(["A", "B", "C"]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/login");
      return;
    }

    fetch(`http://localhost:8080/api/utilisateurs/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données utilisateur");
        }
        return response.json();
      })
      .then(data => {
        setUserData(data);
        fetchEquipments();
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, [navigate]);

  const fetchEquipments = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/equipments", {
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
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des équipements:", error);
      setError(`Erreur lors du chargement des équipements: ${error.message}`);
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
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

  // Calcul des équipements à afficher pour la page actuelle
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEquipments = filteredEquipments.slice(indexOfFirstItem, indexOfLastItem);

  const showTotal = (total) => `Total ${total} équipements`;

  const onChange = (page) => {
    setCurrentPage(page);
  };

  const handleRequestEquipment = (equipment) => {
    setSelectedEquipment(equipment);
    setRequestForm({
      startDate: "",
      endDate: "",
      remarks: ""
    });
    setShowRequestModal(true);
    setIsBlurred(true);
    setActiveSection("request");
  };

  const handleViewDetails = (equipment) => {
    setSelectedEquipment(equipment);
    setShowDetailsModal(true);
    setIsBlurred(true);
  };

  const closeModal = () => {
    setShowRequestModal(false);
    setShowDetailsModal(false);
    setIsBlurred(false);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
  
    if (!requestForm.startDate || !requestForm.endDate) {
      alert("Veuillez spécifier les dates de début et de fin.");
      return;
    }
  
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/login");
      return;
    }
  
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/demandes/soumettre/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idEquipement: selectedEquipment.id,
          nomEquipement: selectedEquipment.name,
          categorieEquipement: selectedEquipment.category,
          centreEquipement: selectedEquipment.center,
          dateDebut: requestForm.startDate,
          dateFin: requestForm.endDate,
          remarques: requestForm.remarks
        }),
      });
  
      if (response.ok) {
        alert("Demande d'équipement soumise avec succès !");
        closeModal();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la soumission");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="dashboard-container">
        <nav className="navbar">
          <div className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </div>
          <img src="/images/logo-light.png" alt="Logo" className="navbar-logo" />
        </nav>
        <div className="content">
          <div className="loading">Chargement en cours...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <nav className="navbar">
          <div className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </div>
          <img src="/images/logo-light.png" alt="Logo" className="navbar-logo" />
        </nav>
        <div className="content">
          <div className="error">Erreur: {error}</div>
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
          <li><Link to="/AdherantHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link></li>
          <li><Link to="/EquipmentDisponible"><FaCogs /><span>Équipements Disponibles</span></Link></li>
          <li><Link to="/SuiviDemandeAdherant"><FaClipboardList /><span>Suivi des Demandes</span></Link></li>
          <li><Link to="/notifications"><FaBell /><span>Notifications</span></Link></li>
        </ul>

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

      <main className={`content ${isBlurred ? "blur-background" : ""}`}>
        <h2>Équipements Disponibles</h2>

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

        {/* Pagination Ant Design */}
        <div className="pagination-container">
          <Pagination
            current={currentPage}
            total={filteredEquipments.length}
            pageSize={itemsPerPage}
            onChange={onChange}
            showTotal={showTotal}
            showSizeChanger={false}
            showQuickJumper
          />
        </div>

        {/* ... (le reste du code avec les modals reste inchangé) */}
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
              <div className="accordion-container">
                {/* Section Équipement */}
                <div className="accordion-section">
                  <div 
                    className={`accordion-header ${activeSection === 'equipment' ? 'active' : ''}`}
                    onClick={() => toggleSection('equipment')}
                  >
                    <span>📋 Informations sur l'équipement</span>
                  </div>
                  <div className={`accordion-content ${activeSection === 'equipment' ? 'show' : ''}`}>
                    <div className="form-group">
                      <label>Nom de l'équipement</label>
                      <input
                        type="text"
                        value={selectedEquipment?.name || ""}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Catégorie</label>
                      <input
                        type="text"
                        value={selectedEquipment?.category || ""}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Centre</label>
                      <input
                        type="text"
                        value={selectedEquipment?.center || ""}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                
                {/* Section Utilisateur */}
                <div className="accordion-section">
                  <div 
                    className={`accordion-header ${activeSection === 'user' ? 'active' : ''}`}
                    onClick={() => toggleSection('user')}
                  >
                    <span>👤 Informations personnelles</span>
                  </div>
                  <div className={`accordion-content ${activeSection === 'user' ? 'show' : ''}`}>
                    <div className="form-group">
                      <label>Nom</label>
                      <input
                        type="text"
                        value={userData?.nom || ""}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Prénom</label>
                      <input
                        type="text"
                        value={userData?.prenom || ""}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={userData?.email || ""}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Téléphone</label>
                      <input
                        type="text"
                        value={userData?.phone || ""}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                
                {/* Section Demande */}
                <div className="accordion-section">
                  <div 
                    className={`accordion-header ${activeSection === 'request' ? 'active' : ''}`}
                    onClick={() => toggleSection('request')}
                  >
                    <span>📅 Détails de la demande</span>
                  </div>
                  <div className={`accordion-content ${activeSection === 'request' ? 'show' : ''}`}>
                    <div className="form-group">
                      <label>Date et heure de début *</label>
                      <input
                        type="datetime-local"
                        name="startDate"
                        value={requestForm.startDate}
                        onChange={(e) => setRequestForm({...requestForm, startDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Date et heure de fin *</label>
                      <input
                        type="datetime-local"
                        name="endDate"
                        value={requestForm.endDate}
                        onChange={(e) => setRequestForm({...requestForm, endDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Remarques</label>
                      <textarea
                        name="remarks"
                        value={requestForm.remarks}
                        onChange={(e) => setRequestForm({...requestForm, remarks: e.target.value})}
                        placeholder="Facultatif"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <button type="submit" disabled={loading} className="submit-button">
                {loading ? "Envoi en cours..." : "Soumettre la demande"}
              </button>
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
              <div className="details-content">
                <img 
                  src={selectedEquipment.imageUrl || "/images/pc.jpg"} 
                  alt="Équipement" 
                  style={{ width: "100%", maxHeight: "200px", objectFit: "contain", marginBottom: "15px" }}
                />
                <p><strong>Nom:</strong> {selectedEquipment.name}</p>
                <p><strong>Catégorie:</strong> {selectedEquipment.category}</p>
                <p><strong>Centre:</strong> {selectedEquipment.center}</p>
                <p><strong>Description:</strong> {selectedEquipment.description}</p>
                {selectedEquipment.specifications && (
                  <div>
                    <h4 style={{ margin: "15px 0 10px", color: "#4a148c" }}>Spécifications techniques:</h4>
                    <ul style={{ paddingLeft: "20px" }}>
                      {Object.entries(selectedEquipment.specifications).map(([key, value]) => (
                        <li key={key} style={{ marginBottom: "5px" }}><strong>{key}:</strong> {value}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDisponible;