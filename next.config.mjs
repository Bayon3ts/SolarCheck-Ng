/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https', 
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    // Apply the same CSP in both environments —
    // having dev and prod behave identically here
    // prevents "works on localhost, breaks in
    // production" surprises.
    const csp = [
      "default-src 'self'",

      // 'unsafe-eval' and 'unsafe-inline' are required by Next.js / React hydration.
      // maps.googleapis.com is required by Google Places Autocomplete (address-search.tsx).
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' " +
        "https://maps.googleapis.com https://maps.gstatic.com",

      // Esri World Imagery tile images, Google Satellite tiles (mt0-mt3),
      // Leaflet marker PNGs from unpkg CDN,
      // and any Supabase-hosted installer media.
      "img-src 'self' data: blob: " +
        "https://server.arcgisonline.com https://*.arcgisonline.com " +
        "https://mt0.google.com https://mt1.google.com " +
        "https://mt2.google.com https://mt3.google.com " +
        "https://*.tile.openstreetmap.org " +
        "https://*.basemaps.cartocdn.com " +
        "https://unpkg.com " +
        "https://*.supabase.co https://*.supabase.in " +
        "https://*.googleusercontent.com",

      // connect-src: fetch() / XHR targets:
      // – NASA POWER climatology API (solar metrics via server proxy)
      // – Google Maps Places API (address autocomplete XHR)
      // – Supabase REST + Realtime
      // Note: Nominatim calls are now replaced by Google Places
      "connect-src 'self' " +
        "https://power.larc.nasa.gov " +
        "https://maps.googleapis.com " +
        "https://*.supabase.co https://*.supabase.in",

      "font-src 'self' data: https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // media-src: allow self-hosted videos from Supabase storage.
      // Without this, default-src 'self' blocks <video> from loading
      // external URLs even when img-src and connect-src allow them.
      "media-src 'self' https://*.supabase.co https://*.supabase.in",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
        ],
      },
    ];
  }
};
export default nextConfig;
