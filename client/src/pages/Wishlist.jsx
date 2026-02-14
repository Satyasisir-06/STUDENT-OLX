import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';

const API = 'http://localhost:5000/api/v1/wishlist';

export default function Wishlist() {
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(API, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.success) setListings(data.listings);
            } catch (err) {
                console.error('Failed to fetch wishlist:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchWishlist();
    }, []);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner spinner-lg"></div>
            </div>
        );
    }

    return (
        <div className="services-page">
            <div className="container">
                <div className="listings-header">
                    <div>
                        <h1>My Wishlist ❤️</h1>
                        <span className="listings-count">{listings.length} saved items</span>
                    </div>
                </div>

                <div className="listings-grid">
                    {listings.length > 0 ? (
                        listings.map((listing) => (
                            <ListingCard key={listing._id} listing={listing} />
                        ))
                    ) : (
                        <div className="listings-empty">
                            <div className="listings-empty-icon">💝</div>
                            <h3>Your wishlist is empty</h3>
                            <p>Save items you like by clicking the heart icon!</p>
                            <Link to="/listings" className="btn btn-primary">
                                Browse Marketplace
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
