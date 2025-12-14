import mongoose from 'mongoose';
const commentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: [true, 'Write a commment'],
        maxlength: [1000, 'Comment length is not more than 1000 characters']
    }
}, {
    timestamps: true
});
const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
