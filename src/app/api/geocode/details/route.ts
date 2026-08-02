import { NextResponse } from 'next/server';

/**
 * Resolves a Google Place ID to exact lat/lng coordinates.
 * Called after the user selects a prediction from /api/geocode.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');

  if (!placeId) {
    return NextResponse.json({ error: 'Missing placeId' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', 'geometry,formatted_address,name');
    url.searchParams.set('key', apiKey);

    const res = await fetch(url.toString(), { cache: 'no-store' });
    const data = await res.json();

    if (data.status !== 'OK') {
      console.error('Place Details error:', data.status, data.error_message);
      return NextResponse.json(
        { error: data.error_message ?? data.status },
        { status: 422 }
      );
    }

    const loc = data.result.geometry.location;
    return NextResponse.json({
      lat: loc.lat,
      lng: loc.lng,
      address: data.result.formatted_address ?? data.result.name,
    });
  } catch (err: any) {
    console.error('Place details proxy threw:', err?.message ?? err);
    return NextResponse.json({ error: 'Place lookup failed' }, { status: 500 });
  }
}
