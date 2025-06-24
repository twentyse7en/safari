import React from 'react';
import VideoItem from './VideoItem';

function SelectedLocation({ location, onVideoClick }) {
    if (!location) {
        return <p className="text-gray-500">Click a marker on the map to see details here.</p>;
    }

    return (
        <div>
            <h3 className="text-lg font-medium text-slate-600">{location.locationName}</h3>
            <a href={location.location} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 hover:underline mb-4 inline-block">
                View on Google Maps
            </a>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {location.videos && location.videos.length > 0 ? (
                    location.videos.map(video => (
                        <VideoItem
                            key={video.episode}
                            // Ensure lat/long are available on the video object for VideoItem if needed by onVideoClick indirectly
                            video={{...video, locationName: location.locationName, lat: parseFloat(location.lat), long: parseFloat(location.long)}}
                            onVideoClick={onVideoClick}
                        />
                    ))
                ) : (
                    <p className="text-gray-500">No videos for this location.</p>
                )}
            </div>
        </div>
    );
}

export default SelectedLocation;