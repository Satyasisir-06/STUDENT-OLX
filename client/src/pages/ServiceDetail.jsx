import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReportModal from '../components/ReportModal';
import './ListingDetail.css'; // and some custom styles

const API = 'http://localhost:5000/api/v1/services';

const serviceCategories = {
    assignment: '📝 Assignment Help',
    project: '🚀 Project Collaboration',
    notes: '📖 Notes / Study Material',
    tutoring: '🎓 Tutoring / Mentoring',
    'lab-work': '🔬 Lab Work',
    other: '📦 Other',
};

const statusLabels = {
    open: '🟢 Open',
    'in-progress': '🟡 In Progress',
    completed: '✅ Completed',
};

export default function ServiceDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const res = await fetch(`${API}/${id}`);
                const data = await res.json();
                if (data.success) {
                    setService(data.service);
                } else {
                    setError('Service not found');
                }
            } catch (err) {
                setError('Failed to load service');
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

    const handleStatusChange = async (newStatus) => {
        if (!window.confirm(`Change status to ${newStatus}?`)) return;
        setStatusLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API}/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                setService({ ...service, status: newStatus });
            }
        } catch (err) {
            console.error('Status update failed:', err);
        } finally {
            setStatusLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API}/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                navigate('/services');
            }
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) return <div className="loading-screen"><div className="spinner spinner-lg"></div></div>;

    if (error || !service) {
        return (
            <div className="detail-page">
                <div className="container">
                    <div className="listings-empty">
                        <div className="listings-empty-icon">😕</div>
                        <h3>{error || 'Service not found'}</h3>
                        <Link to="/services" className="btn btn-primary">Back to Services</Link>
                    </div>
                </div>
            </div>
        );
    }

    const isOwner = user && service.poster && user._id === service.poster._id;

    return (
        <div className="detail-page fade-in">
            <div className="container">
                <Link to="/services" className="detail-back">← Back to Services</Link>

                <div className="detail-layout" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="detail-info" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="detail-info-card">
                            <div className="detail-badges">
                                <span className={`service-card-type type-${service.type}`}>
                                    {service.type === 'request' ? '🙋 Need Help' : '🤝 Offering'}
                                </span>
                                <span className="badge badge-primary">
                                    {serviceCategories[service.serviceCategory] || service.serviceCategory}
                                </span>
                                <span className={`badge status-${service.status}`}>
                                    {statusLabels[service.status] || service.status}
                                </span>
                            </div>

                            <h1 className="detail-title">{service.title}</h1>
                            <div className="detail-price">{service.price > 0 ? `₹${service.price.toLocaleString()}` : 'Free'}</div>

                            <p className="detail-desc">{service.description}</p>

                            <div className="detail-meta">
                                {service.subject && (
                                    <div className="detail-meta-row">
                                        <span className="detail-meta-label">Subject</span>
                                        <span className="detail-meta-value">{service.subject}</span>
                                    </div>
                                )}
                                {service.semester && (
                                    <div className="detail-meta-row">
                                        <span className="detail-meta-label">Semester</span>
                                        <span className="detail-meta-value">Semester {service.semester}</span>
                                    </div>
                                )}
                                {service.deadline && (
                                    <div className="detail-meta-row">
                                        <span className="detail-meta-label">Deadline</span>
                                        <span className="detail-meta-value">
                                            {new Date(service.deadline).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {service.poster && (
                                <div className="detail-seller">
                                    <div className="detail-seller-avatar">{getInitials(service.poster.name)}</div>
                                    <div className="detail-seller-info">
                                        <div className="detail-seller-name">{service.poster.name}</div>
                                        <div className="detail-seller-college">{service.poster.college}</div>
                                    </div>
                                </div>
                            )}

                            <div className="detail-actions">
                                {isOwner ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                        <div className="status-update-section">
                                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '0.875rem', fontWeight: 600 }}>Update Status:</label>
                                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                {['open', 'in-progress', 'completed'].map((s) => (
                                                    <button
                                                        key={s}
                                                        disabled={statusLoading || service.status === s}
                                                        onClick={() => handleStatusChange(s)}
                                                        className={`btn btn-sm ${service.status === s ? 'btn-primary' : 'btn-secondary'}`}
                                                        style={{ flex: 1 }}
                                                    >
                                                        {s.replace('-', ' ')}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <button className="btn btn-secondary" onClick={handleDelete}>Delete Post</button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-primary btn-full btn-lg"
                                            onClick={() => navigate(`/chat?to=${service.poster._id}`)}
                                        >
                                            💬 Contact student
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-full"
                                            style={{ marginTop: '0.75rem', color: 'var(--text-tertiary)' }}
                                            onClick={() => {
                                                if (!user) return navigate('/login');
                                                setIsReportModalOpen(true);
                                            }}
                                        >
                                            🚩 Report this Post
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                targetType="service"
                targetId={id}
            />
        </div>
    );
}
