import React, { memo, useCallback } from 'react';
import { getYoutubeVideoId, getYoutubeThumbnailUrl } from '../utils';

const MapIcon = memo(() => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
));

const VideoThumbnail = memo(({ video, onVideoClick }) => {
  const videoId = getYoutubeVideoId(video.link);
  const thumbnailUrl = videoId 
    ? getYoutubeThumbnailUrl(videoId) 
    : '/placeholder-thumbnail.jpg'; // Use local placeholder

  const handleClick = useCallback((e) => {
    e.preventDefault();
    onVideoClick?.(video);
    window.open(video.link, '_blank', 'noopener,noreferrer');
  }, [video, onVideoClick]);

  return (
    <div 
      className="relative aspect-video overflow-hidden bg-gray-100 group-hover:bg-gray-200 transition-colors"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick(e)}
      aria-label={`Play episode ${video.episode}`}
    >
      <img 
        src={thumbnailUrl}
        alt=""
        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
        loading="lazy"
        onError={(e) => {
          e.target.src = '/placeholder-thumbnail.jpg';
        }}
      />
    </div>
  );
});

const VideoMetadata = memo(({ episode, locationName }) => (
  <div className="p-3">
    <div className="text-sm font-medium text-gray-900 mb-1">
      Episode {episode}
    </div>
    <div className="text-sm text-gray-500 truncate" title={locationName}>
      {locationName}
    </div>
  </div>
));

const MapButton = memo(({ onViewOnMapClick, video }) => {
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onViewOnMapClick?.(video);
  }, [onViewOnMapClick, video]);

  return (
    <button
      onClick={handleClick}
      className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
      aria-label="View location on map"
      type="button"
    >
      <MapIcon />
    </button>
  );
});

const VideoItem = memo(({ 
  video, 
  onVideoClick, 
  showViewOnMap = false, 
  onViewOnMapClick,
  className = "" 
}) => {
  if (!video?.episode || !video?.locationName) {
    return null; // Fail gracefully for invalid data
  }

  return (
    <article 
      className={`
        bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg 
        transition-shadow duration-300 cursor-pointer group
        ${className}
      `}
    >
      <div className="relative">
        <VideoThumbnail video={video} onVideoClick={onVideoClick} />
        {showViewOnMap && onViewOnMapClick && (
          <MapButton onViewOnMapClick={onViewOnMapClick} video={video} />
        )}
      </div>
      
      <VideoMetadata 
        episode={video.episode} 
        locationName={video.locationName} 
      />
    </article>
  );
});

VideoItem.displayName = 'VideoItem';
VideoThumbnail.displayName = 'VideoThumbnail';
VideoMetadata.displayName = 'VideoMetadata';
MapButton.displayName = 'MapButton';
MapIcon.displayName = 'MapIcon';

export default VideoItem;