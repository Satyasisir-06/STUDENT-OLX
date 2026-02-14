import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const API = 'http://localhost:5000/api/v1';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) {
                setSent(true);
            } else {
                setError(data.message);
            }
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="auth-page fade-in">
                <div className="auth-card">
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
                        <h2 className="auth-title">Check Your Email</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            If an account exists with <strong>{email}</strong>, we've sent a password reset link.
                        </p>
                        <Link to="/login" className="btn btn-primary btn-full">Back to Login</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page fade-in">
            <div className="auth-card">
                <h2 className="auth-title">Forgot Password?</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Enter your email and we'll send you a reset link.
                </p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <p className="auth-switch">
                    Remember your password? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}
