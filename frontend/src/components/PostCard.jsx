import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post, onUpdate }) => {
    const { user } = useAuth();
    const videoRef = useRef(null);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [liked, setLiked] = useState(post.likes?.includes(user?.id));
    const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState(post.comments || []);
    const [showAllComments, setShowAllComments] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [likedUsers, setLikedUsers] = useState([]);
    const [likesLoading, setLikesLoading] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [sharing, setSharing] = useState(false);

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

    const fetchLikes = async () => {
        setLikesLoading(true);
        try {
            const res = await api.get(`/posts/${post._id}/likes`);
            setLikedUsers(res.data.users || []);
            setShowLikesModal(true);
        } catch (err) {
            console.error('Error fetching likes:', err);
        } finally {
            setLikesLoading(false);
        }
    };

    const fetchConversations = async () => {
        try {
            const res = await api.get('/messages/conversations');
            setConversations(res.data.conversations || []);
        } catch (err) {
            console.error('Error fetching conversations for share:', err);
        }
    };

    const sendShare = async (conversationId) => {
        try {
            setSharing(true);
            const mediaType = (typeof post.imageUrl === 'string' && (post.imageUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i) || post.imageUrl.startsWith('data:video'))) ? 'video' : 'image';
            await api.post(`/messages/conversations/${conversationId}/messages`, {
                content: post.caption || '',
                mediaUrl: post.imageUrl,
                mediaType
            });
            setShowShareModal(false);
        } catch (err) {
            console.error('Error sharing post:', err);
            alert('Failed to share post.');
        } finally {
            setSharing(false);
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
        <div className="bg-black border-b border-zinc-800 mb-4">
            {/* Header */}
            <div className="flex items-center p-3">
                <Link to={`/profile/${post.user?._id}`}>
                    <img
                        src={post.user?.profilePicture || 'https://via.placeholder.com/40'}
                        alt={post.user?.username}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                </Link>
                <Link to={`/profile/${post.user?._id}`} className="ml-3 font-semibold text-sm text-white hover:opacity-70">
                    {post.user?.username}
                </Link>
            </div>

            {/* Media (image or video) - clicking media toggles play/pause or mute instead of navigating */}
            <div className="relative" onClick={(e) => {
                // prevent clicks from bubbling to parent clickable areas
                e.stopPropagation();
                // toggle play/pause for video
                const vid = videoRef.current;
                if (vid) {
                    if (vid.paused) { vid.play(); setIsPlaying(true); }
                    else { vid.pause(); setIsPlaying(false); }
                }
            }}>
                {typeof post.imageUrl === 'string' && (post.imageUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i) || post.imageUrl.startsWith('data:video')) ? (
                    <video
                        ref={videoRef}
                        src={post.imageUrl}
                        className="w-full object-cover"
                        style={{ maxHeight: '600px' }}
                        muted={isMuted}
                        playsInline
                        autoPlay
                        loop
                        preload="metadata"
                    />
                ) : (
                    <img
                        src={post.imageUrl}
                        alt="Post"
                        className="w-full object-cover"
                        style={{ maxHeight: '600px' }}
                        loading="lazy"
                        decoding="async"
                    />
                )}

                {/* Open post detail button (top-right) */}
                <Link to={`/post/${post._id}`} onClick={(e) => e.stopPropagation()} className="absolute top-2 right-2 bg-black bg-opacity-50 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A2 2 0 0122 9.618v4.764a2 2 0 01-2.447 1.894L15 14M4 6v12c0 1.105.895 2 2 2h10" />
                    </svg>
                </Link>

                {/* Unmute / Mute control (bottom-right) */}
                {typeof post.imageUrl === 'string' && (post.imageUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i) || post.imageUrl.startsWith('data:video')) && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const vid = videoRef.current;
                            if (!vid) return;
                            vid.muted = !vid.muted;
                            setIsMuted(vid.muted);
                            if (vid.paused) { vid.play(); setIsPlaying(true); }
                        }}
                        className="absolute bottom-2 right-2 bg-black bg-opacity-50 p-1 rounded-full"
                    >
                        {isMuted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.586 3.586A2 2 0 018 4H6a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 001.586-.586L14 12h2v-2h-2l-4.414-3.414zM17 9a5 5 0 00-1.382-3.382l-1.06 1.06A3 3 0 0116 9a3 3 0 01-1.442 2.498l1.06 1.06A5 5 0 0017 9z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.586 3.586A2 2 0 018 4H6a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 001.586-.586L14 12h2v-2h-2l-4.414-3.414zM15.536 8.464A3 3 0 0014 9a3 3 0 001.536 2.536l1.06-1.06A1 1 0 0117 10a1 1 0 01-.404.808l1.06 1.06A3 3 0 0019 10a3 3 0 00-1.464-2.536l-1 1.0z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>

            {/* Actions */}
            <div className="p-3">
                    <div className="flex items-center space-x-4 mb-2">
                    {/* Like Button */}
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

                    {/* Comment Button */}
                    <Link to={`/post/${post._id}`} className="focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white hover:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </Link>
                    {/* Share Button */}
                    <button onClick={async () => { await fetchConversations(); setShowShareModal(true); }} className="focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white hover:text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15 8a3 3 0 10-2.83-4H9a3 3 0 100 6h3.17A3 3 0 0015 8zM7 12a3 3 0 102.83 4H15a3 3 0 100-6H9.83A3 3 0 007 12z" />
                        </svg>
                    </button>
                </div>

                {/* Like Count */}
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

                {/* Comments */}
                {comments.length > 2 && !showAllComments && (
                    <button
                        onClick={() => setShowAllComments(true)}
                        className="text-zinc-500 text-sm mb-2"
                    >
                        View all {comments.length} comments
                    </button>
                )}

                {displayComments.map((c, index) => (
                    <p key={c._id || index} className="text-sm mb-1 text-white">
                        <Link to={`/profile/${c.user?._id}`} className="font-semibold mr-2">
                            {c.user?.username}
                        </Link>
                        <span className="text-zinc-300">{c.text}</span>
                    </p>
                ))}

                {/* Timestamp */}
                <p className="text-xs text-zinc-500 mt-2 uppercase">
                    {formatDate(post.createdAt)}
                </p>
            </div>

            {/* Add Comment */}
            <div className="border-t border-zinc-800 p-3">
                <form onSubmit={handleComment} className="flex items-center">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="flex-1 text-sm focus:outline-none bg-transparent text-white placeholder-zinc-500"
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
            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setShowShareModal(false)}>
                    <div className="bg-zinc-900 rounded-xl w-full max-w-sm mx-4 border border-zinc-800" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                            <h3 className="font-semibold text-white">Share Post</h3>
                            <button onClick={() => setShowShareModal(false)} className="text-zinc-400 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <p className="text-sm text-zinc-400 mb-3">Send this post as a message</p>
                            <div className="max-h-48 overflow-y-auto">
                                {conversations.length === 0 ? (
                                    <p className="text-zinc-500 text-center py-6">No conversations yet. Search in Messages to start one.</p>
                                ) : (
                                    conversations.map((conv) => {
                                        const other = conv.participants.find(p => p._id !== user?.id);
                                        return (
                                            <button
                                                key={conv._id}
                                                onClick={() => sendShare(conv._id)}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800 rounded-lg transition-colors"
                                                disabled={sharing}
                                            >
                                                <img src={other.profilePicture || 'https://via.placeholder.com/40'} alt={other.username} className="w-12 h-12 rounded-full object-cover" />
                                                <div className="text-left flex-1">
                                                    <p className="font-semibold text-white text-sm">{other.username}</p>
                                                    <p className="text-xs text-zinc-500 truncate">{conv.lastMessage?.content || 'Send post'}</p>
                                                </div>
                                                <div className="text-zinc-500 text-sm">{conv.unreadCount > 0 ? conv.unreadCount : ''}</div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button onClick={fetchConversations} className="px-3 py-2 bg-zinc-800 text-white rounded mr-2">Refresh</button>
                                <button onClick={() => setShowShareModal(false)} className="px-3 py-2 bg-transparent border border-zinc-700 text-white rounded">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostCard;
