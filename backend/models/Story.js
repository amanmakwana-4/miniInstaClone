import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imageUrl: {
        type: String,
        required: [true, 'Story image is required']
    },
    caption: {
        type: String,
        maxlength: [200, 'Caption cannot exceed 200 characters'],
        default: ''
    },
    viewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        index: { expires: 0 } // TTL index - automatically delete expired stories
    }
}, {
    timestamps: true
});

// Virtual for view count
storySchema.virtual('viewCount').get(function() {
    return this.viewers.length;
});

storySchema.set('toJSON', { virtuals: true });
storySchema.set('toObject', { virtuals: true });

const Story = mongoose.model('Story', storySchema);
export default Story;
