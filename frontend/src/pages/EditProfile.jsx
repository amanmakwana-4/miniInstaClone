import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const EditProfile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        profilePicture: ''
    });
    const [previewImage, setPreviewImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || '',
                profilePicture: user.profilePicture || ''
            });
            setPreviewImage(user.profilePicture || '');
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    // Function to compress image
    const compressImage = (file, maxWidth = 500, quality = 0.8) => {
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

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            
            // Validate file size (max 10MB before compression)
            if (file.size > 10 * 1024 * 1024) {
                setError('Image size should be less than 10MB');
                return;
            }
            
            setError('');
            
            try {
                // Compress the image
                const compressedBase64 = await compressImage(file, 500, 0.8);
                setPreviewImage(compressedBase64);
                setFormData({
                    ...formData,
                    profilePicture: compressedBase64
                });
            } catch (err) {
                setError('Failed to process image. Please try another.');
                console.error('Image compression error:', err);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await api.put('/users/profile', formData);
            setSuccess('Profile updated successfully!');
            
            // Update user in context
            if (updateUser && res.data.user) {
                updateUser(res.data.user);
            }
            
            setTimeout(() => {
                navigate(`/profile/${user.id}`);
            }, 1500);
        } catch (err) {
            console.error('Profile update error:', err);
            
            // Handle different error types
            if (err.response) {
                // Server responded with error
                setError(err.response.data?.message || 'Failed to update profile');
            } else if (err.request) {
                // Request made but no response (possibly payload too large)
                setError('Request failed. The image might be too large. Please try a smaller image.');
            } else {
                setError('Failed to update profile. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto">
            <div className="">
                {/* Header */}
                <div className="border-b border-zinc-800 p-4 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h1 className="text-base font-semibold text-white flex-1">Edit profile</h1>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="text-blue-500 font-semibold text-sm disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Done'}
                    </button>
                </div>

                {/* Profile Picture Section */}
                <div className="p-4 flex flex-col items-center border-b border-zinc-800">
                    <div className="relative mb-3">
                        <img
                            src={previewImage || 'https://via.placeholder.com/80'}
                            alt={formData.username}
                            className="w-20 h-20 rounded-full object-cover"
                            onClick={handleImageClick}
                        />
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <button 
                        type="button"
                        onClick={handleImageClick}
                        className="text-blue-500 text-sm font-semibold"
                    >
                        Change profile photo
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-500/10 text-green-400 p-3 rounded-lg text-sm border border-green-500/20">
                            {success}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm border border-red-500/20">
                            {error}
                        </div>
                    )}

                    {/* Username */}
                    <div>
                        <label className="block text-zinc-500 text-xs mb-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-zinc-600"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-zinc-500 text-xs mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-zinc-600"
                            required
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-zinc-500 text-xs mb-1">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-zinc-600 resize-none"
                            rows={3}
                            maxLength={150}
                            placeholder="Tell us about yourself..."
                        />
                        <p className="text-xs text-zinc-600 mt-1 text-right">
                            {formData.bio.length}/150
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
