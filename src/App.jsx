import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';
import { travelData as initialTravelData } from './data'; // Renamed to avoid conflict
import { LAST_WATCHED_KEY } from './utils';

function App() {
    const [selectedLocationName, setSelectedLocationName] = useState(null);
    const [lastWatchedVideo, setLastWatchedVideo] = useState(null);
    const [centerMapTarget, setCenterMapTarget] = useState(null);

    // Use a stable reference for travelData
    const travelData = useMemo(() => initialTravelData, []);


    useEffect(() => {
        const storedVideo = localStorage.getItem(LAST_WATCHED_KEY);
        if (storedVideo) {
            try {
                setLastWatchedVideo(JSON.parse(storedVideo));
            } catch (error) {
                console.error("Error parsing stored video data:", error);
                localStorage.removeItem(LAST_WATCHED_KEY); // Clear corrupted data
            }
        }
    }, []);

    const allVideosSorted = useMemo(() => {
        const videos = [];
        travelData.forEach(locationItem => {
            locationItem.videos.forEach(video => {
                videos.push({
                    ...video,
                    locationName: locationItem.locationName,
                    gmaps: locationItem.location,
                    lat: parseFloat(locationItem.lat),
                    long: parseFloat(locationItem.long)
                });
            });
        });
        return videos.sort((a, b) => a.episode - b.episode);
    }, [travelData]); // travelData is stable

    const selectedLocation = useMemo(() => {
        if (!selectedLocationName) return null;
        return travelData.find(loc => loc.locationName === selectedLocationName);
    }, [selectedLocationName, travelData]); // travelData is stable

    const upNextVideos = useMemo(() => {
        if (allVideosSorted.length === 0) return [];
        let startIndex = 0;
        if (lastWatchedVideo) {
            const lastWatchedIndex = allVideosSorted.findIndex(v => v.episode === lastWatchedVideo.episode);
            if (lastWatchedIndex !== -1) {
                startIndex = lastWatchedIndex + 1;
            }
        }
        if (startIndex >= allVideosSorted.length && lastWatchedVideo) {
             return [];
        }
        return allVideosSorted.slice(startIndex, startIndex + 3);
    }, [lastWatchedVideo, allVideosSorted]);

    const handleMarkerClick = useCallback((locationName) => {
        setSelectedLocationName(locationName);
    }, []);

    const handleVideoClick = useCallback((videoData) => {
        // Ensure videoData contains all necessary fields from VideoItem or popup click
         const fullVideoData = {
            link: videoData.link,
            episode: videoData.episode,
            title: videoData.title,
            locationName: videoData.locationName,
            lat: videoData.lat, // Should be a number already
            long: videoData.long, // Should be a number already
        };
        setLastWatchedVideo(fullVideoData);
        localStorage.setItem(LAST_WATCHED_KEY, JSON.stringify(fullVideoData));
    }, []);

    const handleViewOnMapClick = useCallback((video) => {
        setCenterMapTarget({ lat: video.lat, long: video.long, locationName: video.locationName, zoom: 12 });
        if (selectedLocationName !== video.locationName) {
            setSelectedLocationName(video.locationName);
        }
    }, [selectedLocationName]); // Dependency added

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <div className="flex-grow h-full w-3/5">
                    <MapComponent
                        travelData={travelData}
                        onMarkerClick={handleMarkerClick}
                        onVideoInPopupClick={handleVideoClick}
                        centerMapTarget={centerMapTarget}
                    />
                </div>
                <Sidebar
                    selectedLocation={selectedLocation}
                    lastWatchedVideo={lastWatchedVideo}
                    upNextVideos={upNextVideos}
                    onVideoClick={handleVideoClick}
                    onViewOnMapClick={handleViewOnMapClick}
                />
            </div>
        </div>
    );
}

export default App;