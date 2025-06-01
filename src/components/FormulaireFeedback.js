import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  FaStar, FaPaperPlane, FaChevronLeft, FaChevronRight,
  FaInfoCircle, FaCheck, FaExclamationTriangle 
} from "react-icons/fa";
import Swal from "sweetalert2";
import "../styles/FormulaireFeedback.css";

const FormulaireFeedback = () => {
    const navigate = useNavigate();
    const { demandeId } = useParams();
    const [formData, setFormData] = useState({
        equipmentId: "",
        equipmentName: "",
        dateUtilisation: "",
        satisfaction: 0,
        performance: 0,
        faciliteUtilisation: 0,
        fiabilite: 0,
        commentaires: "",
        problemesRencontres: "",
        problemesTechniques: [],
        recommander: "",
        email: ""
    });
    const [currentSection, setCurrentSection] = useState(1);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);

    const problemesTechniquesOptions = [
        "Dysfonctionnement matériel",
        "Problème logiciel",
        "Interface difficile",
        "Lenteur de réponse",
        "Autre problème technique"
    ];

    useEffect(() => {
        const fetchDemandeData = async () => {
            try {
                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("userId");
                
                if (!token || !userId) {
                    throw new Error("Authentification requise");
                }

                // Récupérer toutes les demandes de l'utilisateur
                const response = await fetch(`http://localhost:8080/api/demandes/utilisateur/${userId}/demandes`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Échec du chargement des demandes");
                }

                const demandes = await response.json();
                
                // Trouver la demande spécifique
                const demande = demandes.find(d => d.id == demandeId);
                
                if (!demande) {
                    throw new Error("Demande non trouvée");
                }

                // Vérifier que la demande appartient bien à l'utilisateur
                if (demande.utilisateur.id != userId) {
                    throw new Error("Vous n'êtes pas autorisé à accéder à cette demande");
                }

                // Préremplir le formulaire
                setFormData({
                    equipmentId: demande.idEquipement || "",
                    equipmentName: demande.nomEquipement || "",
                    dateUtilisation: demande.dateDebut ? 
                        new Date(demande.dateDebut).toLocaleDateString('fr-FR') : "",
                    email: localStorage.getItem("userEmail") || "",
                    satisfaction: 0,
                    performance: 0,
                    faciliteUtilisation: 0,
                    fiabilite: 0,
                    commentaires: "",
                    problemesRencontres: "",
                    problemesTechniques: [],
                    recommander: ""
                });

            } catch (err) {
                console.error("Erreur:", err);
                setError(err.message);
                Swal.fire({
                    title: 'Erreur',
                    text: err.message || "Une erreur est survenue",
                    icon: 'error'
                }).then(() => navigate("/AdherantHome"));
            } finally {
                setInitialLoading(false);
            }
        };

        if (demandeId) {
            fetchDemandeData();
        } else {
            setError("ID de demande manquant");
            navigate("/AdherantHome");
        }
    }, [demandeId, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === "checkbox") {
            const updatedProblems = checked 
                ? [...formData.problemesTechniques, value]
                : formData.problemesTechniques.filter(item => item !== value);
            
            setFormData(prev => ({
                ...prev,
                problemesTechniques: updatedProblems
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleRatingChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const nextSection = () => {
        if (currentSection < 4) {
            setCurrentSection(currentSection + 1);
            window.scrollTo(0, 0);
        }
    };

    const prevSection = () => {
        if (currentSection > 1) {
            setCurrentSection(currentSection - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");
            
            if (!token || !userId) {
                throw new Error("Authentification requise");
            }

            const response = await fetch('http://localhost:8080/api/feedback', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    demandeId: demandeId,
                    equipmentId: formData.equipmentId,
                    equipmentName: formData.equipmentName,
                    satisfaction: formData.satisfaction,
                    performance: formData.performance,
                    faciliteUtilisation: formData.faciliteUtilisation,
                    fiabilite: formData.fiabilite,
                    commentaires: formData.commentaires,
                    problemesRencontres: formData.problemesRencontres,
                    problemesTechniques: formData.problemesTechniques,
                    recommander: formData.recommander,
                    email: formData.email,
                    villeCentre: localStorage.getItem("userVilleCentre") || ""
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erreur lors de l'envoi du feedback");
            }

            // Marquer la notification comme lue
            await fetch(`http://localhost:8080/api/notifications/marquer-lue-par-lien`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    link: `/FormulaireFeedback/${demandeId}`
                })
            });

            setSubmitted(true);
            
        } catch (err) {
            console.error("Erreur:", err);
            Swal.fire({
                title: 'Erreur',
                text: err.message || "Échec de l'envoi du formulaire",
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const RatingSection = ({ title, name, value, description }) => (
        <div className="rating-section">
            <div className="rating-header">
                <h4 className="rating-title">
                    {title}
                    {description && (
                        <span className="rating-description">
                            <FaInfoCircle /> {description}
                        </span>
                    )}
                </h4>
            </div>
            <div className="stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                        key={star}
                        className={`star ${star <= (hoveredStar || value) ? "active" : ""}`}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => handleRatingChange(name, star)}
                    />
                ))}
            </div>
            <div className="rating-labels">
                <span>Pas du tout d'accord</span>
                <span>Totalement d'accord</span>
            </div>
        </div>
    );

    if (initialLoading) {
        return (
            <div className="dashboard-container">
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Chargement des informations...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <nav className="navbar">
                    <div className="menu-icon" onClick={() => navigate(-1)}>
                        <FaChevronLeft />
                    </div>
                    <img src="/images/logo-light.png" alt="Logo" className="navbar-logo" />
                </nav>
                <main className="content">
                    <div className="error-message">
                        <FaExclamationTriangle className="error-icon" />
                        <h3>Erreur de chargement</h3>
                        <p>{error}</p>
                        <button 
                            onClick={() => navigate("/AdherantHome")} 
                            className="btn btn-primary"
                        >
                            Retour à l'accueil
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="dashboard-container">
                <nav className="navbar">
                    <div className="menu-icon" onClick={() => navigate(-1)}>
                        <FaChevronLeft />
                    </div>
                    <img src="/images/logo-light.png" alt="Logo" className="navbar-logo" />
                </nav>

                <main className="content">
                    <div className="feedback-confirmation">
                        <div className="confirmation-icon">
                            <FaCheck />
                        </div>
                        <h3 className="confirmation-title">Merci pour votre feedback !</h3>
                        <p className="confirmation-message">
                            Votre évaluation a été enregistrée avec succès.
                        </p>
                        <button
                            onClick={() => navigate("/AdherantHome")}
                            className="btn btn-primary"
                        >
                            Retour à l'accueil
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <nav className="navbar">
                <div className="menu-icon" onClick={() => navigate(-1)}>
                    <FaChevronLeft />
                </div>
                <img src="/images/logo-light.png" alt="Logo" className="navbar-logo" />
            </nav>

            <main className="content">
                <div className="feedback-container">
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div style={{ width: `${(currentSection / 4) * 100}%` }}></div>
                        </div>
                        <div className="progress-steps">
                            <span className={`progress-step ${currentSection >= 1 ? 'active' : ''}`}>Identification</span>
                            <span className={`progress-step ${currentSection >= 2 ? 'active' : ''}`}>Évaluation</span>
                            <span className={`progress-step ${currentSection >= 3 ? 'active' : ''}`}>Retour</span>
                            <span className={`progress-step ${currentSection >= 4 ? 'active' : ''}`}>Validation</span>
                        </div>
                    </div>

                    <h3 className="feedback-title">
                        <FaInfoCircle />
                        Évaluation de l'Équipement
                    </h3>

                    <form onSubmit={handleSubmit}>
                        {currentSection === 1 && (
                            <div className="form-section">
                                <h4 className="section-title">1. Identification de l'équipement</h4>
                                
                                <div className="form-group">
                                    <label className="required">Numéro/ID de l'équipement</label>
                                    <input
                                        type="text"
                                        className="form-control read-only"
                                        value={formData.equipmentId}
                                        readOnly
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Nom de l'équipement</label>
                                    <input
                                        type="text"
                                        className="form-control read-only"
                                        value={formData.equipmentName}
                                        readOnly
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="required">Date d'utilisation</label>
                                    <input
                                        type="text"
                                        className="form-control read-only"
                                        value={formData.dateUtilisation}
                                        readOnly
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Votre email</label>
                                    <input
                                        type="text"
                                        className="form-control read-only"
                                        value={formData.email}
                                        readOnly
                                    />
                                </div>
                            </div>
                        )}

                        {currentSection === 2 && (
                            <div className="form-section">
                                <h4 className="section-title">2. Évaluation de l'équipement</h4>
                                
                                <RatingSection 
                                    title="Satisfaction globale" 
                                    name="satisfaction" 
                                    value={formData.satisfaction}
                                    description="Dans quelle mesure êtes-vous satisfait de cet équipement ?"
                                />

                                <RatingSection 
                                    title="Performance technique" 
                                    name="performance" 
                                    value={formData.performance}
                                    description="L'équipement a-t-il répondu à vos attentes techniques ?"
                                />

                                <RatingSection 
                                    title="Facilité d'utilisation" 
                                    name="faciliteUtilisation" 
                                    value={formData.faciliteUtilisation}
                                    description="L'interface et l'utilisation étaient-elles intuitives ?"
                                />

                                <RatingSection 
                                    title="Fiabilité" 
                                    name="fiabilite" 
                                    value={formData.fiabilite}
                                    description="L'équipement a-t-il fonctionné sans problème ?"
                                />
                            </div>
                        )}

                        {currentSection === 3 && (
                            <div className="form-section">
                                <h4 className="section-title">3. Retour d'expérience</h4>
                                
                                <div className="form-group">
                                    <label>Commentaires généraux</label>
                                    <textarea
                                        className="form-control"
                                        name="commentaires"
                                        value={formData.commentaires}
                                        onChange={handleChange}
                                        placeholder="Décrivez votre expérience globale avec cet équipement..."
                                        rows="4"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Problèmes rencontrés (le cas échéant)</label>
                                    <textarea
                                        className="form-control"
                                        name="problemesRencontres"
                                        value={formData.problemesRencontres}
                                        onChange={handleChange}
                                        placeholder="Décrivez les problèmes que vous avez rencontrés..."
                                        rows="4"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Types de problèmes techniques</label>
                                    <div className="checkbox-grid">
                                        {problemesTechniquesOptions.map((option, index) => (
                                            <div key={index} className="checkbox-item">
                                                <input
                                                    type="checkbox"
                                                    id={`probleme-${index}`}
                                                    className="checkbox-input"
                                                    name="problemesTechniques"
                                                    value={option}
                                                    checked={formData.problemesTechniques.includes(option)}
                                                    onChange={handleChange}
                                                />
                                                <label 
                                                    htmlFor={`probleme-${index}`}
                                                    className={`checkbox-label ${formData.problemesTechniques.includes(option) ? "checked" : ""}`}
                                                >
                                                    {option}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentSection === 4 && (
                            <div className="form-section">
                                <h4 className="section-title">4. Recommandation et validation</h4>
                                
                                <div className="form-group">
                                    <h4>Recommandation</h4>
                                    <p>Recommanderiez-vous cet équipement à un collègue ou pour un autre projet ?</p>
                                    <div className="recommendation-options">
                                        <div 
                                            className={`recommendation-option ${formData.recommander === "oui" ? "selected" : ""}`}
                                            onClick={() => setFormData({...formData, recommander: "oui"})}
                                        >
                                            <input
                                                type="radio"
                                                name="recommander"
                                                value="oui"
                                                checked={formData.recommander === "oui"}
                                                onChange={handleChange}
                                                required
                                            />
                                            <div className="radio-indicator"></div>
                                            <span className="recommendation-text">Oui, certainement</span>
                                        </div>

                                        <div 
                                            className={`recommendation-option ${formData.recommander === "peutetre" ? "selected" : ""}`}
                                            onClick={() => setFormData({...formData, recommander: "peutetre"})}
                                        >
                                            <input
                                                type="radio"
                                                name="recommander"
                                                value="peutetre"
                                                checked={formData.recommander === "peutetre"}
                                                onChange={handleChange}
                                            />
                                            <div className="radio-indicator"></div>
                                            <span className="recommendation-text">Peut-être</span>
                                        </div>

                                        <div 
                                            className={`recommendation-option ${formData.recommander === "non" ? "selected" : ""}`}
                                            onClick={() => setFormData({...formData, recommander: "non"})}
                                        >
                                            <input
                                                type="radio"
                                                name="recommander"
                                                value="non"
                                                checked={formData.recommander === "non"}
                                                onChange={handleChange}
                                            />
                                            <div className="radio-indicator"></div>
                                            <span className="recommendation-text">Non, pas recommandé</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="confidentiality-notice">
                                    <div className="notice-icon">
                                        <FaExclamationTriangle />
                                    </div>
                                    <div className="notice-content">
                                        <h5>Confidentialité</h5>
                                        <p>
                                            Vos réponses seront traitées de manière confidentielle et utilisées uniquement pour améliorer nos équipements et services.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="form-navigation">
                            {currentSection > 1 && (
                                <button
                                    type="button"
                                    onClick={prevSection}
                                    className="btn btn-secondary"
                                >
                                    <FaChevronLeft className="btn-icon" />
                                    Précédent
                                </button>
                            )}

                            {currentSection < 4 ? (
                                <button
                                    type="button"
                                    onClick={nextSection}
                                    className="btn btn-primary"
                                >
                                    Suivant
                                    <FaChevronRight className="btn-icon" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span>Envoi en cours...</span>
                                    ) : (
                                        <>
                                            <FaPaperPlane className="btn-icon" />
                                            Soumettre l'évaluation
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default FormulaireFeedback;