"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/ui/star-rating";
import NigeriaMap from "@/components/ui/nigeria-map";
import { NIGERIAN_STATES } from "@/lib/validations";

type Installer = {
  id: string;
  slug: string;
  company_name: string;
  city: string;
  state: string;
  average_rating: number;
  total_reviews: number;
  is_verified: boolean;
  services: string[];
};

interface Props {
  initialInstallers: Installer[];
}

const REGIONS: Record<string, string[]> = {
  "North West": ["Kaduna", "Kano", "Katsina", "Kebbi", "Jigawa", "Sokoto", "Zamfara"],
  "North East": ["Borno", "Adamawa", "Yobe", "Taraba", "Bauchi", "Gombe"],
  "North Central": ["Niger", "Kogi", "Benue", "Plateau", "Nasarawa", "Kwara", "Federal Capital Territory"],
  "South West": ["Lagos", "Ogun", "Oyo", "Osun", "Ondo", "Ekiti"],
  "South East": ["Abia", "Anambra", "Ebonyi", "Enugu", "Imo"],
  "South South": ["Akwa Ibom", "Bayelsa", "Cross River", "Rivers", "Delta", "Edo"]
};

export default function InteractiveDirectory({ initialInstallers }: Props) {
  // Start with Lagos or FCT as default if there are installers there, or fallback
  const defaultState = initialInstallers.find(i => i.state === "Lagos") ? "Lagos" : "FCT";
  const [selectedState, setSelectedState] = useState(defaultState);
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState(0);

  // Group installers by state to easily get counts for the map
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    initialInstallers.forEach(inst => {
      counts[inst.state] = (counts[inst.state] || 0) + 1;
    });
    return counts;
  }, [initialInstallers]);

  // Filter installers based on selected state, search query, and rating
  const filteredInstallers = useMemo(() => {
    return initialInstallers.filter(inst => {
      const matchesState = selectedState === "All" || inst.state === selectedState;
      const matchesSearch = inst.company_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            inst.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRating = minRating === 0 || inst.average_rating >= minRating;
      
      return matchesState && matchesSearch && matchesRating;
    });
  }, [initialInstallers, selectedState, searchQuery, minRating]);

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* LEFT COLUMN: Map & Controls */}
      <div className="w-full lg:w-2/3 space-y-6">
        
        {/* Search & Regions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            
            {/* Search input */}
            <div className="space-y-2 flex-1">
              <label htmlFor="q" className="text-sm font-medium text-text-primary">
                Search Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  id="q"
                  placeholder="e.g. GreenPower"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>

            {/* State Filter */}
            <div className="space-y-2 flex-1">
              <label htmlFor="state" className="text-sm font-medium text-text-primary">
                State
              </label>
              <select
                id="state"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="select-field w-full"
              >
                <option value="All">All States</option>
                {NIGERIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2 flex-1">
              <label htmlFor="rating" className="text-sm font-medium text-text-primary">
                Minimum Rating
              </label>
              <select
                id="rating"
                value={minRating.toString()}
                onChange={(e) => setMinRating(parseInt(e.target.value, 10))}
                className="select-field w-full"
              >
                <option value="0">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>
            </div>
            
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border mt-2">
            <span className="text-sm font-medium text-text-muted flex items-center mr-2">Regions:</span>
            {Object.keys(REGIONS).map(region => (
              <button
                key={region}
                onClick={() => {
                  // Find a state in this region that actually has installers
                  const statesInRegion = REGIONS[region];
                  const stateWithData = statesInRegion.find(s => stateCounts[s] > 0) || statesInRegion[0];
                  setSelectedState(stateWithData);
                }}
                className="px-3 py-1 text-xs font-medium bg-gray-50 text-gray-700 rounded-full border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors"
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* The SVG Map */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-border">
          <NigeriaMap 
            selectedState={selectedState} 
            onSelectState={setSelectedState} 
            stateCounts={stateCounts}
          />
          <p className="text-center text-sm text-text-muted mt-4">
            Click on any state to view verified solar companies in that location.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Installer List */}
      <div className="w-full lg:w-1/3">
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden sticky top-24 max-h-[calc(100vh-8rem)] flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-border bg-gray-50/50">
            <h2 className="text-2xl font-bold text-text-primary">
              {selectedState === "All" ? "All States" : `${selectedState} State`}
            </h2>
            <p className="text-text-muted mt-1">
              {filteredInstallers.length} {filteredInstallers.length === 1 ? 'Installer' : 'Installers'} Available
            </p>
          </div>

          {/* List */}
          <div className="p-6 overflow-y-auto flex-1">
            {filteredInstallers.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                  <Search className="h-6 w-6 text-text-muted" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">No installers found</h3>
                <p className="text-sm text-text-muted mt-2">
                  We don&apos;t have any verified installers in {selectedState} matching your search yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInstallers.map((installer) => (
                  <div key={installer.id} className="group border border-border rounded-xl p-4 hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors">
                        {installer.company_name}
                      </h3>
                      {installer.is_verified && (
                        <span className="badge-verified shrink-0 text-[10px] px-1.5 py-0.5">Verified</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-text-muted mb-3">
                      <MapPin className="h-3 w-3" />
                      {installer.city}, {installer.state}
                    </div>
                    
                    <StarRating
                      rating={installer.average_rating}
                      reviewCount={installer.total_reviews}
                      showValue
                    />
                    
                    <div className="mt-4">
                      <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
                        <Link href={`/installers/${installer.slug}`}>
                          View Profile
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
