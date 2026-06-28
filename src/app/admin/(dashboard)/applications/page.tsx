"use client";

import React, { useState, useEffect } from "react";
import { Check, X, Phone, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Application = {
  id: string;
  company_name: string;
  contact_name: string;
  role: string | null;
  phone: string | null;
  whatsapp: string;
  email: string;
  website: string | null;
  years_in_business: string | null;
  primary_state: string;
  primary_city: string;
  other_states: string[];
  business_type: string | null;
  system_size_range: string | null;
  price_range: string | null;
  cac_number: string | null;
  description: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/applications");
      const result = await res.json();
      if (result.success) {
        setApplications(result.data);
      } else {
        console.error(result.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    if (status === "rejected" && !window.confirm("Are you sure you want to reject this application?")) {
      return;
    }
    
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();

      if (result.success) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status } : app))
        );
        if (status === "approved") {
           alert("Approved. Profile created in installers.");
        } else {
           alert("Application rejected");
        }
      } else {
        alert("Failed to update status: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredApps = applications.filter((app) => filter === "all" || app.status === filter);
  
  const pendingCount = applications.filter(a => a.status === "pending").length;
  const approvedCount = applications.filter(a => a.status === "approved").length;
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeekCount = applications.filter(a => new Date(a.created_at) > oneWeekAgo).length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Installer Applications</h1>
          {pendingCount > 0 && (
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
              {pendingCount} pending
            </span>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Applications", value: applications.length },
          { label: "Pending Review", value: pendingCount },
          { label: "Approved", value: approvedCount },
          { label: "This Week", value: thisWeekCount },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-px overflow-x-auto">
        {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
              filter === tab
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            Loading applications...
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-900 font-medium mb-1">No applications yet.</p>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Share your application page with solar installers to get started.
            </p>
            <div className="inline-flex bg-gray-50 border border-gray-200 rounded-lg p-2 items-center gap-3">
              <span className="text-xs text-gray-500 font-mono">solarcheckng.com/for-installers/apply</span>
              <button 
                onClick={() => navigator.clipboard.writeText("https://solarcheckng.com/for-installers/apply")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Copy Link
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">WhatsApp</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApps.map((app) => (
                  <React.Fragment key={app.id}>
                    <tr 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{app.company_name}</div>
                        <div className="text-xs text-gray-500 mt-1">{app.contact_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-700">{app.primary_state}</div>
                        <div className="text-xs text-gray-500 mt-1">{app.primary_city}</div>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <a 
                          href={`https://wa.me/${app.whatsapp.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {app.whatsapp}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                          app.status === "pending" && "bg-amber-50 text-amber-700 border-amber-200",
                          app.status === "approved" && "bg-green-50 text-green-700 border-green-200",
                          app.status === "rejected" && "bg-red-50 text-red-700 border-red-200"
                        )}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {app.status === "pending" && (
                            <>
                              <button
                                disabled={actionLoading === app.id}
                                onClick={() => updateStatus(app.id, "approved")}
                                className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                                title="Approve"
                              >
                                {actionLoading === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              </button>
                              <button
                                disabled={actionLoading === app.id}
                                onClick={() => updateStatus(app.id, "rejected")}
                                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <div className="ml-2 text-gray-400">
                            {expandedId === app.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded Row */}
                    {expandedId === app.id && (
                      <tr className="bg-gray-50/50">
                        <td colSpan={6} className="px-6 py-6 border-b border-gray-200">
                          <div className="grid md:grid-cols-2 gap-8 text-sm">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Company Details</h4>
                                <ul className="space-y-1 text-gray-600">
                                  <li><span className="font-medium">Email:</span> {app.email}</li>
                                  <li><span className="font-medium">Phone:</span> {app.phone || 'N/A'}</li>
                                  <li><span className="font-medium">Website:</span> {app.website || 'N/A'}</li>
                                  <li><span className="font-medium">Role:</span> {app.role || 'N/A'}</li>
                                  <li><span className="font-medium">CAC Number:</span> {app.cac_number || 'N/A'}</li>
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Business Profile</h4>
                                <ul className="space-y-1 text-gray-600">
                                  <li><span className="font-medium">Years in Business:</span> {app.years_in_business}</li>
                                  <li><span className="font-medium">Type:</span> {app.business_type}</li>
                                  <li><span className="font-medium">System Size:</span> {app.system_size_range}</li>
                                  <li><span className="font-medium">Price Range:</span> {app.price_range}</li>
                                </ul>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Other States Served</h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {app.other_states && app.other_states.length > 0 ? (
                                    app.other_states.map(state => (
                                      <span key={state} className="bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">
                                        {state}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-gray-500 italic">None</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Description</h4>
                                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed max-w-prose">
                                  {app.description || 'No description provided.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
