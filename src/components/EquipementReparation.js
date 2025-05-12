import React, { useState, useEffect } from 'react';
import { FaWrench, FaClock, FaCheckCircle, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import "../styles/adherant.css";
const EquipementReparation = () => {
    const [equipements, setEquipements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [formData, setFormData] = useState({
        actionsRealisees: '',
        dureeReelle: ''
    });

    useEffect(() => {
        const fetchEquipements = async () => {
            try {
                const response = await axios.get('/api/maintenances/en-cours/ville/TINGHIR', {
                    headers: {
                        'X-User-Role': 'TECHNICIEN',
                        'X-User-Center': 'TINGHIR'
                    }
                });
                setEquipements(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Erreur lors de la récupération des équipements:", error);
                setLoading(false);
            }
        };

        fetchEquipements();
    }, []);

    const handleTerminer = (maintenance) => {
        setSelectedMaintenance(maintenance);
        setFormData({
            actionsRealisees: maintenance.actionsRealisees || '',
            dureeReelle: maintenance.dureeReelle || ''
        });
    };

    const handleSubmit = async () => {
        try {
            await axios.put(`/api/maintenances/${selectedMaintenance.id}/terminer`, formData, {
                headers: {
                    'X-User-Role': 'TECHNICIEN'
                }
            });
            // Mettre à jour la liste après soumission
            const updatedEquipements = equipements.filter(e => e.id !== selectedMaintenance.id);
            setEquipements(updatedEquipements);
            setSelectedMaintenance(null);
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la maintenance:", error);
        }
    };

    const filteredEquipements = equipements.filter(equipement =>
        equipement.nomEquipement.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipement.idEquipement.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="content">
            <h2><FaWrench /> Équipements en Réparation</h2>
            
            <div className="search-and-filters">
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Rechercher un équipement..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading">Chargement en cours...</div>
            ) : filteredEquipements.length === 0 ? (
                <div className="no-data-message">
                    <p>Aucun équipement en réparation pour le moment</p>
                </div>
            ) : (
                <>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Équipement</th>
                                    <th>ID</th>
                                    <th>Type de problème</th>
                                    <th>Urgence</th>
                                    <th>Durée estimée</th>
                                    <th>Date début</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEquipements.map(equipement => (
                                    <tr key={equipement.id}>
                                        <td>{equipement.nomEquipement}</td>
                                        <td>{equipement.idEquipement}</td>
                                        <td>{equipement.typeProbleme}</td>
                                        <td>
                                            <span className={`badge urgency-badge ${equipement.degreUrgence.toLowerCase()}`}>
                                                {equipement.degreUrgence}
                                            </span>
                                        </td>
                                        <td>{equipement.dureeEstimee}h</td>
                                        <td className="date-cell">
                                            {new Date(equipement.dateDebut).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-success"
                                                onClick={() => handleTerminer(equipement)}
                                            >
                                                <FaCheckCircle /> Terminer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {selectedMaintenance && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <button className="modal-close" onClick={() => setSelectedMaintenance(null)}>×</button>
                                <h3>Terminer la maintenance</h3>
                                
                                <div className="form-group">
                                    <label>Actions réalisées</label>
                                    <textarea 
                                        value={formData.actionsRealisees}
                                        onChange={(e) => setFormData({...formData, actionsRealisees: e.target.value})}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Durée réelle (heures)</label>
                                    <input 
                                        type="number" 
                                        value={formData.dureeReelle}
                                        onChange={(e) => setFormData({...formData, dureeReelle: e.target.value})}
                                    />
                                </div>

                                <div className="form-group" style={{ marginTop: '20px' }}>
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={handleSubmit}
                                        style={{ width: '100%' }}
                                    >
                                        <FaCheckCircle /> Confirmer la fin de maintenance
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default EquipementReparation;