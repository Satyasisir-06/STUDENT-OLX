import jwt from 'jsonwebtoken';
import { db } from '../config/firebase.js';

const usersRef = db.collection('users');

// @desc    Protect routes — verify JWT and attach user to request
export const protect = async (req, res, next) => {
    let token;

    // Check for token in header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token && req.cookies.token !== 'none') {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized — no token',
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user in Firestore
        const doc = await usersRef.doc(decoded.id).get();
        if (!doc.exists) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists',
            });
        }

        const userData = doc.data();
        req.user = { _id: doc.id, id: doc.id, ...userData };
        delete req.user.password;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized — invalid token',
        });
    }
};

// @desc    Admin-only middleware
export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Admin access required',
    });
};
