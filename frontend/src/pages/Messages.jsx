import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const res = await api.get('/messages/conversations');
            setConversations(res.data.conversations || []);
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
            setSearchResults(res.data.users || []);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const startConversation = async (userId) => {
        try {
            const res = await api.post(`/messages/conversations/${userId}`);
            navigate(`/messages/${res.data.conversation._id}`);
        } catch (err) {
            console.error('Failed to start conversation:', err);
        }
    };

    const getOtherParticipant = (conversation) => {
        return conversation.participants.find(p => p._id !== user?.id);
    };

    const getTimeAgo = (date) => {
        if (!date) return '';
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="text-zinc-500">Loading messages...</div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto">
            <div className="min-h-[70vh]">
                {/* Header */}
                <div className="border-b border-zinc-800 p-4">
                    <h1 className="text-base font-semibold text-center text-white">{user?.username}</h1>
                </div>

                {/* Search */}
                <div className="p-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border-none rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-600 text-white placeholder-zinc-500 text-sm"
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
                    </div>

                    {/* Search Results */}
                    {searchQuery && (
                        <div className="mt-2">
                            {isSearching ? (
                                <p className="text-zinc-500 text-sm text-center py-2">Searching...</p>
                            ) : searchResults.length > 0 ? (
                                <div className="space-y-1">
                                    {searchResults.map((result) => (
                                        <button
                                            key={result._id}
                                            onClick={() => startConversation(result._id)}
                                            className="w-full flex items-center gap-3 p-2 hover:bg-zinc-900 rounded-lg transition-colors"
                                        >
                                            <img
                                                src={result.profilePicture || 'https://via.placeholder.com/40'}
                                                alt={result.username}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            <div className="text-left">
                                                <p className="font-semibold text-sm text-white">{result.username}</p>
                                                <p className="text-xs text-zinc-500">{result.bio?.substring(0, 30) || 'No bio'}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-500 text-sm text-center py-2">No users found</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Conversations List */}
                {conversations.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h3 className="text-lg font-light mb-2 text-white">No messages yet</h3>
                        <p className="text-zinc-500 text-sm">Search for users to start a conversation</p>
                    </div>
                ) : (
                    <div className="">
                        {conversations.map((conversation) => {
                            const otherUser = getOtherParticipant(conversation);
                            return (
                                <Link
                                    key={conversation._id}
                                    to={`/messages/${conversation._id}`}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 transition-colors"
                                >
                                    <img
                                        src={otherUser?.profilePicture || 'https://via.placeholder.com/56'}
                                        alt={otherUser?.username}
                                        className="w-14 h-14 rounded-full object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-sm text-white">{otherUser?.username}</p>
                                            <span className="text-xs text-zinc-600">
                                                {getTimeAgo(conversation.updatedAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-500 truncate">
                                            {conversation.lastMessage?.content || 'Start a conversation'}
                                        </p>
                                    </div>
                                    {conversation.unreadCount > 0 && (
                                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                            {conversation.unreadCount}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
