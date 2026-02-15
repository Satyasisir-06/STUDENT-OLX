import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import './Home.css';

const initialCategories = [
    { icon: '📚', name: 'Books', count: 0 },
    { icon: '💻', name: 'Electronics', count: 0 },
    { icon: '✏️', name: 'Stationery', count: 0 },
    { icon: '👕', name: 'Clothing', count: 0 },
    { icon: '🏠', name: 'Hostel', count: 0 },
    { icon: '🔬', name: 'Lab Equipment', count: 0 },
];

const features = [
    {
        icon: '🔄',
        color: 'purple',
        title: 'Exchange Items',
        desc: 'Sell or swap pre-owned textbooks, electronics, and essentials with fellow students at student-friendly prices.',
    },
    {
        icon: '📝',
        color: 'green',
        title: 'Academic Services',
        desc: 'Get help with assignments, projects, or notes. Offer your skills as a tutor and earn while you learn.',
    },
    {
        icon: '🛡️',
        color: 'amber',
        title: 'Verified & Safe',
        desc: 'College-verified profiles, star ratings, and a report system ensure a trustworthy community.',
    },
];

export default function Home() {
    const { user } = useAuth();
    const [categories, setCategories] = useState(initialCategories);
    const [recentListings, setRecentListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch category counts
                const countsResponse = await fetch(`${import.meta.env.VITE_SOCKET_URL}/api/v1/listings/categories/counts`);
                const countsData = await countsResponse.json();

                if (countsData.success) {
                    setCategories(prev => prev.map(cat => ({
                        ...cat,
                        count: countsData.counts[cat.name] || 0
                    })));
                }

                // Fetch recent listings
                const listingsResponse = await fetch(`${import.meta.env.VITE_SOCKET_URL}/api/v1/listings?limit=4`);
                const listingsData = await listingsResponse.json();

                if (listingsData.success) {
                    setRecentListings(listingsData.listings);
                }

            } catch (error) {
                console.error('Error fetching home data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="home">
            {/* Hero */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="hero-badge-dot"></span>
                        Built by students, for students
                    </div>

                    <h1>
                        Buy, Sell & Exchange
                        <br />
                        with <span>CampusSwap</span>
                    </h1>

                    <p className="hero-subtitle">
                        The student-only marketplace to exchange pre-owned items, get academic
                        help, and connect with your campus community — all in one place.
                    </p>

                    <div className="hero-actions">
                        {user ? (
                            <>
                                <Link to="/listings" className="btn btn-primary btn-lg">
                                    Browse Marketplace
                                </Link>
                                <Link to="/services" className="btn btn-secondary btn-lg">
                                    Academic Services
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    Get Started — It's Free
                                </Link>
                                <Link to="/login" className="btn btn-secondary btn-lg">
                                    I Have an Account
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="hero-stats">
                        <div className="hero-stat">
                            <div className="hero-stat-value">500+</div>
                            <div className="hero-stat-label">Students</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value">1.2K+</div>
                            <div className="hero-stat-label">Listings</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value">300+</div>
                            <div className="hero-stat-label">Exchanges</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="categories-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Browse by Category</h2>
                        <p>Find what you need in the right place</p>
                    </div>

                    <div className="categories-grid">
                        {categories.map((cat) => (
                            <Link key={cat.name} to={`/listings?category=${cat.name}`} className="category-card">
                                <span className="category-icon">{cat.icon}</span>
                                <div className="category-name">{cat.name}</div>
                                <div className="category-count">{cat.count} items</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recent Listings - New Section */}
            {recentListings.length > 0 && (
                <section className="recent-listings-section" style={{ padding: '4rem 0', background: 'var(--bg-secondary)' }}>
                    <div className="container">
                        <div className="section-header" style={{ marginBottom: '3rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <h2>New Arrivals</h2>
                                    <p>Check out the latest items added by students</p>
                                </div>
                                <Link to="/listings" className="btn btn-link">
                                    View All &rarr;
                                </Link>
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '2rem'
                        }}>
                            {recentListings.map(listing => (
                                <ListingCard key={listing._id} listing={listing} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Features */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Why CampusSwap?</h2>
                        <p>Everything you need in a student marketplace</p>
                    </div>

                    <div className="features-grid">
                        {features.map((f) => (
                            <div key={f.title} className="feature-card">
                                <div className={`feature-icon ${f.color}`}>{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-box">
                        <h2>Ready to start swapping?</h2>
                        <p>
                            Join hundreds of students already saving money and helping each
                            other on CampusSwap.
                        </p>
                        <Link
                            to={user ? '/listings' : '/register'}
                            className="btn btn-white btn-lg"
                        >
                            {user ? 'Go to Marketplace' : 'Create Free Account'}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p>© 2026 CampusSwap. Built with ❤️ by students.</p>
                </div>
            </footer>
        </div>
    );
}
