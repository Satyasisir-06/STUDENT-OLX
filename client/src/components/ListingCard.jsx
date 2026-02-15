import { Link } from 'react-router-dom';
import './ListingCard.css';

const categoryIcons = {
    books: '📚',
    electronics: '💻',
    stationery: '✏️',
    clothing: '👕',
    hostel: '🏠',
    lab: '🔬',
    other: '📦',
};

const conditionLabels = {
    new: 'New',
    'like-new': 'Like New',
    good: 'Good',
    fair: 'Fair',
};

export default function ListingCard({ listing }) {
    const imageUrl = listing.images && listing.images.length > 0
        ? `${import.meta.env.VITE_SOCKET_URL}${listing.images[0]}`
        : null;

    const timeAgo = (date) => {
        const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    return (
        <Link to={`/listing/${listing._id}`} className="listing-card">
            <div className="listing-card-image">
                {imageUrl ? (
                    <img src={imageUrl} alt={listing.title} loading="lazy" />
                ) : (
                    <div className="listing-card-placeholder">
                        {categoryIcons[listing.category] || '📦'}
                    </div>
                )}
                <div className="listing-card-badge">
                    <span className="badge badge-primary">
                        {conditionLabels[listing.condition] || listing.condition}
                    </span>
                </div>
            </div>

            <div className="listing-card-body">
                <div className="listing-card-title">{listing.title}</div>
                <div className="listing-card-price">
                    ₹{listing.price.toLocaleString()}
                    {listing.isNegotiable && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--warning)', marginLeft: '6px' }}>
                            Negotiable
                        </span>
                    )}
                </div>
                <div className="listing-card-meta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    {listing.seller?.name || 'Student'}
                    <span className="listing-card-dot"></span>
                    {timeAgo(listing.createdAt)}
                </div>
            </div>
        </Link>
    );
}
