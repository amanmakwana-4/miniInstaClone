import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post, onUpdate }) => {
    const { user } = useAuth();
    const [liked, setLiked] = useState(post.likes?.includes(user?.id));
    const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState(post.comments || []);
    const [showAllComments, setShowAllComments] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLike = async () => {
        try {
            if (liked) {
                await api.delete(`/posts/${post._id}/like`);
                setLikeCount(prev => prev - 1);
            } else {
                await api.post(`/posts/${post._id}/like`);
                setLikeCount(prev => prev + 1);
            }
            setLiked(!liked);
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setLoading(true);
        try {
            const response = await api.post(`/posts/${post._id}/comments`, { text: comment });
            setComments([...comments, response.data.comment]);
            setComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMins = Math.floor(diffTime / (1000 * 60));
                return `${diffMins} minutes ago`;
            }
            return `${diffHours} hours ago`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const displayComments = showAllComments ? comments : comments.slice(0, 2);

    return (
        <div className="bg-white border border-gray-200 rounded-lg mb-6">
            {/* Header */}
            <div className="flex items-center p-4">
                <Link to={`/profile/${post.user?._id}`}>
                    <img
                        src={post.user?.profilePicture || 'https://via.placeholder.com/40'}
                        alt={post.user?.username}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                </Link>
                <Link to={`/profile/${post.user?._id}`} className="ml-3 font-semibold text-sm hover:underline">
                    {post.user?.username}
                </Link>
            </div>

            {/* Image */}
            <Link to={`/post/${post._id}`}>
                <img
                    src={post.imageUrl}
                    alt="Post"
                    className="w-full object-cover"
                    style={{ maxHeight: '600px' }}
                />
            </Link>

            {/* Actions */}
            <div className="p-4">
                <div className="flex items-center space-x-4 mb-3">
                    {/* Like Button */}
                    <button onClick={handleLike} className="focus:outline-none">
                        {liked ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-700 hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        )}
                    </button>

                    {/* Comment Button */}
                    <Link to={`/post/${post._id}`} className="focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-700 hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </Link>
                </div>

                {/* Like Count */}
                <p className="font-semibold text-sm mb-2">{likeCount} likes</p>

                {/* Caption */}
                {post.caption && (
                    <p className="text-sm mb-2">
                        <Link to={`/profile/${post.user?._id}`} className="font-semibold mr-2">
                            {post.user?.username}
                        </Link>
                        {post.caption}
                    </p>
                )}

                {/* Comments */}
                {comments.length > 2 && !showAllComments && (
                    <button
                        onClick={() => setShowAllComments(true)}
                        className="text-gray-500 text-sm mb-2"
                    >
                        View all {comments.length} comments
                    </button>
                )}

                {displayComments.map((c, index) => (
                    <p key={c._id || index} className="text-sm mb-1">
                        <Link to={`/profile/${c.user?._id}`} className="font-semibold mr-2">
                            {c.user?.username}
                        </Link>
                        {c.text}
                    </p>
                ))}

                {/* Timestamp */}
                <p className="text-xs text-gray-400 mt-2 uppercase">
                    {formatDate(post.createdAt)}
                </p>
            </div>

            {/* Add Comment */}
            <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleComment} className="flex items-center">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="flex-1 text-sm focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!comment.trim() || loading}
                        className="text-blue-500 font-semibold text-sm disabled:opacity-50"
                    >
                        Post
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PostCard;
