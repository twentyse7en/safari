import React from 'react';
import { getYoutubeVideoId, getYoutubeThumbnailUrl } from '../utils';

function VideoItem({ video, onVideoClick, showViewOnMap = false, onViewOnMapClick }) {
    const videoId = getYoutubeVideoId(video.link);
    const thumbUrl = videoId ? getYoutubeThumbnailUrl(videoId) : 'https://via.placeholder.com/160x120.png?text=No+Preview';
    
    const handleVideoClick = (e) => {
        e.preventDefault();
        onVideoClick(video); // Pass the full video object
        window.open(video.link, '_blank');
    };
    
    return (
        <div className="flex items-start p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 hover:border-gray-200 transition-all duration-200 group">
            {/* Larger thumbnail with better aspect ratio */}
            <div className="flex-shrink-0 mr-4">
                <img 
                    src={thumbUrl} 
                    alt={`Thumbnail for ${video.title}`} 
                    className="h-30 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200" 
                />
            </div>
            
            {/* Content area with improved spacing */}
            <div className="flex-grow min-w-0">
                <a
                    href={video.link}
                    onClick={handleVideoClick}
                    className="font-semibold text-gray-900 hover:text-blue-600 hover:underline block cursor-pointer text-base leading-6 mb-2 line-clamp-2"
                >
                    {video.title}
                </a>
                
                {/* Enhanced metadata with better visual hierarchy */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                    <span className="flex items-center">
                        <span className="font-medium text-gray-700">Episode:</span>
                        <span className="ml-1">{video.episode}</span>
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center">
                        <span className="font-medium text-gray-700">Location:</span>
                        <span className="ml-1">{video.locationName}</span>
                    </span>
                </div>
                
                {/* Enhanced map button */}
                {showViewOnMap && onViewOnMapClick && (
                    <button
                        onClick={() => onViewOnMapClick(video)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                    >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        View on Map
                    </button>
                )}
            </div>
        </div>
    );
}

export default VideoItem;