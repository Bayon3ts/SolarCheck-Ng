export interface SolarClimatology {
  worstCasePsh: number;      // Lowest monthly ALLSKY_SFC_SW_DWN
  peakMaxTempC: number;      // Highest monthly T2M_MAX
  thermalDeratingFactor: number; // Calculated efficiency penalty from heat
}

export const STATE_COORDINATES: Record<string, { lat: number; lon: number }> = {
  "Abia": { lat: 5.532, lon: 7.486 },
  "Adamawa": { lat: 9.326, lon: 12.398 },
  "Akwa Ibom": { lat: 5.038, lon: 7.909 },
  "Anambra": { lat: 6.220, lon: 7.006 },
  "Bauchi": { lat: 10.301, lon: 9.823 },
  "Bayelsa": { lat: 4.771, lon: 6.069 },
  "Benue": { lat: 7.190, lon: 8.114 },
  "Borno": { lat: 11.833, lon: 13.150 },
  "Cross River": { lat: 5.870, lon: 8.598 },
  "Delta": { lat: 5.532, lon: 5.898 },
  "Ebonyi": { lat: 6.264, lon: 8.013 },
  "Edo": { lat: 6.340, lon: 5.620 },
  "Ekiti": { lat: 7.621, lon: 5.221 },
  "Enugu": { lat: 6.448, lon: 7.494 },
  "Federal Capital Territory": { lat: 9.076, lon: 7.398 },
  "Gombe": { lat: 10.289, lon: 11.171 },
  "Imo": { lat: 5.485, lon: 7.035 },
  "Jigawa": { lat: 12.228, lon: 9.561 },
  "Kaduna": { lat: 10.510, lon: 7.416 },
  "Kano": { lat: 12.002, lon: 8.591 },
  "Katsina": { lat: 12.990, lon: 7.601 },
  "Kebbi": { lat: 12.450, lon: 4.199 },
  "Kogi": { lat: 7.733, lon: 6.733 },
  "Kwara": { lat: 8.496, lon: 4.542 },
  "Lagos": { lat: 6.524, lon: 3.379 },
  "Nasarawa": { lat: 8.537, lon: 8.520 },
  "Niger": { lat: 9.932, lon: 5.597 },
  "Ogun": { lat: 7.147, lon: 3.361 },
  "Ondo": { lat: 7.100, lon: 5.050 },
  "Osun": { lat: 7.629, lon: 4.181 },
  "Oyo": { lat: 8.157, lon: 3.614 },
  "Plateau": { lat: 9.218, lon: 9.517 },
  "Rivers": { lat: 4.815, lon: 7.049 },
  "Sokoto": { lat: 13.060, lon: 5.243 },
  "Taraba": { lat: 8.893, lon: 11.359 },
  "Yobe": { lat: 12.187, lon: 11.707 },
  "Zamfara": { lat: 12.122, lon: 6.223 }
};

export async function fetchStateSolarData(lat: number, lon: number): Promise<SolarClimatology> {
  try {
    const endpoint = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN,T2M_MAX&community=RE&longitude=${lon}&latitude=${lat}&format=JSON`;
    const res = await fetch(endpoint);
    const data = await res.json();
    
    const pshMonthly = data.properties.parameter.ALLSKY_SFC_SW_DWN;
    const tempMonthly = data.properties.parameter.T2M_MAX;

    const worstCasePsh = Math.min(...Object.values(pshMonthly) as number[]);
    const peakMaxTempC = Math.max(...Object.values(tempMonthly) as number[]);

    // Thermal loss math: STC is 25°C. Cell temp is roughly Ambient + 25°C.
    // Panel power drops by ~0.4% per °C above 25°C cell temp.
    const maxCellTemp = peakMaxTempC + 25;
    const thermalLossPct = Math.max(0, (maxCellTemp - 25) * 0.004);
    const thermalDeratingFactor = 1 - thermalLossPct;

    return { worstCasePsh, peakMaxTempC, thermalDeratingFactor };
  } catch (err) {
    // Fallback defaults for Southern Nigeria worst-case
    return { worstCasePsh: 3.5, peakMaxTempC: 35, thermalDeratingFactor: 0.86 };
  }
}
