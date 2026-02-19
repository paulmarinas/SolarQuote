
import React, { useEffect, useRef, useState } from 'react';
import { Location, RoofData } from '../types';

// Declare google variable for global access to Google Maps API
declare const google: any;

interface Props {
  location: Location;
  onConfirm: (data: RoofData) => void;
  onBack: () => void;
}

const MapStep: React.FC<Props> = ({ location, onConfirm, onBack }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [drawnArea, setDrawnArea] = useState<number>(0);
  const polygonRef = useRef<any | null>(null);
  const mapInstanceRef = useRef<any | null>(null);

  useEffect(() => {
    // Define the global authentication failure hook to catch ApiProjectMapError and others
    (window as any).gm_authFailure = () => {
      setLoadError("Google Maps authentication failed. Please ensure your API key has the Maps JavaScript API enabled and billing is configured.");
    };

    if (typeof (window as any).google === 'undefined' || !(window as any).google.maps) {
      const script = document.createElement('script');
      // Adding the process.env.API_KEY to the script URL to resolve ApiProjectMapError
      // Also added callback and loading parameters for better reliability
      const apiKey = process.env.API_KEY || '';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing,geometry&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Double check if maps is actually available after load
        if ((window as any).google && (window as any).google.maps) {
          setGoogleMapsLoaded(true);
        } else {
          setLoadError("Google Maps library failed to initialize.");
        }
      };
      script.onerror = () => {
        setLoadError("Failed to load Google Maps script. Check your internet connection or API key.");
      };
      document.head.appendChild(script);
    } else {
      setGoogleMapsLoaded(true);
    }

    return () => {
      // Cleanup the global callback
      delete (window as any).gm_authFailure;
    };
  }, []);

  useEffect(() => {
    if (googleMapsLoaded && mapRef.current && !mapInstanceRef.current && !loadError) {
      try {
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
      } catch (err) {
        console.error("Map initialization error:", err);
        setLoadError("An error occurred while initializing the map.");
      }
    }
  }, [googleMapsLoaded, location, loadError]);

  const updateArea = (polygon: any) => {
    if (google && google.maps && google.maps.geometry) {
      const area = google.maps.geometry.spherical.computeArea(polygon.getPath());
      setDrawnArea(area);
    }
  };

  const handleConfirm = () => {
    if (!polygonRef.current) return;
    
    const path = polygonRef.current.getPath().getArray().map((p: any) => ({
      lat: p.lat(),
      lng: p.lng()
    }));

    onConfirm({
      areaM2: drawnArea,
      polygonPoints: path,
      orientation: 'South' 
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
        {loadError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 p-8 text-center">
            <div className="max-w-md">
              <div className="text-red-500 mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <h3 className="text-red-800 font-bold text-lg mb-2">Map Loading Error</h3>
              <p className="text-red-600 mb-6 text-sm">{loadError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : !googleMapsLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500">Loading Satellite View...</p>
            </div>
          </div>
        ) : null}
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
          disabled={drawnArea === 0 || !!loadError}
          onClick={handleConfirm}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${
            drawnArea > 0 && !loadError
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
