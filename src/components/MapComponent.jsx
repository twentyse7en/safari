import React, { useEffect, useRef, useCallback, useState } from 'react';

function MapComponent({ travelData, onMarkerClick, onVideoInPopupClick, centerMapTarget }) {
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);
    const markersRef = useRef(null);
    const locationMarkersMapRef = useRef(new Map());
    const [selectedLocation, setSelectedLocation] = useState(null); // eslint-disable-line no-unused-vars

    const createPopupContent = (item) => {
        const videoCount = item.videos ? item.videos.length : 0;
        
        return `
            <div class="airbnb-popup">
                <div class="popup-header">
                    <div class="location-info">
                        <h3 class="location-title">${item.locationName}</h3>
                        <div class="location-meta">
                            <span class="video-count">${videoCount} video${videoCount !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>
                
                ${item.videos && item.videos.length > 0 ? `
                    <div class="videos-section">
                        <div class="videos-grid">
                            ${item.videos.slice(0, 3).map(video => `
                                <div class="video-card">
                                    <div class="video-thumbnail">
                                        <div class="play-overlay">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M8 5v14l11-7z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="video-info">
                                        <a href="${video.link}"
                                           data-videolink="${video.link}"
                                           data-videoepisode="${video.episode}"
                                           data-videotitle="${video.title.replace(/"/g, '&quot;')}"
                                           data-locationname="${item.locationName.replace(/"/g, '&quot;')}"
                                           data-lat="${item.lat}"
                                           data-long="${item.long}"
                                           class="video-link-in-popup">
                                            <div class="episode-badge">Ep ${video.episode}</div>
                                            <div class="video-title">${video.title}</div>
                                        </a>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        ${item.videos.length > 3 ? `
                            <div class="show-more">
                                <span>+${item.videos.length - 3} more videos</span>
                            </div>
                        ` : ''}
                    </div>
                ` : `
                    <div class="no-videos">
                        <div class="no-videos-icon">📹</div>
                        <span>No videos available</span>
                    </div>
                `}
                
                <div class="popup-footer">
                    <a href="${item.location}" target="_blank" rel="noopener noreferrer" class="maps-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15,3 21,3 21,9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        View on Google Maps
                    </a>
                </div>
            </div>
        `;
    };

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
        if (mapRef.current && !leafletMapRef.current && window.L) {
            const L = window.L;
            const mapInstance = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false
            });
            
            leafletMapRef.current = mapInstance;
            markersRef.current = L.featureGroup().addTo(mapInstance);

            // Add custom zoom control
            L.control.zoom({
                position: 'bottomright'
            }).addTo(mapInstance);

            // Use a more modern tile layer
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(mapInstance);

            travelData.forEach(item => {
                const lat = parseFloat(item.lat);
                const long = parseFloat(item.long);
                if (isNaN(lat) || isNaN(long)) return;

                // Create simple custom icon with video count
                const videoCount = item.videos ? item.videos.length : 0;
                const markerHtml = `
                    <div class="airbnb-marker-pin">
                        <div class="pin-content">${videoCount > 0 ? videoCount : '📍'}</div>
                    </div>
                `;

                const customIcon = L.divIcon({
                    html: markerHtml,
                    className: 'custom-marker-wrapper',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                });

                const marker = L.marker([lat, long], { icon: customIcon })
                    .bindPopup(createPopupContent(item), {
                        maxWidth: 320,
                        className: 'airbnb-popup-container',
                        closeButton: false
                    });

                marker.on('click', (e) => {
                    setSelectedLocation(item.locationName);
                    onMarkerClick(item.locationName);
                    mapInstance.setView(e.latlng, mapInstance.getZoom() < 4 ? 4 : mapInstance.getZoom());
                });

                markersRef.current.addLayer(marker);
                locationMarkersMapRef.current.set(item.locationName, marker);
            });

            // If markers exist, fit bounds but keep Serbia visible. Otherwise center on Serbia
            if (markersRef.current.getLayers().length > 0) {
                mapInstance.fitBounds(markersRef.current.getBounds().pad(0.1));
            } 
            // Default to Serbia at zoom level 3
            mapInstance.setView([44.0165, 21.0059], 3);

            mapInstance.on('popupopen', function (e) {
                const popupNode = e.popup.getElement();
                if (popupNode) {
                    popupNode.querySelectorAll('.video-link-in-popup').forEach(link => {
                        link.removeEventListener('click', handlePopupVideoClick);
                        link.addEventListener('click', handlePopupVideoClick);
                    });
                }
            });

            mapInstance.on('popupclose', function () {
                setSelectedLocation(null);
            });
        }

        return () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
            }
        };
    }, [travelData, onMarkerClick, handlePopupVideoClick]);

    useEffect(() => {
        if (leafletMapRef.current && centerMapTarget) {
            const { lat, long, zoom, locationName } = centerMapTarget;
            leafletMapRef.current.setView([lat, long], zoom || 12);
            if (locationName) {
                const targetMarker = locationMarkersMapRef.current.get(locationName);
                if (targetMarker) {
                    setSelectedLocation(locationName);
                    targetMarker.openPopup();
                }
            }
        }
    }, [centerMapTarget]);

    return (
        <>
            <style jsx>{`
                .custom-marker-wrapper {
                    background: transparent !important;
                    border: none !important;
                }

                .airbnb-marker-pin {
                    width: 32px;
                    height: 32px;
                    background: #FF385C;
                    border: 2px solid white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }

                .airbnb-marker-pin:hover {
                    background: #E31C5F;
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
                }

                .pin-content {
                    color: white;
                    font-weight: 600;
                    font-size: 11px;
                    line-height: 1;
                }

                .airbnb-popup-container .leaflet-popup-content-wrapper {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                    padding: 0;
                    overflow: hidden;
                }

                .airbnb-popup-container .leaflet-popup-content {
                    margin: 0;
                    padding: 0;
                }

                .airbnb-popup-container .leaflet-popup-tip {
                    background: white;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .airbnb-popup {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    width: 300px;
                }

                .popup-header {
                    padding: 20px 20px 16px;
                    border-bottom: 1px solid #EBEBEB;
                }

                .location-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #222222;
                    margin: 0 0 4px 0;
                    line-height: 1.3;
                }

                .location-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .video-count {
                    font-size: 14px;
                    color: #717171;
                    font-weight: 400;
                }

                .videos-section {
                    padding: 16px 20px;
                }

                .videos-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .video-card {
                    display: flex;
                    gap: 12px;
                    padding: 8px;
                    border-radius: 8px;
                    transition: background-color 0.2s ease;
                    cursor: pointer;
                }

                .video-card:hover {
                    background-color: #F7F7F7;
                }

                .video-thumbnail {
                    width: 48px;
                    height: 36px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    position: relative;
                }

                .play-overlay {
                    color: white;
                    opacity: 0.9;
                }

                .video-info {
                    flex: 1;
                    min-width: 0;
                }

                .video-link-in-popup {
                    text-decoration: none;
                    color: inherit;
                    display: block;
                }

                .episode-badge {
                    font-size: 11px;
                    font-weight: 600;
                    color: #FF385C;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 2px;
                }

                .video-title {
                    font-size: 13px;
                    color: #222222;
                    font-weight: 500;
                    line-height: 1.3;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                .show-more {
                    text-align: center;
                    padding: 8px;
                    margin-top: 8px;
                    background: #F7F7F7;
                    border-radius: 8px;
                    font-size: 12px;
                    color: #717171;
                    font-weight: 500;
                }

                .no-videos {
                    padding: 24px 20px;
                    text-align: center;
                    color: #717171;
                    font-size: 14px;
                }

                .no-videos-icon {
                    font-size: 24px;
                    margin-bottom: 8px;
                }

                .popup-footer {
                    padding: 16px 20px 20px;
                    border-top: 1px solid #EBEBEB;
                }

                .maps-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    color: #717171;
                    text-decoration: none;
                    font-size: 13px;
                    font-weight: 500;
                    transition: color 0.2s ease;
                }

                .maps-link:hover {
                    color: #222222;
                }

                .leaflet-control-zoom {
                    border: none !important;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
                }

                .leaflet-control-zoom a {
                    background: white !important;
                    color: #717171 !important;
                    border: none !important;
                    width: 36px !important;
                    height: 36px !important;
                    line-height: 36px !important;
                    font-size: 16px !important;
                    font-weight: 500 !important;
                }

                .leaflet-control-zoom a:hover {
                    background: #F7F7F7 !important;
                    color: #222222 !important;
                }

                .leaflet-control-zoom a:first-of-type {
                    border-radius: 8px 8px 0 0 !important;
                }

                .leaflet-control-zoom a:last-of-type {
                    border-radius: 0 0 8px 8px !important;
                }
            `}</style>
            <div 
                id="map-container-react" 
                ref={mapRef} 
                className="h-full w-full rounded-xl overflow-hidden"
                style={{ 
                    background: '#F7F7F7',
                    minHeight: '400px'
                }}
            />
        </>
    );
}

export default MapComponent;