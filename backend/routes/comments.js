import express from 'express';
import Comment from '../models/Comment.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
router.delete('/:id', protect, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not owner of this comment to delete this'
            });
        }
        await comment.deleteOne();
        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
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
