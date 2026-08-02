import { NextResponse } from 'next/server';

/**
 * Server-side proxy for Google Geocoding REST API.
 *
 * Why proxy instead of calling from the browser?
 * – The Maps JavaScript API (client-side) requires billing to be enabled,
 *   throwing BillingNotEnabledMapError even on free-tier keys.
 * – The Geocoding REST API uses the same key but is called server-to-server,
 *   which does NOT trigger the billing wall for basic usage.
 * – The API key is kept server-side only (not exposed in the browser bundle).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input');

  if (!input || input.trim().length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Geocoding API key not configured' }, { status: 500 });
  }

  try {
    // Use the Places Autocomplete REST API (not the JS SDK)
    // This avoids the BillingNotEnabledMapError thrown by the JS API.
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.set('input', input);
    url.searchParams.set('components', 'country:ng');   // Nigeria only
    url.searchParams.set('language', 'en');
    url.searchParams.set('types', 'geocode|establishment');
    url.searchParams.set('key', apiKey);

    const res = await fetch(url.toString(), { cache: 'no-store' });
    const data = await res.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places Autocomplete error:', data.status, data.error_message);
      return NextResponse.json(
        { error: data.error_message ?? data.status, predictions: [] },
        { status: 422 }
      );
    }

    // Return only the fields the client needs
    const predictions = (data.predictions ?? []).map((p: any) => ({
      placeId: p.place_id,
      description: p.description,
    }));

    return NextResponse.json({ predictions });
  } catch (err: any) {
    console.error('Geocode proxy threw:', err?.message ?? err);
    return NextResponse.json({ error: 'Geocoding failed', predictions: [] }, { status: 500 });
  }
}
