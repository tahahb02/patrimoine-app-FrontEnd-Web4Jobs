import React, { useState, useEffect } from 'react';
import { FaBell, FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import "../styles/adherant.css";

const NotificationsTechnicien = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cette fonction serait normalement connectée à votre backend
        // ou à un service de notifications en temps réel
        const fetchNotifications = async () => {
            try {
                // Simulation de données - à remplacer par un appel API réel
                const simulatedNotifications = [
                    {
                        id: 1,
                        type: 'URGENT',
                        message: 'PC-0245 en surchauffe critique',
                        date: new Date(),
                        read: false
                    },
                    {
                        id: 2,
                        type: 'INFO',
                        message: 'Nouveau diagnostic disponible pour Projecteur-012',
                        date: new Date(Date.now() - 3600000),
                        read: true
                    },
                    {
                        id: 3,
                        type: 'SUCCESS',
                        message: 'Maintenance PC-0245 terminée avec succès',
                        date: new Date(Date.now() - 86400000),
                        read: true
                    }
                ];
                
                setNotifications(simulatedNotifications);
                setLoading(false);
            } catch (error) {
                console.error("Erreur lors de la récupération des notifications:", error);
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const markAsRead = (id) => {
        setNotifications(notifications.map(notif => 
            notif.id === id ? { ...notif, read: true } : notif
        ));
    };

    const getIconForType = (type) => {
        switch(type) {
            case 'URGENT': return <FaExclamationTriangle className="urgent-icon" />;
            case 'INFO': return <FaInfoCircle className="info-icon" />;
            case 'SUCCESS': return <FaCheckCircle className="success-icon" />;
            default: return <FaBell />;
        }
    };

    return (
        <div className="content">
            <h2><FaBell /> Notifications</h2>
            
            {loading ? (
                <div className="loading">Chargement en cours...</div>
            ) : notifications.length === 0 ? (
                <div className="no-data-message">
                    <p>Aucune notification pour le moment</p>
                </div>
            ) : (
                <div className="equipment-grid">
                    {notifications.map(notification => (
                        <div 
                            key={notification.id} 
                            className={`notification-card ${notification.read ? 'read' : 'unread'} ${notification.type.toLowerCase()}`}
                            onClick={() => markAsRead(notification.id)}
                        >
                            <div className="notification-icon">
                                {getIconForType(notification.type)}
                            </div>
                            <div className="notification-content">
                                <p className="notification-message">{notification.message}</p>
                                <p className="notification-date">
                                    {notification.date.toLocaleDateString()} à {notification.date.toLocaleTimeString()}
                                </p>
                            </div>
                            {!notification.read && <div className="notification-badge"></div>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsTechnicien;