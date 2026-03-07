"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

interface MapViewProps {
  center?: [number, number];
  boundaryGeoJSON?: GeoJSON.Polygon | null;
  className?: string;
}

export function MapView({ center, boundaryGeoJSON, className = "" }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || !mapboxgl.accessToken) return;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: center ?? [144.9631, -37.8136],
      zoom: 18,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.on("load", () => setLoaded(true));
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !center) return;
    mapInstance.current.flyTo({ center, zoom: 18 });
  }, [center]);

  useEffect(() => {
    if (!mapInstance.current || !loaded) return;

    const map = mapInstance.current;
    const existingSource = map.getSource("boundary");
    if (existingSource) {
      (map.getSource("boundary") as mapboxgl.GeoJSONSource).setData({
        type: "Feature",
        properties: {},
        geometry: boundaryGeoJSON ?? { type: "Polygon", coordinates: [] },
      });
      return;
    }

    if (boundaryGeoJSON?.coordinates?.length) {
      map.addSource("boundary", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: boundaryGeoJSON,
        },
      });
      map.addLayer({
        id: "boundary-fill",
        type: "fill",
        source: "boundary",
        paint: { "fill-color": "#ef4444", "fill-opacity": 0.3 },
      });
      map.addLayer({
        id: "boundary-line",
        type: "line",
        source: "boundary",
        paint: { "line-color": "#ef4444", "line-width": 3 },
      });
    }
  }, [loaded, boundaryGeoJSON]);
  console.log(mapboxgl.accessToken, 'mapboxgl.accessToken');
  if (!mapboxgl.accessToken) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <p className="text-gray-500">Mapbox token not configured</p>
      </div>
    );
  }

  return <div ref={mapRef} className={`w-full h-full min-h-[300px] ${className}`} />;
}
