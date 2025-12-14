import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
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
                <div className="text-gray-500">Loading profile...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={fetchProfileData} className="btn-primary">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                        <img
                            src={profile?.profilePicture || 'https://via.placeholder.com/150'}
                            alt={profile?.username}
                            className="w-36 h-36 rounded-full object-cover border-2 border-gray-200"
                        />
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                            <h1 className="text-2xl font-light">{profile?.username}</h1>
                            {!isOwnProfile && (
                                <button
                                    onClick={handleFollow}
                                    className={isFollowing ? 'btn-secondary' : 'btn-primary'}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            )}
                            {isOwnProfile && (
                                <button className="btn-secondary">
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex justify-center md:justify-start gap-8 mb-4">
                            <div className="text-center">
                                <span className="font-semibold">{posts.length}</span>
                                <span className="text-gray-500 ml-1">posts</span>
                            </div>
                            <div className="text-center">
                                <span className="font-semibold">{followers.length}</span>
                                <span className="text-gray-500 ml-1">followers</span>
                            </div>
                            <div className="text-center">
                                <span className="font-semibold">{following.length}</span>
                                <span className="text-gray-500 ml-1">following</span>
                            </div>
                        </div>

                        {/* Bio */}
                        {profile?.bio && (
                            <p className="text-sm">{profile.bio}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-t border-gray-200 bg-white rounded-t-lg">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 py-4 text-sm font-semibold uppercase tracking-wide ${
                        activeTab === 'posts'
                            ? 'text-gray-900 border-t-2 border-gray-900 -mt-px'
                            : 'text-gray-400'
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
            <div className="bg-white border border-gray-200 rounded-b-lg p-4">
                {posts.length === 0 ? (
                    <div className="text-center py-16">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h2 className="text-2xl font-light mb-2">No Posts Yet</h2>
                        {isOwnProfile && (
                            <Link to="/create" className="text-blue-500 font-semibold">
                                Share your first photo
                            </Link>
                        )}
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
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded">
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
