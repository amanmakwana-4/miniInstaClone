import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    
    return children;
};

// Public Route - redirect to home if already authenticated
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }
    
    if (isAuthenticated) {
        return <Navigate to="/" />;
    }
    
    return children;
};

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="container mx-auto px-4 py-8 max-w-4xl">
                    <Routes>
                        <Route path="/login" element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        } />
                        <Route path="/signup" element={
                            <PublicRoute>
                                <Signup />
                            </PublicRoute>
                        } />
                        <Route path="/" element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        } />
                        <Route path="/create" element={
                            <ProtectedRoute>
                                <CreatePost />
                            </ProtectedRoute>
                        } />
                        <Route path="/profile/:userId" element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        } />
                        <Route path="/post/:postId" element={
                            <ProtectedRoute>
                                <PostDetail />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
