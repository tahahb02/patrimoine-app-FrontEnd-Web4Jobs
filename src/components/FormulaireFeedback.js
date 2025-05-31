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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("Token d'authentification manquant");
                }

                // 1. Récupérer les données de la demande
                const demandeResponse = await fetch(`http://localhost:8080/api/demandes/${demandeId}`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!demandeResponse.ok) {
                    const errorData = await demandeResponse.json();
                    throw new Error(errorData.message || "Échec du chargement de la demande");
                }

                const demandeData = await demandeResponse.json();
                console.log("Données de la demande:", demandeData);

                // 2. Préparer les données utilisateur
                const userId = localStorage.getItem("userId") || demandeData.utilisateur?.id;
                let userEmail = localStorage.getItem("userEmail") || "";

                if (userId) {
                    const userResponse = await fetch(`http://localhost:8080/api/utilisateurs/${userId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        userEmail = userData.email || userEmail;
                    }
                }

                // 3. Mettre à jour le state avec les données récupérées
                setFormData({
                    equipmentId: demandeData.idEquipement || "",
                    equipmentName: demandeData.nomEquipement || "",
                    dateUtilisation: demandeData.dateDebut ? 
                        new Date(demandeData.dateDebut).toISOString().split('T')[0] : "",
                    email: userEmail,
                    satisfaction: 0,
                    performance: 0,
                    faciliteUtilisation: 0,
                    fiabilite: 0,
                    commentaires: "",
                    problemesRencontres: "",
                    problemesTechniques: [],
                    recommander: ""
                });

                setError(null);
            } catch (err) {
                console.error("Erreur lors du chargement:", err);
                setError(err.message);
                Swal.fire({
                    title: 'Erreur',
                    text: err.message || "Impossible de charger les données",
                    icon: 'error'
                });
            } finally {
                setInitialLoading(false);
            }
        };

        if (demandeId) {
            fetchData();
        } else {
            setFormData(prev => ({
                ...prev,
                email: localStorage.getItem("userEmail") || ""
            }));
            setInitialLoading(false);
        }
    }, [demandeId, navigate]);

    const problemesTechniquesOptions = [
        "Dysfonctionnement matériel",
        "Problème logiciel",
        "Interface difficile",
        "Lenteur de réponse",
        "Autre problème technique"
    ];

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
            const response = await fetch('http://localhost:8080/api/feedback', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    demandeId,
                    userId: localStorage.getItem("userId")
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erreur lors de l'envoi");
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
        } catch (error) {
            console.error("Erreur:", error);
            Swal.fire({
                title: 'Erreur',
                text: error.message || "Échec de l'envoi du formulaire",
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
                            onClick={() => window.location.reload()} 
                            className="btn btn-primary"
                        >
                            Réessayer
                        </button>
                        <button 
                            onClick={() => navigate("/AdherantHome")} 
                            className="btn btn-secondary"
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
                                    <div className="read-only-field">
                                        {formData.equipmentId || "Non spécifié"}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Nom de l'équipement</label>
                                    <div className="read-only-field">
                                        {formData.equipmentName || "Non spécifié"}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="required">Date d'utilisation</label>
                                    <div className="read-only-field">
                                        {formData.dateUtilisation || "Non spécifié"}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Votre email</label>
                                    <div className="read-only-field">
                                        {formData.email || "Non spécifié"}
                                    </div>
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