/**
 * Shared Google Maps JavaScript API loader.
 *
 * Both address-search.tsx (Places Autocomplete) and roof-tracer.tsx
 * (satellite map) need window.google.maps. This module ensures the
 * script tag is inserted exactly ONCE regardless of how many components
 * call loadGoogleMaps() or in what order they mount.
 */

let loadPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).google?.maps?.places) {
      resolve();
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      reject(new Error(
        'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set in your environment variables.'
      ));
      return;
    }

    const scriptId = 'google-maps-script';

    if (document.getElementById(scriptId)) {
      // Script tag already injected by a previous call but hasn't fired
      // onload yet — poll until window.google.maps.places is available.
      const checkInterval = setInterval(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).google?.maps?.places) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src =
      `https://maps.googleapis.com/maps/api/js?` +
      `key=${apiKey}&libraries=places&region=NG`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(
        'Failed to load Google Maps script — check network connection and API key validity.'
      ));
    document.head.appendChild(script);
  });

  return loadPromise;
}
