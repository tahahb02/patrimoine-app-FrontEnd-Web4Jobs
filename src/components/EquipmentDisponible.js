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
  FaClock,
  FaExclamationTriangle,
  FaInfoCircle,
  FaClipboardCheck,
  FaFilter
} from "react-icons/fa";
import { Pagination } from 'antd';
import "../styles/adherant.css";

const EquipmentDisponible = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [equipments, setEquipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [requestForm, setRequestForm] = useState({
    startDate: "",
    endDate: "",
    remarks: "",
    urgency: "NORMALE"
  });
  const [isBlurred, setIsBlurred] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [activeSection, setActiveSection] = useState("personal");
  const [requestSuccess, setRequestSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [categories] = useState(["PC Portable", "PC Bureau", "Bureautique", "Imprimante"]);

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
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/utilisateurs/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des données utilisateur");
      }
      const data = await response.json();
      setUserData(data);
      fetchEquipmentsByCenter(data.villeCentre);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

const fetchEquipmentsByCenter = async (villeCentre) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:8080/api/equipments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Center': villeCentre,
        'X-User-Role': 'ADHERANT'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    // Normaliser les valeurs boolean
    const normalizedData = data.map(equip => ({
      ...equip,
      enMaintenance: equip.enMaintenance || false,
      status: equip.status || "Disponible"
    }));
    
    const availableEquipments = normalizedData.filter(equip => 
      !equip.enMaintenance && 
      equip.status === "Disponible"
    );
    setEquipments(availableEquipments);
    setLoading(false);
  } catch (error) {
    console.error("Erreur:", error);
    setError(error.message);
    setLoading(false);
  }
};
  const formatVilleCentre = (ville) => {
    if (!ville) return "";
    return ville.charAt(0) + ville.slice(1).toLowerCase().replace(/_/g, " ");
  };

  const filteredEquipments = equipments.filter((equipment) => {
    const matchesSearch =
      equipment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory
      ? equipment.category === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
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
      remarks: "",
      urgency: "NORMALE"
    });
    setShowRequestModal(true);
    setIsBlurred(true);
    setActiveSection("personal");
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
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("userRole");

      const response = await fetch(`http://localhost:8080/api/demandes/soumettre/${userId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-User-Role": userRole
        },
        body: JSON.stringify({
          idEquipement: selectedEquipment.id,
          nomEquipement: selectedEquipment.name,
          categorieEquipement: selectedEquipment.category,
          centreEquipement: selectedEquipment.villeCentre,
          villeCentre: userData.villeCentre,
          prenom: userData.prenom,
          nom: userData.nom,
          numeroTelephone: userData.phone,
          dateDebut: requestForm.startDate,
          dateFin: requestForm.endDate,
          remarques: requestForm.remarks,
          urgence: requestForm.urgency
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la soumission");
      }

      const data = await response.json();
      setRequestSuccess(true);
      alert(`Demande d'équipement soumise avec succès !`);
      fetchEquipmentsByCenter(userData.villeCentre);
    } catch (error) {
      console.error("Erreur:", error);
      setError(error.message);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userNom");
    localStorage.removeItem("userPrenom");
    localStorage.removeItem("userVilleCentre");
    navigate("/login");
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
          <li  className={location.pathname === '/HistoriqueDemandeAdherant' ? 'active' : ''}>
            <Link to="/MesDemandes"><FaClipboardCheck /><span>Mes Demandes</span></Link>
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
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', padding: '10px', width: '100%', textAlign: 'left' }}>
                <FaSignOutAlt /><span>Déconnexion</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <main className={`content ${isBlurred ? "blur-background" : ""}`}>
        <h2>Équipements Disponibles</h2>
        <p className="center-info">
          Vous visualisez les équipements disponibles pour le centre : <strong>{formatVilleCentre(userData?.villeCentre)}</strong>
        </p>

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
            </div>
          </div>
        </div>

        <div className="equipment-grid">
          {currentEquipments.map((equipment) => (
            <div key={equipment.id} className="equipment-card">
              <img src={equipment.imageUrl || "/images/pc.jpg"} alt="Équipement" className="card-image" />
              <div className="card-content">
                <h3>{equipment.name}</h3>
                <p><strong>Catégorie:</strong> {equipment.category}</p>
                <p><strong>Centre:</strong> {formatVilleCentre(equipment.villeCentre)}</p>
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
        <>
          <div className="modal-backdrop"></div>
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
                        className={`accordion-header ${activeSection === 'personal' ? 'active' : ''}`}
                        onClick={() => setActiveSection('personal')}
                      >
                        <span><FaUser /> Informations personnelles</span>
                      </div>
                      <div className={`accordion-content ${activeSection === 'personal' ? 'show' : ''}`}>
                        <div className="form-group">
                          <label>Nom complet</label>
                          <input
                            type="text"
                            value={`${userData?.prenom || ''} ${userData?.nom || ''}`}
                            readOnly
                          />
                        </div>
                        <div className="form-group">
                          <label>Téléphone</label>
                          <input
                            type="text"
                            value={userData?.phone || ''}
                            readOnly
                          />
                        </div>
                        <div className="form-group">
                          <label>Email</label>
                          <input
                            type="text"
                            value={userData?.email || ''}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div className="accordion-section">
                      <div 
                        className={`accordion-header ${activeSection === 'equipment' ? 'active' : ''}`}
                        onClick={() => setActiveSection('equipment')}
                      >
                        <span><FaInfoCircle /> Équipement demandé</span>
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
                            value={formatVilleCentre(selectedEquipment?.villeCentre) || ""}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-section">
                      <div 
                        className={`accordion-header ${activeSection === 'request' ? 'active' : ''}`}
                        onClick={() => setActiveSection('request')}
                      >
                        <span><FaClock /> Période de demande</span>
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

                    <div className="accordion-section">
                      <div 
                        className={`accordion-header ${activeSection === 'urgency' ? 'active' : ''}`}
                        onClick={() => setActiveSection('urgency')}
                      >
                        <span><FaExclamationTriangle /> Niveau d'urgence</span>
                      </div>
                      <div className={`accordion-content ${activeSection === 'urgency' ? 'show' : ''}`}>
                        <div className="urgency-notice">
                          Sélectionnez le niveau d'urgence approprié pour votre demande
                        </div>
                        <div className="urgency-levels">
                          <div 
                            className={`urgency-level ${requestForm.urgency === 'NORMALE' ? 'selected' : ''}`}
                            onClick={() => setRequestForm({...requestForm, urgency: 'NORMALE'})}
                          >
                            <div className="urgency-indicator normal"></div>
                            <div className="urgency-content">
                              <h4>Normale</h4>
                              <p>Traitement standard sous 5-7 jours ouvrés</p>
                              <div className="urgency-details">
                                <span>Pour les demandes non critiques</span>
                              </div>
                            </div>
                          </div>

                          <div 
                            className={`urgency-level ${requestForm.urgency === 'MOYENNE' ? 'selected' : ''}`}
                            onClick={() => setRequestForm({...requestForm, urgency: 'MOYENNE'})}
                          >
                            <div className="urgency-indicator medium"></div>
                            <div className="urgency-content">
                              <h4>Moyenne</h4>
                              <p>Traitement accéléré sous 2-3 jours ouvrés</p>
                              <div className="urgency-details">
                                <span>Pour les besoins importants</span>
                              </div>
                            </div>
                          </div>

                          <div 
                            className={`urgency-level ${requestForm.urgency === 'ELEVEE' ? 'selected' : ''}`}
                            onClick={() => setRequestForm({...requestForm, urgency: 'ELEVEE'})}
                          >
                            <div className="urgency-indicator high"></div>
                            <div className="urgency-content">
                              <h4>Élevée</h4>
                              <p>Traitement immédiat (24h maximum)</p>
                              <div className="urgency-details">
                                <span>Pour les situations critiques</span>
                              </div>
                            </div>
                          </div>
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
        </>
      )}

      {showDetailsModal && (
        <>
          <div className="modal-backdrop"></div>
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
                    <span className="detail-value">{formatVilleCentre(selectedEquipment.villeCentre)}</span>
                  </div>
                  <div className="detail-group">
                    <span className="detail-label">Description:</span>
                    <span className="detail-value">{selectedEquipment.description || "Non spécifiée"}</span>
                  </div>
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
        </>
      )}
    </div>
  );
};

export default EquipmentDisponible;