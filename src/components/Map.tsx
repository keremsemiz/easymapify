import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
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

        return () => {
          if (mapRef.current) {
            mapRef.current.remove();
          }
        };
      }
    }, []);
  
    useEffect(() => {
      if (mapRef.current) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            console.log(`Longitude: ${longitude}, Latitude: ${latitude}`);
            mapRef.current!.setCenter([longitude, latitude]);
            mapRef.current!.setZoom(13);
          },
          (error) => {
            console.error(error);
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
          mapRef.current.setCenter([longitude, latitude]);
          mapRef.current.setZoom(12);
        }
      }
    };

  
    return(
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