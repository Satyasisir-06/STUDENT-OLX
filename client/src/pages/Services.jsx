import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Services.css';

const API = 'http://localhost:5000/api/v1/services';

const serviceCategories = [
    { value: 'all', label: 'All' },
    { value: 'assignment', label: '📝 Assignments' },
    { value: 'project', label: '🚀 Projects' },
    { value: 'notes', label: '📖 Notes' },
    { value: 'tutoring', label: '🎓 Tutoring' },
    { value: 'lab-work', label: '🔬 Lab Work' },
    { value: 'other', label: '📦 Other' },
];

export default function Services() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState('');
    const [category, setCategory] = useState('all');

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (type) params.set('type', type);
            if (category !== 'all') params.set('serviceCategory', category);

            const res = await fetch(`${API}?${params}`);
            const data = await res.json();
            if (data.success) {
                setServices(data.services);
            }
        } catch (err) {
            console.error('Failed to fetch services:', err);
        } finally {
            setLoading(false);
        }
    }, [type, category]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const timeAgo = (date) => {
        const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="services-page">
            <div className="container">
                <div className="listings-header">
                    <div>
                        <h1>Academic Services</h1>
                        <span className="listings-count">Collaborate with fellow students</span>
                    </div>
                    {user && (
                        <Link to="/create-service" className="btn btn-primary">
                            + Post Service
                        </Link>
                    )}
                </div>

                {/* Type Tabs */}
                <div className="services-tabs">
                    <button
                        className={`services-tab ${type === '' ? 'active' : ''}`}
                        onClick={() => setType('')}
                    >
                        All
                    </button>
                    <button
                        className={`services-tab ${type === 'request' ? 'active' : ''}`}
                        onClick={() => setType('request')}
                    >
                        🙋 Requests
                    </button>
                    <button
                        className={`services-tab ${type === 'offer' ? 'active' : ''}`}
                        onClick={() => setType('offer')}
                    >
                        🤝 Offers
                    </button>
                </div>

                {/* Category Filters */}
                <div className="filter-group" style={{ marginBottom: 'var(--space-8)' }}>
                    {serviceCategories.map((cat) => (
                        <button
                            key={cat.value}
                            className={`filter-chip ${category === cat.value ? 'active' : ''}`}
                            onClick={() => setCategory(cat.value)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Services Grid */}
                {loading ? (
                    <div className="loading-screen" style={{ minHeight: '40vh' }}>
                        <div className="spinner spinner-lg"></div>
                    </div>
                ) : (
                    <div className="listings-grid">
                        {services.length > 0 ? (
                            services.map((service) => (
                                <div key={service._id} className="service-card" onClick={() => navigate(`/service/${service._id}`)}>
                                    <div className="service-card-header">
                                        <div className="service-card-title">{service.title}</div>
                                        <span className={`service-card-type type-${service.type}`}>
                                            {service.type === 'request' ? '🙋 Need Help' : '🤝 Offering'}
                                        </span>
                                    </div>
                                    <p className="service-card-desc">{service.description}</p>
                                    <div className="service-card-tags">
                                        {service.subject && (
                                            <span className="badge badge-primary">{service.subject}</span>
                                        )}
                                        <span className="badge badge-secondary">
                                            {serviceCategories.find((c) => c.value === service.serviceCategory)?.label || service.serviceCategory}
                                        </span>
                                        {service.deadline && (
                                            <span className="badge badge-warning">
                                                Due: {new Date(service.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="service-card-footer">
                                        <div className="service-card-poster">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                            {service.poster?.name || 'Student'} · {timeAgo(service.createdAt)}
                                        </div>
                                        <div className="service-card-price">
                                            {service.price > 0 ? `₹${service.price.toLocaleString()}` : 'Free'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="listings-empty">
                                <div className="listings-empty-icon">🎓</div>
                                <h3>No services yet</h3>
                                <p>Be the first to request or offer academic help!</p>
                                {user && (
                                    <Link to="/create-service" className="btn btn-primary">
                                        Post a Service
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
