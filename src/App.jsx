/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from 'react';
import { travelData } from './travelData';

// Map Component
const MapComponent = ({ lat, long, locationUrl }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const coords = [lat, long];
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
        keyboard: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OSM',
      }).addTo(map);

      const customIcon = L.divIcon({
        className: '', // No longer need a separate class name
        html: '<div class="bg-[#FF385C] border-[3px] border-white rounded-full w-5 h-5 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
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
  }, [lat, long, locationUrl]); // Added lat, long to dependency array

  return (
    <div className="w-full h-[300px] relative rounded-t-[24px] overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

// Video Item Component
const VideoItem = ({ video }) => (
  <a
    href={video.link}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center p-4 border border-[#EBEBEB] rounded-xl mb-3 cursor-pointer transition-all duration-200 ease-in-out no-underline text-inherit hover:border-[#FF385C] hover:shadow-[0_2px_8px_rgba(255,56,92,0.1)]"
  >
    <div className="w-12 h-[34px] bg-[#FF385C] rounded-xl flex items-center justify-center text-white text-xl mr-4 flex-shrink-0">
      ▶
    </div>
    <div className=""> {/* Wrapper for text content */}
      <h5 className="text-base font-semibold text-[#222] mb-1 leading-[1.3]">{video.title}</h5>
      <div className="text-sm text-[#717171]">Watch on YouTube</div>
    </div>
  </a>
);

// Bottom Sheet Component
const BottomSheet = ({ isOpen, onClose, location, videos }) => {
  const sheetRef = useRef(null);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragCurrentY, setDragCurrentY] = useState(0);
  const [isDraggingSheet, setIsDraggingSheet] = useState(false); // Renamed to avoid conflict

  const handleTouchStart = (e) => {
    setIsDraggingSheet(true);
    setDragStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!isDraggingSheet) return;
    const currentY = e.touches[0].clientY - dragStartY;
    if (currentY > 0) {
      setDragCurrentY(currentY);
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${currentY}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingSheet) return;
    setIsDraggingSheet(false);

    if (dragCurrentY > 100) {
      onClose();
    }

    if (sheetRef.current) {
      sheetRef.current.style.transform = ''; // Reset to CSS-defined transform
    }
    setDragCurrentY(0);
  };
  
  // Effect for touch events on document - ensure it only runs when dragging
  useEffect(() => {
    if (!isDraggingSheet) return;

    // Add listeners to document for wider drag area
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDraggingSheet, dragStartY, dragCurrentY]); // Dependencies for the effect

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 transition-all duration-300 ease-in-out z-[999] ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-[24px] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-[1000] max-h-[70vh] overflow-hidden ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="px-6 pt-5 pb-4 border-b border-[#EBEBEB] relative">
          <div
            className="w-10 h-1 bg-[#DDDDDD] rounded-[2px] mx-auto mb-5 cursor-grab"
            onTouchStart={handleTouchStart} // Only handle touch start on the handle itself
          />
          <h3 className="text-2xl font-bold text-[#222] mb-1">{location}</h3>
          <p className="text-[#717171] text-base">
            {videos.length} travel video{videos.length !== 1 ? 's' : ''} available
          </p>
          <button
            className="absolute top-5 right-6 bg-transparent border-0 text-2xl cursor-pointer text-[#717171] w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F7F7F7]"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(70vh-100px)]">
          {videos.length === 0 ? (
            <div className="text-center py-10 px-5 text-[#717171]">
              <h4 className="text-lg font-semibold text-[#222] mb-4">📹 No videos yet</h4>
              <p className="text-base">Check back later for travel content from {location}</p>
            </div>
          ) : (
            <div className=""> {/* videos-section wrapper */}
              <h4 className="text-lg font-semibold text-[#222] mb-4">Travel Videos</h4>
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
const TravelCard = ({ data, index, isTop, onSwipe, onTap, style = {}, zIndex = 1 }) => {
  const cardRef = useRef(null);
  const [isDraggingCard, setIsDraggingCard] = useState(false); // Renamed
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 });

  const handleStart = (e) => {
    if (!isTop) return;

    setIsDraggingCard(true);
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    setDragStart({ x: clientX, y: clientY });

    if (cardRef.current) {
      cardRef.current.classList.add('dragging'); // JS adds 'dragging' class for transition override
      cardRef.current.style.zIndex = '1000'; // Higher z-index while dragging
    }
  };

  const handleMove = (e) => {
    if (!isDraggingCard || !isTop) return;
    // e.preventDefault(); // Be cautious with preventDefault on touchmove, can prevent scroll

    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    const currentX = clientX - dragStart.x;
    const currentY = clientY - dragStart.y;

    setDragCurrent({ x: currentX, y: currentY });

    if (cardRef.current) {
      const rotation = currentX * 0.1;
      cardRef.current.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;
      cardRef.current.style.opacity = `${1 - Math.abs(currentX) / 300}`;
    }
  };

  const handleEnd = () => {
    if (!isDraggingCard || !isTop) return;
    setIsDraggingCard(false);

    if (cardRef.current) {
      cardRef.current.classList.remove('dragging');
      // zIndex reset is handled by onSwipe updating the component props
    }

    const threshold = 100;
    if (Math.abs(dragCurrent.x) > threshold) {
      const direction = dragCurrent.x > 0 ? 'right' : 'left';
      animateOut(direction);
    } else {
      if (cardRef.current) {
        cardRef.current.style.transform = '';
        cardRef.current.style.opacity = '';
        cardRef.current.style.zIndex = `${zIndex}`; // Reset to its original zIndex prop
      }
    }
    setDragCurrent({ x: 0, y: 0 });
  };

  const animateOut = (direction) => {
    if (!cardRef.current) return;

    const translateX = direction === 'right' ? 1000 : -1000;
    const rotation = direction === 'right' ? 30 : -30;

    cardRef.current.style.transition = 'all 0.3s ease-out'; // Specific animation transition
    cardRef.current.style.transform = `translateX(${translateX}px) rotate(${rotation}deg)`;
    cardRef.current.style.opacity = '0';

    setTimeout(() => {
      onSwipe(direction);
      // Reset card style after animation for potential reuse or cleanup if it's unmounted
      if (cardRef.current) {
         // This might not be necessary if component unmounts
         cardRef.current.style.transition = ''; // Reset to allow Tailwind transition to take over
      }
    }, 300);
  };

  const handleClick = () => {
    if (isDraggingCard || Math.abs(dragCurrent.x) > 5 || Math.abs(dragCurrent.y) > 5) {
      return; // Considered a drag, not a tap
    }
    onTap(data, index);
  };

  useEffect(() => {
    if (isDraggingCard) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('touchmove', handleMove, { passive: false }); // passive:false if preventDefault is used
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDraggingCard, dragStart, dragCurrent.x, dragCurrent.y]); // Added all dependencies

  return (
    <div
      ref={cardRef}
      className="absolute w-full max-w-[340px] h-[500px] bg-white rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.15)] cursor-grab active:cursor-grabbing transition-transform duration-200 ease-out overflow-hidden select-none"
      style={{ ...style, zIndex }}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      onClick={handleClick}
    >
      <MapComponent
        lat={data.lat ?? 0}
        long={data.long ?? 0}
        locationUrl={data.locationUrl}
        locationName={data.locationName}
      />
      <div className="p-6 h-[200px] flex flex-col justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-[#222] mb-2 tracking-[-0.5px]">{data.locationName}</h2>
          <p className="text-base text-[#717171] mb-5">Discover amazing travel stories</p>
        </div>
        <div className="flex justify-between items-center"> {/* Use justify-between as per original CSS */}
          {/* Example of conditional rendering for video count if it were active */}
          {/* {data.videos.length > 0 ? (
            <div className="flex items-center gap-1.5 text-[#FF385C] font-semibold text-sm">
              📹 {data.videos.length} video{data.videos.length !== 1 ? 's' : ''}
            </div>
          ) : <div />} */}
          <div /> {/* Empty div to push tap-hint to the right when video count is not shown */}
          <div className="text-[#717171] text-sm flex items-center gap-1.5">
            Tap to explore →
          </div>
        </div>
      </div>
    </div>
  );
};

