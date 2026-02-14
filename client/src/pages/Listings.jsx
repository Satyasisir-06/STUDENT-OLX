import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import './Listings.css';

const API = 'http://localhost:5000/api/v1/listings';

const categories = [
    { value: 'all', label: 'All' },
    { value: 'books', label: '📚 Books' },
    { value: 'electronics', label: '💻 Electronics' },
    { value: 'stationery', label: '✏️ Stationery' },
    { value: 'clothing', label: '👕 Clothing' },
    { value: 'hostel', label: '🏠 Hostel' },
    { value: 'lab', label: '🔬 Lab' },
    { value: 'other', label: '📦 Other' },
];

export default function Listings() {
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [sort, setSort] = useState('newest');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    const fetchListings = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            let url;
            if (search.trim()) {
                url = `${API}/search?q=${encodeURIComponent(search)}&page=${page}&limit=12`;
            } else {
                const params = new URLSearchParams({ page, limit: 12 });
                if (category !== 'all') params.set('category', category);
                if (sort === 'price-asc') params.set('sort', 'price-asc');
                if (sort === 'price-desc') params.set('sort', 'price-desc');
                if (sort === 'popular') params.set('sort', 'popular');
                url = `${API}?${params}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                setListings(data.listings);
                setPagination(data.pagination);
            }
        } catch (err) {
            console.error('Failed to fetch listings:', err);
        } finally {
            setLoading(false);
        }
    }, [search, category, sort]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchListings(1);
        }, search ? 400 : 0); // debounce search

        return () => clearTimeout(timer);
    }, [fetchListings]);

    const handlePageChange = (newPage) => {
        fetchListings(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="listings-page">
            <div className="container">
                {/* Header */}
                <div className="listings-header">
                    <div>
                        <h1>Marketplace</h1>
                        <span className="listings-count">{pagination.total} items available</span>
                    </div>
                    {user && (
                        <Link to="/create-listing" className="btn btn-primary">
                            + Post Listing
                        </Link>
                    )}
                </div>

                {/* Toolbar */}
                <div className="listings-toolbar">
                    <div className="listings-search">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search for books, electronics, clothing..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                        <option value="newest">Newest First</option>
                        <option value="price-asc">Price: Low → High</option>
                        <option value="price-desc">Price: High → Low</option>
                        <option value="popular">Most Viewed</option>
                    </select>
                </div>

                {/* Category Filters */}
                <div className="filter-group" style={{ marginBottom: 'var(--space-8)' }}>
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            className={`filter-chip ${category === cat.value ? 'active' : ''}`}
                            onClick={() => setCategory(cat.value)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Listings Grid */}
                {loading ? (
                    <div className="loading-screen" style={{ minHeight: '40vh' }}>
                        <div className="spinner spinner-lg"></div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading listings...</p>
                    </div>
                ) : (
                    <>
                        <div className="listings-grid">
                            {listings.length > 0 ? (
                                listings.map((listing) => (
                                    <ListingCard key={listing._id} listing={listing} />
                                ))
                            ) : (
                                <div className="listings-empty">
                                    <div className="listings-empty-icon">🔍</div>
                                    <h3>No listings found</h3>
                                    <p>
                                        {search
                                            ? `No results for "${search}". Try a different search term.`
                                            : 'Be the first to post a listing!'}
                                    </p>
                                    {user && (
                                        <Link to="/create-listing" className="btn btn-primary">
                                            Post Your First Listing
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="pagination">
                                <button
                                    className="pagination-btn"
                                    disabled={pagination.page <= 1}
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                >
                                    ← Prev
                                </button>
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                                    .filter((p) => Math.abs(p - pagination.page) <= 2 || p === 1 || p === pagination.pages)
                                    .map((p, idx, arr) => (
                                        <span key={p}>
                                            {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px' }}>…</span>}
                                            <button
                                                className={`pagination-btn ${pagination.page === p ? 'active' : ''}`}
                                                onClick={() => handlePageChange(p)}
                                            >
                                                {p}
                                            </button>
                                        </span>
                                    ))}
                                <button
                                    className="pagination-btn"
                                    disabled={pagination.page >= pagination.pages}
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
