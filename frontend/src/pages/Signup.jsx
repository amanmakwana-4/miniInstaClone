import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (formData.username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        setLoading(true);

        try {
            await signup(formData.username, formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full">
                {/* Signup Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-8 mb-4">
                    {/* Logo */}
                    <h1 className="text-4xl font-semibold italic text-center mb-4">
                        Instagram
                    </h1>
                    
                    <p className="text-gray-500 text-center mb-6 text-sm">
                        Sign up to see photos and videos from your friends.
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !formData.email || !formData.username || !formData.password}
                            className="btn-primary w-full py-2"
                        >
                            {loading ? 'Signing up...' : 'Sign Up'}
                        </button>
                    </form>

                    {/* Terms */}
                    <p className="text-xs text-gray-500 text-center mt-6">
                        By signing up, you agree to our Terms, Privacy Policy and Cookies Policy.
                    </p>
                </div>

                {/* Login Link */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-sm">
                        Have an account?{' '}
                        <Link to="/login" className="text-blue-500 font-semibold">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
