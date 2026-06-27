export interface PanelFootprint {
  watts: number;
  lengthM: number;
  widthM: number;
  areaM2: number;
}

export const PANEL_FOOTPRINTS: PanelFootprint[] = [
  { watts: 400, lengthM: 1.755, widthM: 1.038, areaM2: 1.82 },
  { watts: 450, lengthM: 1.909, widthM: 1.038, areaM2: 1.98 },
  { watts: 550, lengthM: 2.279, widthM: 1.134, areaM2: 2.58 },
  { watts: 650, lengthM: 2.384, widthM: 1.303, areaM2: 3.11 },
  { watts: 700, lengthM: 2.384, widthM: 1.303, areaM2: 3.11 },
];

export function getPanelFootprint(watts: number): PanelFootprint {
  return PANEL_FOOTPRINTS.find((p) => p.watts === watts) ?? PANEL_FOOTPRINTS[2];
}

export const INSTALL_SPACING_FACTOR = 1.20;

export interface FitCheckResult {
  panelsRequired: number;
  panelWatts: number;
  installedAreaPerPanelM2: number;
  totalAreaNeededM2: number;
  usableRoofAreaM2: number;
  maxPanelsThatFit: number;
  fits: boolean;
  shortfallPanels: number;
  message: string;
}

export function checkPanelFit(
  panelsRequired: number,
  panelWatts: number,
  usableRoofAreaM2: number
): FitCheckResult {
  const footprint = getPanelFootprint(panelWatts);
  const installedAreaPerPanelM2 = Math.round(footprint.areaM2 * INSTALL_SPACING_FACTOR * 100) / 100;
  const totalAreaNeededM2 = Math.round(panelsRequired * installedAreaPerPanelM2 * 100) / 100;
  
  const maxPanelsThatFit = Math.floor(usableRoofAreaM2 / installedAreaPerPanelM2);
  const fits = maxPanelsThatFit >= panelsRequired;
  const shortfallPanels = fits ? 0 : panelsRequired - maxPanelsThatFit;

  let message: string;
  if (fits) {
    const spareM2 = Math.round((usableRoofAreaM2 - totalAreaNeededM2) * 10) / 10;
    message = `Your roof comfortably fits the recommended ${panelsRequired} × ${panelWatts}W panels, with approximately ${spareM2}m² of usable roof space remaining.`;
  } else {
    message = `Your traced roof area can only fit approximately ${maxPanelsThatFit} panels at ${panelWatts}W each — ${shortfallPanels} short of the ${panelsRequired} panels your system needs. Consider a smaller-footprint panel tier, splitting the array across additional roof faces, or reviewing whether the traced area includes all usable roof surfaces.`;
  }

  return {
    panelsRequired,
    panelWatts,
    installedAreaPerPanelM2,
    totalAreaNeededM2,
    usableRoofAreaM2,
    maxPanelsThatFit,
    fits,
    shortfallPanels,
    message,
  };
}
