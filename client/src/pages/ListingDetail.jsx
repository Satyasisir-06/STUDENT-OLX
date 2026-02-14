import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ListingDetail.css';
import ReportModal from '../components/ReportModal';

const API = 'http://localhost:5000/api/v1/listings';

const categoryLabels = {
    books: '📚 Books',
    electronics: '💻 Electronics',
    stationery: '✏️ Stationery',
    clothing: '👕 Clothing',
    hostel: '🏠 Hostel',
    lab: '🔬 Lab Equipment',
    other: '📦 Other',
};

const conditionLabels = {
    new: 'New',
    'like-new': 'Like New',
    good: 'Good',
    fair: 'Fair',
};

export default function ListingDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [error, setError] = useState('');
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const res = await fetch(`${API}/${id}`);
                const data = await res.json();
                if (data.success) {
                    setListing(data.listing);
                } else {
                    setError('Listing not found');
                }
            } catch (err) {
                setError('Failed to load listing');
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API}/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                navigate('/listings');
            }
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner spinner-lg"></div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="detail-page">
                <div className="container">
                    <div className="listings-empty">
                        <div className="listings-empty-icon">😕</div>
                        <h3>{error || 'Listing not found'}</h3>
                        <p>This listing may have been removed or doesn't exist.</p>
                        <Link to="/listings" className="btn btn-primary">
                            Back to Marketplace
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const images = listing.images || [];
    const isOwner = user && listing.seller && user._id === listing.seller._id;

    return (
        <div className="detail-page fade-in">
            <div className="container">
                <Link to="/listings" className="detail-back">
                    ← Back to Marketplace
                </Link>

                <div className="detail-layout">
                    {/* Gallery */}
                    <div className="detail-gallery">
                        <div className="detail-main-image">
                            {images.length > 0 ? (
                                <img
                                    src={`http://localhost:5000${images[selectedImage]}`}
                                    alt={listing.title}
                                />
                            ) : (
                                <span className="placeholder-icon">
                                    {categoryLabels[listing.category]?.split(' ')[0] || '📦'}
                                </span>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="detail-thumbs">
                                {images.map((img, i) => (
                                    <div
                                        key={i}
                                        className={`detail-thumb ${selectedImage === i ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(i)}
                                    >
                                        <img src={`http://localhost:5000${img}`} alt={`${listing.title} ${i + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="detail-info">
                        <div className="detail-info-card">
                            <div className="detail-badges">
                                <span className="badge badge-primary">
                                    {categoryLabels[listing.category] || listing.category}
                                </span>
                                <span className="badge badge-success">
                                    {conditionLabels[listing.condition] || listing.condition}
                                </span>
                                {listing.isNegotiable && (
                                    <span className="badge badge-warning">Negotiable</span>
                                )}
                            </div>

                            <h1 className="detail-title">{listing.title}</h1>
                            <div className="detail-price">₹{listing.price.toLocaleString()}</div>

                            <p className="detail-desc">{listing.description}</p>

                            <div className="detail-meta">
                                <div className="detail-meta-row">
                                    <span className="detail-meta-label">Category</span>
                                    <span className="detail-meta-value">
                                        {categoryLabels[listing.category] || listing.category}
                                    </span>
                                </div>
                                <div className="detail-meta-row">
                                    <span className="detail-meta-label">Condition</span>
                                    <span className="detail-meta-value">
                                        {conditionLabels[listing.condition] || listing.condition}
                                    </span>
                                </div>
                                <div className="detail-meta-row">
                                    <span className="detail-meta-label">Posted</span>
                                    <span className="detail-meta-value">
                                        {new Date(listing.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Seller */}
                            {listing.seller && (
                                <div className="detail-seller">
                                    <div className="detail-seller-avatar">
                                        {getInitials(listing.seller.name)}
                                    </div>
                                    <div className="detail-seller-info">
                                        <div className="detail-seller-name">{listing.seller.name}</div>
                                        <div className="detail-seller-college">
                                            {listing.seller.college}
                                            {listing.seller.year ? ` · ${listing.seller.year}${['st', 'nd', 'rd', 'th', 'th'][listing.seller.year - 1] || 'th'} Year` : ''}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="detail-actions">
                                {isOwner ? (
                                    <>
                                        <button className="btn btn-secondary btn-full" onClick={handleDelete}>
                                            Delete Listing
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-primary btn-full btn-lg"
                                            onClick={() => navigate(`/chat?to=${listing.seller._id}&listing=${listing._id}`)}
                                        >
                                            💬 Contact Seller
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-full"
                                            style={{ marginTop: '0.75rem', color: 'var(--text-tertiary)' }}
                                            onClick={() => {
                                                if (!user) return navigate('/login');
                                                setIsReportModalOpen(true);
                                            }}
                                        >
                                            🚩 Report this Listing
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="detail-views">
                                👁 {listing.views} views
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                targetType="listing"
                targetId={id}
            />
        </div>
    );
}
