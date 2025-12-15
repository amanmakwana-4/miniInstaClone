import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const CreatePost = () => {
    const [imageUrl, setImageUrl] = useState('');
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState('');
    const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleImageUrlChange = (e) => {
        const url = e.target.value;
        setImageUrl(url);
        setPreview(url);
    };

    // Function to compress image
    const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to base64 with compression
                    const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressedBase64);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setError('');
            // Accept both images and videos
            if (file.type.startsWith('image/')) {
                // Validate file size (max 15MB before compression)
                if (file.size > 15 * 1024 * 1024) {
                    setError('Image size should be less than 15MB');
                    return;
                }

                try {
                    const compressedBase64 = await compressImage(file, 1200, 0.85);
                    setImageUrl(compressedBase64);
                    setPreview(compressedBase64);
                } catch (err) {
                    setError('Failed to process image. Please try another.');
                    console.error('Image compression error:', err);
                }
            } else if (file.type.startsWith('video/')) {
                // Validate video size (max 50MB)
                if (file.size > 50 * 1024 * 1024) {
                    setError('Video size should be less than 50MB');
                    return;
                }

                try {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const base64 = ev.target.result;
                        setImageUrl(base64);
                        setPreview(base64);
                    };
                    reader.readAsDataURL(file);
                } catch (err) {
                    setError('Failed to process video. Please try another.');
                    console.error('Video read error:', err);
                }
            } else {
                setError('Please select an image or video file');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!imageUrl.trim()) {
            setError('Please provide an image');
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
            console.error('Create post error:', err);
            
            // Handle validation errors
            if (err.response?.data?.errors) {
                const errorMessages = err.response.data.errors.map(e => e.msg).join(', ');
                setError(errorMessages);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.request) {
                setError('Request failed. The image might be too large. Please try a smaller image.');
            } else {
                setError('Failed to create post. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto">
            <div className="bg-black">
                {/* Header */}
                <div className="border-b border-zinc-800 p-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h1 className="text-base font-semibold text-white">New Post</h1>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !imageUrl.trim()}
                        className="text-blue-500 font-semibold text-sm disabled:opacity-50"
                    >
                        {loading ? 'Sharing...' : 'Share'}
                    </button>
                </div>

                <div className="p-4">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm border border-red-500/20">
                            {error}
                        </div>
                    )}

                    {/* Upload Mode Toggle */}
                    <div className="flex mb-4 border-b border-zinc-800">
                        <button
                            type="button"
                            onClick={() => { setUploadMode('file'); setImageUrl(''); setPreview(''); }}
                            className={`flex-1 py-3 text-sm font-medium ${
                                uploadMode === 'file' 
                                    ? 'text-white border-b border-white' 
                                    : 'text-zinc-500'
                            }`}
                        >
                            Upload
                        </button>
                        <button
                            type="button"
                            onClick={() => { setUploadMode('url'); setImageUrl(''); setPreview(''); }}
                            className={`flex-1 py-3 text-sm font-medium ${
                                uploadMode === 'url' 
                                    ? 'text-white border-b border-white' 
                                    : 'text-zinc-500'
                            }`}
                        >
                            URL
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {uploadMode === 'file' ? (
                            /* File Upload */
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*,video/*"
                                    className="hidden"
                                />
                                    {!preview ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border border-zinc-800 rounded-lg p-12 text-center cursor-pointer hover:border-zinc-600 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-zinc-400 font-medium">Tap to select a photo</p>
                                        <p className="text-zinc-600 text-sm mt-1">JPG, PNG up to 15MB; MP4/WebM up to 50MB</p>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        {preview.startsWith('data:video') || preview.match(/\.(mp4|webm|ogg)(\?.*)?$/i) ? (
                                            <video src={preview} className="w-full max-h-96 object-contain bg-zinc-900 rounded-lg" controls />
                                        ) : (
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="w-full max-h-96 object-contain bg-zinc-900 rounded-lg"
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => { setImageUrl(''); setPreview(''); }}
                                            className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-2 rounded-full"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Image URL Input */
                            <div>
                                <input
                                    type="url"
                                    placeholder="Paste image URL"
                                    value={imageUrl}
                                    onChange={handleImageUrlChange}
                                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                                />
                            </div>
                        )}

                        {/* Image Preview for URL mode */}
                        {uploadMode === 'url' && preview && (
                            <div className="mt-4">
                                <div className="border border-zinc-800 rounded-lg overflow-hidden">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full max-h-96 object-contain bg-zinc-900"
                                        onError={() => setPreview('')}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Caption Input */}
                        <div>
                            <textarea
                                placeholder="Write a caption..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                className="w-full px-3 py-2 bg-transparent border-0 text-sm text-white placeholder-zinc-500 focus:outline-none resize-none"
                                rows={3}
                                maxLength={2200}
                            />
                            <p className="text-xs text-zinc-600 text-right">
                                {caption.length}/2200
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
