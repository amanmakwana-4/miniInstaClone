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
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [likedUsers, setLikedUsers] = useState([]);
    const [likesLoading, setLikesLoading] = useState(false);

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

    const fetchLikes = async () => {
        setLikesLoading(true);
        try {
            const res = await api.get(`/posts/${postId}/likes`);
            setLikedUsers(res.data.users || []);
            setShowLikesModal(true);
        } catch (err) {
            console.error('Error fetching likes:', err);
        } finally {
            setLikesLoading(false);
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
                <div className="text-zinc-500">Loading post...</div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                <p className="text-red-400 mb-4">{error || 'Post not found'}</p>
                <button onClick={() => navigate('/')} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                    Go Home
                </button>
            </div>
        );
    }

    const isOwner = user?.id === post.user?._id;

    return (
        <div className="max-w-lg mx-auto">
            <div className="bg-black">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-zinc-800">
                    <button onClick={() => navigate(-1)} className="text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-base font-semibold text-white">Post</h1>
                    {isOwner ? (
                        <button
                            onClick={handleDeletePost}
                            className="text-red-500 text-sm font-semibold"
                        >
                            Delete
                        </button>
                    ) : (
                        <div className="w-6"></div>
                    )}
                </div>

                {/* Post User Header */}
                <div className="flex items-center p-3">
                    <Link to={`/profile/${post.user?._id}`}>
                        <img
                            src={post.user?.profilePicture || 'https://via.placeholder.com/40'}
                            alt={post.user?.username}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    </Link>
                    <Link to={`/profile/${post.user?._id}`} className="ml-3 font-semibold text-sm text-white">
                        {post.user?.username}
                    </Link>
                </div>

                {/* Media (image or video) */}
                {typeof post.imageUrl === 'string' && (post.imageUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i) || post.imageUrl.startsWith('data:video')) ? (
                    <video src={post.imageUrl} className="w-full" controls preload="metadata" />
                ) : (
                    <img src={post.imageUrl} alt="Post" className="w-full" />
                )}

                {/* Actions */}
                <div className="p-3">
                    <div className="flex items-center space-x-4 mb-2">
                        <button onClick={handleLike} className="focus:outline-none">
                            {liked ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white hover:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <button 
                        onClick={fetchLikes}
                        className="font-semibold text-sm mb-2 text-white hover:text-zinc-400 cursor-pointer text-left"
                        disabled={likesLoading}
                    >
                        {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                    </button>

                    {/* Caption */}
                    {post.caption && (
                        <p className="text-sm mb-2 text-white">
                            <Link to={`/profile/${post.user?._id}`} className="font-semibold mr-2">
                                {post.user?.username}
                            </Link>
                            <span className="text-zinc-300">{post.caption}</span>
                        </p>
                    )}

                    <p className="text-xs text-zinc-500 uppercase mt-2">
                        {formatDate(post.createdAt)}
                    </p>
                </div>

                {/* Comments Section */}
                <div className="border-t border-zinc-800 p-3">
                    <h3 className="text-sm font-semibold text-white mb-3">Comments</h3>
                    <div className="max-h-60 overflow-y-auto space-y-3">
                        {comments.length === 0 ? (
                            <p className="text-zinc-500 text-sm text-center py-4">
                                No comments yet. Be the first!
                            </p>
                        ) : (
                            comments.map(comment => (
                                <div key={comment._id} className="flex group">
                                    <Link to={`/profile/${comment.user?._id}`}>
                                        <img
                                            src={comment.user?.profilePicture || 'https://via.placeholder.com/32'}
                                            alt={comment.user?.username}
                                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                        />
                                    </Link>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm text-white">
                                            <Link to={`/profile/${comment.user?._id}`} className="font-semibold mr-2">
                                                {comment.user?.username}
                                            </Link>
                                            <span className="text-zinc-300">{comment.text}</span>
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <p className="text-xs text-zinc-600">
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
                </div>

                {/* Add Comment */}
                <div className="border-t border-zinc-800 p-3">
                    <form onSubmit={handleComment} className="flex items-center">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-1 text-sm focus:outline-none bg-transparent text-white placeholder-zinc-500"
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || commentLoading}
                            className="text-blue-500 font-semibold text-sm disabled:opacity-50"
                        >
                            {commentLoading ? 'Posting...' : 'Post'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Likes Modal */}
            {showLikesModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setShowLikesModal(false)}>
                    <div className="bg-zinc-900 rounded-xl w-full max-w-sm mx-4 border border-zinc-800" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                            <h3 className="font-semibold text-white">Likes</h3>
                            <button onClick={() => setShowLikesModal(false)} className="text-zinc-400 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {likedUsers.length === 0 ? (
                                <p className="text-zinc-500 text-center py-8">No likes yet</p>
                            ) : (
                                likedUsers.map((likedUser) => (
                                    <Link
                                        key={likedUser._id}
                                        to={`/profile/${likedUser._id}`}
                                        onClick={() => setShowLikesModal(false)}
                                        className="flex items-center gap-3 p-3 hover:bg-zinc-800 transition-colors"
                                    >
                                        <img
                                            src={likedUser.profilePicture || 'https://via.placeholder.com/40'}
                                            alt={likedUser.username}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <span className="font-semibold text-sm text-white">{likedUser.username}</span>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostDetail;
