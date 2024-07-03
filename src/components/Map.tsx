import React, { useRef, useEffect, useState } from 'react';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
import './Map.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoia3N6bSIsImEiOiJjbHk0aGtjbjcwMmpyMmlzY3B5ZTFjeGx6In0.Ba97fHvQRjXp6Se5vKXoSg';

const Map: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-74.5, 40],
        zoom: 9,
      });

      mapRef.current.on('load', () => {
        console.log('Map loaded');
      });

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
        }
      };
    }
  }, []);

  useEffect(() => {
    const createMarker = (coordinates: [number, number], description: string) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.innerHTML = description;

      const marker = new mapboxgl.Marker(el)
        .setLngLat(coordinates as LngLatLike)
        .addTo(mapRef.current!);

      // Adjust marker position when the map is zoomed or panned
      const updateMarkerPosition = () => {
        const canvas = mapRef.current!.getCanvas();
        const markerElement = el;
        const { offsetWidth, offsetHeight } = markerElement;

        const point = mapRef.current!.project(coordinates as LngLatLike);
        markerElement.style.transform = `translate(${point.x - offsetWidth / 2}px, ${point.y - offsetHeight / 2}px)`;
      };

      mapRef.current!.on('move', updateMarkerPosition);
      mapRef.current!.on('zoom', updateMarkerPosition);
      updateMarkerPosition(); // Initial position
    };

    const updateUserLocation = (coordinates: [number, number], description: string) => {
      if (mapRef.current) {
        mapRef.current.setCenter(coordinates as LngLatLike);
        mapRef.current.setZoom(13);
        createMarker(coordinates, description);
      }
    };

    if (mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          console.log(`Longitude: ${longitude}, Latitude: ${latitude}`);
          updateUserLocation([longitude, latitude], 'Your location');
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback location: Center of Central Park, NYC
          updateUserLocation([-73.968285, 40.785091], 'Fallback location');
        },
        {
          enableHighAccuracy: true,
        }
      );
    }
  }, []);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchQuery.trim() === '') return;

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        searchQuery
      )}.json?access_token=${mapboxgl.accessToken}`
    );
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      if (mapRef.current) {
        mapRef.current.setCenter([longitude, latitude] as LngLatLike);
        mapRef.current.setZoom(12);
      }
    }
  };

  return (
    <>
      <div className="searchHolder">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a city"
            className="searchInput"
          />
          <button type="submit">
            <i id="searchIcon" className="uil uil-search"></i>
          </button>
        </form>
      </div>
      <div className="titleHolder">
        <h3>Mapify</h3>
        <i id='compassIcon' className='uil uil-compass'></i>
      </div>
      <div className="zoom-controls">
        <button onClick={handleZoomIn}>+</button>
        <button onClick={handleZoomOut}>-</button>
      </div>
      <div className="map-container" ref={mapContainerRef} />
    </>
  );
};

export default Map;
