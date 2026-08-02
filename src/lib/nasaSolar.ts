export interface NasaSolarMetrics {
  annualPeakSunHours: number;
  optimalTiltAngle: number;
  avgTemperature: number;
  thermalLossPct: number;
}

export async function getNasaSolarMetrics(lat: number, lon: number): Promise<NasaSolarMetrics | null> {
  try {
    // Use our internal API route proxy to avoid CORS/AdBlocker blocks
    const url = `/api/nasa?lat=${lat}&lon=${lon}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error('NASA POWER Proxy failed:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    // Extracting annual values
    const annualPeakSunHours = data.properties?.parameter?.ALLSKY_SFC_SW_DWN?.ANN;
    const optimalTiltAngle = Math.abs(lat); // NASA POWER does not support ALLSKY_OPTS_SLP in climatology point. Lat is standard optimal tilt.
    const avgTemperature = data.properties?.parameter?.T2M?.ANN;
    
    if (
      typeof annualPeakSunHours !== 'number' ||
      typeof avgTemperature !== 'number'
    ) {
      console.error('NASA POWER API response missing required data:', data);
      return null;
    }

    // Standard panels lose ~0.4% per °C above 25°C. 
    // If average temperature is below 25, loss is 0 (or technically a gain, but we'll floor at 0 for thermal loss).
    const tempAbove25 = Math.max(0, avgTemperature - 25);
    const thermalLossPct = tempAbove25 * 0.4;
    
    return {
      annualPeakSunHours,
      optimalTiltAngle,
      avgTemperature,
      thermalLossPct,
    };
  } catch (error) {
    console.error('Error fetching NASA POWER data:', error);
    return null;
  }
}
