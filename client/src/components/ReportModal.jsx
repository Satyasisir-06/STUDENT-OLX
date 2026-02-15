import { useState } from 'react';
import './ReportModal.css';

const API = `${import.meta.env.VITE_API_URL}/reports`;

export default function ReportModal({ isOpen, onClose, targetType, targetId }) {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason) return setError('Please select a reason');

        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ targetType, targetId, reason, description }),
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    onClose();
                }, 2000);
            } else {
                setError(data.message);
            }
        } catch {
            setError('Failed to submit report');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="report-modal fade-in">
                <div className="report-modal-header">
                    <h3>Report {targetType}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {success ? (
                    <div className="report-success">
                        <div className="success-icon">✅</div>
                        <p>Report submitted successfully. Our team will review it shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && <div className="alert alert-error mb-4">{error}</div>}

                        <div className="form-group">
                            <label className="form-label">Reason for report</label>
                            <select
                                className="form-input"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            >
                                <option value="">Select a reason</option>
                                <option value="spam">Spam or misleading</option>
                                <option value="fraud">Fraud or scam</option>
                                <option value="inappropriate">Inappropriate content</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Additional Details (Optional)</label>
                            <textarea
                                className="form-input"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tell us more about the issue..."
                                rows="4"
                            ></textarea>
                        </div>

                        <div className="report-modal-actions">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-danger" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
