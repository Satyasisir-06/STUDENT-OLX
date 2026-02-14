import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../config/firebase.js';

const usersRef = db.collection('users');
const resetTokensRef = db.collection('resetTokens');

// Helper: generate JWT and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });

    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };

    const userObj = { ...user };
    delete userObj.password;

    res.status(statusCode).cookie('token', token, cookieOptions).json({
        success: true,
        token,
        user: userObj,
    });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
export const register = async (req, res) => {
    try {
        const { name, email, password, college, year, branch, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password',
            });
        }

        const existingSnap = await usersRef.where('email', '==', email).limit(1).get();
        if (!existingSnap.empty) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists',
            });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword,
            college: college || '',
            year: year || '',
            branch: branch || '',
            phone: phone || '',
            bio: '',
            role: 'user',
            rating: 0,
            wishlist: [],
            isBanned: false,
            isVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const docRef = await usersRef.add(userData);
        const user = { id: docRef.id, _id: docRef.id, ...userData };

        sendTokenResponse(user, 201, res);
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Server error — could not register' });
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const snap = await usersRef.where('email', '==', email).limit(1).get();
        if (snap.empty) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const doc = snap.docs[0];
        const userData = doc.data();

        // Check if banned
        if (userData.isBanned) {
            return res.status(403).json({ success: false, message: 'Your account has been banned. Contact admin.' });
        }

        const isMatch = await bcrypt.compare(password, userData.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = { id: doc.id, _id: doc.id, ...userData };
        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error — could not login' });
    }
};

// @desc    Google OAuth login/register
// @route   POST /api/v1/auth/google
export const googleAuth = async (req, res) => {
    try {
        const { name, email, avatar } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Check if user exists
        const snap = await usersRef.where('email', '==', email).limit(1).get();

        let user;
        if (!snap.empty) {
            const doc = snap.docs[0];
            const userData = doc.data();
            if (userData.isBanned) {
                return res.status(403).json({ success: false, message: 'Your account has been banned.' });
            }
            user = { id: doc.id, _id: doc.id, ...userData };
        } else {
            // Create new user from Google data
            const userData = {
                name: name || 'Google User',
                email,
                password: await bcrypt.hash(crypto.randomBytes(20).toString('hex'), 12),
                college: '',
                year: '',
                branch: '',
                phone: '',
                bio: '',
                avatar: avatar || '',
                role: 'user',
                rating: 0,
                wishlist: [],
                isBanned: false,
                isVerified: true,
                authProvider: 'google',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const docRef = await usersRef.add(userData);
            user = { id: docRef.id, _id: docRef.id, ...userData };
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Forgot password — generate reset token
// @route   POST /api/v1/auth/forgot-password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Please provide email' });

        const snap = await usersRef.where('email', '==', email).limit(1).get();
        if (snap.empty) {
            // Don't reveal if email exists
            return res.status(200).json({ success: true, message: 'If the email exists, a reset link has been sent' });
        }

        const userId = snap.docs[0].id;

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Store token in Firestore (expires in 15 min)
        await resetTokensRef.add({
            userId,
            token: hashedToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
        });

        // In production, send email. In dev, log the token.
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        console.log(`🔑 Password reset link: ${resetUrl}`);

        res.status(200).json({
            success: true,
            message: 'If the email exists, a reset link has been sent',
            // Include resetToken in dev mode for testing
            ...(process.env.NODE_ENV !== 'production' && { resetToken, resetUrl }),
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Reset password with token
// @route   PUT /api/v1/auth/reset-password/:token
export const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        // Find valid token
        const snap = await resetTokensRef.where('token', '==', hashedToken).get();
        if (snap.empty) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }

        const tokenDoc = snap.docs[0];
        const tokenData = tokenDoc.data();

        if (new Date(tokenData.expiresAt) < new Date()) {
            await resetTokensRef.doc(tokenDoc.id).delete();
            return res.status(400).json({ success: false, message: 'Reset token has expired' });
        }

        // Update password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        await usersRef.doc(tokenData.userId).update({
            password: hashedPassword,
            updatedAt: new Date().toISOString(),
        });

        // Delete used token
        await resetTokensRef.doc(tokenDoc.id).delete();

        res.status(200).json({ success: true, message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Logout
// @route   POST /api/v1/auth/logout
export const logout = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
export const getMe = async (req, res) => {
    try {
        const doc = await usersRef.doc(req.user._id).get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = { _id: doc.id, id: doc.id, ...doc.data() };
        delete user.password;

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
