"use client";

import { useState } from "react";

export function LeadsClient({ leads }: { leads: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [matchFilter, setMatchFilter] = useState("all");

  const filteredLeads = leads?.filter((lead) => {
    const searchString = `${lead.full_name || ""} ${lead.email || ""} ${lead.phone || ""} ${lead.city || ""} ${lead.state || ""} ${lead.installers?.company_name || ""}`.toLowerCase();
    
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesMatch =
      matchFilter === "all" ||
      (matchFilter === "matched" ? !!lead.installer_id : !lead.installer_id);

    return matchesSearch && matchesStatus && matchesMatch;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center bg-gray-50/50">
        <div className="relative w-full sm:max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search leads by name, email, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="quoted">Quoted</option>
          <option value="converted">Converted</option>
        </select>
        <select
          value={matchFilter}
          onChange={(e) => setMatchFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        >
          <option value="all">All Matches</option>
          <option value="matched">Matched</option>
          <option value="unmatched">Unmatched</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Customer</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Location</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Matched Installer</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Intent</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Type</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredLeads && filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-sm text-text-muted">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary">{lead.full_name}</div>
                    <div className="text-sm text-text-muted">
                      {lead.email} · {lead.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary">
                    {lead.city}, {lead.state}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {lead.installers?.company_name ? (
                      <span className="font-medium text-primary">
                        {lead.installers.company_name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                        Unmatched
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center gap-1 whitespace-nowrap text-xs font-bold px-2.5 py-1 rounded-full ${
                        (lead.intent_score || 0) >= 80
                          ? "text-red-700 bg-red-100" // Hot
                          : (lead.intent_score || 0) >= 50
                          ? "text-orange-700 bg-orange-100" // Warm
                          : "text-blue-700 bg-blue-100" // Cold
                      }`}
                    >
                      <span>🔥</span>
                      <span>{lead.intent_score || 0}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                        lead.lead_type === "exclusive"
                          ? "text-purple-700 bg-purple-100"
                          : "text-blue-700 bg-blue-100"
                      }`}
                    >
                      {lead.lead_type === "exclusive" ? "Exclusive" : "Shared"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                        lead.status === "converted"
                          ? "text-green-700 bg-green-100"
                          : lead.status === "quoted"
                          ? "text-blue-700 bg-blue-100"
                          : lead.status === "contacted"
                          ? "text-indigo-700 bg-indigo-100"
                          : "text-gray-700 bg-gray-100"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-text-muted">
                  No leads found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
