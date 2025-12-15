import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
    const { conversationId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [otherUser, setOtherUser] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null);
    const [mediaData, setMediaData] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const pollIntervalRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        
        // Poll for new messages every 3 seconds
        pollIntervalRef.current = setInterval(fetchMessages, 3000);

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/messages/conversations/${conversationId}/messages`);
            setMessages(res.data.messages || []);
            
            // Get other user info from first message or conversation
            if (res.data.messages?.length > 0) {
                const firstMsg = res.data.messages[0];
                const other = firstMsg.sender._id === user?.id ? null : firstMsg.sender;
                if (other) setOtherUser(other);
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Determine media type
        let type = null;
        if (file.type.startsWith('image/gif')) {
            type = 'gif';
        } else if (file.type.startsWith('image/')) {
            type = 'image';
        } else if (file.type.startsWith('video/')) {
            type = 'video';
        } else {
            alert('Please select an image, video, or GIF');
            return;
        }

        // Check file size (50MB max for videos, 10MB for images)
        const maxSize = type === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert(`File too large. Max size: ${type === 'video' ? '50MB' : '10MB'}`);
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            let data = event.target.result;
            
            // Compress images (not videos or GIFs)
            if (type === 'image') {
                data = await compressImage(data, 800, 0.8);
            }
            
            setMediaPreview(data);
            setMediaType(type);
            setMediaData(data);
        };
        reader.readAsDataURL(file);
    };

    const compressImage = (base64, maxWidth, quality) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = base64;
        });
    };

    const clearMedia = () => {
        setMediaPreview(null);
        setMediaType(null);
        setMediaData(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !mediaData) || sending) return;

        setSending(true);
        try {
            const payload = {
                content: newMessage.trim() || ''
            };
            
            // Only include media fields if media is present
            if (mediaData && mediaType) {
                payload.mediaUrl = mediaData;
                payload.mediaType = mediaType;
            }
            
            const res = await api.post(`/messages/conversations/${conversationId}/messages`, payload);
            setMessages([...messages, res.data.message]);
            setNewMessage('');
            clearMedia();
        } catch (err) {
            console.error('Failed to send message:', err);
            const errorMsg = err.response?.data?.message || 'Failed to send message. File might be too large.';
            alert(errorMsg);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString();
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = formatDate(message.createdAt);
        if (!groups[date]) groups[date] = [];
        groups[date].push(message);
        return groups;
    }, {});

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="text-zinc-500">Loading chat...</div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto h-screen flex flex-col bg-black">
            {/* Header */}
            <div className="border-b border-zinc-800 p-3 flex items-center gap-3 sticky top-0 bg-black z-10">
                <button onClick={() => navigate('/messages')} className="text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                {otherUser && (
                    <Link to={`/profile/${otherUser._id}`} className="flex items-center gap-3">
                        <img
                            src={otherUser.profilePicture || 'https://via.placeholder.com/40'}
                            alt={otherUser.username}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="font-semibold text-white text-sm">{otherUser.username}</span>
                    </Link>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
                {messages.length === 0 ? (
                    <div className="text-center text-zinc-500 py-8">
                        <p>No messages yet</p>
                        <p className="text-sm">Send a message to start the conversation</p>
                    </div>
                ) : (
                    Object.entries(groupedMessages).map(([date, dateMessages]) => (
                        <div key={date}>
                            <div className="text-center text-xs text-zinc-600 my-4">{date}</div>
                            <div className="space-y-2">
                                {dateMessages.map((message) => {
                                    const isOwn = message.sender._id === user?.id;
                                    if (!otherUser && !isOwn) {
                                        setOtherUser(message.sender);
                                    }
                                    return (
                                        <div
                                            key={message._id}
                                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                                <div
                                                    className={`px-4 py-2 rounded-2xl ${
                                                        isOwn
                                                            ? 'bg-blue-500 text-white rounded-br-md'
                                                            : 'bg-zinc-800 text-white rounded-bl-md'
                                                    }`}
                                                >
                                                    {/* Media content */}
                                                    {message.mediaUrl && (
                                                        <div className="mb-2">
                                                            {message.mediaType === 'video' ? (
                                                                <video 
                                                                    src={message.mediaUrl} 
                                                                    controls 
                                                                    className="max-w-full rounded-lg max-h-64"
                                                                />
                                                            ) : (
                                                                <img 
                                                                    src={message.mediaUrl} 
                                                                    alt="Media" 
                                                                    className="max-w-full rounded-lg max-h-64 cursor-pointer"
                                                                    onClick={() => window.open(message.mediaUrl, '_blank')}
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                    {/* Text content */}
                                                    {message.content && (
                                                        <p className="text-sm break-words">{message.content}</p>
                                                    )}
                                                </div>
                                                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                    <p className="text-xs text-zinc-600">
                                                        {formatTime(message.createdAt)}
                                                    </p>
                                                    {/* Read receipt for own messages */}
                                                    {isOwn && (
                                                        <span className="text-xs">
                                                            {message.read ? (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            ) : (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="fixed bottom-14 left-0 right-0 border-t border-zinc-800 p-3 bg-black">
                <div className="max-w-lg mx-auto">
                    {/* Media Preview */}
                    {mediaPreview && (
                        <div className="mb-3 relative inline-block">
                            {mediaType === 'video' ? (
                                <video src={mediaPreview} className="max-h-24 rounded-lg" />
                            ) : (
                                <img src={mediaPreview} alt="Preview" className="max-h-24 rounded-lg" />
                            )}
                            <button
                                type="button"
                                onClick={clearMedia}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                                ×
                            </button>
                        </div>
                    )}
                    <div className="flex gap-2 items-center">
                        {/* Media Upload Button */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*,video/*,.gif"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-zinc-400 hover:text-blue-500 transition-colors"
                            title="Send image, video, or GIF"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Message..."
                            className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-full focus:outline-none focus:border-zinc-600 text-white text-sm placeholder-zinc-500"
                            maxLength={1000}
                        />
                        <button
                            type="submit"
                            disabled={(!newMessage.trim() && !mediaData) || sending}
                            className="text-blue-500 font-semibold disabled:opacity-50 text-sm"
                        >
                            {sending ? '...' : 'Send'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Chat;
