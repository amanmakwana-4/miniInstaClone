import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const StoryViewer = ({ stories, initialUserIndex, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex || 0);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [viewers, setViewers] = useState([]);
    const [showViewers, setShowViewers] = useState(false);

    const currentUserStories = stories[currentUserIndex];
    const currentStory = currentUserStories?.stories[currentStoryIndex];
    const isOwnStory = currentUserStories?.user._id === user?.id;

    useEffect(() => {
        if (!currentStory) return;

        // Mark story as viewed
        api.post(`/stories/${currentStory._id}/view`).catch(console.error);

        // Fetch viewers if it's own story
        if (isOwnStory) {
            api.get(`/stories/${currentStory._id}/viewers`)
                .then(res => setViewers(res.data.viewers || []))
                .catch(console.error);
        }

        // Auto-advance timer
        const duration = 5000; // 5 seconds per story
        const interval = 50;
        let elapsed = 0;

        const timer = setInterval(() => {
            elapsed += interval;
            setProgress((elapsed / duration) * 100);

            if (elapsed >= duration) {
                goToNext();
            }
        }, interval);

        return () => clearInterval(timer);
    }, [currentUserIndex, currentStoryIndex, isOwnStory]);

    const goToNext = () => {
        if (currentStoryIndex < currentUserStories.stories.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
            setProgress(0);
        } else if (currentUserIndex < stories.length - 1) {
            setCurrentUserIndex(currentUserIndex + 1);
            setCurrentStoryIndex(0);
            setProgress(0);
        } else {
            onClose();
        }
    };

    const goToPrev = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(currentStoryIndex - 1);
            setProgress(0);
        } else if (currentUserIndex > 0) {
            setCurrentUserIndex(currentUserIndex - 1);
            const prevUserStories = stories[currentUserIndex - 1];
            setCurrentStoryIndex(prevUserStories.stories.length - 1);
            setProgress(0);
        }
    };

    const handleClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        if (x < width / 3) {
            goToPrev();
        } else {
            goToNext();
        }
    };

    if (!currentStory) return null;

    const getTimeAgo = (date) => {
        const hours = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60));
        if (hours < 1) return 'Just now';
        if (hours === 1) return '1h ago';
        return `${hours}h ago`;
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white z-10 p-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Story container */}
            <div 
                className="relative w-full max-w-md h-full max-h-[90vh] bg-zinc-900 rounded-lg overflow-hidden cursor-pointer"
                onClick={handleClick}
            >
                {/* Progress bars */}
                <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
                    {currentUserStories.stories.map((_, idx) => (
                        <div key={idx} className="flex-1 h-0.5 bg-white bg-opacity-30 rounded overflow-hidden">
                            <div 
                                className="h-full bg-white transition-all duration-100"
                                style={{ 
                                    width: idx < currentStoryIndex ? '100%' : 
                                           idx === currentStoryIndex ? `${progress}%` : '0%' 
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* User info */}
                <div 
                    className="absolute top-6 left-4 flex items-center gap-3 z-10 cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); onClose(); navigate(`/profile/${currentUserStories.user._id}`); }}
                >
                    <img
                        src={currentUserStories.user.profilePicture || 'https://via.placeholder.com/32'}
                        alt={currentUserStories.user.username}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white hover:opacity-80 transition-opacity"
                    />
                    <div className="text-white">
                        <span className="font-semibold text-sm hover:underline">{currentUserStories.user.username}</span>
                        <span className="text-xs text-zinc-400 ml-2">{getTimeAgo(currentStory.createdAt)}</span>
                    </div>
                </div>

                {/* Story image */}
                <img
                    src={currentStory.imageUrl}
                    alt="Story"
                    className="w-full h-full object-contain"
                />

                {/* Caption */}
                {currentStory.caption && !showViewers && (
                    <div className="absolute bottom-16 left-4 right-4 text-white text-center">
                        <p className="bg-black bg-opacity-50 px-4 py-2 rounded-lg">{currentStory.caption}</p>
                    </div>
                )}

                {/* View count for own stories */}
                {isOwnStory && (
                    <div className="absolute bottom-4 left-4 right-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowViewers(!showViewers); }}
                            className="flex items-center gap-2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{viewers.length} {viewers.length === 1 ? 'view' : 'views'}</span>
                        </button>

                        {/* Viewers list */}
                        {showViewers && viewers.length > 0 && (
                            <div className="mt-2 bg-zinc-900 rounded-lg max-h-48 overflow-y-auto border border-zinc-800" onClick={(e) => e.stopPropagation()}>
                                {viewers.map((view) => (
                                    <div 
                                        key={view._id} 
                                        className="flex items-center gap-3 p-3 border-b border-zinc-800 last:border-0 cursor-pointer hover:bg-zinc-800"
                                        onClick={() => { onClose(); navigate(`/profile/${view.viewer._id}`); }}
                                    >
                                        <img
                                            src={view.viewer.profilePicture || 'https://via.placeholder.com/32'}
                                            alt={view.viewer.username}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                        <span className="text-white text-sm font-medium">{view.viewer.username}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation arrows */}
            {currentUserIndex > 0 && (
                <button
                    onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                    className="absolute left-4 text-white p-2 hover:bg-white hover:bg-opacity-10 rounded-full"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}
            {currentUserIndex < stories.length - 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                    className="absolute right-4 text-white p-2 hover:bg-white hover:bg-opacity-10 rounded-full"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default StoryViewer;
