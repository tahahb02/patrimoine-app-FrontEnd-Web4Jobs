import React from 'react';
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import '../styles/Footer.css'; // Import des styles

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                {/* Section Informations */}
                <div className="footer-section">
                    <h2>WEB4JOBS</h2>
                    <p>
                        Web4jobs, votre partenaire pour l’avenir professionnel. Nous offrons des programmes de formation spécialisés, des opportunités d’emploi exclusives et un accompagnement personnalisé pour stimuler votre carrière dans le domaine de l’informatique.
                    </p>
                </div>
                
                {/* Section Contacts */}
                <div className="footer-section">
                    <h2>CONTACTS</h2>
                    <p><FaMapMarkerAlt /> 24, Rue 19, Missimi - Hay Hassani, Casablanca - 20300</p>
                    <p><FaEnvelope /> web4jobs@yool.education</p>
                    <p><FaPhone /> +212645393690</p>
                </div>
                
                {/* Section Sitemap */}
                <div className="footer-section">
                    <h2>SITEMAP</h2>
                    <ul>
                        <li>Accueil</li>
                        <li>Conditions générales et services</li>
                        <li>Politique de confidentialité</li>
                        <li>Politique des cookies</li>
                        <li>Politique d’annulation</li>
                    </ul>
                </div>
                
                {/* Section Newsletter */}
                <div className="footer-section">
                    <h2>NEWSLETTER</h2>
                    <form>
                        <input type="text" placeholder="Nom et Prénom" />
                        <input type="email" placeholder="Email" />
                        <button type="submit" class="subscribe-btn">S'abonner</button>

                    </form>
                </div>
            </div>

           {/* Section Réseaux Sociaux */}
            <div className="social-media">
                <a href="https://facebook.com/Web4jobsmaroc" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                <a href="https://www.linkedin.com/company/web4jobs" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
                <a href="https://www.instagram.com/web4jobsmaroc" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            </div>
            {/* Bas du footer */}
            <div className="footer-bottom">
                © 2025 <strong>Web4jobs</strong>
            </div>
        </footer>
    );
};

export default Footer;
