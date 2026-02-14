import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
    const { register, error, clearError } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        college: '',
        year: '1',
        branch: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleChange = (e) => {
        clearError();
        setLocalError('');
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        // Client-side validation
        if (formData.password.length < 8) {
            setLocalError('Password must be at least 8 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        setSubmitting(true);

        const { confirmPassword, ...userData } = formData;
        userData.year = Number(userData.year);

        const result = await register(userData);

        if (result.success) {
            navigate('/');
        }

        setSubmitting(false);
    };

    const displayError = localError || error;

    return (
        <div className="auth-page">
            <div className="auth-container" style={{ maxWidth: '520px' }}>
                <div className="auth-header">
                    <h1>Create your account</h1>
                    <p>Join CampusSwap and start exchanging</p>
                </div>

                <div className="auth-card">
                    {displayError && (
                        <div className="alert alert-error">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {displayError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                className="form-input"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                autoComplete="name"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-email">
                                Email address
                            </label>
                            <input
                                id="reg-email"
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="you@college.edu"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="college">
                                College / University
                            </label>
                            <input
                                id="college"
                                type="text"
                                name="college"
                                className="form-input"
                                placeholder="MIT, IIT Delhi, etc."
                                value={formData.college}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="year">
                                    Year
                                </label>
                                <select
                                    id="year"
                                    name="year"
                                    className="form-select"
                                    value={formData.year}
                                    onChange={handleChange}
                                >
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                    <option value="5">5th Year</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="branch">
                                    Branch
                                </label>
                                <input
                                    id="branch"
                                    type="text"
                                    name="branch"
                                    className="form-input"
                                    placeholder="CSE, ECE, etc."
                                    value={formData.branch}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="phone">
                                Phone <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span>
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                className="form-input"
                                placeholder="+91 9876543210"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-password">
                                Password
                            </label>
                            <div className="password-toggle">
                                <input
                                    id="reg-password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className="form-input"
                                    placeholder="Min 8 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                className="form-input"
                                placeholder="Re-enter your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full btn-lg"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="spinner"></span>
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>
                </div>

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
