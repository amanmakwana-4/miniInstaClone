import express from 'express';
import { body, validationResult } from 'express-validator';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
const isValidMediaUrl = (value) => {
    if (!value) return false;
    if (value.startsWith('data:image/') || value.startsWith('data:video/')) return true;
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
};

router.post('/', protect, [
    body('imageUrl')
        .notEmpty()
        .withMessage('Media is required')
        .custom(isValidMediaUrl)
        .withMessage('Please provide a valid image or video URL or upload media'),
    body('caption')
        .optional()
        .isLength({ max: 2200 })
        .withMessage('Caption cannot exceed 2200 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { imageUrl, caption } = req.body;

        const post = await Post.create({
            user: req.user.id,
            imageUrl,
            caption: caption || ''
        });
        await post.populate('user', 'username profilePicture');
        res.status(201).json({
            success: true,
            post
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.get('/explore', protect, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'username profilePicture')
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            posts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.get('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', 'username profilePicture');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        const comments = await Comment.find({ post: post._id })
            .populate('user', 'username profilePicture')
            .sort({ createdAt: -1 });
        const isLiked = post.likes.includes(req.user.id);
        res.status(200).json({
            success: true,
            post: {
                ...post.toObject(),
                isLiked,
                comments
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
router.delete('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this post'
            });
        }
        await Comment.deleteMany({ post: post._id });
        await post.deleteOne();
        res.status(200).json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.post('/:id/like', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        if (post.likes.includes(req.user.id)) {
            return res.status(400).json({
                success: false,
                message: 'You have already liked this post'
            });
        }
        post.likes.push(req.user.id);
        await post.save();
        if (post.user.toString() !== req.user.id) {
            await Notification.create({
                recipient: post.user,
                sender: req.user.id,
                type: 'like',
                post: post._id
            });
        }
        res.status(200).json({
            success: true,
            message: 'Post liked successfully',
            likeCount: post.likes.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.delete('/:id/like', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        if (!post.likes.includes(req.user.id)) {
            return res.status(400).json({
                success: false,
                message: 'You have not liked this post'
            });
        }
        post.likes = post.likes.filter(id => id.toString() !== req.user.id);
        await post.save();
        res.status(200).json({
            success: true,
            message: 'Post unliked successfully',
            likeCount: post.likes.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.get('/:id/likes', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('likes', 'username profilePicture');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        res.status(200).json({
            success: true,
            users: post.likes || [],
            count: post.likes?.length || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.post('/:id/comments', protect, [
    body('text')
        .trim()
        .notEmpty()
        .withMessage('Comment text is required')
        .isLength({ max: 1000 })
        .withMessage('Comment cannot exceed 999 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        const comment = await Comment.create({
            post: req.params.id,
            user: req.user.id,
            text: req.body.text
        });
        await comment.populate('user', 'username profilePicture');
        if (post.user.toString() !== req.user.id) {
            await Notification.create({
                recipient: post.user,
                sender: req.user.id,
                type: 'comment',
                post: post._id,
                comment: comment._id
            });
        }

        res.status(201).json({
            success: true,
            comment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.get('/:id/comments', protect, async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.id })
            .populate('user', 'username profilePicture')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            comments
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
