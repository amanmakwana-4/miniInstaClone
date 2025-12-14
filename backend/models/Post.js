import mongoose from 'mongoose';
const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL']
    },
    caption: {
        type: String,
        maxlength: [2200, 'Caption maxlength is 2199 characters'],
        default: ''
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});
postSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });
const Post = mongoose.model('Post', postSchema);
export default Post;
