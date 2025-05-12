import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTools, FaClock, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import "../styles/adherant.css";
 


const DiagnostiqueEquipements = () => {
    const [diagnostics, setDiagnostics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);
    const [formData, setFormData] = useState({
        besoinMaintenance: false,
        typeProbleme: '',
        degreUrgence: '',
        description: '',
        dureeEstimee: ''
    });

    useEffect(() => {
        const fetchDiagnostics = async () => {
            try {
                const response = await axios.get('/api/diagnostics/ville/TINGHIR', {
                    headers: {
                        'X-User-Role': 'TECHNICIEN',
                        'X-User-Center': 'TINGHIR'
                    }
                });
                setDiagnostics(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Erreur lors de la récupération des diagnostics:", error);
                setLoading(false);
            }
        };

        fetchDiagnostics();
    }, []);

    const handleEvaluate = (diagnostic) => {
        setSelectedDiagnostic(diagnostic);
        setFormData({
            besoinMaintenance: diagnostic.besoinMaintenance,
            typeProbleme: diagnostic.typeProbleme || '',
            degreUrgence: diagnostic.degreUrgence || '',
            description: diagnostic.descriptionProbleme || '',
            dureeEstimee: diagnostic.dureeEstimee || ''
        });
    };

    const handleSubmit = async () => {
        try {
            await axios.put(`/api/diagnostics/${selectedDiagnostic.id}/evaluation`, formData, {
                headers: {
                    'X-User-Role': 'TECHNICIEN'
                }
            });
            // Mettre à jour la liste après soumission
            const updatedDiagnostics = diagnostics.map(d => 
                d.id === selectedDiagnostic.id ? { ...d, ...formData } : d
            );
            setDiagnostics(updatedDiagnostics);
            setSelectedDiagnostic(null);
        } catch (error) {
            console.error("Erreur lors de la mise à jour du diagnostic:", error);
        }
    };

    return (
        <div className="content">
            <h2><FaTools /> Diagnostics des Équipements</h2>
            
            {loading ? (
                <div className="loading">Chargement en cours...</div>
            ) : diagnostics.length === 0 ? (
                <div className="no-data-message">
                    <p>Aucun équipement nécessitant un diagnostic pour le moment</p>
                </div>
            ) : (
                <>
                    <div className="alert-panel">
                        <div className="alert urgent-alert">
                            <FaExclamationTriangle />
                            <span>Les équipements sont ajoutés automatiquement lorsqu'ils atteignent 1000h d'utilisation (PC) ou 1500h (autres), ou après 20/40 demandes.</span>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Équipement</th>
                                    <th>Catégorie</th>
                                    <th>Heures d'utilisation</th>
                                    <th>Demandes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {diagnostics.map(diagnostic => (
                                    <tr key={diagnostic.id}>
                                        <td>{diagnostic.nomEquipement}</td>
                                        <td>{diagnostic.categorie}</td>
                                        <td>{(diagnostic.heuresUtilisation || 0).toLocaleString()}h</td>
                                        <td>{diagnostic.nbDemandes || 0}</td>
                                        <td>
                                            <button 
                                                className="btn btn-primary"
                                                onClick={() => handleEvaluate(diagnostic)}
                                            >
                                                Évaluer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {selectedDiagnostic && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <button className="modal-close" onClick={() => setSelectedDiagnostic(null)}>×</button>
                                <h3>Évaluation de l'équipement</h3>
                                <div className="form-group">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            checked={formData.besoinMaintenance}
                                            onChange={(e) => setFormData({...formData, besoinMaintenance: e.target.checked})}
                                        />
                                        Nécessite une maintenance
                                    </label>
                                </div>

                                {formData.besoinMaintenance && (
                                    <>
                                        <div className="form-group">
                                            <label>Type de problème</label>
                                            <select 
                                                className="filter-select"
                                                value={formData.typeProbleme}
                                                onChange={(e) => setFormData({...formData, typeProbleme: e.target.value})}
                                            >
                                                <option value="">Sélectionner</option>
                                                <option value="MATERIEL">Matériel</option>
                                                <option value="LOGICIEL">Logiciel</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Degré d'urgence</label>
                                            <select 
                                                className="filter-select"
                                                value={formData.degreUrgence}
                                                onChange={(e) => setFormData({...formData, degreUrgence: e.target.value})}
                                            >
                                                <option value="">Sélectionner</option>
                                                <option value="FAIBLE">Faible</option>
                                                <option value="MOYEN">Moyen</option>
                                                <option value="ELEVE">Élevé</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Description du problème</label>
                                            <textarea 
                                                value={formData.description}
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Durée estimée (heures)</label>
                                            <input 
                                                type="number" 
                                                value={formData.dureeEstimee}
                                                onChange={(e) => setFormData({...formData, dureeEstimee: e.target.value})}
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="form-group" style={{ marginTop: '20px' }}>
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={handleSubmit}
                                        style={{ width: '100%' }}
                                    >
                                        <FaCheckCircle /> Enregistrer l'évaluation
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

export default DiagnostiqueEquipements;