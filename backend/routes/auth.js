import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
router.post('/signup', [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username between 3 and 30 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('provide valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password min 8 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }
        const user = await User.create({
            username,
            email,
            password
        });
        const token = user.getSignedJwtToken();
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.post('/login', [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('provide valid email'),
    body('password')
        .exists()
        .withMessage('provide a password')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        const token = user.getSignedJwtToken();
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;
