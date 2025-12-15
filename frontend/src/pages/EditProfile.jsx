import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const EditProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        profilePicture: ''
    });
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
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.put('/users/profile', formData);
            setSuccess('Profile updated successfully!');
            setTimeout(() => {
                navigate(`/profile/${user.id}`);
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg">
                {/* Header */}
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center">
                        <img
                            src={formData.profilePicture || 'https://via.placeholder.com/80'}
                            alt={formData.username}
                            className="w-20 h-20 rounded-full object-cover"
                        />
                        <div className="ml-6">
                            <h1 className="text-xl font-semibold">{formData.username}</h1>
                            <button className="text-blue-500 text-sm font-semibold mt-1">
                                Change Profile Photo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
                            {success}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Username */}
                    <div className="flex flex-col md:flex-row md:items-center">
                        <label className="md:w-1/4 font-semibold text-right pr-8 mb-2 md:mb-0">
                            Username
                        </label>
                        <div className="md:w-3/4">
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col md:flex-row md:items-center">
                        <label className="md:w-1/4 font-semibold text-right pr-8 mb-2 md:mb-0">
                            Email
                        </label>
                        <div className="md:w-3/4">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="flex flex-col md:flex-row md:items-start">
                        <label className="md:w-1/4 font-semibold text-right pr-8 mb-2 md:mb-0 md:pt-2">
                            Bio
                        </label>
                        <div className="md:w-3/4">
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                className="input-field resize-none"
                                rows={3}
                                maxLength={150}
                                placeholder="Tell us about yourself..."
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                {formData.bio.length}/150
                            </p>
                        </div>
                    </div>

                    {/* Profile Picture URL */}
                    <div className="flex flex-col md:flex-row md:items-center">
                        <label className="md:w-1/4 font-semibold text-right pr-8 mb-2 md:mb-0">
                            Profile Picture URL
                        </label>
                        <div className="md:w-3/4">
                            <input
                                type="url"
                                name="profilePicture"
                                value={formData.profilePicture}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="https://example.com/photo.jpg"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col md:flex-row md:items-center">
                        <div className="md:w-1/4"></div>
                        <div className="md:w-3/4 flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary px-6"
                            >
                                {loading ? 'Saving...' : 'Submit'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
