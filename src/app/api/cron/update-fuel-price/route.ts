import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  // Verify this is a legitimate cron call
  // (Vercel sends this header on cron requests)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch FuelTracker.ng page
    const response = await fetch('https://fueltracker.ng/', {
      headers: {
        'User-Agent': 'SolarCheck Nigeria fuel price monitor',
      },
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      throw new Error(`FuelTracker returned ${response.status}`)
    }

    const html = await response.text()

    // Extract average PMS price
    const price = extractFuelPrice(html)

    if (!price || price < 500 || price > 5000) {
      // Sanity check: valid Nigerian fuel price range
      throw new Error(`Extracted invalid price: ${price}`)
    }

    // Update Supabase
    const now = new Date().toISOString()

    await supabase.from('site_settings').upsert([
      {
        key: 'fuel_price_per_litre',
        value: price.toString(),
        updated_at: now,
        updated_by: 'cron',
      },
      {
        key: 'fuel_price_source',
        value: 'FuelTracker.ng (crowdsourced average)',
        updated_at: now,
        updated_by: 'cron',
      },
      {
        key: 'fuel_price_updated_at',
        value: now,
        updated_at: now,
        updated_by: 'cron',
      },
    ])

    console.log(`[Fuel Price Cron] Updated: ₦${price}/L`)

    return NextResponse.json({ success: true, price, updatedAt: now })
  } catch (error) {
    console.error('[Fuel Price Cron] Failed:', error)

    // Log the failure but don't crash
    // Calculator will use the last stored price
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        message: 'Using last stored price',
      },
      { status: 200 } // 200 so Vercel doesn't retry and spam the site
    )
  }
}

// ── Price extraction helper ─────────────────────────────────
function extractFuelPrice(html: string): number | null {
  // Strategy 1: Look for price patterns near "Avg PMS" section
  // FuelTracker shows prices like "₦1,150" or "1150" near "Avg PMS" text

  const avgPmsIndex = html.indexOf('Avg PMS')
  if (avgPmsIndex !== -1) {
    // Look in the 500 chars after that marker
    const section = html.slice(avgPmsIndex, avgPmsIndex + 500)

    // Match ₦1,150 or 1150 or 1,150 patterns
    const patterns = [
      /₦([\d,]+)/, // ₦1,150
      /(\d{4})/, // 1150 (4 digit number)
      /([\d,]{5,7})/, // 1,150
    ]

    for (const pattern of patterns) {
      const match = section.match(pattern)
      if (match) {
        const raw = match[1].replace(/,/g, '')
        const num = parseInt(raw)
        if (num >= 500 && num <= 5000) return num
      }
    }
  }

  // Strategy 2: Look for any 3-4 digit number
  // in range 800-2500 (realistic fuel prices)
  const allNumbers = html.match(/\b(\d{3,4})\b/g)
  if (allNumbers) {
    for (const n of allNumbers) {
      const num = parseInt(n)
      if (num >= 800 && num <= 2500) return num
    }
  }

  return null
}