// Action Buttons Component
const ActionButtons = ({ onSwipe }) => (
  <div className="flex justify-center gap-[30px] pt-[30px] pb-[90px]">
    <button
      className="w-14 h-14 rounded-full cursor-pointer flex items-center justify-center text-2xl transition-all duration-200 ease-in-out shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:scale-110 bg-white text-[#ccc]"
      onClick={() => onSwipe('left')}
    >
      ✕
    </button>
    <button
      className="w-14 h-14 rounded-full cursor-pointer flex items-center justify-center text-2xl transition-all duration-200 ease-in-out shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:scale-110 bg-[#FF385C] text-white"
      onClick={() => onSwipe('right')}
    >
      ❤
    </button>
  </div>
);

// Header Component
const Header = () => (
  <div className="pt-8 px-6 pb-8 text-left relative overflow-hidden">
  {/* Subtle gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 to-white/70"></div>
  
  {/* Floating elements for depth */}
  <div className="absolute top-8 right-8 w-32 h-32 bg-rose-50 rounded-full opacity-40 blur-3xl"></div>
  <div className="absolute top-16 left-12 w-24 h-24 bg-blue-50 rounded-full opacity-30 blur-2xl"></div>
  
  <div className="relative z-10">
    <div className="mb-8">
      <h1 className="text-5xl font-bold mb-4 text-gray-900 leading-tight tracking-[-0.02em]">
        Discover
      </h1>
      <div className="w-12 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 mb-4"></div>
      <p className="text-xl text-gray-600 font-light leading-relaxed max-w-xs">
        Travel stories from around the world
      </p>
    </div>
  </div>
</div>
);

// No More Cards Component
const NoMoreCards = () => (
  <div className="text-center text-white p-10">
    <h3 className="text-2xl mb-3">🌍 All caught up!</h3>
    <p className="text-base">You've explored all available destinations</p>
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
    setCurrentCardIndex((prev) => prev + 1);
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
    if (index === 0) return {}; // Top card
    if (index === 1) return { transform: 'scale(0.95) translateY(10px)' };
    if (index === 2) return { transform: 'scale(0.9) translateY(20px)' };
    return { display: 'none' }; // Cards beyond the 3rd are hidden
  };
  
  return (
    <div className='font-sans bg-gradient-to-br from-gray-50 via-white to-rose-50/30 min-h-screen overflow-hidden relative m-0 p-0 box-border'>
      <div className="flex flex-col h-screen max-w-[400px] mx-auto relative">
        <Header />
        <div className="flex-1 relative px-5 flex items-center justify-center">
          {hasCards ? (
            remainingCards.slice(0, 3).map((cardData, idx) => ( // Renamed to avoid conflict with outer 'index'
              <TravelCard
                key={cardData.id || currentCardIndex + idx} // Use a stable key if available
                data={cardData}
                index={idx} // This is the index in the rendered slice (0, 1, 2)
                isTop={idx === 0}
                onSwipe={handleSwipe}
                onTap={handleCardTap}
                style={getCardStyle(idx)}
                zIndex={3 - idx} // Higher index = lower z-index (further back)
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
    </div>
  );
};

export default App;