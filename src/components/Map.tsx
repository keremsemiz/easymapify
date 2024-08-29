import React, { useRef, useEffect, useState } from 'react';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';

console.log('Mapbox Access Token:', process.env.REACT_APP_MAPBOX_ACCESS_TOKEN);

if (!process.env.REACT_APP_MAPBOX_ACCESS_TOKEN) {
  throw new Error('Missing Mapbox access token');
}

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || '';

const Map: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [startCity, setStartCity] = useState('');

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
          mapRef.current = null;
        }
      };
    }
  }, []);

  const createMarker = (coordinates: [number, number], description: string) => {
    const el = document.createElement('div');
    el.className = 'marker';
    el.innerHTML = description;
  
    new mapboxgl.Marker(el)
      .setLngLat(coordinates as LngLatLike)
      .addTo(mapRef.current!);
  
    const updateMarkerSize = () => {
      const zoomLevel = mapRef.current!.getZoom();
      const size = Math.max(5, 20 - (13 - zoomLevel) * 1.5);
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.fontSize = `${size / 2.5}px`;
  
      const point = mapRef.current!.project(coordinates as LngLatLike);
      el.style.transform = `translate(${point.x - el.offsetWidth / 2}px, ${point.y - el.offsetHeight / 2}px)`;
    };
  
    mapRef.current!.on('zoom', updateMarkerSize);
    updateMarkerSize();
  };
  

  const updateUserLocation = (coordinates: [number, number], description: string) => {
    if (mapRef.current) {
      mapRef.current.setCenter(coordinates as LngLatLike);
      mapRef.current.setZoom(13);
      createMarker(coordinates, description);
    }
  };

  useEffect(() => {
    if (mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          console.log(`Longitude: ${longitude}, Latitude: ${latitude}`);
          updateUserLocation([longitude, latitude], 'Your Location');
        },
        (error) => {
          console.error('Geolocation error:', error);
          updateUserLocation([-73.968285, 40.785091], 'Fallback location');
        },
        { enableHighAccuracy: true }
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

  const geocodeCity = async (city: string) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        return { longitude, latitude };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (startCity.trim() === '') return;

    const startCoordinates = await geocodeCity(startCity);

    if (startCoordinates && mapRef.current) {
      mapRef.current.setCenter([startCoordinates.longitude, startCoordinates.latitude]);
      mapRef.current.setZoom(13); // Adjust zoom level if necessary
      createMarker([startCoordinates.longitude, startCoordinates.latitude], startCity);
    }
  };

  return (
    <>
      <div className="searchHolder">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={startCity}
            onChange={(e) => setStartCity(e.target.value)}
            placeholder="Search City"
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
