import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CreateListing.css'; // reuse create-listing styles

const API = 'http://localhost:5000/api/v1/services';

const serviceCategories = [
    { value: 'assignment', label: 'Assignment Help' },
    { value: 'project', label: 'Project Collaboration' },
    { value: 'notes', label: 'Notes / Study Material' },
    { value: 'tutoring', label: 'Tutoring / Mentoring' },
    { value: 'lab-work', label: 'Lab Work' },
    { value: 'other', label: 'Other' },
];

export default function CreateService() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        semester: '',
        type: 'request',
        serviceCategory: 'assignment',
        price: '',
        deadline: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!user) {
        return (
            <div className="create-page">
                <div className="container">
                    <div className="listings-empty">
                        <div className="listings-empty-icon">🔒</div>
                        <h3>Login Required</h3>
                        <p>You need to be logged in to post a service.</p>
                        <Link to="/login" className="btn btn-primary">Sign In</Link>
                    </div>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setError('');
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.title.trim()) return setError('Title is required');
        if (!formData.description.trim()) return setError('Description is required');

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (data.success) {
                navigate('/services');
            } else {
                setError(data.message || 'Failed to create service');
            }
        } catch (err) {
            setError('Network error — please try again');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="create-page">
            <div className="container">
                <div className="create-container">
                    <div className="create-header">
                        <h1>Post a Service</h1>
                        <p>Request help or offer your skills to fellow students</p>
                    </div>

                    <div className="create-card">
                        {error && (
                            <div className="alert alert-error" style={{ marginBottom: 'var(--space-6)' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="create-section">
                                <h2>📋 Service Details</h2>

                                <div className="form-group">
                                    <label className="form-label">I want to...</label>
                                    <div className="services-tabs" style={{ width: '100%' }}>
                                        <button
                                            type="button"
                                            className={`services-tab ${formData.type === 'request' ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, type: 'request' })}
                                            style={{ flex: 1 }}
                                        >
                                            🙋 Request Help
                                        </button>
                                        <button
                                            type="button"
                                            className={`services-tab ${formData.type === 'offer' ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, type: 'offer' })}
                                            style={{ flex: 1 }}
                                        >
                                            🤝 Offer Help
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="title">Title</label>
                                    <input
                                        id="title"
                                        type="text"
                                        name="title"
                                        className="form-input"
                                        placeholder={formData.type === 'request' ? 'e.g., Need help with Data Structures assignment' : 'e.g., Offering Python tutoring sessions'}
                                        value={formData.title}
                                        onChange={handleChange}
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        className="form-input"
                                        placeholder="Describe what you need help with or what you can offer..."
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={5}
                                        maxLength={1000}
                                        required
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="serviceCategory">Category</label>
                                        <select
                                            id="serviceCategory"
                                            name="serviceCategory"
                                            className="form-select"
                                            value={formData.serviceCategory}
                                            onChange={handleChange}
                                        >
                                            {serviceCategories.map((c) => (
                                                <option key={c.value} value={c.value}>{c.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="subject">Subject</label>
                                        <input
                                            id="subject"
                                            type="text"
                                            name="subject"
                                            className="form-input"
                                            placeholder="e.g., Mathematics, OS"
                                            value={formData.subject}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="semester">Semester</label>
                                        <select
                                            id="semester"
                                            name="semester"
                                            className="form-select"
                                            value={formData.semester}
                                            onChange={handleChange}
                                        >
                                            <option value="">Any</option>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                                <option key={s} value={s}>Semester {s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="deadline">Deadline</label>
                                        <input
                                            id="deadline"
                                            type="date"
                                            name="deadline"
                                            className="form-input"
                                            value={formData.deadline}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="create-section">
                                <h2>💰 Pricing</h2>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="price">Price (₹) — leave 0 for free</label>
                                    <input
                                        id="price"
                                        type="number"
                                        name="price"
                                        className="form-input"
                                        placeholder="0"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-full btn-lg"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="spinner"></span>
                                        Posting...
                                    </>
                                ) : (
                                    'Post Service'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
