import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const API = 'http://localhost:5000/api/v1';

export default function Admin() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ users: 0, listings: 0, services: 0, reports: 0 });
    const [users, setUsers] = useState([]);
    const [listings, setListings] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('stats');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const fetchData = useCallback(async () => {
        try {
            const [usersRes, listingsRes, servicesRes, reportsRes, statsRes] = await Promise.all([
                fetch(`${API}/admin/users`, { headers }).then((r) => r.json()),
                fetch(`${API}/listings`).then((r) => r.json()),
                fetch(`${API}/services`).then((r) => r.json()),
                fetch(`${API}/reports`, { headers }).then((r) => r.json()),
                fetch(`${API}/admin/stats`, { headers }).then((r) => r.json()),
            ]);

            if (usersRes.success) setUsers(usersRes.users);
            if (listingsRes.success) setListings(listingsRes.listings);
            if (reportsRes.success) setReports(reportsRes.reports);
            if (statsRes.success) setStats(statsRes.stats);
        } catch (err) {
            console.error('Admin fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [headers]);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchData();
    }, [user, fetchData]);

    const handleToggleBan = async (userId) => {
        try {
            const res = await fetch(`${API}/admin/users/${userId}/ban`, {
                method: 'PUT',
                headers,
            });
            const data = await res.json();
            if (data.success) {
                setUsers(users.map(u => u._id === userId ? { ...u, isBanned: !u.isBanned } : u));
            }
        } catch (err) {
            console.error('Ban toggle failed:', err);
        }
    };

    const handleResolveReport = async (reportId) => {
        try {
            const res = await fetch(`${API}/reports/${reportId}/resolve`, {
                method: 'PUT',
                headers,
            });
            const data = await res.json();
            if (data.success) {
                setReports(reports.map(r => r._id === reportId ? { ...r, status: 'resolved' } : r));
                setStats(prev => ({ ...prev, pendingReports: Math.max(0, prev.pendingReports - 1) }));
            }
        } catch (err) {
            console.error('Resolve report failed:', err);
        }
    };

    const handleDeleteListing = async (id) => {
        if (!window.confirm('Delete this listing?')) return;
        try {
            await fetch(`${API}/listings/${id}`, {
                method: 'DELETE',
                headers,
            });
            setListings((prev) => prev.filter((l) => l._id !== id));
            setStats((prev) => ({ ...prev, listings: prev.listings - 1 }));
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) return <div className="loading-screen"><div className="spinner spinner-lg"></div></div>;

    return (
        <div className="admin-page fade-in">
            <div className="container">
                <div className="admin-header">
                    <h1>Admin Dashboard</h1>
                    <p>Manage users, listings, and platform moderation</p>
                </div>

                <div className="admin-tabs">
                    {['stats', 'users', 'listings', 'reports'].map(tab => (
                        <button
                            key={tab}
                            className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {tab === 'reports' && stats.pendingReports > 0 && <span className="tab-badge">{stats.pendingReports}</span>}
                        </button>
                    ))}
                </div>

                {activeTab === 'stats' && (
                    <div className="admin-stats">
                        <div className="admin-stat-card">
                            <div className="admin-stat-icon blue">👥</div>
                            <div>
                                <div className="admin-stat-value">{stats.users}</div>
                                <div className="admin-stat-label">Total Users</div>
                            </div>
                        </div>
                        <div className="admin-stat-card">
                            <div className="admin-stat-icon green">📦</div>
                            <div>
                                <div className="admin-stat-value">{stats.listings}</div>
                                <div className="admin-stat-label">Listings</div>
                            </div>
                        </div>
                        <div className="admin-stat-card">
                            <div className="admin-stat-icon yellow">🎓</div>
                            <div>
                                <div className="admin-stat-value">{stats.services}</div>
                                <div className="admin-stat-label">Services</div>
                            </div>
                        </div>
                        <div className="admin-stat-card">
                            <div className="admin-stat-icon red">🚩</div>
                            <div>
                                <div className="admin-stat-value">{stats.pendingReports || 0}</div>
                                <div className="admin-stat-label">Pending Reports</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="admin-section">
                        <h2>👥 User Management</h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>College</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id}>
                                        <td>
                                            <div className="admin-user-cell">
                                                <div className="mini-avatar">{getInitials(u.name)}</div>
                                                <Link to={`/profile/${u._id}`}>{u.name}</Link>
                                            </div>
                                        </td>
                                        <td>{u.email}</td>
                                        <td>{u.college || '—'}</td>
                                        <td>
                                            <span className={`badge badge-${u.isBanned ? 'danger' : 'success'}`}>
                                                {u.isBanned ? 'Banned' : 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={`btn btn-sm ${u.isBanned ? 'btn-success' : 'btn-danger'}`}
                                                onClick={() => handleToggleBan(u._id)}
                                            >
                                                {u.isBanned ? 'Unban' : 'Ban'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'listings' && (
                    <div className="admin-section">
                        <h2>📦 Listing Moderation</h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Seller</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listings.map((l) => (
                                    <tr key={l._id}>
                                        <td><Link to={`/listing/${l._id}`}>{l.title}</Link></td>
                                        <td>{l.seller?.name || '—'}</td>
                                        <td>₹{l.price?.toLocaleString()}</td>
                                        <td>
                                            <button className="admin-action-btn delete" onClick={() => handleDeleteListing(l._id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="admin-section">
                        <h2>🚩 Active Reports</h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Target</th>
                                    <th>Reporter</th>
                                    <th>Reason</th>
                                    <th>Summary</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.length > 0 ? reports.map((r) => (
                                    <tr key={r._id}>
                                        <td><span className="badge badge-secondary">{r.targetType}</span></td>
                                        <td>{r.reporter?.name || 'Student'}</td>
                                        <td><strong>{r.reason}</strong></td>
                                        <td style={{ maxWidth: 200, fontSize: '0.8125rem' }}>{r.description || '—'}</td>
                                        <td>
                                            {r.status === 'pending' ? (
                                                <button className="btn btn-sm btn-primary" onClick={() => handleResolveReport(r._id)}>Resolve</button>
                                            ) : (
                                                <span className="badge badge-success">Resolved</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>No reports found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
