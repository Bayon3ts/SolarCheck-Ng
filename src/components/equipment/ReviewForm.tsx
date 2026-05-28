'use client'

import { useState } from 'react'
interface ReviewFormProps {
  equipmentId: string
  equipmentName: string
}

export default function ReviewForm({ equipmentId, equipmentName }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [text, setText] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setMessage('Please select a star rating.'); return }
    if (text.trim().length < 50) { setMessage('Review must be at least 50 characters.'); return }

    setStatus('loading')
    try {
      const res = await fetch('/api/equipment-reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_id: equipmentId,
          reviewer_name: name.trim(),
          reviewer_city: city.trim() || undefined,
          rating,
          review_text: text.trim(),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setMessage('Your review has been submitted. Thank you!')
        setName(''); setCity(''); setText(''); setRating(0)
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to submit review')
      }
    } catch {
      setStatus('error')
      setMessage('Network error — please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-2xl transition-transform hover:scale-110"
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <span className={(hoverRating || rating) >= star ? 'text-accent' : 'text-gray-300'}>★</span>
            </button>
          ))}
        </div>
      </div>

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
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="reviewer-city" className="block text-sm font-semibold text-text-primary mb-1">
            City (optional)
          </label>
          <input
            id="reviewer-city"
            type="text"
            className="input-field"
            placeholder="e.g. Lagos, Abuja"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="review-text" className="block text-sm font-semibold text-text-primary mb-1">
          Your Review <span className="text-red-500">*</span>
          <span className="font-normal text-text-muted ml-1">(min. 50 characters)</span>
        </label>
        <textarea
          id="review-text"
          rows={5}
          className="input-field resize-none"
          placeholder={`Tell others about your experience with the ${equipmentName}. How has it performed? Any issues with the warranty or distributor?`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <p className="mt-1 text-right text-xs text-text-muted">{text.length} / 50 min</p>
      </div>

      {message && (
        <div className={`rounded-xl p-4 text-sm ${status === 'success' ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary w-full disabled:opacity-60"
      >
        {status === 'loading' ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  )
}
