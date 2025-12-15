import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('posts');

    const isOwnProfile = currentUser?.id === userId;

    useEffect(() => {
        fetchProfileData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const [profileRes, postsRes, followersRes, followingRes] = await Promise.all([
                api.get(`/users/${userId}`),
                api.get(`/users/${userId}/posts`),
                api.get(`/users/${userId}/followers`),
                api.get(`/users/${userId}/following`)
            ]);

            setProfile(profileRes.data.user);
            setPosts(postsRes.data.posts || []);
            setFollowers(followersRes.data.followers || []);
            setFollowing(followingRes.data.following || []);
            
            // Check if current user is following this profile
            const isUserFollowing = followersRes.data.followers?.some(
                f => f._id === currentUser?.id
            );
            setIsFollowing(isUserFollowing);
        } catch (err) {
            setError('Failed to load profile. Please try again.');
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        try {
            if (isFollowing) {
                await api.delete(`/users/${userId}/follow`);
                setFollowers(followers.filter(f => f._id !== currentUser?.id));
            } else {
                await api.post(`/users/${userId}/follow`);
                setFollowers([...followers, { _id: currentUser?.id, username: currentUser?.username }]);
            }
            setIsFollowing(!isFollowing);
        } catch (err) {
            console.error('Error following/unfollowing:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-zinc-500">Loading profile...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={fetchProfileData} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto">
            {/* Profile Header */}
            <div className="p-4 mb-4">
                <div className="flex items-center gap-6 mb-4">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                        <img
                            src={profile?.profilePicture || 'https://via.placeholder.com/150'}
                            alt={profile?.username}
                            className="w-20 h-20 rounded-full object-cover border-2 border-zinc-700"
                        />
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6 text-center">
                        <div>
                            <div className="font-semibold text-white">{posts.length}</div>
                            <div className="text-zinc-500 text-xs">posts</div>
                        </div>
                        <div>
                            <div className="font-semibold text-white">{followers.length}</div>
                            <div className="text-zinc-500 text-xs">followers</div>
                        </div>
                        <div>
                            <div className="font-semibold text-white">{following.length}</div>
                            <div className="text-zinc-500 text-xs">following</div>
                        </div>
                    </div>
                </div>

                {/* Username and Bio */}
                <div className="mb-4">
                    <h1 className="font-semibold text-white">{profile?.username}</h1>
                    {profile?.bio && (
                        <p className="text-sm text-zinc-400 mt-1">{profile.bio}</p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {!isOwnProfile ? (
                        <>
                            <button
                                onClick={handleFollow}
                                className={`flex-1 py-1.5 rounded-lg font-semibold text-sm ${
                                    isFollowing
                                        ? 'bg-zinc-800 text-white'
                                        : 'bg-blue-500 text-white'
                                }`}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await api.post(`/messages/conversations/${userId}`);
                                        navigate(`/messages/${res.data.conversation._id}`);
                                    } catch (err) {
                                        console.error('Failed to start conversation:', err);
                                    }
                                }}
                                className="flex-1 py-1.5 bg-zinc-800 text-white rounded-lg font-semibold text-sm"
                            >
                                Message
                            </button>
                        </>
                    ) : (
                        <Link to="/edit-profile" className="flex-1 py-1.5 bg-zinc-800 text-white rounded-lg font-semibold text-sm text-center">
                            Edit Profile
                        </Link>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-t border-zinc-800">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wide ${
                        activeTab === 'posts'
                            ? 'text-white border-t border-white -mt-px'
                            : 'text-zinc-500'
                    }`}
                >
                    <span className="flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Posts
                    </span>
                </button>
            </div>

            {/* Posts Grid */}
            <div className="">
                {posts.length === 0 ? (
                    <div className="text-center py-16">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h2 className="text-xl font-light mb-2 text-white">No Posts Yet</h2>
                        {isOwnProfile && (
                            <Link to="/create" className="text-blue-500 font-semibold">
                                Share your first photo
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-0.5">
                        {posts.map(post => (
                            <Link
                                key={post._id}
                                to={`/post/${post._id}`}
                                className="relative aspect-square group"
                            >
                                <img
                                    src={post.imageUrl}
                                    alt="Post"
                                    className="w-full h-full object-cover"
                                />
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="flex items-center gap-6 text-white font-semibold">
                                        <span className="flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                            </svg>
                                            {post.likes?.length || 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                            </svg>
                                            {post.commentCount || 0}
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

export default Profile;
