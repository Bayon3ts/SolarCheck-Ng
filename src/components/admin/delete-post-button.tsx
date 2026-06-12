"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeletePostButton({ postId, title }: { postId: string; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/admin/blog/${postId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to delete post. Please try again.");
    }
    setLoading(false);
    setConfirming(false);
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-xs text-red-600 font-medium">Delete &ldquo;{title.slice(0, 20)}…&rdquo;?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded transition-colors disabled:opacity-60"
        >
          {loading ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs font-semibold text-text-muted hover:text-text-primary px-2 py-1 rounded border border-border transition-colors"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title="Delete post"
      className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded border border-red-200 transition-colors"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Delete
    </button>
  );
}
