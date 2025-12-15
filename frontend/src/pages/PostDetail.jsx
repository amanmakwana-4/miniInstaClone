import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const PostDetail = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    useEffect(() => {
        fetchPostData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postId]);

    const fetchPostData = async () => {
        try {
            setLoading(true);
            const [postRes, commentsRes] = await Promise.all([
                api.get(`/posts/${postId}`),
                api.get(`/posts/${postId}/comments`)
            ]);

            const postData = postRes.data.post;
            setPost(postData);
            setComments(commentsRes.data.comments || []);
            setLiked(postData.likes?.includes(user?.id));
            setLikeCount(postData.likes?.length || 0);
        } catch (err) {
            setError('Failed to load post. Please try again.');
            console.error('Error fetching post:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        try {
            if (liked) {
                await api.delete(`/posts/${postId}/like`);
                setLikeCount(prev => prev - 1);
            } else {
                await api.post(`/posts/${postId}/like`);
                setLikeCount(prev => prev + 1);
            }
            setLiked(!liked);
        } catch (err) {
            console.error('Error liking post:', err);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setCommentLoading(true);
        try {
            const response = await api.post(`/posts/${postId}/comments`, { text: newComment });
            setComments([...comments, response.data.comment]);
            setNewComment('');
        } catch (err) {
            console.error('Error adding comment:', err);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            await api.delete(`/posts/${postId}`);
            navigate('/');
        } catch (err) {
            console.error('Error deleting post:', err);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await api.delete(`/comments/${commentId}`);
            setComments(comments.filter(c => c._id !== commentId));
        } catch (err) {
            console.error('Error deleting comment:', err);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-gray-500">Loading post...</div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                <p className="text-red-500 mb-4">{error || 'Post not found'}</p>
                <button onClick={() => navigate('/')} className="btn-primary">
                    Go Home
                </button>
            </div>
        );
    }

    const isOwner = user?.id === post.user?._id;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                    {/* Image Section */}
                    <div className="lg:w-3/5 bg-black flex items-center justify-center">
                        <img
                            src={post.imageUrl}
                            alt="Post"
                            className="w-full max-h-[600px] object-contain"
                        />
                    </div>

                    {/* Details Section */}
                    <div className="lg:w-2/5 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <Link to={`/profile/${post.user?._id}`} className="flex items-center">
                                <img
                                    src={post.user?.profilePicture || 'https://via.placeholder.com/40'}
                                    alt={post.user?.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <span className="ml-3 font-semibold text-sm hover:underline">
                                    {post.user?.username}
                                </span>
                            </Link>
                            {isOwner && (
                                <button
                                    onClick={handleDeletePost}
                                    className="text-red-500 text-sm font-semibold hover:text-red-600"
                                >
                                    Delete
                                </button>
                            )}
                        </div>

                        {/* Comments Section */}
                        <div className="flex-1 overflow-y-auto p-4 max-h-80 lg:max-h-96">
                            {/* Caption */}
                            {post.caption && (
                                <div className="flex mb-4">
                                    <Link to={`/profile/${post.user?._id}`}>
                                        <img
                                            src={post.user?.profilePicture || 'https://via.placeholder.com/32'}
                                            alt={post.user?.username}
                                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                        />
                                    </Link>
                                    <div className="ml-3">
                                        <p className="text-sm">
                                            <Link to={`/profile/${post.user?._id}`} className="font-semibold mr-2 hover:underline">
                                                {post.user?.username}
                                            </Link>
                                            {post.caption}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatDate(post.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Comments */}
                            {comments.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-8">
                                    No comments yet. Be the first to comment!
                                </p>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment._id} className="flex mb-4 group">
                                        <Link to={`/profile/${comment.user?._id}`}>
                                            <img
                                                src={comment.user?.profilePicture || 'https://via.placeholder.com/32'}
                                                alt={comment.user?.username}
                                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                            />
                                        </Link>
                                        <div className="ml-3 flex-1">
                                            <p className="text-sm">
                                                <Link to={`/profile/${comment.user?._id}`} className="font-semibold mr-2 hover:underline">
                                                    {comment.user?.username}
                                                </Link>
                                                {comment.text}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-xs text-gray-400">
                                                    {formatDate(comment.createdAt)}
                                                </p>
                                                {(user?.id === comment.user?._id || isOwner) && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment._id)}
                                                        className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Actions */}
                        <div className="border-t border-gray-200 p-4">
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
                            </div>

                            {/* Like Count */}
                            <p className="font-semibold text-sm mb-2">{likeCount} likes</p>

                            {/* Timestamp */}
                            <p className="text-xs text-gray-400 uppercase">
                                {formatDate(post.createdAt)}
                            </p>
                        </div>

                        {/* Add Comment */}
                        <div className="border-t border-gray-200 p-4">
                            <form onSubmit={handleComment} className="flex items-center">
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="flex-1 text-sm focus:outline-none bg-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || commentLoading}
                                    className="text-blue-500 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {commentLoading ? 'Posting...' : 'Post'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Back Button */}
            <div className="mt-6 text-center">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                >
                    ← Go Back
                </button>
            </div>
        </div>
    );
};

export default PostDetail;
