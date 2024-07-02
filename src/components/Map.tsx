import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoia3N6bSIsImEiOiJjbHk0aGtjbjcwMmpyMmlzY3B5ZTFjeGx6In0.Ba97fHvQRjXp6Se5vKXoSg';
const Map: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
  
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
  
    return <div className="map-container" ref={mapContainerRef} />;
  };
  
  export default Map;