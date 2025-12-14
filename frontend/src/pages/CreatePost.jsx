import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const CreatePost = () => {
    const [imageUrl, setImageUrl] = useState('');
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState('');
    const navigate = useNavigate();

    const handleImageUrlChange = (e) => {
        const url = e.target.value;
        setImageUrl(url);
        setPreview(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!imageUrl.trim()) {
            setError('Please provide an image URL');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/posts', {
                imageUrl: imageUrl.trim(),
                caption: caption.trim()
            });
            navigate(`/post/${response.data.post._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg">
                {/* Header */}
                <div className="border-b border-gray-200 p-4">
                    <h1 className="text-xl font-semibold text-center">Create New Post</h1>
                </div>

                <div className="p-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image URL Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Image URL
                            </label>
                            <input
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                value={imageUrl}
                                onChange={handleImageUrlChange}
                                className="input-field"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Enter a direct link to an image (JPG, PNG, GIF)
                            </p>
                        </div>

                        {/* Image Preview */}
                        {preview && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preview
                                </label>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full max-h-96 object-contain bg-gray-100"
                                        onError={() => setPreview('')}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Caption Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Caption
                            </label>
                            <textarea
                                placeholder="Write a caption..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                className="input-field resize-none"
                                rows={4}
                                maxLength={2200}
                            />
                            <p className="text-xs text-gray-500 mt-1 text-right">
                                {caption.length}/2200
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="btn-secondary flex-1 py-3"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !imageUrl.trim()}
                                className="btn-primary flex-1 py-3"
                            >
                                {loading ? 'Posting...' : 'Share Post'}
                            </button>
                        </div>
                    </form>

                    {/* Sample Image URLs */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Sample Image URLs:</h3>
                        <div className="space-y-1 text-xs text-gray-500">
                            <p className="cursor-pointer hover:text-blue-500" onClick={() => {
                                setImageUrl('https://picsum.photos/800/600');
                                setPreview('https://picsum.photos/800/600');
                            }}>
                                • https://picsum.photos/800/600 (Random image)
                            </p>
                            <p className="cursor-pointer hover:text-blue-500" onClick={() => {
                                setImageUrl('https://picsum.photos/800/800');
                                setPreview('https://picsum.photos/800/800');
                            }}>
                                • https://picsum.photos/800/800 (Square image)
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
