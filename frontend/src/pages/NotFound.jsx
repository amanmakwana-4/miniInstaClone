import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-zinc-700 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-white mb-2">
                    Page Not Found
                </h2>
                <p className="text-zinc-500 mb-8">
                    Sorry, the page you're looking for doesn't exist.
                </p>
                <Link to="/" className="text-blue-500 font-semibold hover:text-blue-400">
                    Go Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
