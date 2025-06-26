import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Pagination } from 'antd';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaUsers,
  FaUserCog,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaSearch,
  FaFilter,
  FaUserShield,
  FaUserTie,
  FaUserGraduate,
  FaBoxes,
  FaChartLine,
  FaWrench,
  FaHistory,
  FaClipboardList,
  FaCogs,
  FaUserAlt,
  FaEye
} from "react-icons/fa";

const MySwal = withReactContent(Swal);
const API_URL = "http://localhost:8080/api/utilisateurs";

const DirecteurUtilisateurs = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedVilleCentre, setSelectedVilleCentre] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [stats, setStats] = useState({
    total: 0,
    adherants: 0,
    responsables: 0,
    techniciens: 0,
    directeurs: 0,
    rp: 0
  });
  const [showDetails, setShowDetails] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const villesCentre = [
    "TINGHIR", "TEMARA", "TCHAD", "ESSAOUIRA", 
    "DAKHLA", "LAAYOUNE", "NADOR", "AIN_EL_AOUDA"
  ];

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

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

  const fetchUtilisateurs = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des utilisateurs");
      }
      const data = await response.json();
      setUtilisateurs(data);
      
      // Calcul des statistiques
      const statsData = {
        total: data.length,
        adherants: data.filter(u => u.role === 'ADHERANT').length,
        responsables: data.filter(u => u.role === 'RESPONSABLE').length,
        techniciens: data.filter(u => u.role === 'TECHNICIEN').length,
        directeurs: data.filter(u => u.role === 'DIRECTEUR').length,
        rp: data.filter(u => u.role === 'RESPONSABLE_PATRIMOINE').length
      };
      setStats(statsData);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      setUtilisateurs([]);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredUtilisateurs = utilisateurs.filter((utilisateur) => {
    const matchesSearch =
      `${utilisateur.nom} ${utilisateur.prenom} ${utilisateur.email} ${utilisateur.city}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole
      ? utilisateur.role === selectedRole
      : true;

    const matchesVilleCentre = selectedVilleCentre
      ? utilisateur.villeCentre === selectedVilleCentre
      : true;

    return matchesSearch && matchesRole && matchesVilleCentre;
  });

  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentUsers = filteredUtilisateurs.slice(indexOfFirstItem, indexOfLastItem);

  const showTotal = (total) => `Total ${total} utilisateurs`;

  const onChange = (page) => {
    setCurrentPage(page);
  };

  const toggleDetails = (id) => {
    setShowDetails(showDetails === id ? null : id);
  };

  const formatVilleCentre = (ville) => {
    if (!ville) return "";
    return ville.charAt(0) + ville.slice(1).toLowerCase().replace("_", " ");
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'ADHERANT': return <FaUserAlt className="role-icon" />;
      case 'RESPONSABLE': return <FaUserTie className="role-icon" />;
      case 'TECHNICIEN': return <FaUserGraduate className="role-icon" />;
      case 'DIRECTEUR': return <FaUserShield className="role-icon" />;
      case 'RESPONSABLE_PATRIMOINE': return <FaUserCog className="role-icon" />;
      default: return <FaUser className="role-icon" />;
    }
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
          <li className={location.pathname === '/DirecteurHome' ? 'active' : ''}>
            <Link to="/DirecteurHome"><FaTachometerAlt /><span>Tableau de Bord</span></Link>
          </li>

          <li className={location.pathname.includes('/DirecteurUtilisateurs') ? 'active' : ''}>
            <Link to="/DirecteurUtilisateurs"><FaUsers /><span>Utilisateurs</span></Link>
          </li>
          
          <li className={location.pathname === '/EquipementsDirecteur' ? 'active' : ''}>
            <Link to="/EquipementsDirecteur"><FaCogs /><span>Équipements</span></Link>
          </li>
          
          <li className={location.pathname === '/DirecteurHistoriqueDemandes' ? 'active' : ''}>
            <Link to="/DirecteurHistoriqueDemandes"><FaClipboardList /><span>Historique Demandes</span></Link>
          </li>
          
          <li className={location.pathname === '/DirecteurHistoriqueUtilisations' ? 'active' : ''}>
            <Link to="/DirecteurHistoriqueUtilisations"><FaHistory /><span>Historique Utilisations Des Équipements</span></Link>
          </li>
          
          <li className={location.pathname === '/DirecteurHistoriqueMaintenances' ? 'active' : ''}>
            <Link to="/DirecteurHistoriqueMaintenances"><FaWrench /><span>Historique Maintenances</span></Link>
          </li>
        </ul>

        <div className="sidebar-bottom">
          <ul>
            <li className={location.pathname === '/DirecteurAccount' ? 'active' : ''}>
              <Link to="/DirecteurAccount"><FaUser /><span>Compte</span></Link>
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
        <h2>Vue Globale des Utilisateurs</h2>

        {/* Cartes de statistiques */}
        <div className="dashboard-cards">
          <div className="stat-card">
            <div className="stat-icon total">
              <FaUsers />
            </div>
            <div className="stat-info">
              <h3>Total Utilisateurs</h3>
              <p>{stats.total}</p>
              <span>Tous les utilisateurs</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon adherants">
              <FaUserGraduate />
            </div>
            <div className="stat-info">
              <h3>Adhérents</h3>
              <p>{stats.adherants}</p>
              <span>Membres adhérents</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon responsables">
               <FaUserAlt />
            </div>
            <div className="stat-info">
              <h3>Responsables Centres</h3>
              <p>{stats.responsables}</p>
              <span>Gestion Centre</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon techniciens">
               <FaUserCog />
            </div>
            <div className="stat-info">
              <h3>Techniciens</h3>
              <p>{stats.techniciens}</p>
              <span>Maintenance</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rp">
              <FaUserTie />
            </div>
            <div className="stat-info">
              <h3>Responsables Patrimoine</h3>
              <p>{stats.rp}</p>
              <span>Gestion Globale</span>
            </div>
          </div>
        </div>

        <div className="search-and-filters">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, email ou ville..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select
              className="filter-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">Tous les rôles</option>
              <option value="ADHERANT">Adhérent</option>
              <option value="RESPONSABLE">Responsable</option>
              <option value="DIRECTEUR">Directeur</option>
              <option value="RESPONSABLE_PATRIMOINE">Responsable Patrimoine</option>
              <option value="TECHNICIEN">Technicien</option>
            </select>
          </div>

          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select
              className="filter-select"
              value={selectedVilleCentre}
              onChange={(e) => setSelectedVilleCentre(e.target.value)}
            >
              <option value="">Tous les centres</option>
              {villesCentre.map((ville) => (
                <option key={ville} value={ville}>
                  {formatVilleCentre(ville)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="utilisateurs-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Ville</th>
                <th>Centre</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((utilisateur) => (
                  <React.Fragment key={utilisateur.id}>
                    <tr>
                      <td>
                        {utilisateur.profileImage ? (
                          <img 
                            src={`data:image/jpeg;base64,${utilisateur.profileImage}`} 
                            alt="Profile" 
                            className="profile-image"
                          />
                        ) : (
                          <div className="profile-placeholder">
                            <FaUser />
                          </div>
                        )}
                      </td>
                      <td>{utilisateur.nom}</td>
                      <td>{utilisateur.prenom}</td>
                      <td>{utilisateur.email}</td>
                      <td>{utilisateur.phone}</td>
                      <td>{utilisateur.city}</td>
                      <td>{formatVilleCentre(utilisateur.villeCentre)}</td>
                      <td>
                        <div className="role-cell">
                          {getRoleIcon(utilisateur.role)}
                          <span>
                            {utilisateur.role === 'RESPONSABLE_PATRIMOINE' 
                              ? 'Responsable Patrimoine' 
                              : utilisateur.role}
                          </span>
                        </div>
                      </td>
                      <td>
                        <button
                          className="details-button"
                          onClick={() => toggleDetails(utilisateur.id)}
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                    {showDetails === utilisateur.id && (
                      <tr className="details-row">
                        <td colSpan="9">
                          <div className="user-details-card">
                            <div className="details-header">
                              <h3>Détails de l'utilisateur</h3>
                            </div>
                            <div className="details-body">
                              <div className="details-image">
                                {utilisateur.profileImage ? (
                                  <img 
                                    src={`data:image/jpeg;base64,${utilisateur.profileImage}`} 
                                    alt="Profile" 
                                    className="profile-image-large"
                                  />
                                ) : (
                                  <div className="profile-placeholder-large">
                                    <FaUser />
                                  </div>
                                )}
                              </div>
                              <div className="details-info">
                                <p><strong>Nom complet:</strong> {utilisateur.prenom} {utilisateur.nom}</p>
                                <p><strong>Email:</strong> {utilisateur.email}</p>
                                <p><strong>Téléphone:</strong> {utilisateur.phone}</p>
                                <p><strong>Ville:</strong> {utilisateur.city}</p>
                                <p><strong>Centre:</strong> {formatVilleCentre(utilisateur.villeCentre)}</p>
                                <p><strong>Rôle:</strong> 
                                  {utilisateur.role === 'RESPONSABLE_PATRIMOINE' 
                                    ? 'Responsable Patrimoine' 
                                    : utilisateur.role}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
                                                                                        
        {filteredUtilisateurs.length > 0 && (
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              total={filteredUtilisateurs.length}
              pageSize={pageSize}
              onChange={onChange}
              showTotal={showTotal}
              showSizeChanger={false}
              showQuickJumper
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default DirecteurUtilisateurs;