import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full">
                {/* Login Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-8 mb-4">
                    {/* Logo */}
                    <h1 className="text-4xl font-semibold italic text-center mb-8">
                        Instagram
                    </h1>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="btn-primary w-full py-2"
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-4 text-gray-500 text-sm font-medium">OR</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Demo Credentials */}
                    <div className="text-center text-sm text-gray-600">
                        <p>Demo: demo@example.com / demo123</p>
                    </div>
                </div>

                {/* Sign Up Link */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-sm">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-500 font-semibold">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
