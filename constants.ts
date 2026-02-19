
export const DEFAULT_CONFIG = {
  panelWattage: 400,
  panelEfficiency: 0.18,
  electricityRate: 0.25, // $/kWh
  costPerPanel: 1200, // Fully installed $
  avgSunHours: 4.5, // Daily average
};

export const PANEL_SIZE_M2 = 1.75; // Standard panel ~1.75m^2
export const ROOF_UTILIZATION_FACTOR = 0.85; // Account for edges and spacing

export const STEP_METADATA = [
  { id: 'welcome', label: 'Start' },
  { id: 'location', label: 'Location' },
  { id: 'drawing', label: 'Roof Area' },
  { id: 'config', label: 'Rates' },
  { id: 'results', label: 'Report' },
];
