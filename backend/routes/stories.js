import express from 'express';
import Story from '../models/Story.js';
import StoryView from '../models/StoryView.js';
import Follow from '../models/Follow.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Create a new story
router.post('/', protect, async (req, res) => {
    try {
        const { imageUrl, caption } = req.body;

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Image is required'
            });
        }

        const story = await Story.create({
            user: req.user.id,
            imageUrl,
            caption: caption || ''
        });

        await story.populate('user', 'username profilePicture');

        res.status(201).json({
            success: true,
            story
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get stories from users you follow (feed)
router.get('/feed', protect, async (req, res) => {
    try {
        // Get users the current user is following
        const following = await Follow.find({ follower: req.user.id }).select('following');
        const followingIds = following.map(f => f.following);
        
        // Include current user's stories
        followingIds.push(req.user.id);

        // Get active stories (not expired)
        const stories = await Story.find({
            user: { $in: followingIds },
            expiresAt: { $gt: new Date() }
        })
        .populate('user', 'username profilePicture')
        .sort({ createdAt: -1 });

        // Group stories by user
        const groupedStories = stories.reduce((acc, story) => {
            const userId = story.user._id.toString();
            if (!acc[userId]) {
                acc[userId] = {
                    user: story.user,
                    stories: [],
                    hasUnviewed: false
                };
            }
            acc[userId].stories.push(story);
            if (!story.viewers.includes(req.user.id)) {
                acc[userId].hasUnviewed = true;
            }
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            stories: Object.values(groupedStories)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get user's stories
router.get('/user/:userId', protect, async (req, res) => {
    try {
        const stories = await Story.find({
            user: req.params.userId,
            expiresAt: { $gt: new Date() }
        })
        .populate('user', 'username profilePicture')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            stories
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// View a story (mark as viewed)
router.post('/:id/view', protect, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        // Don't count story owner's own view
        if (story.user.toString() === req.user.id) {
            return res.status(200).json({
                success: true,
                message: 'Own story view not counted'
            });
        }

        // Add viewer if not already viewed
        if (!story.viewers.includes(req.user.id)) {
            story.viewers.push(req.user.id);
            await story.save();

            // Persist the view in StoryView collection (will remain even after story expires)
            await StoryView.findOneAndUpdate(
                { story: story._id, viewer: req.user.id },
                { 
                    story: story._id,
                    storyOwner: story.user,
                    viewer: req.user.id,
                    storyImageUrl: story.imageUrl,
                    viewedAt: new Date()
                },
                { upsert: true, new: true }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Story viewed'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Delete a story
router.delete('/:id', protect, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        if (story.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this story'
            });
        }

        await story.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Story deleted'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get story view history (persisted views for analytics)
router.get('/views/history', protect, async (req, res) => {
    try {
        const views = await StoryView.find({ storyOwner: req.user.id })
            .populate('viewer', 'username profilePicture')
            .sort({ viewedAt: -1 })
            .limit(100);

        // Get total view count
        const totalViews = await StoryView.countDocuments({ storyOwner: req.user.id });
        
        // Get unique viewers count
        const uniqueViewers = await StoryView.distinct('viewer', { storyOwner: req.user.id });

        res.status(200).json({
            success: true,
            views,
            stats: {
                totalViews,
                uniqueViewers: uniqueViewers.length
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

// Get viewers of a specific story
router.get('/:id/viewers', protect, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        // Only story owner can see viewers
        if (story.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const views = await StoryView.find({ story: req.params.id })
            .populate('viewer', 'username profilePicture')
            .sort({ viewedAt: -1 });

        res.status(200).json({
            success: true,
            viewers: views,
            viewCount: views.length
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
