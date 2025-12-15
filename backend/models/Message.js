import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        maxlength: [1000, 'Message cannot exceed 1000 characters'],
        default: ''
    },
    // Media support for images, videos, and GIFs
    mediaUrl: {
        type: String,
        default: null
    },
    mediaType: {
        type: String,
        enum: ['image', 'video', 'gif', null],
        default: null
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Validate that message has either content or media
messageSchema.pre('save', function(next) {
    if (!this.content && !this.mediaUrl) {
        next(new Error('Message must have content or media'));
    } else {
        next();
    }
});

// Index for faster conversation queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
