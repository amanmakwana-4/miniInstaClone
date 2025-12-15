import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const UserCard = ({ user, showFollowButton = true, initialFollowing = false }) => {
    const { user: currentUser } = useAuth();
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [loading, setLoading] = useState(false);

    const isOwnProfile = currentUser?.id === user._id;

    const handleFollow = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (loading) return;
        setLoading(true);

        try {
            if (isFollowing) {
                await api.delete(`/users/${user._id}/follow`);
            } else {
                await api.post(`/users/${user._id}/follow`);
            }
            setIsFollowing(!isFollowing);
        } catch (err) {
            console.error('Error following/unfollowing:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-3 hover:bg-zinc-900 rounded-lg transition-colors">
            <Link to={`/profile/${user._id}`} className="flex items-center flex-1">
                <img
                    src={user.profilePicture || 'https://via.placeholder.com/44'}
                    alt={user.username}
                    className="w-11 h-11 rounded-full object-cover border border-zinc-700"
                />
                <div className="ml-3">
                    <p className="font-semibold text-sm text-white hover:underline">{user.username}</p>
                    <p className="text-xs text-zinc-500 truncate max-w-[150px]">
                        {user.bio || 'amangram user'}
                    </p>
                </div>
            </Link>
            
            {showFollowButton && !isOwnProfile && (
                <button
                    onClick={handleFollow}
                    disabled={loading}
                    className={`text-xs font-semibold px-4 py-1.5 rounded transition-colors ${
                        isFollowing
                            ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                            : 'text-blue-500 hover:text-blue-400'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
                </button>
            )}
        </div>
    );
};

export default UserCard;
