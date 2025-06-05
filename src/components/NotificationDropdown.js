import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import '../styles/notificationDropdown.css';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');
                
                if (!token || !userId) return;

                const response = await axios.get(`http://localhost:8080/api/notifications/user/${userId}/unread`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setNotifications(response.data);
                setUnreadCount(response.data.length);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/notifications/${id}/marquer-lue`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setNotifications(notifications.filter(notif => notif.id !== id));
            setUnreadCount(prev => prev - 1);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            
            await axios.put(`http://localhost:8080/api/notifications/user/${userId}/marquer-toutes-lues`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
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
                        <h4>Notifications</h4>
                        <button 
                            className="close-btn"
                            onClick={() => setIsOpen(false)}
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="notification-list">
                        {loading ? (
                            <div className="loading-notifications">Chargement...</div>
                        ) : notifications.length === 0 ? (
                            <div className="no-notifications">Aucune nouvelle notification</div>
                        ) : (
                            <>
                                {notifications.slice(0, 5).map(notification => (
                                    <div 
                                        key={notification.id} 
                                        className="notification-item"
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="notification-message">
                                            <strong>{notification.titre}</strong>
                                            <p>{notification.message}</p>
                                            <small>{formatDate(notification.dateCreation)}</small>
                                        </div>
                                    </div>
                                ))}
                                {notifications.length > 5 && (
                                    <div className="notification-more">
                                        + {notifications.length - 5} autres notifications
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="notification-footer">
                        <button 
                            className="mark-all-read"
                            onClick={markAllAsRead}
                            disabled={notifications.length === 0}
                        >
                            Tout marquer comme lu
                        </button>
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