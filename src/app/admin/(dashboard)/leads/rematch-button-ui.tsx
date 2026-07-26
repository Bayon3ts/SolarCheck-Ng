"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface RematchButtonProps {
  unmatchedCount: number;
}

export function RematchButton({ unmatchedCount }: RematchButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    matched: number;
    skipped: number;
    message: string;
  } | null>(null);

  async function handleRematch() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/leads/rematch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (data.success) {
        setResult({
          matched: data.matched,
          skipped: data.skipped,
          message: data.message,
        });
        // Reload the page after a short delay to show updated data
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setResult({ matched: 0, skipped: 0, message: data.error || "Rematch failed" });
      }
    } catch {
      setResult({ matched: 0, skipped: 0, message: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span
          className={`text-sm font-medium ${
            result.matched > 0 ? "text-green-600" : "text-amber-600"
          }`}
        >
          {result.message}
        </span>
      )}
      <Button onClick={handleRematch} disabled={loading} variant="primary" size="sm">
        {loading ? "Matching..." : `Rematch ${unmatchedCount} Unmatched`}
      </Button>
    </div>
  );
}
