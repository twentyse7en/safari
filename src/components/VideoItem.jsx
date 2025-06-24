import React from 'react';
import { getYoutubeVideoId, getYoutubeThumbnailUrl } from '../utils';

function VideoItem({ video, onVideoClick, showViewOnMap = false, onViewOnMapClick }) {
    const videoId = getYoutubeVideoId(video.link);
    const thumbUrl = videoId ? getYoutubeThumbnailUrl(videoId) : 'https://via.placeholder.com/120x90.png?text=No+Preview';

    const handleVideoClick = (e) => {
        e.preventDefault();
        onVideoClick(video); // Pass the full video object
        window.open(video.link, '_blank');
    };

    return (
        <div className="flex items-start p-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-150">
            <img src={thumbUrl} alt={`Thumbnail for ${video.title}`} className="w-28 h-auto object-cover rounded mr-3 flex-shrink-0" />
            <div className="flex-grow">
                <a
                    href={video.link}
                    onClick={handleVideoClick}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline block cursor-pointer"
                >
                    {video.title}
                </a>
                <p className="text-xs text-gray-500">Episode: {video.episode} | Location: {video.locationName}</p>
                {showViewOnMap && onViewOnMapClick && (
                    <button
                        onClick={() => onViewOnMapClick(video)}
                        className="mt-1 text-xs bg-sky-500 hover:bg-sky-600 text-white py-1 px-2 rounded"
                    >
                        View on Map
                    </button>
                )}
            </div>
        </div>
    );
}

export default VideoItem;