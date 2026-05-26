import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/* ═══════════════════════════════════════ */
/* POST /api/equipment-reviews/submit      */
/* Insert an equipment review (public)     */
/* ═══════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { equipment_id, reviewer_name, reviewer_city, rating, review_text } = body as {
      equipment_id: string
      reviewer_name: string
      reviewer_city?: string
      rating: number
      review_text: string
    }

    // Basic validation
    if (!equipment_id || !reviewer_name || !rating || !review_text) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }
    if (review_text.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: 'Review must be at least 50 characters' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase.from('equipment_reviews').insert({
      equipment_id,
      reviewer_name: reviewer_name.trim(),
      reviewer_city: reviewer_city?.trim() || null,
      rating,
      review_text: review_text.trim(),
      verified_purchase: false,
    })

    if (error) {
      console.error('[Equipment Review Submit]', error)
      return NextResponse.json(
        { success: false, error: 'Failed to save review' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Your review has been submitted. Thank you!',
    })
  } catch (err) {
    console.error('[Equipment Review Submit] Unexpected:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
