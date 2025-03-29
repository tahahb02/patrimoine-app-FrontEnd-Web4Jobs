import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  FaEye, 
  FaHistory 
} from "react-icons/fa";
import { Pagination } from 'antd';
import "../styles/GestionDemandes.css";

const API_URL = "http://localhost:8080/api/demandes";

const GestionDemandes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demandes, setDemandes] = useState([]);
  const [filtres, setFiltres] = useState({
    statut: "TOUS",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [commentaire, setCommentaire] = useState("");
  const [actionChoisie, setActionChoisie] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // 20 demandes par page

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    try {
      const response = await fetch(`${API_URL}/en-attente`);
      const data = await response.json();
      setDemandes(data);
    } catch (error) {
      console.error("Erreur lors du chargement des demandes:", error);
    }
  };

  const handleFiltreChange = (e) => {
    const { name, value } = e.target;
    setFiltres({ ...filtres, [name]: value });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredDemandes = demandes.filter((demande) => {
    if (filtres.statut !== "TOUS" && demande.statut !== filtres.statut) {
      return false;
    }
    return (
      demande.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.centreEquipement.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calcul des demandes à afficher pour la page actuelle
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDemandes = filteredDemandes.slice(indexOfFirstItem, indexOfLastItem);

  const showTotal = (total) => `Total ${total} demandes`;

  const onChange = (page) => {
    setCurrentPage(page);
  };

  const handleAction = (demande, action) => {
    setSelectedDemande(demande);
    setActionChoisie(action);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCommentaire("");
    setActionChoisie(null);
  };

  const mettreAJourStatut = async () => {
    try {
      const response = await fetch(`${API_URL}/${selectedDemande.id}/statut`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          statut: actionChoisie,
          commentaire: commentaire
        })
      });
      
      if (response.ok) {
        alert(`Demande ${actionChoisie.toLowerCase()} avec succès !`);
        closeModal();
        fetchDemandes();
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la mise à jour du statut: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      alert("Erreur réseau. Veuillez réessayer.");
    }
  };

  const handleDetails = (demande) => {
    setSelectedDetails(demande);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedDetails(null);
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
          <li>
            <Link to="/ResponsableHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
          </li>
          <li>
            <Link to="/Equipments"><FaCogs /><span>Gestion des Équipements</span></Link>
          </li>
          <li>
            <Link to="/GestionDemandes"><FaClipboardList /><span>Gestion des Demandes</span></Link>
          </li>
          <li>
            <Link to="/HistoriqueDemandes"><FaHistory /><span>Historique des Demandes</span></Link>
          </li>
          <li>
            <Link to="/Notifications"><FaBell /><span>Notifications</span></Link>
          </li>
        </ul>
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

      <main className="content">
        <h2>Gestion des Demandes</h2>

        <div className="search-and-filter-container">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou centre..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="demandes-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Centre</th>
                <th>Équipement</th>
                <th>Statut</th>
                <th>Actions</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              {currentDemandes.map((demande) => (
                <tr key={demande.id}>
                  <td>{demande.nom}</td>
                  <td>{demande.prenom}</td>
                  <td>{demande.centreEquipement}</td>
                  <td>{demande.nomEquipement}</td>
                  <td>{demande.statut}</td>
                  <td>
                    <button
                      className="accepter"
                      onClick={() => handleAction(demande, "ACCEPTEE")}
                    >
                      Accepter
                    </button>
                    <button
                      className="refuser"
                      onClick={() => handleAction(demande, "REFUSEE")}
                    >
                      Refuser
                    </button>
                  </td>
                  <td>
                    <button
                      className="details-button"
                      onClick={() => handleDetails(demande)}
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-container">
          <Pagination
            current={currentPage}
            total={filteredDemandes.length}
            pageSize={itemsPerPage}
            onChange={onChange}
            showTotal={showTotal}
            showSizeChanger={false}
            showQuickJumper
          />
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close" onClick={closeModal}>
                &times;
              </button>
              <h3>Commentaire</h3>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Ajouter un commentaire..."
              />
              <div className="modal-actions">
                {actionChoisie === "ACCEPTEE" && (
                  <button className="accepter" onClick={mettreAJourStatut}>
                    Accepter
                  </button>
                )}
                {actionChoisie === "REFUSEE" && (
                  <button className="refuser" onClick={mettreAJourStatut}>
                    Refuser
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {showDetailsModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close" onClick={closeDetailsModal}>
                &times;
              </button>
              <h3>Détails de la demande</h3>
              {selectedDetails && (
                <div className="details-content">
                  <p><strong>Nom :</strong> {selectedDetails.nom}</p>
                  <p><strong>Prénom :</strong> {selectedDetails.prenom}</p>
                  <p><strong>Centre :</strong> {selectedDetails.centreEquipement}</p>
                  <p><strong>Équipement :</strong> {selectedDetails.nomEquipement}</p>
                  <p><strong>Catégorie :</strong> {selectedDetails.categorieEquipement}</p>
                  <p><strong>Date de début :</strong> {new Date(selectedDetails.dateDebut).toLocaleString('fr-FR')}</p>
                  <p><strong>Date de fin :</strong> {new Date(selectedDetails.dateFin).toLocaleString('fr-FR')}</p>
                  <p><strong>Remarques :</strong> {selectedDetails.remarques}</p>
                  <p><strong>Statut :</strong> {selectedDetails.statut}</p>
                  <p><strong>Commentaire du responsable :</strong> {selectedDetails.commentaireResponsable}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GestionDemandes;