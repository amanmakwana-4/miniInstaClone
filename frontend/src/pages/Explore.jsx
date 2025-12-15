import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import StoryViewer from '../components/StoryViewer';

const Explore = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followingMap, setFollowingMap] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [storyViewerOpen, setStoryViewerOpen] = useState(false);
    const [storyViewerStories, setStoryViewerStories] = useState([]);
    const [storyViewerInitialIndex, setStoryViewerInitialIndex] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [showingFallback, setShowingFallback] = useState(false);
    const CACHE_KEY = 'explore_cache_v1';
    const CACHE_TTL = 30 * 1000; // 30 seconds

    useEffect(() => {
        // Try to show cached data immediately for fast perceived load
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed?.timestamp && (Date.now() - parsed.timestamp) < CACHE_TTL) {
                    if (parsed.posts) setPosts(parsed.posts);
                    if (parsed.users) setUsers(parsed.users);
                    // show cached quickly but still refresh in background
                    fetchExploreData();
                    return;
                }
            }
        } catch (e) {
            console.warn('Failed to read explore cache', e);
        }

        fetchExploreData();
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        
        try {
            setIsSearching(true);
            const res = await api.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchResults(res.data.users || []);
        } catch (err) {
            console.error('Error searching users:', err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const fetchExploreData = async () => {
        try {
            setLoading(true);
            setErrorMessage('');
            setShowingFallback(false);

            const [usersRes, postsRes] = await Promise.all([
                api.get('/users'),
                api.get('/posts/explore')
            ]);
            
            setUsers(usersRes.data.users || []);
            setPosts(postsRes.data.posts || []);
            // cache the successful response for short TTL to speed up next visit
            try {
                const cacheObj = {
                    timestamp: Date.now(),
                    users: usersRes.data.users || [],
                    posts: postsRes.data.posts || []
                };
                localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
            } catch (e) {
                console.warn('Failed to write explore cache', e);
            }
        } catch (err) {
            console.error('Error fetching explore data:', err);
            let message = 'Failed to load explore posts.';
            if (err?.response) {
                console.error('Explore fetch response data:', err.response.data);
                message += ` (${err.response.status} ${err.response.statusText})`;
            } else if (err?.message) {
                message += ` (${err.message})`;
            }
            setErrorMessage(message);

            // Try fallback to /feed (shows posts from following) if explore is unavailable
            try {
                const feedRes = await api.get('/feed');
                const feedPosts = feedRes.data.posts || [];
                setPosts(feedPosts);
                setShowingFallback(true);
            } catch (fallbackErr) {
                console.error('Fallback /feed fetch failed:', fallbackErr);
                setPosts([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const retryFetch = () => {
        setErrorMessage('');
        setShowingFallback(false);
        fetchExploreData();
    };

    const handleFollow = async (userId) => {
        try {
            if (followingMap[userId]) {
                await api.delete(`/users/${userId}/follow`);
                setFollowingMap({ ...followingMap, [userId]: false });
            } else {
                await api.post(`/users/${userId}/follow`);
                setFollowingMap({ ...followingMap, [userId]: true });
            }
        } catch (err) {
            console.error('Error following user:', err);
        }
    };

    const openStoriesForUser = async (user, e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        try {
            const res = await api.get(`/stories/user/${user._id}`);
            const stories = res.data.stories || [];
            if (stories.length === 0) {
                // no stories, just return (link will still navigate to profile)
                return;
            }

            // StoryViewer expects array grouped by user
            const grouped = [{ user: stories[0].user, stories }];
            setStoryViewerStories(grouped);
            setStoryViewerInitialIndex(0);
            setStoryViewerOpen(true);
        } catch (err) {
            console.error('Error fetching user stories:', err);
        }
    };

    if (loading) {
        // Fast skeleton grid while loading to improve perceived performance
        return (
            <div className="max-w-lg mx-auto p-4">
                <div className="grid grid-cols-3 gap-0.5">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-zinc-800 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto">
            {/* Search Bar */}
            <div className="p-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-zinc-800 border-0 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-600 text-white placeholder-zinc-500"
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {isSearching && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-zinc-400"></div>
                        </div>
                    )}
                </div>

                {/* Search Results */}
                {searchQuery.trim() && (
                    <div className="mt-4">
                        {searchResults.length > 0 ? (
                            <div className="space-y-2">
                                {searchResults.map(user => (
                                    <Link
                                        key={user._id}
                                        to={`/profile/${user._id}`}
                                        className="flex items-center p-3 hover:bg-zinc-900 rounded-lg transition-colors"
                                    >
                                        <div className="relative">
                                            <img
                                                src={user.profilePicture || 'https://via.placeholder.com/40'}
                                                alt={user.username}
                                                className="w-12 h-12 rounded-full object-cover cursor-pointer"
                                                onClick={(e) => openStoriesForUser(user, e)}
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <p className="font-semibold text-sm text-white">{user.username}</p>
                                            <p className="text-xs text-zinc-500">{user.bio?.substring(0, 50) || 'No bio'}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : !isSearching ? (
                            <p className="text-zinc-500 text-center py-4">No users found for "{searchQuery}"</p>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Suggested Users Section */}
            {!searchQuery.trim() && (
                <div className="mb-6">
                    <h2 className="text-zinc-500 text-sm font-semibold px-4 mb-3">Suggested</h2>
                    <div className="">
                        {users
                            .filter(u => u._id !== currentUser?.id)
                            .slice(0, 6)
                            .map(user => (
                                <div key={user._id} className="flex items-center justify-between px-4 py-2">
                                    <Link to={`/profile/${user._id}`} className="flex items-center">
                                        <div className="relative">
                                            <img
                                                src={user.profilePicture || 'https://via.placeholder.com/40'}
                                                alt={user.username}
                                                className="w-11 h-11 rounded-full object-cover cursor-pointer"
                                                onClick={(e) => openStoriesForUser(user, e)}
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <p className="font-semibold text-sm text-white">{user.username}</p>
                                            <p className="text-xs text-zinc-500">{user.bio?.substring(0, 30) || 'Suggested for you'}</p>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => handleFollow(user._id)}
                                        className={`text-sm font-semibold ${
                                            followingMap[user._id]
                                                ? 'text-zinc-400'
                                                : 'text-blue-500'
                                        }`}
                                    >
                                        {followingMap[user._id] ? 'Following' : 'Follow'}
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Explore Posts Grid */}
            <div className="">
                {posts.length === 0 ? (
                    <div className="text-center py-8 px-4">
                        {errorMessage ? (
                            <>
                                <p className="text-zinc-400 mb-4">{errorMessage}</p>
                                <div className="flex items-center justify-center gap-3">
                                    <button onClick={retryFetch} className="px-4 py-2 bg-blue-500 text-white rounded">Retry</button>
                                </div>
                            </>
                        ) : showingFallback ? (
                            <>
                                <h3 className="text-lg font-medium mb-2 text-white">No posts in Explore; showing your feed</h3>
                                <p className="text-zinc-500 mb-4">You're seeing posts from people you follow instead.</p>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h3 className="text-xl font-light mb-2 text-white">No Posts to Explore</h3>
                                <p className="text-zinc-500">Check back later for new content!</p>
                            </>
                        )}
                    </div>
                        ) : (
                    <div className="grid grid-cols-3 gap-0.5">
                        {posts.map(post => {
                            const isVideo = typeof post.imageUrl === 'string' && (post.imageUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i) || post.imageUrl.startsWith('data:video'));
                            return (
                                <Link
                                    key={post._id}
                                    to={`/post/${post._id}`}
                                    className="relative aspect-square group overflow-hidden bg-zinc-900"
                                >
                                    {isVideo ? (
                                        <video
                                            src={post.imageUrl}
                                            className="w-full h-full object-cover"
                                            muted
                                            playsInline
                                            autoPlay
                                            loop
                                            preload="metadata"
                                            poster={post.poster || ''}
                                        />
                                    ) : (
                                        <img
                                            src={post.imageUrl}
                                            alt="Post"
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    )}

                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="flex items-center gap-6 text-white font-semibold">
                                            <span className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                </svg>
                                                {post.likes?.length || 0}
                                            </span>
                                            {isVideo && (
                                                <span className="flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
            {storyViewerOpen && (
                <StoryViewer
                    stories={storyViewerStories}
                    initialUserIndex={storyViewerInitialIndex}
                    onClose={() => { setStoryViewerOpen(false); setStoryViewerStories([]); }}
                />
            )}
        </div>
    );
};

export default Explore;
