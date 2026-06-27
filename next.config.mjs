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
      // 'unsafe-eval' and 'unsafe-inline' are
      // required by Next.js itself (React
      // hydration / inline chunk scripts) — not
      // safe to remove without breaking the app.
      // maps.googleapis.com + maps.gstatic.com
      // are required for the Google Maps
      // JavaScript API (Places Autocomplete +
      // satellite roof tracer).
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' " +
        "https://maps.googleapis.com https://maps.gstatic.com",
      // Maps map tiles, icons, and marker images
      // load from these domains.
      "img-src 'self' data: blob: " +
        "https://maps.googleapis.com https://maps.gstatic.com " +
        "https://*.supabase.co https://*.supabase.in " +
        "https://*.googleusercontent.com",
      // Maps makes XHR/fetch calls to these
      // domains for tile data and place lookups.
      "connect-src 'self' " +
        "https://maps.googleapis.com https://*.supabase.co " +
        "https://*.supabase.in " +
        "https://nominatim.openstreetmap.org",
      // Google Fonts, if used anywhere in the app —
      // included defensively since Maps' default
      // UI controls can pull in Google-hosted fonts.
      "font-src 'self' data: https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
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
