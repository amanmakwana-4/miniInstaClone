import React, { useState, useRef } from 'react';
import api from '../lib/api';

const CreateStory = ({ onClose, onStoryCreated }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [caption, setCaption] = useState('');
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    // Function to compress image
    const compressImage = (file, maxWidth = 1080, quality = 0.85) => {
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
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            
            if (file.size > 15 * 1024 * 1024) {
                setError('Image size should be less than 15MB');
                return;
            }
            
            setError('');
            try {
                const compressedBase64 = await compressImage(file, 1080, 0.85);
                setImageUrl(compressedBase64);
                setPreview(compressedBase64);
            } catch (err) {
                setError('Failed to process image. Please try another.');
                console.error('Image compression error:', err);
            }
        }
    };

    const handleSubmit = async () => {
        if (!imageUrl) {
            setError('Please select an image');
            return;
        }

        setLoading(true);
        try {
            await api.post('/stories', { imageUrl, caption });
            onStoryCreated && onStoryCreated();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create story');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <button onClick={onClose} className="text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="font-semibold text-white">New Story</h2>
                <button
                    onClick={handleSubmit}
                    disabled={loading || !imageUrl}
                    className="text-blue-500 font-semibold disabled:opacity-50"
                >
                    {loading ? 'Sharing...' : 'Share'}
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                {error && (
                    <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm border border-red-500/20 w-full max-w-lg">
                        {error}
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                {!preview ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border border-zinc-800 rounded-lg p-12 text-center cursor-pointer hover:border-zinc-600 transition-colors max-w-lg w-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="text-zinc-400 font-medium">Add to your story</p>
                        <p className="text-zinc-600 text-sm mt-1">Tap to upload a photo</p>
                    </div>
                ) : (
                    <div className="relative max-w-lg w-full">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full max-h-[60vh] object-contain rounded-lg"
                        />
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

                {preview && (
                    <div className="mt-4 max-w-lg w-full">
                        <input
                            type="text"
                            placeholder="Add a caption..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            maxLength={200}
                            className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-zinc-600 text-white placeholder-zinc-500"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateStory;
