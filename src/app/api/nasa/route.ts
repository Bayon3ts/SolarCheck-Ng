import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing lat or lon' }, { status: 400 });
  }

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  // NASA POWER rejects coordinates outside [-90,90] / [-180,180]
  if (isNaN(latNum) || isNaN(lonNum) || Math.abs(latNum) > 90 || Math.abs(lonNum) > 180) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  // Round to 4 decimal places — NASA POWER rejects very long float strings
  const latRounded = latNum.toFixed(4);
  const lonRounded = lonNum.toFixed(4);

  try {
    const url =
      `https://power.larc.nasa.gov/api/temporal/climatology/point` +
      `?parameters=ALLSKY_SFC_SW_DWN,T2M` +
      `&community=RE` +
      `&longitude=${lonRounded}` +
      `&latitude=${latRounded}` +
      `&format=JSON`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SolarCheck-NextJS-App (info@solarcheck.ng)',
        'Accept': 'application/json',
      },
      // Next.js route handlers cache by default — opt out so data stays fresh
      cache: 'no-store',
    });

    if (!response.ok) {
      // Surface the NASA error body so it's visible in server logs
      const body = await response.text().catch(() => '(unreadable)');
      console.error(`NASA POWER API error ${response.status}:`, body);
      return NextResponse.json(
        { error: 'NASA API returned an error', detail: body },
        { status: response.status }
      );
    }

    const data = await response.json();

    // NASA returns HTTP 200 with an error payload when parameters are invalid
    if (data.messages && !data.properties) {
      console.error('NASA POWER API business error:', data.messages);
      return NextResponse.json(
        { error: 'NASA rejected the request', messages: data.messages },
        { status: 422 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('NASA proxy fetch threw:', error?.message ?? error);
    return NextResponse.json({ error: 'Failed to fetch from NASA' }, { status: 500 });
  }
}
