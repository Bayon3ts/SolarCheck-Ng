"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallersClient({ installers }: { installers: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredInstallers = installers?.filter((installer) => {
    const searchString = `${installer.company_name || ""} ${installer.email || ""} ${installer.city || ""} ${installer.state || ""}`.toLowerCase();
    
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    
    const matchesVerification = 
      verificationFilter === "all" ||
      (verificationFilter === "verified" ? installer.is_verified : !installer.is_verified);
      
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "active" ? installer.is_active : !installer.is_active);

    return matchesSearch && matchesVerification && matchesStatus;
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
            placeholder="Search installers by company, email, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          value={verificationFilter}
          onChange={(e) => setVerificationFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        >
          <option value="all">All Verification</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Company</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Location</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Score</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredInstallers && filteredInstallers.length > 0 ? (
              filteredInstallers.map((installer) => (
                <tr key={installer.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary">{installer.company_name}</div>
                    <div className="text-sm text-text-muted">{installer.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-text-primary">{installer.city}, {installer.state}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-text-primary">{installer.ranking_score || 0}</span>
                      <span className="text-xs text-text-muted">/ 100</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {installer.is_verified ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                          <AlertTriangle className="h-3 w-3" /> Pending
                        </span>
                      )}
                      {installer.is_active ? (
                        <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Active</span>
                      ) : (
                        <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">Suspended</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <form action={`/api/admin/installers/${installer.id}/verify`} method="POST">
                        <Button type="submit" variant="outline" size="sm">
                          {installer.is_verified ? "Unverify" : "Verify"}
                        </Button>
                      </form>
                      <form action={`/api/admin/installers/${installer.id}/toggle-active`} method="POST">
                        <Button type="submit" variant="secondary" size="sm" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200">
                          {installer.is_active ? "Suspend" : "Activate"}
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-text-muted">
                  No installers found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
