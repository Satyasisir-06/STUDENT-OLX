import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import './Navbar.css';

const API = import.meta.env.VITE_API_URL;

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);

    const isActive = (path) => location.pathname === path;

    // Fetch unread count
    useEffect(() => {
        if (!user) return;
        const token = localStorage.getItem('token');
        const fetchUnread = async () => {
            try {
                const res = await fetch(`${API}/notifications/unread`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.success) setUnreadCount(data.count);
            } catch { }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Fetch notifications when bell clicked
    const handleBellClick = async () => {
        setNotifOpen(!notifOpen);
        if (!notifOpen) {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API}/notifications`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.success) setNotifications(data.notifications);
            } catch { }
        }
    };

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API}/notifications/read-all`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
            setUnreadCount(0);
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch { }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMenuOpen(false);
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
    };

    const timeAgo = (d) => {
        const seconds = Math.floor((Date.now() - new Date(d)) / 1000);
        if (seconds < 60) return 'now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="navbar-brand-icon">🔄</span>
                    CampusSwap
                </Link>

                <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    <Link to="/listings" className={`navbar-link ${isActive('/listings') ? 'active' : ''}`}
                        onClick={() => setMenuOpen(false)}>
                        Marketplace
                    </Link>
                    <Link to="/services" className={`navbar-link ${isActive('/services') ? 'active' : ''}`}
                        onClick={() => setMenuOpen(false)}>
                        Services
                    </Link>

                    {user ? (
                        <>
                            <Link to="/chat" className={`navbar-link ${isActive('/chat') ? 'active' : ''}`}
                                onClick={() => setMenuOpen(false)}>
                                Messages
                            </Link>
                            <Link to="/wishlist" className={`navbar-link ${isActive('/wishlist') ? 'active' : ''}`}
                                onClick={() => setMenuOpen(false)}>
                                Wishlist
                            </Link>
                            <Link to="/create-listing" className="btn btn-primary btn-sm"
                                onClick={() => setMenuOpen(false)}>
                                + Sell Item
                            </Link>

                            {/* Notification Bell */}
                            <div className="navbar-notif" ref={notifRef}>
                                <button className="navbar-bell" onClick={handleBellClick} title="Notifications">
                                    🔔
                                    {unreadCount > 0 && <span className="navbar-bell-badge">{unreadCount}</span>}
                                </button>
                                {notifOpen && (
                                    <div className="navbar-notif-dropdown">
                                        <div className="navbar-notif-header">
                                            <strong>Notifications</strong>
                                            {unreadCount > 0 && (
                                                <button className="navbar-notif-read-all" onClick={markAllRead}>
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="navbar-notif-list">
                                            {notifications.length === 0 ? (
                                                <div className="navbar-notif-empty">No notifications</div>
                                            ) : (
                                                notifications.slice(0, 10).map((n) => (
                                                    <div key={n._id}
                                                        className={`navbar-notif-item ${!n.read ? 'unread' : ''}`}
                                                        onClick={() => {
                                                            if (n.link) navigate(n.link);
                                                            setNotifOpen(false);
                                                        }}>
                                                        <span className="navbar-notif-icon">
                                                            {n.type === 'message' ? '💬' :
                                                                n.type === 'review' ? '⭐' :
                                                                    n.type === 'report' ? '🚩' :
                                                                        n.type === 'system' ? '⚙️' : '🔔'}
                                                        </span>
                                                        <div className="navbar-notif-content">
                                                            <span>{n.message}</span>
                                                            <small>{timeAgo(n.createdAt)}</small>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="navbar-user">
                                <Link to="/profile" className="navbar-avatar" onClick={() => setMenuOpen(false)}>
                                    {getInitials(user.name)}
                                </Link>
                                <button className="navbar-logout" onClick={handleLogout}>Logout</button>
                            </div>
                        </>
                    ) : (
                        <div className="navbar-auth">
                            <Link to="/login" className="btn btn-secondary btn-sm"
                                onClick={() => setMenuOpen(false)}>
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-primary btn-sm"
                                onClick={() => setMenuOpen(false)}>
                                Register
                            </Link>
                        </div>
                    )}
                </div>

                <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                    <span></span><span></span><span></span>
                </button>
            </div>
        </nav>
    );
}
