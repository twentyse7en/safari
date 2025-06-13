/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from 'react';

// Travel data
const travelData = [
  {
    locationUrl: "https://www.google.com/maps/@38.995368,22.934067,6.00z",
    locationName: "Greece",
    videos: [
      {
        link: "https://www.youtube.com/watch?v=qanWVGrC6WU",
        title: "Oru Sanchariyude Diary Kurippukal | Greece | EPI 594"
      },
      {
        link: "https://www.youtube.com/watch?v=wEQKezKyhA0",
        title: "Oru Sanchariyude Diary Kurippukal | Greece | EPI 593"
      }
    ]
  },
  {
    locationUrl: "https://www.google.com/maps/@41.008240,28.978359,10z",
    locationName: "Turkey",
    videos: [
      {
        link: "https://www.youtube.com/watch?v=examplelink1",
        title: "Exploring Istanbul"
      }
    ]
  },
  {
    locationUrl: "https://www.google.com/maps/@51.507351,-0.127758,10z",
    locationName: "United Kingdom",
    videos: []
  },
  {
    locationUrl: "https://www.google.com/maps/@48.8566,2.3522,10z",
    locationName: "France",
    videos: [
      {
        link: "https://www.youtube.com/watch?v=paris_vid",
        title: "A Walk Through Paris"
      }
    ]
  },
  {
    locationUrl: "https://www.google.com/maps/@35.6895,139.6917,10z",
    locationName: "Japan",
    videos: [
      {
        link: "https://www.youtube.com/watch?v=tokyo_vid",
        title: "Tokyo City Scape"
      }
    ]
  }
];

// Utility functions
const extractCoordinates = (url) => {
  const match = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (match) {
    return [parseFloat(match[1]), parseFloat(match[2])];
  }
  return [48.8566, 2.3522]; // Default to Paris
};

