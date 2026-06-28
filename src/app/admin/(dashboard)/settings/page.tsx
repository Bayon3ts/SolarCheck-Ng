"use client";

import { useState, useEffect, useCallback } from "react";

interface FuelSettings {
  fuel_price_per_litre?: string;
  fuel_price_source?: string;
  fuel_price_updated_at?: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<FuelSettings>({});
  const [newPrice, setNewPrice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/fuel-price");
      if (!res.ok) throw new Error("Failed to load settings");
      const data = await res.json();
      setSettings(data);
    } catch {
      showStatus("error", "Failed to load current settings.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  function showStatus(type: "success" | "error", text: string) {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  }

  async function handleManualUpdate() {
    const price = parseInt(newPrice);
    if (!newPrice || isNaN(price) || price < 500 || price > 5000) {
      showStatus("error", "Please enter a valid price between ₦500 and ₦5,000.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/fuel-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Update failed");
      }

      showStatus("success", `Fuel price updated to ₦${price.toLocaleString()}/L`);
      setNewPrice("");
      await fetchSettings();
    } catch (e) {
      showStatus("error", `Failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleForceRefresh() {
    setIsRefreshing(true);
    try {
      const cronSecret = process.env.NEXT_PUBLIC_CRON_SECRET || "";
      const res = await fetch("/api/cron/update-fuel-price", {
        headers: { Authorization: `Bearer ${cronSecret}` },
      });

      const data = await res.json();

      if (data.success) {
        showStatus(
          "success",
          `Refreshed! New price: ₦${data.price?.toLocaleString()}/L`
        );
        await fetchSettings();
      } else {
        showStatus(
          "error",
          data.error
            ? `Fetch failed: ${data.error}. Last stored price retained.`
            : "Could not extract price from FuelTracker.ng"
        );
      }
    } catch {
      showStatus("error", "Force refresh failed. Check console for details.");
    } finally {
      setIsRefreshing(false);
    }
  }

  const currentPrice = parseInt(settings.fuel_price_per_litre || "1000");
  const source = settings.fuel_price_source || "—";
  const formattedDate = settings.fuel_price_updated_at
    ? new Date(settings.fuel_price_updated_at).toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage global settings used across the SolarCheck calculator.
        </p>
      </div>

      {/* Status Toast */}
      {statusMessage && (
        <div
          className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{statusMessage.type === "success" ? "✅" : "❌"}</span>
          {statusMessage.text}
        </div>
      )}

      {/* Fuel Price Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl">
            ⛽
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Fuel Price Settings</h2>
            <p className="text-xs text-gray-500">
              Used to calculate generator cost savings in the solar calculator.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Status */}
          {isLoading ? (
            <div className="bg-gray-50 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current price</span>
                <span className="font-bold text-amber-700 text-lg">
                  ₦{currentPrice.toLocaleString()}/L
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Source</span>
                <span className="text-sm text-gray-800 font-medium">{source}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last updated</span>
                <span className="text-sm text-gray-800">{formattedDate}</span>
              </div>
            </div>
          )}

          {/* Manual Override */}
          <div className="space-y-3">
            <label
              htmlFor="fuel-price-input"
              className="block text-sm font-semibold text-gray-800"
            >
              Override fuel price (₦ per litre)
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                  ₦
                </span>
                <input
                  id="fuel-price-input"
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="e.g. 1150"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm"
                  min="500"
                  max="5000"
                />
              </div>
              <button
                id="fuel-price-save-btn"
                onClick={handleManualUpdate}
                disabled={isSaving || !newPrice}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-sm"
              >
                {isSaving ? "Saving…" : "Update"}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Check the latest price at{" "}
              <a
                href="https://fueltracker.ng"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 underline hover:text-amber-700"
              >
                fueltracker.ng
              </a>{" "}
              before overriding. Valid range: ₦500 – ₦5,000/L.
            </p>
          </div>

          {/* Force Refresh Divider */}
          <div className="border-t border-gray-100 pt-6">
            <button
              id="fuel-price-refresh-btn"
              onClick={handleForceRefresh}
              disabled={isRefreshing}
              className="w-full py-3 px-4 border-2 border-gray-300 hover:border-amber-400 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-sm text-gray-700 transition-all flex items-center justify-center gap-2"
            >
              {isRefreshing ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Fetching from FuelTracker.ng…
                </>
              ) : (
                <>
                  <span>🔄</span>
                  Force refresh from FuelTracker.ng
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Automatic refresh runs daily at 6 AM WAT. Use this to fetch immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700">
        <strong>How this works:</strong> The solar calculator uses this price to estimate
        how many litres of generator fuel your monthly spend buys, then converts that
        to kWh to size your solar system accurately. Keeping it up to date improves
        savings estimates for your users.
      </div>
    </div>
  );
}
