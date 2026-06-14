import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// GET — return current fuel price settings
export async function GET() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .in('key', [
      'fuel_price_per_litre',
      'fuel_price_source',
      'fuel_price_updated_at',
    ])

  const settings = Object.fromEntries(
    (data || []).map((r: { key: string; value: string }) => [r.key, r.value])
  )

  return NextResponse.json(settings)
}

// POST — admin manually sets the price
export async function POST(request: Request) {
  const { price } = await request.json()

  if (!price || price < 500 || price > 5000) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const supabase = createAdminClient()

  await supabase.from('site_settings').upsert([
    {
      key: 'fuel_price_per_litre',
      value: price.toString(),
      updated_at: now,
      updated_by: 'admin',
    },
    {
      key: 'fuel_price_source',
      value: 'Manual admin update',
      updated_at: now,
      updated_by: 'admin',
    },
    {
      key: 'fuel_price_updated_at',
      value: now,
      updated_at: now,
      updated_by: 'admin',
    },
  ])

  return NextResponse.json({ success: true, price })
}
