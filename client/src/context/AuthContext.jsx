import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:5000/api/v1/auth';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_URL}/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });

            const data = await res.json();

            if (data.success) {
                setUser(data.user);
            } else {
                localStorage.removeItem('token');
            }
        } catch (err) {
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data.success) {
                setUser(data.user);
                localStorage.setItem('token', data.token);
                return { success: true };
            } else {
                setError(data.message);
                return { success: false, message: data.message };
            }
        } catch (err) {
            const msg = 'Network error — please try again';
            setError(msg);
            return { success: false, message: msg };
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(userData),
            });

            const data = await res.json();

            if (data.success) {
                setUser(data.user);
                localStorage.setItem('token', data.token);
                return { success: true };
            } else {
                setError(data.message);
                return { success: false, message: data.message };
            }
        } catch (err) {
            const msg = 'Network error — please try again';
            setError(msg);
            return { success: false, message: msg };
        }
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });
        } catch (err) {
            // Logout locally even if API fails
        }

        setUser(null);
        localStorage.removeItem('token');
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider
            value={{ user, loading, error, login, register, logout, clearError }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
