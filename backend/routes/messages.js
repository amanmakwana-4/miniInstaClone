import express from 'express';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
router.get('/conversations', protect, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user.id
        })
        .populate('participants', 'username profilePicture')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await Message.countDocuments({
                    receiver: req.user.id,
                    sender: { $in: conv.participants.map(p => p._id) },
                    read: false
                });
                return {
                    ...conv.toObject(),
                    unreadCount
                };
            })
        );

        res.status(200).json({
            success: true,
            conversations: conversationsWithUnread
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.post('/conversations/:userId', protect, async (req, res) => {
    try {
        const otherUserId = req.params.userId;

        if (otherUserId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot create conversation with yourself'
            });
        }
        const otherUser = await User.findById(otherUserId);
        if (!otherUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user.id, otherUserId] }
        }).populate('participants', 'username profilePicture');
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user.id, otherUserId]
            });
            conversation = await conversation.populate('participants', 'username profilePicture');
        }

        res.status(200).json({
            success: true,
            conversation
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.get('/conversations/:conversationId/messages', protect, async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }
        if (!conversation.participants.includes(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const messages = await Message.find({
            $or: [
                { sender: conversation.participants[0], receiver: conversation.participants[1] },
                { sender: conversation.participants[1], receiver: conversation.participants[0] }
            ]
        })
        .populate('sender', 'username profilePicture')
        .sort({ createdAt: 1 })
        .limit(100);

        await Message.updateMany(
            { receiver: req.user.id, read: false },
            { read: true }
        );

        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.post('/conversations/:conversationId/messages', protect, async (req, res) => {
    try {
        const { content, mediaUrl, mediaType } = req.body;
        if ((!content || !content.trim()) && !mediaUrl) {
            return res.status(400).json({
                success: false,
                message: 'Message must have content or media'
            });
        }
        if (mediaUrl && !['image', 'video', 'gif'].includes(mediaType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid media type'
            });
        }
        const conversation = await Conversation.findById(req.params.conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }
        if (!conversation.participants.includes(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }
        const receiverId = conversation.participants.find(
            p => p.toString() !== req.user.id
        );

        const message = await Message.create({
            sender: req.user.id,
            receiver: receiverId,
            content: content?.trim() || '',
            mediaUrl: mediaUrl || null,
            mediaType: mediaUrl ? mediaType : null
        });
        conversation.lastMessage = message._id;
        conversation.updatedAt = new Date();
        await conversation.save();

        await message.populate('sender', 'username profilePicture');

        res.status(201).json({
            success: true,
            message
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.get('/unread-count', protect, async (req, res) => {
    try {
        const count = await Message.countDocuments({
            receiver: req.user.id,
            read: false
        });

        res.status(200).json({
            success: true,
            count
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
