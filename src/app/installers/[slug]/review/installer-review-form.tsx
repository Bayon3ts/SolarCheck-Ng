"use client";

import { useState } from "react";
import { Star, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SYSTEM_SIZES } from "@/lib/validations";

interface InstallerReviewFormProps {
  installerId: string;
  installerName: string;
}

export default function InstallerReviewForm({ installerId, installerName }: InstallerReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerPhone, setReviewerPhone] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [systemSize, setSystemSize] = useState("");
  const [installDate, setInstallDate] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const activeRating = hoverRating || rating;

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (rating === 0) {
      setMessage("Please select a star rating.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          installer_id: installerId,
          reviewer_name: reviewerName.trim(),
          reviewer_phone: reviewerPhone.trim() || undefined,
          rating,
          title: title.trim(),
          body: body.trim(),
          system_size: systemSize || undefined,
          install_date: installDate || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message || "Your review has been submitted. Thank you!");
        setReviewerName("");
        setReviewerPhone("");
        setTitle("");
        setBody("");
        setSystemSize("");
        setInstallDate("");
        setRating(0);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to submit review. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error — please check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">Thank You!</h3>
        <p className="text-text-muted max-w-md mx-auto">
          {message}
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-medium text-primary hover:underline"
        >
          Write another review
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Star Rating */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-3">
          Overall Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <Star
                  className={cn(
                    "h-8 w-8 transition-colors",
                    activeRating >= star
                      ? "fill-accent text-accent"
                      : "fill-gray-200 text-gray-200"
                  )}
                />
              </button>
            ))}
          </div>
          {activeRating > 0 && (
            <span className="text-sm font-medium text-text-primary">
              {ratingLabels[activeRating]}
            </span>
          )}
        </div>
      </div>

      {/* Name and Phone */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="reviewer-name" className="block text-sm font-semibold text-text-primary mb-1">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            id="reviewer-name"
            type="text"
            className="input-field"
            placeholder="e.g. Chukwuemeka A."
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            required
            minLength={2}
            maxLength={100}
          />
        </div>
        <div>
          <label htmlFor="reviewer-phone" className="block text-sm font-semibold text-text-primary mb-1">
            Phone (optional)
          </label>
          <input
            id="reviewer-phone"
            type="tel"
            className="input-field"
            placeholder="e.g. 08012345678"
            value={reviewerPhone}
            onChange={(e) => setReviewerPhone(e.target.value)}
          />
        </div>
      </div>

      {/* System Size and Install Date */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="system-size" className="block text-sm font-semibold text-text-primary mb-1">
            System Size Installed (optional)
          </label>
          <select
            id="system-size"
            className="input-field"
            value={systemSize}
            onChange={(e) => setSystemSize(e.target.value)}
          >
            <option value="">Select size</option>
            {SYSTEM_SIZES.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="install-date" className="block text-sm font-semibold text-text-primary mb-1">
            Installation Date (optional)
          </label>
          <input
            id="install-date"
            type="date"
            className="input-field"
            value={installDate}
            onChange={(e) => setInstallDate(e.target.value)}
          />
        </div>
      </div>

      {/* Review Title */}
      <div>
        <label htmlFor="review-title" className="block text-sm font-semibold text-text-primary mb-1">
          Review Title <span className="text-red-500">*</span>
        </label>
        <input
          id="review-title"
          type="text"
          className="input-field"
          placeholder="Summarize your experience in one sentence"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
          maxLength={150}
        />
      </div>

      {/* Review Body */}
      <div>
        <label htmlFor="review-body" className="block text-sm font-semibold text-text-primary mb-1">
          Your Review <span className="text-red-500">*</span>
          <span className="font-normal text-text-muted ml-1">(min. 10 characters)</span>
        </label>
        <textarea
          id="review-body"
          rows={5}
          className="input-field resize-none"
          placeholder={`Tell others about your experience with ${installerName}. How was the installation process? Quality of work? Communication and professionalism?`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minLength={10}
          maxLength={2000}
        />
        <p className="mt-1 text-right text-xs text-text-muted">{body.length} / 2000</p>
      </div>

      {/* Error / Validation Message */}
      {message && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
          {message}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit Review"
        )}
      </button>

      <p className="text-xs text-text-muted text-center">
        Your review will be published after moderation. We may contact you to verify your experience.
      </p>
    </form>
  );
}
