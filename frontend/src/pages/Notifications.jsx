import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications');
            setNotifications(res.data.notifications || []);
            
            // Mark all as read
            await api.put('/notifications/read-all');
            
            // Notify Navbar to update unread count
            window.dispatchEvent(new CustomEvent('notificationsRead'));
        } catch (err) {
            setError('Failed to load notifications');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getNotificationText = (notification) => {
        switch (notification.type) {
            case 'like':
                return 'liked your post';
            case 'comment':
                return 'commented on your post';
            case 'follow':
                return 'started following you';
            default:
                return 'interacted with you';
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        const weeks = Math.floor(days / 7);
        return `${weeks}w ago`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="text-zinc-500">Loading notifications...</div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto">
            <div className="">
                <div className="border-b border-zinc-800 p-4">
                    <h1 className="text-xl font-semibold text-white">Notifications</h1>
                </div>

                {error && (
                    <div className="p-4 text-red-400 text-center">{error}</div>
                )}

                {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <h3 className="text-xl font-light mb-2 text-white">No notifications yet</h3>
                        <p className="text-zinc-500">When someone interacts with you, you'll see it here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-800">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`p-4 flex items-center gap-3 ${
                                    !notification.read ? 'bg-zinc-900' : ''
                                }`}
                            >
                                <Link to={`/profile/${notification.sender._id}`}>
                                    <img
                                        src={notification.sender.profilePicture || 'https://via.placeholder.com/44'}
                                        alt={notification.sender.username}
                                        className="w-11 h-11 rounded-full object-cover"
                                    />
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white">
                                        <Link to={`/profile/${notification.sender._id}`} className="font-semibold">
                                            {notification.sender.username}
                                        </Link>{' '}
                                        <span className="text-zinc-400">{getNotificationText(notification)}</span>
                                        <span className="text-zinc-600 ml-2">{getTimeAgo(notification.createdAt)}</span>
                                    </p>
                                </div>
                                {notification.post && (
                                    <Link to={`/post/${notification.post._id}`}>
                                        <img
                                            src={notification.post.imageUrl}
                                            alt="Post"
                                            className="w-11 h-11 object-cover"
                                        />
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
