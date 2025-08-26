// src/lib/geocode.ts
// Utility to geocode a UK postcode using postcodes.io

export interface GeocodeResult {
  latitude: number;
  longitude: number;
}


export async function geocodeAddress(query: string, maxRetries = 5): Promise<GeocodeResult | null> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const resp = await fetch(`https://geocode.maps.co/search?q=${encodeURIComponent(query)}&apikey=${process.env.GEOCODE_MAPS_CO_API_KEY}`);
      if (resp.status === 429) {
        // Rate limited: wait 1s + random 1-500ms, then retry
        const baseDelay = 1000;
        const jitter = Math.floor(Math.random() * 500) + 1;
        await new Promise(res => setTimeout(res, baseDelay + jitter));
        attempt++;
        continue;
      }
      if (resp.status === 503) {
        // Service unavailable: wait 2s + random 0-500ms, try once only
        console.error('Geocode API 503 Service Unavailable. Retrying once...');
        const baseDelay = 2000;
        const jitter = Math.floor(Math.random() * 501); // 0-500ms
        await new Promise(res => setTimeout(res, baseDelay + jitter));
        // Try once more
        const retryResp = await fetch(`https://geocode.maps.co/search?q=${encodeURIComponent(query)}&apikey=${process.env.GEOCODE_MAPS_CO_API_KEY}`);
        if (retryResp.status === 503) {
          console.error('Geocode API 503 Service Unavailable. Giving up after one retry.');
          return null;
        }
        if (!retryResp.ok) return null;
        const retryData = await retryResp.json();
        if (Array.isArray(retryData) && retryData.length > 0) {
          const result = retryData[0];
          return {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
          };
        }
        return null;
      }
      if (!resp.ok) return null;
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        const result = data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        };
      }
      return null;
    } catch (e) {
      console.error('Geocode API error:', e);
      return null;
    }
  }
  return null;
}
