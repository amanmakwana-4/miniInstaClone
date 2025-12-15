import React from 'react';

const Loading = ({ text = 'Loading...' }) => {
    return (
        <div className="flex flex-col justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
            <p className="text-zinc-500 text-sm">{text}</p>
        </div>
    );
};

export default Loading;
