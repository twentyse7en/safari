import React from 'react';
import SelectedLocation from './SelectedLocation';
import LastWatched from './LastWatched';
import UpNext from './UpNext';

function Sidebar({ selectedLocation, lastWatchedVideo, upNextVideos, onVideoClick, onViewOnMapClick }) {
    return (
        <aside id="sidebar" className="w-[400px] h-full bg-white p-6 overflow-y-auto shadow-lg space-y-6">
            <div className="border-b pb-6 mb-6 border-gray-200">
                <h2 className="text-xl font-semibold text-slate-700 mb-3">Selected Location</h2>
                <SelectedLocation location={selectedLocation} onVideoClick={onVideoClick} />
            </div>

            <div className="border-b pb-6 mb-6 border-gray-200">
                <h2 className="text-xl font-semibold text-slate-700 mb-3">Last Watched</h2>
                <LastWatched video={lastWatchedVideo} onVideoClick={onVideoClick} onViewOnMapClick={onViewOnMapClick} />
            </div>

            <div>
                <h2 className="text-xl font-semibold text-slate-700 mb-3">Up Next</h2>
                <UpNext videos={upNextVideos} onVideoClick={onVideoClick} onViewOnMapClick={onViewOnMapClick} />
            </div>
        </aside>
    );
}

export default Sidebar;