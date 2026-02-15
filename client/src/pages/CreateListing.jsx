import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CreateListing.css';

const API = `${import.meta.env.VITE_API_URL}/listings`;

const categories = [
    { value: 'books', label: 'Books & Textbooks' },
    { value: 'electronics', label: 'Electronics & Gadgets' },
    { value: 'stationery', label: 'Stationery & Supplies' },
    { value: 'clothing', label: 'Clothing & Accessories' },
    { value: 'hostel', label: 'Hostel Essentials' },
    { value: 'lab', label: 'Lab Equipment' },
    { value: 'other', label: 'Other' },
];

const conditions = [
    { value: 'new', label: 'New — Unused' },
    { value: 'like-new', label: 'Like New — Barely used' },
    { value: 'good', label: 'Good — Light wear' },
    { value: 'fair', label: 'Fair — Visible wear' },
];

export default function CreateListing() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: 'books',
        condition: 'good',
        isNegotiable: false,
    });
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [dragging, setDragging] = useState(false);

    if (!user) {
        return (
            <div className="create-page">
                <div className="container">
                    <div className="listings-empty">
                        <div className="listings-empty-icon">🔒</div>
                        <h3>Login Required</h3>
                        <p>You need to be logged in to create a listing.</p>
                        <Link to="/login" className="btn btn-primary">Sign In</Link>
                    </div>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setError('');
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const addFiles = (files) => {
        const newFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
        const totalSlots = 5 - images.length;
        const filesToAdd = newFiles.slice(0, totalSlots);

        if (filesToAdd.length === 0) return;

        setImages((prev) => [...prev, ...filesToAdd]);

        filesToAdd.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                setPreviews((prev) => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = (e) => {
        addFiles(e.target.files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.title.trim()) return setError('Title is required');
        if (!formData.description.trim()) return setError('Description is required');
        if (!formData.price || Number(formData.price) < 0) return setError('Valid price is required');

        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const fd = new FormData();
            fd.append('title', formData.title);
            fd.append('description', formData.description);
            fd.append('price', formData.price);
            fd.append('category', formData.category);
            fd.append('condition', formData.condition);
            fd.append('isNegotiable', formData.isNegotiable);

            images.forEach((img) => fd.append('images', img));

            const res = await fetch(API, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });

            const data = await res.json();

            if (data.success) {
                navigate(`/listing/${data.listing._id}`);
            } else {
                setError(data.message || 'Failed to create listing');
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
                        <h1>Post a Listing</h1>
                        <p>Sell or exchange your items with fellow students</p>
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
                            {/* Images Section */}
                            <div className="create-section">
                                <h2>📷 Photos</h2>
                                <div
                                    className={`image-upload-zone ${dragging ? 'dragging' : ''}`}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                    onDragLeave={() => setDragging(false)}
                                    onDrop={handleDrop}
                                >
                                    <span className="upload-icon">📸</span>
                                    <div className="upload-text">Click or drag images here</div>
                                    <div className="upload-hint">Up to 5 images · JPEG, PNG, WebP · Max 5MB each</div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    hidden
                                />
                                {previews.length > 0 && (
                                    <div className="image-previews">
                                        {previews.map((src, i) => (
                                            <div key={i} className="image-preview">
                                                <img src={src} alt={`Preview ${i + 1}`} />
                                                <button
                                                    type="button"
                                                    className="image-preview-remove"
                                                    onClick={() => removeImage(i)}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Details Section */}
                            <div className="create-section">
                                <h2>📝 Details</h2>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="title">Title</label>
                                    <input
                                        id="title"
                                        type="text"
                                        name="title"
                                        className="form-input"
                                        placeholder="e.g., Engineering Mathematics Textbook — 3rd Edition"
                                        value={formData.title}
                                        onChange={handleChange}
                                        maxLength={100}
                                        required
                                    />
                                    <span className="form-hint">{formData.title.length}/100</span>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        className="form-input"
                                        placeholder="Describe your item — condition, why you're selling, any defects, etc."
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={5}
                                        maxLength={1000}
                                        required
                                        style={{ resize: 'vertical' }}
                                    />
                                    <span className="form-hint">{formData.description.length}/1000</span>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="category">Category</label>
                                        <select
                                            id="category"
                                            name="category"
                                            className="form-select"
                                            value={formData.category}
                                            onChange={handleChange}
                                        >
                                            {categories.map((c) => (
                                                <option key={c.value} value={c.value}>{c.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="condition">Condition</label>
                                        <select
                                            id="condition"
                                            name="condition"
                                            className="form-select"
                                            value={formData.condition}
                                            onChange={handleChange}
                                        >
                                            {conditions.map((c) => (
                                                <option key={c.value} value={c.value}>{c.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Section */}
                            <div className="create-section">
                                <h2>💰 Pricing</h2>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="price">Price (₹)</label>
                                    <input
                                        id="price"
                                        type="number"
                                        name="price"
                                        className="form-input"
                                        placeholder="0"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="0"
                                        required
                                    />
                                    <span className="form-hint">Set to 0 for free items</span>
                                </div>

                                <div className="form-group">
                                    <div className="toggle-row">
                                        <label className="form-label" style={{ marginBottom: 0 }}>
                                            Price is negotiable
                                        </label>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                name="isNegotiable"
                                                checked={formData.isNegotiable}
                                                onChange={handleChange}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
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
                                        Publishing...
                                    </>
                                ) : (
                                    'Publish Listing'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
