import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Explore = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followingMap, setFollowingMap] = useState({});

    useEffect(() => {
        fetchExploreData();
    }, []);

    const fetchExploreData = async () => {
        try {
            setLoading(true);
            const [usersRes, postsRes] = await Promise.all([
                api.get('/users'),
                api.get('/posts/explore')
            ]);
            
            setUsers(usersRes.data.users || []);
            setPosts(postsRes.data.posts || []);
        } catch (err) {
            console.error('Error fetching explore data:', err);
        } finally {
            setLoading(false);
        }
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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-gray-500">Discovering...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Suggested Users Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Suggested Users</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users
                        .filter(u => u._id !== currentUser?.id)
                        .slice(0, 6)
                        .map(user => (
                            <div key={user._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                <Link to={`/profile/${user._id}`} className="flex items-center">
                                    <img
                                        src={user.profilePicture || 'https://via.placeholder.com/40'}
                                        alt={user.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div className="ml-3">
                                        <p className="font-semibold text-sm hover:underline">{user.username}</p>
                                        <p className="text-xs text-gray-500">{user.bio?.substring(0, 30) || 'New user'}</p>
                                    </div>
                                </Link>
                                <button
                                    onClick={() => handleFollow(user._id)}
                                    className={`text-sm font-semibold px-3 py-1 rounded ${
                                        followingMap[user._id]
                                            ? 'bg-gray-100 text-gray-800'
                                            : 'bg-blue-500 text-white'
                                    }`}
                                >
                                    {followingMap[user._id] ? 'Following' : 'Follow'}
                                </button>
                            </div>
                        ))}
                </div>
            </div>

            {/* Explore Posts Grid */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Explore Posts</h2>
                {posts.length === 0 ? (
                    <div className="text-center py-16">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="text-xl font-light mb-2">No Posts to Explore</h3>
                        <p className="text-gray-500">Check back later for new content!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-1 md:gap-4">
                        {posts.map(post => (
                            <Link
                                key={post._id}
                                to={`/post/${post._id}`}
                                className="relative aspect-square group"
                            >
                                <img
                                    src={post.imageUrl}
                                    alt="Post"
                                    className="w-full h-full object-cover rounded"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded">
                                    <div className="flex items-center gap-6 text-white font-semibold">
                                        <span className="flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                            </svg>
                                            {post.likes?.length || 0}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Explore;
