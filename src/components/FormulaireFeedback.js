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

    useEffect(() => {
        const fetchDemandeInfo = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost:8080/api/demandes/${demandeId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setFormData(prev => ({
                        ...prev,
                        equipmentId: data.idEquipement,
                        equipmentName: data.nomEquipement,
                        dateUtilisation: data.dateDebut.split('T')[0]
                    }));
                }
            } catch (error) {
                console.error("Erreur lors du chargement des informations de la demande:", error);
            }
        };

        if (demandeId) {
            fetchDemandeInfo();
        }
    }, [demandeId]);

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

            if (response.ok) {
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
            } else {
                throw new Error('Erreur lors de l\'envoi du feedback');
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Erreur',
                text: 'Une erreur est survenue lors de l\'envoi de votre feedback',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const RatingSection = ({ title, name, value, description }) => (
        <div className="rating-section">
            <h4>
                {title}
                {description && (
                    <span className="rating-description">
                        <FaInfoCircle /> {description}
                    </span>
                )}
            </h4>
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
                        <h3>Merci pour votre feedback !</h3>
                        <p>
                            Votre évaluation a été enregistrée avec succès. Nous prenons en compte tous les retours pour améliorer nos équipements et services.
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
                    <div className="progress-bar">
                        <div style={{ width: `${(currentSection / 4) * 100}%` }}></div>
                    </div>

                    <h3 className="feedback-title">
                        <FaInfoCircle />
                        Évaluation de l'Équipement
                    </h3>

                    <form onSubmit={handleSubmit}>
                        {currentSection === 1 && (
                            <div className="form-section">
                                <h4>1. Identification de l'équipement</h4>
                                
                                <div className="form-group">
                                    <label>Numéro/ID de l'équipement *</label>
                                    <input
                                        type="text"
                                        name="equipmentId"
                                        value={formData.equipmentId}
                                        onChange={handleChange}
                                        required
                                        readOnly={!!demandeId}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Nom de l'équipement (si connu)</label>
                                    <input
                                        type="text"
                                        name="equipmentName"
                                        value={formData.equipmentName}
                                        onChange={handleChange}
                                        readOnly={!!demandeId}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Date d'utilisation *</label>
                                    <input
                                        type="date"
                                        name="dateUtilisation"
                                        value={formData.dateUtilisation}
                                        onChange={handleChange}
                                        required
                                        readOnly={!!demandeId}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Votre email (facultatif)</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        )}

                        {currentSection === 2 && (
                            <div className="form-section">
                                <h4>2. Évaluation de l'équipement</h4>
                                
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
                                <h4>3. Retour d'expérience</h4>
                                
                                <div className="form-group">
                                    <label>Commentaires généraux</label>
                                    <textarea
                                        name="commentaires"
                                        value={formData.commentaires}
                                        onChange={handleChange}
                                        placeholder="Décrivez votre expérience globale avec cet équipement..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Problèmes rencontrés (le cas échéant)</label>
                                    <textarea
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
                                            <label 
                                                key={index}
                                                className={`checkbox-label ${formData.problemesTechniques.includes(option) ? "checked" : ""}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    name="problemesTechniques"
                                                    value={option}
                                                    checked={formData.problemesTechniques.includes(option)}
                                                    onChange={handleChange}
                                                />
                                                {option}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentSection === 4 && (
                            <div className="form-section">
                                <h4>4. Recommandation et validation</h4>
                                
                                <div className="form-group">
                                    <h4>Recommandation</h4>
                                    <p>Recommanderiez-vous cet équipement à un collègue ou pour un autre projet ?</p>
                                    <div className="recommendation-options">
                                        <label className={`recommendation-option ${formData.recommander === "oui" ? "selected" : ""}`}>
                                            <input
                                                type="radio"
                                                name="recommander"
                                                value="oui"
                                                checked={formData.recommander === "oui"}
                                                onChange={handleChange}
                                                required
                                            />
                                            <div className="radio-indicator"></div>
                                            <span>Oui, certainement</span>
                                        </label>

                                        <label className={`recommendation-option ${formData.recommander === "peutetre" ? "selected" : ""}`}>
                                            <input
                                                type="radio"
                                                name="recommander"
                                                value="peutetre"
                                                checked={formData.recommander === "peutetre"}
                                                onChange={handleChange}
                                            />
                                            <div className="radio-indicator"></div>
                                            <span>Peut-être</span>
                                        </label>

                                        <label className={`recommendation-option ${formData.recommander === "non" ? "selected" : ""}`}>
                                            <input
                                                type="radio"
                                                name="recommander"
                                                value="non"
                                                checked={formData.recommander === "non"}
                                                onChange={handleChange}
                                            />
                                            <div className="radio-indicator"></div>
                                            <span>Non, pas recommandé</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="confidentiality-notice">
                                    <FaExclamationTriangle />
                                    <div>
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
                                    <FaChevronLeft />
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
                                    <FaChevronRight />
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
                                            <FaPaperPlane />
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