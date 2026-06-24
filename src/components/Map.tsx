import React, { useEffect, useRef, useState } from "react";
import { Issue } from "../types";

declare const L: any; // Leaflet is loaded in index.html

interface MapProps {
  issues: Issue[];
  onSelectIssue?: (issue: Issue) => void;
  selectedIssue?: Issue | null;
  interactiveSelect?: boolean;
}

export default function Map({ issues, onSelectIssue, selectedIssue, interactiveSelect = true }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Poll for Leaflet availability
  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(() => {
      if (typeof L !== "undefined") {
        setLeafletLoaded(true);
        clearInterval(interval);
      } else {
        attempts++;
        if (attempts > 30) {
          clearInterval(interval);
          console.error("Leaflet failed to load within 3 seconds.");
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;

    // Center map around Bangalore, India as default
    const defaultCenter = [12.9716, 77.5946];
    const initialZoom = 13;

    // Create map instance if it doesn't exist
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView(defaultCenter, initialZoom);

      // Add OpenStreetMap tile layer (Clean Dark/Light modern theme)
      // We will use standard highly legible OSM tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded]);

  // Handle markers updating
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for current issues
    issues.forEach((issue) => {
      if (!issue.latitude || !issue.longitude) return;

      // Determine color based on severity and status
      let colorClass = "bg-amber-500"; // Moderate / Assigned / In Progress
      let pulseColorClass = "bg-amber-400";
      let iconLabel = "M"; // Moderate

      if (issue.status === "Fixed") {
        colorClass = "bg-emerald-500"; // Fixed
        pulseColorClass = "bg-emerald-400";
        iconLabel = "✓";
      } else if (issue.severity === "Critical") {
        colorClass = "bg-rose-600 animate-pulse"; // Critical
        pulseColorClass = "bg-rose-500";
        iconLabel = "!";
      } else if (issue.severity === "Low") {
        colorClass = "bg-blue-500";
        pulseColorClass = "bg-blue-400";
        iconLabel = "L";
      }

      // Create beautiful custom pulsing divIcon using Tailwind
      const customIcon = L.divIcon({
        className: "custom-div-icon",
        html: `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <span class="animate-ping absolute inline-flex h-7 w-7 rounded-full ${pulseColorClass} opacity-60"></span>
            <span class="relative inline-flex rounded-full h-5.5 w-5.5 ${colorClass} border-2 border-white shadow-lg items-center justify-center text-[10px] text-white font-bold font-mono">
              ${iconLabel}
            </span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([issue.latitude, issue.longitude], { icon: customIcon })
        .addTo(mapInstanceRef.current);

      // Create custom tooltip style
      const popupContent = `
        <div class="p-2.5 max-w-[220px]">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
              issue.severity === "Critical" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
            }">
              ${issue.issueType}
            </span>
            <span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
              ${issue.status}
            </span>
          </div>
          <h4 class="font-bold text-slate-900 text-xs line-clamp-1 mb-0.5">${issue.title}</h4>
          <p class="text-slate-500 text-[10px] line-clamp-2 mb-2 leading-relaxed">${issue.description}</p>
          <div class="flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span class="text-[9px] font-medium text-slate-400 font-mono">${issue.ward}</span>
            <span class="text-[9px] text-teal-600 font-bold hover:underline cursor-pointer">View Details →</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        offset: [0, -5],
      });

      // Handle marker click selection
      marker.on("click", () => {
        if (onSelectIssue && interactiveSelect) {
          onSelectIssue(issue);
        }
      });

      markersRef.current.push(marker);
    });
  }, [issues, leafletLoaded, onSelectIssue, interactiveSelect]);

  // Center on selected issue if changed
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current || !selectedIssue) return;

    mapInstanceRef.current.setView([selectedIssue.latitude, selectedIssue.longitude], 15, {
      animate: true,
      duration: 0.8,
    });

    // Find the marker corresponding to this issue and open popup
    const index = issues.findIndex((i) => i.id === selectedIssue.id);
    if (index !== -1 && markersRef.current[index]) {
      setTimeout(() => {
        if (markersRef.current[index]) {
          markersRef.current[index].openPopup();
        }
      }, 300);
    }
  }, [selectedIssue, leafletLoaded, issues]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm min-h-[300px]">
      {!leafletLoaded && (
        <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center z-10">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium text-slate-500 font-sans">Booting OpenStreetMap Engine...</p>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: "350px" }} />
      
      {/* Visual map legend overlay */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-2.5 rounded-xl shadow-md border border-slate-100/80 z-[1000] text-[10px] space-y-1.5 font-medium max-w-[140px]">
        <div className="text-slate-500 font-bold uppercase tracking-wider text-[8px] mb-1">Issue Legends</div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 block shadow-sm shadow-rose-600/50"></span>
          <span className="text-slate-700">Critical / Urgent</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block shadow-sm shadow-amber-500/50"></span>
          <span className="text-slate-700">Moderate / Active</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block shadow-sm shadow-blue-500/50"></span>
          <span className="text-slate-700">Low Severity</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block shadow-sm shadow-emerald-500/50"></span>
          <span className="text-slate-700">Resolved / Fixed</span>
        </div>
      </div>
    </div>
  );
}