// Map Component
const MapComponent = ({ locationUrl}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const coords = extractCoordinates(locationUrl);
    
    // Create map using Leaflet CDN (loaded globally)
    if (typeof L !== 'undefined') {
      const map = L.map(mapRef.current, {
        center: coords,
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        boxZoom: false,
        keyboard: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OSM'
      }).addTo(map);

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background: #FF385C; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker(coords, { icon: customIcon }).addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [locationUrl]);

  return (
    <div className="map-container">
      <div ref={mapRef} className="card-map" />
    </div>
  );
};

// Video Item Component
const VideoItem = ({ video }) => (
  <a 
    href={video.link} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="video-item"
  >
    <div className="video-icon">▶</div>
    <div className="video-info">
      <h5>{video.title}</h5>
      <div className="video-meta">Watch on YouTube</div>
    </div>
  </a>
);

// Bottom Sheet Component
const BottomSheet = ({ isOpen, onClose, location, videos }) => {
  const sheetRef = useRef(null);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragCurrentY, setDragCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setDragStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY - dragStartY;
    if (currentY > 0) {
      setDragCurrentY(currentY);
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${currentY}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (dragCurrentY > 100) {
      onClose();
    }
    
    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
    setDragCurrentY(0);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragStartY, dragCurrentY]);

  return (
    <>
      <div 
        className={`overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />
      <div 
        ref={sheetRef}
        className={`bottom-sheet ${isOpen ? 'open' : ''}`}
      >
        <div className="sheet-header">
          <div 
            className="sheet-handle"
            onTouchStart={handleTouchStart}
          />
          <h3 className="sheet-title">{location}</h3>
          <p className="sheet-subtitle">
            {videos.length} travel video{videos.length !== 1 ? 's' : ''} available
          </p>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="sheet-content">
          {videos.length === 0 ? (
            <div className="no-videos">
              <h4>📹 No videos yet</h4>
              <p>Check back later for travel content from {location}</p>
            </div>
          ) : (
            <div className="videos-section">
              <h4>Travel Videos</h4>
              {videos.map((video, index) => (
                <VideoItem key={index} video={video} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Travel Card Component
const TravelCard = ({ 
  data, 
  index, 
  isTop, 
  onSwipe, 
  onTap, 
  style = {},
  zIndex = 1 
}) => {
  const cardRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 });

  const handleStart = (e) => {
    if (!isTop) return;
    
    setIsDragging(true);
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    setDragStart({ x: clientX, y: clientY });
    
    if (cardRef.current) {
      cardRef.current.classList.add('dragging');
      cardRef.current.style.zIndex = '1000';
    }
  };

  const handleMove = (e) => {
    if (!isDragging || !isTop) return;
    e.preventDefault();
    
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    const currentX = clientX - dragStart.x;
    const currentY = clientY - dragStart.y;
    
    setDragCurrent({ x: currentX, y: currentY });
    
    if (cardRef.current) {
      const rotation = currentX * 0.1;
      cardRef.current.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;
      cardRef.current.style.opacity = 1 - Math.abs(currentX) / 300;
    }
  };

  const handleEnd = () => {
    if (!isDragging || !isTop) return;
    setIsDragging(false);
    
    if (cardRef.current) {
      cardRef.current.classList.remove('dragging');
    }
    
    const threshold = 100;
    if (Math.abs(dragCurrent.x) > threshold) {
      const direction = dragCurrent.x > 0 ? 'right' : 'left';
      animateOut(direction);
    } else {
      // Snap back
      if (cardRef.current) {
        cardRef.current.style.transform = '';
        cardRef.current.style.opacity = '';
        cardRef.current.style.zIndex = '';
      }
    }
    
    setDragCurrent({ x: 0, y: 0 });
  };

  const animateOut = (direction) => {
    if (!cardRef.current) return;
    
    const translateX = direction === 'right' ? 1000 : -1000;
    const rotation = direction === 'right' ? 30 : -30;
    
    cardRef.current.style.transition = 'all 0.3s ease-out';
    cardRef.current.style.transform = `translateX(${translateX}px) rotate(${rotation}deg)`;
    cardRef.current.style.opacity = '0';
    
    setTimeout(() => {
      onSwipe(direction);
    }, 300);
  };

  const handleClick = () => {
    if (isDragging || Math.abs(dragCurrent.x) > 5 || Math.abs(dragCurrent.y) > 5) {
      return;
    }
    onTap(data, index);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, dragStart, dragCurrent.x, dragCurrent.y]);

  return (
    <div 
      ref={cardRef}
      className="card"
      style={{ ...style, zIndex }}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      onClick={handleClick}
    >
      <MapComponent 
        locationUrl={data.locationUrl} 
        locationName={data.locationName} 
      />
      <div className="card-content">
        <h2 className="card-title">{data.locationName}</h2>
        <p className="card-subtitle">Discover amazing travel stories</p>
        <div className="card-stats">
          <div className="video-count">
            📹 {data.videos.length} video{data.videos.length !== 1 ? 's' : ''}
          </div>
          <div className="tap-hint">
            Tap to explore →
          </div>
        </div>
      </div>
    </div>
  );
};

// Action Buttons Component
const ActionButtons = ({ onSwipe }) => (
  <div className="swipe-actions">
    <button 
      className="action-btn pass-btn" 
      onClick={() => onSwipe('left')}
    >
      ✕
    </button>
    <button 
      className="action-btn like-btn" 
      onClick={() => onSwipe('right')}
    >
      ❤
    </button>
  </div>
);

// Header Component
const Header = () => (
  <div className="header">
    <h1>Discover</h1>
    <p>Travel stories from around the world</p>
  </div>
);

// No More Cards Component
const NoMoreCards = () => (
  <div className="no-more-cards">
    <h3>🌍 All caught up!</h3>
    <p>You've explored all available destinations</p>
  </div>
);

// Main App Component
const App = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedVideos, setSelectedVideos] = useState([]);

  const remainingCards = travelData.slice(currentCardIndex);
  const hasCards = remainingCards.length > 0;

  const handleSwipe = () => {
    setCurrentCardIndex(prev => prev + 1);
  };

  const handleCardTap = (data) => {
    setSelectedLocation(data.locationName);
    setSelectedVideos(data.videos);
    setBottomSheetOpen(true);
  };

  const handleCloseBottomSheet = () => {
    setBottomSheetOpen(false);
  };

  const getCardStyle = (index) => {
    if (index === 0) return {};
    if (index === 1) return { transform: 'scale(0.95) translateY(10px)', zIndex: 1 };
    if (index === 2) return { transform: 'scale(0.9) translateY(20px)', zIndex: 0 };
    return { display: 'none' };
  };

  return (
    <>
      <style>{`

      `}</style>

      <div className="app-container">
        <Header />
        
        <div className="cards-container">
          {hasCards ? (
            remainingCards.slice(0, 3).map((data, index) => (
              <TravelCard
                key={currentCardIndex + index}
                data={data}
                index={index}
                isTop={index === 0}
                onSwipe={handleSwipe}
                onTap={handleCardTap}
                style={getCardStyle(index)}
                zIndex={3 - index}
              />
            ))
          ) : (
            <NoMoreCards />
          )}
        </div>

        {hasCards && <ActionButtons onSwipe={handleSwipe} />}
      </div>

      <BottomSheet
        isOpen={bottomSheetOpen}
        onClose={handleCloseBottomSheet}
        location={selectedLocation}
        videos={selectedVideos}
      />
    </>
  );
};

export default App;