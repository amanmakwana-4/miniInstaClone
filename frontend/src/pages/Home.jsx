import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import PostCard from '../components/PostCard.jsx';
import StoriesBar from '../components/StoriesBar.jsx';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        try {
            setLoading(true);
            const response = await api.get('/feed');
            setPosts(response.data.posts || []);
        } catch (err) {
            setError('Failed to load feed. Please try again.');
            console.error('Error fetching feed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePostUpdate = (updatedPost) => {
        setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-zinc-500">Loading feed...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={fetchFeed} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto">
            {/* Stories */}
            <StoriesBar />

            {/* Posts Feed */}
            {posts.length === 0 ? (
                <div className="border-b border-zinc-800 p-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h2 className="text-xl font-semibold mb-2 text-white">No Posts Yet</h2>
                    <p className="text-zinc-500 mb-4">
                        Follow some users to see their posts in your feed, or create your first post!
                    </p>
                    <a href="/create" className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold inline-block">
                        Create Post
                    </a>
                </div>
            ) : (
                posts.map(post => (
                    <PostCard 
                        key={post._id} 
                        post={post} 
                        onUpdate={handlePostUpdate}
                    />
                ))
            )}
        </div>
    );
};

export default Home;
