import React from 'react';
import VideoItem from './VideoItem';

function LastWatched({ video, onVideoClick, onViewOnMapClick }) {
    if (!video) {
        return <p className="text-gray-500">No video watched yet. Click a video to mark it as watched.</p>;
    }
    return (
        <VideoItem
            video={video}
            onVideoClick={onVideoClick}
            showViewOnMap={true}
            onViewOnMapClick={onViewOnMapClick}
        />
    );
}

export default LastWatched;