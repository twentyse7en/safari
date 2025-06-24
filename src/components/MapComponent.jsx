import React, { useEffect, useRef, useCallback } from 'react';
// If you installed Leaflet via npm:
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

function MapComponent({ travelData, onMarkerClick, onVideoInPopupClick, centerMapTarget }) {
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);
    const markersRef = useRef(null);
    const locationMarkersMapRef = useRef(new Map());

    // Memoized handler for popup video clicks
    const handlePopupVideoClick = useCallback((event) => {
        event.preventDefault();
        const link = event.currentTarget;
        const videoData = {
            link: link.dataset.videolink,
            episode: parseInt(link.dataset.videoepisode, 10),
            title: link.dataset.videotitle,
            locationName: link.dataset.locationname,
            lat: parseFloat(link.dataset.lat),
            long: parseFloat(link.dataset.long)
        };
        onVideoInPopupClick(videoData);
        window.open(videoData.link, '_blank');
    }, [onVideoInPopupClick]);

    useEffect(() => {
        if (mapRef.current && !leafletMapRef.current && window.L) { // Ensure L is available
            const L = window.L; // Access Leaflet global
            const mapInstance = L.map(mapRef.current);
            leafletMapRef.current = mapInstance;
            markersRef.current = L.featureGroup().addTo(mapInstance);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(mapInstance);

            travelData.forEach(item => {
                const lat = parseFloat(item.lat);
                const long = parseFloat(item.long);
                if (isNaN(lat) || isNaN(long)) return;

                let popupContent = `<strong class="text-base text-slate-700">${item.locationName}</strong><br />
                                    <a href="${item.location}" target="_blank" rel="noopener noreferrer" class="text-xs text-blue-600 hover:text-blue-800 hover:underline">View on Google Maps</a>`;
                if (item.videos && item.videos.length > 0) {
                    popupContent += '<br /><strong class="mt-2 inline-block text-sm text-slate-600">Videos:</strong><ul class="popup-video-list">';
                    item.videos.forEach(video => {
                        popupContent += `<li class="popup-video-item">
                                           <a href="${video.link}"
                                              data-videolink="${video.link}"
                                              data-videoepisode="${video.episode}"
                                              data-videotitle="${video.title.replace(/"/g, '"')}"
                                              data-locationname="${item.locationName.replace(/"/g, '"')}"
                                              data-lat="${lat}"
                                              data-long="${long}"
                                              class="video-link-in-popup">
                                                Ep ${video.episode}: ${video.title}
                                           </a>
                                         </li>`;
                    });
                    popupContent += '</ul>';
                } else {
                    popupContent += '<br /><em class="text-xs text-gray-500">No videos available.</em>';
                }

                const marker = L.marker([lat, long]).bindPopup(popupContent);
                marker.on('click', (e) => {
                    onMarkerClick(item.locationName);
                    mapInstance.setView(e.latlng, mapInstance.getZoom() < 10 ? 10 : mapInstance.getZoom());
                });
                markersRef.current.addLayer(marker);
                locationMarkersMapRef.current.set(item.locationName, marker);
            });

            if (markersRef.current.getLayers().length > 0) {
                mapInstance.fitBounds(markersRef.current.getBounds().pad(0.1));
            } else {
                mapInstance.setView([0, 0], 2);
            }

            mapInstance.on('popupopen', function (e) {
                const popupNode = e.popup.getElement();
                if (popupNode) {
                    popupNode.querySelectorAll('.video-link-in-popup').forEach(link => {
                        link.removeEventListener('click', handlePopupVideoClick); // Prevent duplicates
                        link.addEventListener('click', handlePopupVideoClick);
                    });
                }
            });
        }
        return () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
            }
        };
    }, [travelData, onMarkerClick, handlePopupVideoClick]); // handlePopupVideoClick is stable due to useCallback

    useEffect(() => {
        if (leafletMapRef.current && centerMapTarget) {
            const { lat, long, zoom, locationName } = centerMapTarget;
            leafletMapRef.current.setView([lat, long], zoom || 12);
            if (locationName) {
                const targetMarker = locationMarkersMapRef.current.get(locationName);
                if (targetMarker) {
                    targetMarker.openPopup();
                }
            }
        }
    }, [centerMapTarget]);

    return <div id="map-container-react" ref={mapRef} className="h-full w-full"></div>;
}

export default MapComponent;