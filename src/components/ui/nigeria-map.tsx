"use client";

import React from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { NIGERIAN_STATES } from "@/lib/validations";

const geoUrl = "/nigeria-states.geojson";

// Standardize state names from geojson to match our NIGERIAN_STATES array
const normalizeStateName = (name: string): string => {
  if (!name) return "";
  const cleanName = name.trim();
  
  // Handle known mismatches between GeoJSON and our state list
  if (cleanName === "Nassarawa") return "Nasarawa";
  
  // Find closest match in our valid states array
  const match = NIGERIAN_STATES.find(s => s.toLowerCase() === cleanName.toLowerCase());
  return match || cleanName;
};

interface NigeriaMapProps {
  selectedState: string;
  onSelectState: (state: string) => void;
  stateCounts?: Record<string, number>;
}

export default function NigeriaMap({ selectedState, onSelectState, stateCounts = {} }: NigeriaMapProps) {
  
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center bg-blue-50/30 rounded-2xl border border-border overflow-hidden">
      <ComposableMap 
        projection="geoMercator" 
        projectionConfig={{
          scale: 3000,
          center: [8, 9] // Center of Nigeria
        }}
        className="w-full h-full"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              // This GeoJSON uses NAME_1 for state names
              const rawName = geo.properties.NAME_1 || geo.properties.name || geo.properties.admin1Name || "";
              const stateName = normalizeStateName(rawName);
              
              const isSelected = selectedState === stateName;
              const installerCount = stateCounts[stateName] || 0;
              const hasInstallers = installerCount > 0;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => {
                    if (stateName) onSelectState(stateName);
                  }}
                  style={{
                    default: {
                      fill: isSelected 
                        ? "#0A5C36" // SolarCheck Brand Green (Selected)
                        : hasInstallers 
                          ? "#E6F4EA" // Light Green (Available)
                          : "#F3F4F6", // Gray (No Data)
                      stroke: isSelected ? "#064025" : "#D1D5DB",
                      strokeWidth: isSelected ? 1.5 : 0.5,
                      outline: "none",
                      transition: "all 250ms"
                    },
                    hover: {
                      fill: isSelected ? "#0A5C36" : "#A7F3D0",
                      stroke: "#0A5C36",
                      strokeWidth: 1,
                      cursor: "pointer",
                      outline: "none",
                      transition: "all 250ms"
                    },
                    pressed: {
                      fill: "#064025",
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-border text-xs font-medium space-y-2">
        <div className="flex items-center gap-2 text-text-primary">
          <span className="w-3 h-3 bg-[#0A5C36] rounded-sm"></span> Selected
        </div>
        <div className="flex items-center gap-2 text-text-primary">
          <span className="w-3 h-3 bg-[#E6F4EA] rounded-sm border border-green-200"></span> Available
        </div>
        <div className="flex items-center gap-2 text-text-muted">
          <span className="w-3 h-3 bg-[#F3F4F6] rounded-sm border border-gray-200"></span> No Data
        </div>
      </div>
    </div>
  );
}
