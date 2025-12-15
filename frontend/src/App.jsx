import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Home from './pages/Home.jsx';
import Profile from './pages/Profile.jsx';
import CreatePost from './pages/CreatePost.jsx';
import PostDetail from './pages/PostDetail.jsx';
import Explore from './pages/Explore.jsx';
import EditProfile from './pages/EditProfile.jsx';
import Notifications from './pages/Notifications.jsx';
import Messages from './pages/Messages.jsx';
import Chat from './pages/Chat.jsx';
import NotFound from './pages/NotFound.jsx';

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-zinc-500">Loading...</div>
            </div>
        );
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    
    return children;
};
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-zinc-500">Loading...</div>
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
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <main className="container mx-auto px-4 pt-4 pb-20 max-w-lg">
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
                        <Route path="/explore" element={
                            <ProtectedRoute>
                                <Explore />
                            </ProtectedRoute>
                        } />
                        <Route path="/edit-profile" element={
                            <ProtectedRoute>
                                <EditProfile />
                            </ProtectedRoute>
                        } />
                        <Route path="/notifications" element={
                            <ProtectedRoute>
                                <Notifications />
                            </ProtectedRoute>
                        } />
                        <Route path="/messages" element={
                            <ProtectedRoute>
                                <Messages />
                            </ProtectedRoute>
                        } />
                        <Route path="/messages/:conversationId" element={
                            <ProtectedRoute>
                                <Chat />
                            </ProtectedRoute>
                        } />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}
export default App;
