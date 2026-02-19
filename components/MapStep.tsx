
import React, { useEffect, useRef, useState } from 'react';
import { Location, RoofData } from '../types';

// Declare google variable for global access to Google Maps API and fix "Cannot find name 'google'" errors
declare const google: any;

interface Props {
  location: Location;
  onConfirm: (data: RoofData) => void;
  onBack: () => void;
}

const MapStep: React.FC<Props> = ({ location, onConfirm, onBack }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnArea, setDrawnArea] = useState<number>(0);
  // Use any to avoid "Cannot find namespace 'google'" errors for specific map types
  const polygonRef = useRef<any | null>(null);
  const mapInstanceRef = useRef<any | null>(null);

  useEffect(() => {
    // Check window.google using type assertion to avoid "Property 'google' does not exist" error
    if (typeof (window as any).google === 'undefined') {
      const script = document.createElement('script');
      // Using a placeholder - user would need their own key here normally
      script.src = `https://maps.googleapis.com/maps/api/js?libraries=drawing,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleMapsLoaded(true);
      document.head.appendChild(script);
    } else {
      setGoogleMapsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (googleMapsLoaded && mapRef.current && !mapInstanceRef.current) {
      // Use google object after it's loaded from the script
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: location.lat, lng: location.lng },
        zoom: 20,
        mapTypeId: 'satellite',
        tilt: 0,
        disableDefaultUI: true,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      const drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.POLYGON],
        },
        polygonOptions: {
          fillColor: '#10b981',
          fillOpacity: 0.4,
          strokeWeight: 2,
          strokeColor: '#059669',
          clickable: true,
          editable: true,
          zIndex: 1,
        },
      });

      drawingManager.setMap(map);

      google.maps.event.addListener(drawingManager, 'overlaycomplete', (event: any) => {
        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
          if (polygonRef.current) {
            polygonRef.current.setMap(null);
          }
          const newPolygon = event.overlay;
          polygonRef.current = newPolygon;
          updateArea(newPolygon);
          drawingManager.setDrawingMode(null);

          newPolygon.getPath().addListener('set_at', () => updateArea(newPolygon));
          newPolygon.getPath().addListener('insert_at', () => updateArea(newPolygon));
        }
      });
    }
  }, [googleMapsLoaded, location]);

  const updateArea = (polygon: any) => {
    const area = google.maps.geometry.spherical.computeArea(polygon.getPath());
    setDrawnArea(area);
  };

  const handleConfirm = () => {
    if (!polygonRef.current) return;
    
    const path = polygonRef.current.getPath().getArray().map((p: any) => ({
      lat: p.lat(),
      lng: p.lng()
    }));

    // Basic orientation detection logic
    // We'd normally check the dominant angle of the polygon
    onConfirm({
      areaM2: drawnArea,
      polygonPoints: path,
      orientation: 'South' // Placeholder - would calculate from path normally
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Outline Your Roof</h2>
          <p className="text-slate-500 text-sm">Draw a perimeter around the installation area.</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-bold">
          Area: {drawnArea.toFixed(1)} m²
        </div>
      </div>

      <div className="relative h-[500px] bg-slate-200">
        {!googleMapsLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500">Loading Satellite View...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      <div className="p-6 flex justify-between gap-4">
        <button 
          onClick={onBack}
          className="px-6 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors"
        >
          Back
        </button>
        <button 
          disabled={drawnArea === 0}
          onClick={handleConfirm}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${
            drawnArea > 0 
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Confirm Area
        </button>
      </div>
    </div>
  );
};

export default MapStep;
