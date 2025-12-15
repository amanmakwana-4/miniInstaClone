import React from 'react';
import { Link } from 'react-router-dom';

const Comment = ({ comment, onDelete, canDelete }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMins = Math.floor(diffTime / (1000 * 60));
                return `${diffMins}m`;
            }
            return `${diffHours}h`;
        } else if (diffDays < 7) {
            return `${diffDays}d`;
        } else {
            return date.toLocaleDateString();
        }
    };

    return (
        <div className="flex group py-2">
            <Link to={`/profile/${comment.user?._id}`} className="flex-shrink-0">
                <img
                    src={comment.user?.profilePicture || 'https://via.placeholder.com/32'}
                    alt={comment.user?.username}
                    className="w-8 h-8 rounded-full object-cover"
                />
            </Link>
            <div className="ml-3 flex-1">
                <p className="text-sm text-white">
                    <Link
                        to={`/profile/${comment.user?._id}`}
                        className="font-semibold mr-2"
                    >
                        {comment.user?.username}
                    </Link>
                    <span className="text-zinc-300">{comment.text}</span>
                </p>
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-zinc-600">
                        {formatDate(comment.createdAt)}
                    </span>
                    {canDelete && (
                        <button
                            onClick={() => onDelete(comment._id)}
                            className="text-xs text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Comment;
