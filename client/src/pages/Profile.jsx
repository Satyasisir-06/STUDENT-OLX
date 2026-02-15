import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import './Profile.css';

const API = import.meta.env.VITE_API_URL;

export default function Profile() {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('listings');
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);

    // If no ID param, show the current user's profile
    const profileId = id || currentUser?._id;
    const isOwnProfile = currentUser && profileId === currentUser._id;

    useEffect(() => {
        if (!profileId) return;
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API}/users/${profileId}`);
                const data = await res.json();
                if (data.success) {
                    setProfile(data.profile);
                    setEditForm({
                        name: data.profile.name || '',
                        college: data.profile.college || '',
                        year: data.profile.year || '',
                        branch: data.profile.branch || '',
                        phone: data.profile.phone || '',
                        bio: data.profile.bio || '',
                    });
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [profileId]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API}/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editForm),
            });
            const data = await res.json();
            if (data.success) {
                setProfile((prev) => ({ ...prev, ...data.user }));
                setEditing(false);
            }
        } catch (err) {
            console.error('Failed to update profile:', err);
        } finally {
            setSaving(false);
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

    if (!profile) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="listings-empty">
                        <div className="listings-empty-icon">😕</div>
                        <h3>Profile not found</h3>
                        <Link to="/" className="btn btn-primary">Go Home</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page fade-in">
            <div className="container">
                <div className="profile-layout">
                    {/* Sidebar */}
                    <div className="profile-sidebar">
                        <div className="profile-avatar">
                            {getInitials(profile.name)}
                        </div>
                        <div className="profile-name">{profile.name}</div>
                        <div className="profile-college">
                            {profile.college}
                            {profile.year ? ` · ${profile.year}${['st', 'nd', 'rd', 'th', 'th'][profile.year - 1] || 'th'} Year` : ''}
                        </div>

                        <div className="profile-stats">
                            <div className="profile-stat">
                                <div className="profile-stat-value">{profile.listings?.length || 0}</div>
                                <div className="profile-stat-label">Listings</div>
                            </div>
                            <div className="profile-stat">
                                <div className="profile-stat-value">{profile.services?.length || 0}</div>
                                <div className="profile-stat-label">Services</div>
                            </div>
                        </div>

                        {profile.bio && <p className="profile-bio">{profile.bio}</p>}

                        {profile.branch && (
                            <div className="profile-detail">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                </svg>
                                {profile.branch}
                            </div>
                        )}

                        {profile.email && (
                            <div className="profile-detail">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                                {profile.email}
                            </div>
                        )}

                        <div className="profile-detail">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            Joined {new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </div>

                        {isOwnProfile && (
                            <button
                                className="btn btn-secondary btn-full"
                                style={{ marginTop: 'var(--space-5)' }}
                                onClick={() => setEditing(true)}
                            >
                                ✏️ Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div>
                        <div className="profile-content-tabs">
                            <button
                                className={`profile-content-tab ${tab === 'listings' ? 'active' : ''}`}
                                onClick={() => setTab('listings')}
                            >
                                Listings ({profile.listings?.length || 0})
                            </button>
                            <button
                                className={`profile-content-tab ${tab === 'services' ? 'active' : ''}`}
                                onClick={() => setTab('services')}
                            >
                                Services ({profile.services?.length || 0})
                            </button>
                        </div>

                        {tab === 'listings' && (
                            <div className="listings-grid">
                                {profile.listings?.length > 0 ? (
                                    profile.listings.map((listing) => (
                                        <ListingCard key={listing._id} listing={{ ...listing, seller: profile }} />
                                    ))
                                ) : (
                                    <div className="listings-empty">
                                        <div className="listings-empty-icon">📦</div>
                                        <h3>No listings yet</h3>
                                        {isOwnProfile && (
                                            <Link to="/create-listing" className="btn btn-primary">
                                                Post Your First Listing
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {tab === 'services' && (
                            <div className="listings-grid">
                                {profile.services?.length > 0 ? (
                                    profile.services.map((service) => (
                                        <div key={service._id} className="service-card">
                                            <div className="service-card-header">
                                                <div className="service-card-title">{service.title}</div>
                                                <span className={`service-card-type type-${service.type}`}>
                                                    {service.type === 'request' ? '🙋 Need' : '🤝 Offer'}
                                                </span>
                                            </div>
                                            <p className="service-card-desc">{service.description}</p>
                                            <div className="service-card-footer">
                                                <span className="badge badge-primary">{service.serviceCategory}</span>
                                                <div className="service-card-price">
                                                    {service.price > 0 ? `₹${service.price}` : 'Free'}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="listings-empty">
                                        <div className="listings-empty-icon">🎓</div>
                                        <h3>No services yet</h3>
                                        {isOwnProfile && (
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

                {/* Edit Profile Modal */}
                {editing && (
                    <div className="edit-profile-overlay" onClick={() => setEditing(false)}>
                        <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
                            <h2>Edit Profile</h2>
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input
                                    type="text" className="form-input"
                                    value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">College</label>
                                <input
                                    type="text" className="form-input"
                                    value={editForm.college} onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Year</label>
                                    <select className="form-select" value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}>
                                        <option value="">Select</option>
                                        {[1, 2, 3, 4, 5].map((y) => <option key={y} value={y}>Year {y}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Branch</label>
                                    <input
                                        type="text" className="form-input" placeholder="e.g. CSE, ECE"
                                        value={editForm.branch} onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    type="tel" className="form-input"
                                    value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Bio</label>
                                <textarea
                                    className="form-input" rows={3} placeholder="Tell others about yourself..."
                                    value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                            <div className="edit-actions">
                                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditing(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveProfile} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
