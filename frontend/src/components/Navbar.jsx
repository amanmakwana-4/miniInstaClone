import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-semibold italic">
                        Instagram
                    </Link>

                    {/* Navigation Links */}
                    {isAuthenticated ? (
                        <div className="flex items-center space-x-6">
                            <Link to="/" className="text-gray-700 hover:text-gray-900" title="Home">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </Link>
                            <Link to="/explore" className="text-gray-700 hover:text-gray-900" title="Explore">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </Link>
                            <Link to="/create" className="text-gray-700 hover:text-gray-900" title="Create Post">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </Link>
                            <Link to={`/profile/${user?.id}`} className="text-gray-700 hover:text-gray-900" title="Profile">
                                <img 
                                    src={user?.profilePicture || 'https://via.placeholder.com/32'} 
                                    alt="Profile" 
                                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                />
                            </Link>
                            <button 
                                onClick={handleLogout}
                                className="text-gray-700 hover:text-gray-900 text-sm font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="btn-primary text-sm">
                                Log In
                            </Link>
                            <Link to="/signup" className="text-blue-500 font-semibold text-sm">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
