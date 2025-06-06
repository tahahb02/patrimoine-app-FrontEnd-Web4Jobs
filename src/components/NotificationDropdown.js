import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaTimes, FaCircle, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import '../styles/notificationDropdown.css';

const NotificationDropdown = () => {
    const [allNotifications, setAllNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');
                
                if (!token || !userId) return;

                const response = await axios.get(
                    `http://localhost:8080/api/notifications/user/${userId}`, 
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                );

                const countResponse = await axios.get(
                    `http://localhost:8080/api/notifications/count/user/${userId}/unread`, 
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                );

                setAllNotifications(response.data);
                setUnreadCount(countResponse.data);
            } catch (error) {
                console.error('Erreur lors du chargement des notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();

        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:8080/api/notifications/${id}/marquer-lue`, 
                {}, 
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            setAllNotifications(allNotifications.map(notif => 
                notif.id === id ? { ...notif, lue: true } : notif
            ));
            setUnreadCount(prev => prev - 1);
        } catch (error) {
            console.error('Erreur lors du marquage comme lu:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            
            await axios.put(
                `http://localhost:8080/api/notifications/user/${userId}/marquer-toutes-lues`, 
                {}, 
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            setAllNotifications(allNotifications.map(notif => ({
                ...notif,
                lue: true
            })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
        }
    };

    const formatDate = (dateString) => {
        const options = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const handleNotificationClick = (notification) => {
        if (!notification.lue) {
            markAsRead(notification.id);
        }
        setIsOpen(false);
    };

    return (
        <div className="notification-dropdown">
            <div 
                className="notification-icon-container"
                onClick={() => setIsOpen(!isOpen)}
            >
                <FaBell className="notification-icon" />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </div>

            {isOpen && (
                <div className="notification-dropdown-content">
                    <div className="notification-header">
                        <h4>Notifications {unreadCount > 0 && `(${unreadCount} non lues)`}</h4>
                        <button 
                            className="close-btn"
                            onClick={() => setIsOpen(false)}
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="notification-list">
                        {loading ? (
                            <div className="loading-notifications">Chargement en cours...</div>
                        ) : allNotifications.length === 0 ? (
                            <div className="no-notifications">Aucune notification</div>
                        ) : (
                            <>
                                {allNotifications.slice(0, 5).map(notification => (
                                    <div 
                                        key={notification.id} 
                                        className={`notification-item ${notification.lue ? 'read' : 'unread'}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="notification-status">
                                            {!notification.lue ? (
                                                <FaCircle className="unread-indicator" />
                                            ) : (
                                                <FaCheck className="read-indicator" />
                                            )}
                                        </div>
                                        <div className="notification-message">
                                            <strong>{notification.titre}</strong>
                                            <p>{notification.message}</p>
                                            <small>{formatDate(notification.dateCreation)}</small>
                                        </div>
                                    </div>
                                ))}
                                {allNotifications.length > 5 && (
                                    <div className="notification-more">
                                        + {allNotifications.length - 5} autres notifications
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="notification-footer">
                        {unreadCount > 0 && (
                            <button 
                                className="mark-all-read"
                                onClick={markAllAsRead}
                            >
                                Tout marquer comme lu
                            </button>
                        )}
                        <Link 
                            to="/Notifications" 
                            className="view-all"
                            onClick={() => setIsOpen(false)}
                        >
                            Voir toutes les notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;