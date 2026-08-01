"use client";

import { useState } from "react";

type Banner = {
  id: string;
  company_name: string;
  plan: string;
  payment_status: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
  impressions: number;
  clicks: number;
  created_at: string;
};

function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "text-amber-700 bg-amber-100",
    paid: "text-blue-700 bg-blue-100",
    rejected: "text-red-700 bg-red-100",
    failed: "text-gray-700 bg-gray-100",
  };
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
        styles[status] ?? "text-gray-700 bg-gray-100"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function LiveStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
        isActive ? "text-green-700 bg-green-100" : "text-gray-500 bg-gray-100"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`}
      />
      {isActive ? "Live" : "Inactive"}
    </span>
  );
}

export function SponsorsClient({ banners }: { banners: Banner[] }) {
  const [data, setData] = useState<Banner[]>(banners);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: "publish" | "reject" | "deactivate") => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/banners/${id}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        setData((prev) =>
          prev.map((b) => {
            if (b.id !== id) return b;
            if (action === "publish") return { ...b, is_active: true };
            if (action === "reject") return { ...b, payment_status: "rejected", is_active: false };
            if (action === "deactivate") return { ...b, is_active: false };
            return b;
          })
        );
      }
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

  const pendingReview = data.filter(
    (b) => b.payment_status === "paid" && !b.is_active
  ).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
      {pendingReview > 0 && (
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
          <span className="text-amber-700 text-sm font-semibold">
            {pendingReview} banner{pendingReview !== 1 ? "s" : ""} awaiting review
          </span>
          <span className="text-amber-600 text-xs">— payment confirmed, not yet published</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Company</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Plan</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Payment</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Run Dates</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Impr.</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Clicks</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length > 0 ? (
              data.map((banner) => {
                const isLoading = loadingId === banner.id;
                const awaitingReview = banner.payment_status === "paid" && !banner.is_active;

                return (
                  <tr
                    key={banner.id}
                    className={`hover:bg-gray-50/50 ${
                      awaitingReview ? "bg-amber-50/30" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary text-sm">
                        {banner.company_name}
                      </div>
                      <div className="text-xs text-text-muted mt-0.5">
                        {formatDate(banner.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                          banner.plan === "featured"
                            ? "text-purple-700 bg-purple-100"
                            : "text-blue-700 bg-blue-100"
                        }`}
                      >
                        {banner.plan.charAt(0).toUpperCase() + banner.plan.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <PaymentStatusBadge status={banner.payment_status} />
                    </td>
                    <td className="px-6 py-4">
                      <LiveStatusBadge isActive={banner.is_active} />
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted whitespace-nowrap">
                      {formatDate(banner.starts_at)} → {formatDate(banner.ends_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary font-mono">
                      {banner.impressions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary font-mono">
                      {banner.clicks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Awaiting review: show Publish + Reject */}
                        {awaitingReview && (
                          <>
                            <button
                              onClick={() => handleAction(banner.id, "publish")}
                              disabled={isLoading}
                              className="text-xs font-semibold text-white bg-primary hover:bg-primary-dark px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isLoading ? "…" : "Publish"}
                            </button>
                            <button
                              onClick={() => handleAction(banner.id, "reject")}
                              disabled={isLoading}
                              className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isLoading ? "…" : "Reject"}
                            </button>
                          </>
                        )}

                        {/* Live: allow deactivation */}
                        {banner.is_active && (
                          <button
                            onClick={() => handleAction(banner.id, "deactivate")}
                            disabled={isLoading}
                            className="text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isLoading ? "…" : "Pause"}
                          </button>
                        )}

                        {/* Rejected / Paused: allow re-publish */}
                        {!banner.is_active &&
                          banner.payment_status !== "pending" &&
                          !awaitingReview && (
                            <button
                              onClick={() => handleAction(banner.id, "publish")}
                              disabled={isLoading}
                              className="text-xs font-semibold text-primary hover:text-primary-dark bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isLoading ? "…" : "Re-publish"}
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-sm text-text-muted">
                  No sponsor banners yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
