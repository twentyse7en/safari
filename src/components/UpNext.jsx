import React from 'react';
import VideoItem from './VideoItem';

function UpNext({ videos, onVideoClick, onViewOnMapClick }) {
    if (!videos || videos.length === 0) {
        return <p className="text-gray-500">No upcoming videos to display.</p>;
    }
    return (
        <div className="space-y-3">
            {videos.map(video => (
                <VideoItem
                    key={video.episode}
                    video={video}
                    onVideoClick={onVideoClick}
                    showViewOnMap={true}
                    onViewOnMapClick={onViewOnMapClick}
                />
            ))}
        </div>
    );
}

export default UpNext;