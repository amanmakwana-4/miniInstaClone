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
        <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4">
            <div className="max-w-sm w-full">
                {/* Login Card */}
                <div className="bg-black border border-zinc-800 rounded-lg p-8 mb-4">
                    {/* Logo */}
                    <h1 className="text-4xl font-semibold italic text-center mb-8 text-white">
                        amangram
                    </h1>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm text-center border border-red-500/20">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="w-full py-2 bg-blue-500 text-white font-semibold rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>
{/* 
                    <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-zinc-700"></div>
                        <span className="px-4 text-zinc-500 text-sm font-medium">OR</span>
                        <div className="flex-1 border-t border-zinc-700"></div>
                    </div>

                    <div className="text-center text-sm text-zinc-500">
                        <p>Demo: demo@example.com / demo123</p>
                    </div> */}
                </div>

                {/* Sign Up Link */}
                <div className="bg-black border border-zinc-800 rounded-lg p-4 text-center">
                    <p className="text-sm text-zinc-400">
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
