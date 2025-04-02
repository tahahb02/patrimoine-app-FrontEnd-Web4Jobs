import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaBars, 
  FaTimes, 
  FaTachometerAlt, 
  FaCogs, 
  FaClipboardList, 
  FaBell, 
  FaUser, 
  FaSignOutAlt, 
  FaSearch, 
  FaClock 
} from "react-icons/fa";
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
  const [itemsPerPage] = useState(12);
  const [activeSection, setActiveSection] = useState("request");
  const [requestSuccess, setRequestSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [categories] = useState(["PC Portable", "PC Bureau", "Bureautique", "Imprimante"]);
  const [centers] = useState(["A", "B", "C"]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/login");
      return;
    }

    fetchUserData(userId);
  }, [navigate]);

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/utilisateurs/${userId}`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des données utilisateur");
      }
      const data = await response.json();
      setUserData(data);
      fetchEquipments();
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchEquipments = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/equipments", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ''}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      const availableEquipments = Array.isArray(data) 
        ? data.filter(equip => equip.status === "Disponible" || !equip.status)
        : [];
      
      setEquipments(availableEquipments);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des équipements:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "Non spécifié";
    const date = new Date(dateTime);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    setRequestSuccess(false);
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
  
    const startDate = new Date(requestForm.startDate);
    const endDate = new Date(requestForm.endDate);
    
    if (startDate >= endDate) {
      alert("La date de fin doit être postérieure à la date de début.");
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
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ''}`
        },
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
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la soumission");
      }

      const data = await response.json();
      setRequestSuccess(true);
      alert(`Demande d'équipement soumise avec succès le ${formatDateTime(data.dateDemande)} !`);
      fetchEquipments();
    } catch (error) {
      console.error("Erreur:", error);
      setError(error.message);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !showRequestModal && !showDetailsModal) {
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

  if (error && !showRequestModal && !showDetailsModal) {
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
          <button onClick={() => window.location.reload()} className="retry-button">
            Réessayer
          </button>
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
          <li className={location.pathname === '/AdherantHome' ? 'active' : ''}>
            <Link to="/AdherantHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
          </li>
          <li className={location.pathname === '/EquipmentDisponible' ? 'active' : ''}>
            <Link to="/EquipmentDisponible"><FaCogs /><span>Équipements Disponibles</span></Link>
          </li>
          <li className={location.pathname === '/SuiviDemandeAdherant' ? 'active' : ''}>
            <Link to="/SuiviDemandeAdherant"><FaClipboardList /><span>Suivi des Demandes</span></Link>
          </li>
          <li className={location.pathname === '/notifications' ? 'active' : ''}>
            <Link to="/notifications"><FaBell /><span>Notifications</span></Link>
          </li>
        </ul>

        <div className="sidebar-bottom">
          <ul>
            <li className={location.pathname === '/account' ? 'active' : ''}>
              <Link to="/account"><FaUser /><span>Compte</span></Link>
            </li>
            <li className="logout">
              <Link to="/logout"><FaSignOutAlt /><span>Déconnexion</span></Link>
            </li>
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
              value={selectedCategory}
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
              value={selectedCenter}
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
                <p><strong>Disponibilité:</strong> {equipment.status || "Disponible"}</p>
              </div>
              <div className="card-actions">
                <button 
                  className="view-button" 
                  onClick={() => handleViewDetails(equipment)}
                >
                  Détails
                </button>
                <button 
                  className="request-button" 
                  onClick={() => handleRequestEquipment(equipment)}
                >
                  Demander
                </button>
              </div>
            </div>
          ))}
        </div>

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
      </main>

      {showRequestModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>
              &times;
            </button>
            <h3>Demander un équipement</h3>
            
            {requestSuccess ? (
              <div className="success-message">
                <p>Votre demande a été soumise avec succès !</p>
                <button 
                  className="close-button"
                  onClick={closeModal}
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest}>
                <div className="accordion-container">
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
                          min={requestForm.startDate}
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
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={closeModal}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="submit-button"
                  >
                    {loading ? "Envoi en cours..." : "Soumettre la demande"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
                  className="detail-image"
                />
                <div className="detail-group">
                  <span className="detail-label">Nom:</span>
                  <span className="detail-value">{selectedEquipment.name}</span>
                </div>
                <div className="detail-group">
                  <span className="detail-label">Catégorie:</span>
                  <span className="detail-value">{selectedEquipment.category}</span>
                </div>
                <div className="detail-group">
                  <span className="detail-label">Centre:</span>
                  <span className="detail-value">{selectedEquipment.center}</span>
                </div>
                <div className="detail-group">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{selectedEquipment.description || "Non spécifiée"}</span>
                </div>
                {selectedEquipment.specifications && (
                  <>
                    <h4 className="specifications-title">Spécifications techniques:</h4>
                    <div className="specifications-grid">
                      {Object.entries(selectedEquipment.specifications).map(([key, value]) => (
                        <div key={key} className="specification-item">
                          <span className="spec-label">{key}:</span>
                          <span className="spec-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <button 
                  className="request-button"
                  onClick={() => {
                    closeModal();
                    handleRequestEquipment(selectedEquipment);
                  }}
                >
                  Demander cet équipement
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDisponible;