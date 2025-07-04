import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaBars, FaTimes, FaCheckCircle, FaTimesCircle, 
  FaSearch, FaFilter, FaUser, FaSignOutAlt, 
  FaTachometerAlt, FaHistory, FaChartLine, FaBuilding, FaCogs, FaInfoCircle
} from "react-icons/fa";
import { Pagination, Modal } from "antd";
import Swal from 'sweetalert2';
import "../styles/responsable.css";

const API_URL = "http://localhost:8080/api/rp";

const ValidationEquipementRP = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingEquipments, setPendingEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [selectedCenter, setSelectedCenter] = useState("all");
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const centers = [
    "TINGHIR",
    "TEMARA",
    "TCHAD",
    "ESSAOUIRA",
    "DAKHLA",
    "LAAYOUNE",
    "NADOR",
    "AIN_EL_AOUDA"
  ];

  useEffect(() => {
    fetchPendingEquipments();
  }, []);

  const fetchPendingEquipments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/equipments/pending`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      const normalizedData = data.map(equipment => ({
        ...equipment,
        name: equipment.name || "Nom non spécifié",
        category: equipment.category || "Catégorie non spécifiée",
        villeCentre: equipment.villeCentre || "Centre non spécifié",
        addedByName: equipment.addedByName || equipment.addedBy || "Utilisateur inconnu",
        dateAdded: equipment.dateAdded || new Date().toISOString(),
        description: equipment.description || "Aucune description fournie",
        imageUrl: equipment.imageUrl || "/images/pc.jpg"
      }));
      setPendingEquipments(normalizedData);
    } catch (error) {
      console.error("Erreur:", error);
      Swal.fire({
        title: 'Erreur',
        text: error.message || 'Impossible de charger les équipements',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/equipments/validate/${id}`, {
        method: "PUT",
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        Swal.fire('Succès', 'Équipement validé', 'success');
        fetchPendingEquipments();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire('Erreur', error.message || 'Échec de la validation', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/equipments/reject/${id}`, {
        method: "PUT",
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        Swal.fire('Succès', 'Équipement rejeté', 'success');
        fetchPendingEquipments();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire('Erreur', error.message || 'Échec du rejet', 'error');
    }
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

  const filteredEquipments = pendingEquipments.filter(equipment => {
    const matchesSearch = equipment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCenter = selectedCenter === "all" || 
                         equipment.villeCentre?.toString() === selectedCenter.toString();
    return matchesSearch && matchesCenter;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEquipments.slice(indexOfFirstItem, indexOfLastItem);

  const formatVilleCentre = (ville) => {
    if (!ville) return "";
    const formatted = ville.replace(/_/g, " ");
    return formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
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
        <h2>Validation des Équipements</h2>
        <p className="center-info">
          Équipements en attente de validation
        </p>

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

          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select
              className="filter-select"
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
            >
              <option value="all">Tous les centres</option>
              {centers.map((center, index) => (
                <option key={index} value={center}>
                  {formatVilleCentre(center)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Chargement des équipements en attente...</p>
          </div>
        ) : (
          <>
            <div className="equipment-grid">
              {currentItems.length > 0 ? (
                currentItems.map(equipment => (
                  <div key={equipment.id} className="equipment-card">
                    <img src={equipment.imageUrl} alt="Équipement" className="card-image" />
                    <div className="card-content">
                      <h3>{equipment.name}</h3>
                      <p><strong>Catégorie:</strong> {equipment.category}</p>
                      <p><strong>Centre:</strong> {formatVilleCentre(equipment.villeCentre)}</p>
                      <p><strong>Ajouté par:</strong> {equipment.addedByName}</p>
                      <p><strong>Date ajout:</strong> {new Date(equipment.dateAdded).toLocaleDateString()}</p>
                      
                      <div className="validation-actions">
                        <div className="approval-buttons">
                          <button 
                            className="validate-button"
                            onClick={() => handleValidate(equipment.id)}
                          >
                            <FaCheckCircle /> Valider
                          </button>
                          <button 
                            className="reject-button"
                            onClick={() => handleReject(equipment.id)}
                          >
                            <FaTimesCircle /> Rejeter
                          </button>
                        </div>
                        <button 
                          className="details-button"
                          onClick={() => {
                            setSelectedEquipment(equipment);
                            setIsDetailModalVisible(true);
                          }}
                        >
                          <FaInfoCircle /> Détails
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <p>Aucun équipement en attente de validation</p>
                </div>
              )}
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
          </>
        )}
      </main>

      <Modal
        title={`Détails de l'équipement - ${selectedEquipment?.name || ''}`}
        visible={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedEquipment && (
          <div className="details-container">
            <img 
              src={selectedEquipment.imageUrl} 
              alt={selectedEquipment.name} 
              className="detail-image"
            />
            <div className="details-content">
              <div className="detail-row">
                <span className="detail-label">Nom:</span>
                <span className="detail-value">{selectedEquipment.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Catégorie:</span>
                <span className="detail-value">{selectedEquipment.category}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Centre:</span>
                <span className="detail-value">{formatVilleCentre(selectedEquipment.villeCentre)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Ajouté par:</span>
                <span className="detail-value">{selectedEquipment.addedByName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date ajout:</span>
                <span className="detail-value">{new Date(selectedEquipment.dateAdded).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{selectedEquipment.description}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ValidationEquipementRP;