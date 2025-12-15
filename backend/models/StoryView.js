import mongoose from 'mongoose';

const storyViewSchema = new mongoose.Schema({
    story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
        required: true
    },
    storyOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    viewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    storyImageUrl: {
        type: String
    },
    viewedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
storyViewSchema.index({ storyOwner: 1, viewedAt: -1 });
storyViewSchema.index({ viewer: 1, viewedAt: -1 });
storyViewSchema.index({ story: 1, viewer: 1 }, { unique: true });

const StoryView = mongoose.model('StoryView', storyViewSchema);
export default StoryView;
