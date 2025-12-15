import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCounts();
            // Poll for updates every 30 seconds
            const interval = setInterval(fetchUnreadCounts, 30000);
            
            // Listen for notifications being read
            const handleNotificationsRead = () => setUnreadNotifications(0);
            const handleMessagesRead = () => setUnreadMessages(0);
            window.addEventListener('notificationsRead', handleNotificationsRead);
            window.addEventListener('messagesRead', handleMessagesRead);
            
            return () => {
                clearInterval(interval);
                window.removeEventListener('notificationsRead', handleNotificationsRead);
                window.removeEventListener('messagesRead', handleMessagesRead);
            };
        }
    }, [isAuthenticated]);

    const fetchUnreadCounts = async () => {
        try {
            const [notifRes, msgRes] = await Promise.all([
                api.get('/notifications/unread-count'),
                api.get('/messages/unread-count')
            ]);
            setUnreadNotifications(notifRes.data.count || 0);
            setUnreadMessages(msgRes.data.count || 0);
        } catch (err) {
            console.error('Failed to fetch unread counts:', err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    // Don't show navbar on login/signup pages
    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
            {/* Top Header - Logo and Messages */}
            <header className="bg-black border-b border-zinc-800 sticky top-0 z-50">
                <div className="container mx-auto px-4 max-w-lg">
                    <div className="flex justify-between items-center h-14">
                        <Link to="/" className="text-2xl font-semibold italic text-white">
                            amangram
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link to="/messages" className="text-white relative" title="Messages">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {unreadMessages > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full text-[10px]">
                                        {unreadMessages > 9 ? '9+' : unreadMessages}
                                    </span>
                                )}
                            </Link>
                            <button onClick={handleLogout} className="text-zinc-400 hover:text-white text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Bottom Navigation - Like amangram */}
            <nav className="bg-black border-t border-zinc-800 fixed bottom-0 left-0 right-0 z-50 safe-area-pb">
                <div className="container mx-auto px-4 max-w-lg">
                    <div className="flex justify-around items-center h-14">
                        {/* Home */}
                        <Link to="/" className={`p-2 ${isActive('/') && location.pathname === '/' ? 'text-white' : 'text-zinc-500'}`}>
                            {isActive('/') && location.pathname === '/' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            )}
                        </Link>

                        {/* Explore/Search */}
                        <Link to="/explore" className={`p-2 ${isActive('/explore') ? 'text-white' : 'text-zinc-500'}`}>
                            {isActive('/explore') ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            )}
                        </Link>

                        {/* Create Post */}
                        <Link to="/create" className="p-2 text-zinc-500">
                            <div className="border-2 border-current rounded-md p-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                        </Link>

                        {/* Notifications */}
                        <Link to="/notifications" className={`p-2 relative ${isActive('/notifications') ? 'text-white' : 'text-zinc-500'}`}>
                            {isActive('/notifications') ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            )}
                            {unreadNotifications > 0 && (
                                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full text-[10px]">
                                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                </span>
                            )}
                        </Link>

                        {/* Profile */}
                        <Link to={`/profile/${user?.id}`} className="p-2">
                            <div className={`rounded-full ${isActive('/profile') ? 'ring-2 ring-white' : ''}`}>
                                <img 
                                    src={user?.profilePicture || 'https://via.placeholder.com/28'} 
                                    alt="Profile" 
                                    className="w-7 h-7 rounded-full object-cover"
                                />
                            </div>
                        </Link>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
