import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import CreateStory from './CreateStory';
import StoryViewer from './StoryViewer';

const StoriesBar = () => {
    const { user } = useAuth();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateStory, setShowCreateStory] = useState(false);
    const [viewingStoryIndex, setViewingStoryIndex] = useState(null);

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const res = await api.get('/stories/feed');
            setStories(res.data.stories || []);
        } catch (err) {
            console.error('Failed to fetch stories:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStoryCreated = () => {
        fetchStories();
    };

    // Find current user's story and separate from others
    const myStory = stories.find(s => s.user._id === user?.id);
    const otherStories = stories.filter(s => s.user._id !== user?.id);

    // Handle click on "Your story" button
    const handleMyStoryClick = () => {
        if (myStory) {
            // If user has stories, find its index and view it
            const myStoryIndex = stories.findIndex(s => s.user._id === user?.id);
            setViewingStoryIndex(myStoryIndex);
        } else {
            // If no story, open create story modal
            setShowCreateStory(true);
        }
    };

    if (loading) {
        return (
            <div className="bg-black border-b border-zinc-800 p-4 mb-2">
                <div className="flex gap-4 overflow-x-auto">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-1 animate-pulse">
                            <div className="w-16 h-16 rounded-full bg-zinc-800" />
                            <div className="w-12 h-2 bg-zinc-800 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-black border-b border-zinc-800 p-4 mb-2">
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {/* Your Story Button - Always first */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={handleMyStoryClick}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleMyStoryClick(); }}
                            className="relative cursor-pointer"
                        >
                            <div className={`p-0.5 rounded-full ${
                                myStory 
                                    ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600' 
                                    : 'bg-zinc-700'
                            }`}>
                                <img
                                    src={user?.profilePicture || 'https://via.placeholder.com/64'}
                                    alt="Your story"
                                    className="w-14 h-14 rounded-full object-cover border-2 border-white"
                                />
                            </div>
                            {/* Plus button to add story */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowCreateStory(true); }}
                                className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black hover:bg-blue-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <span className="text-xs text-zinc-400 truncate w-16 text-center">Your story</span>
                    </div>

                    {/* Other Users' Stories */}
                    {otherStories.map((userStory) => {
                        // Find the original index in the full stories array for viewing
                        const originalIndex = stories.findIndex(s => s.user._id === userStory.user._id);
                        return (
                            <button
                                key={userStory.user._id}
                                onClick={() => setViewingStoryIndex(originalIndex)}
                                className="flex flex-col items-center gap-1 flex-shrink-0"
                            >
                                <div className={`p-0.5 rounded-full ${
                                    userStory.hasUnviewed 
                                        ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600' 
                                        : 'bg-zinc-600'
                                }`}>
                                    <img
                                        src={userStory.user.profilePicture || 'https://via.placeholder.com/64'}
                                        alt={userStory.user.username}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-black"
                                    />
                                </div>
                                <span className="text-xs text-zinc-400 truncate w-16 text-center">
                                    {userStory.user.username}
                                </span>
                            </button>
                        );
                    })}

                    {otherStories.length === 0 && !myStory && (
                        <div className="flex items-center text-zinc-500 text-sm pl-4">
                            No stories yet. Be the first to share!
                        </div>
                    )}
                </div>
            </div>

            {/* Create Story Modal */}
            {showCreateStory && (
                <CreateStory 
                    onClose={() => setShowCreateStory(false)} 
                    onStoryCreated={handleStoryCreated}
                />
            )}

            {/* Story Viewer */}
            {viewingStoryIndex !== null && (
                <StoryViewer
                    stories={stories}
                    initialUserIndex={viewingStoryIndex}
                    onClose={() => setViewingStoryIndex(null)}
                />
            )}
        </>
    );
};

export default StoriesBar;
