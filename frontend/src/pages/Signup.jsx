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
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [termsError, setTermsError] = useState('');
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
        setTermsError('');

        if (!acceptedTerms) {
            setTermsError('You must agree to the Terms, Privacy Policy and Cookies Policy to continue.');
            return;
        }

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
        <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4">
            <div className="max-w-sm w-full">
                {/* Signup Card */}
                <div className="bg-black border border-zinc-800 rounded-lg p-8 mb-4">
                    {/* Logo */}
                    <h1 className="text-4xl font-semibold italic text-center mb-4 text-white">
                        Instagram
                    </h1>
                    
                    <p className="text-zinc-500 text-center mb-6 text-sm">
                        Sign up to see photos and videos from your friends.
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm text-center border border-red-500/20">
                            {error}
                        </div>
                    )}

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
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
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
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
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
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
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !formData.email || !formData.username || !formData.password || !acceptedTerms}
                            className="w-full py-2 bg-blue-500 text-white font-semibold rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                        >
                            {loading ? 'Signing up...' : 'Sign Up'}
                        </button>
                    </form>

                    {/* Terms with clickable links and checkbox */}
                    <div className="mt-4 text-xs text-zinc-500">
                        <label className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => { setAcceptedTerms(e.target.checked); if (e.target.checked) setTermsError(''); }}
                                className="mt-1"
                            />
                            <span>
                                By signing up, you agree to our{' '}
                                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-500">Terms</a>,{' '}
                                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500">Privacy Policy</a>{' '}
                                and{' '}
                                <a href="/cookies" target="_blank" rel="noopener noreferrer" className="text-blue-500">Cookies Policy</a>.
                            </span>
                        </label>
                        {termsError && (
                            <div className="text-red-400 text-xs mt-2 text-center">{termsError}</div>
                        )}
                    </div>
                </div>

                {/* Login Link */}
                <div className="bg-black border border-zinc-800 rounded-lg p-4 text-center">
                    <p className="text-sm text-zinc-400">
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
