
export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface RoofData {
  areaM2: number;
  polygonPoints: { lat: number; lng: number }[];
  orientation: 'North' | 'South' | 'East' | 'West' | 'Unknown';
}

export interface SolarConfig {
  panelWattage: number; // Watts per panel
  panelEfficiency: number; // 0.0 to 1.0
  electricityRate: number; // Cost per kWh in local currency
  costPerPanel: number; // Fully installed cost per panel
  avgSunHours: number; // Average peak sun hours per day
}

export interface EstimationResults {
  systemSizeKw: number;
  panelCount: number;
  totalCost: number;
  annualProductionKwh: number;
  monthlySavings: number;
  roiYears: number;
}

export enum AppStep {
  WELCOME = 'welcome',
  LOCATION = 'location',
  DRAWING = 'drawing',
  CONFIG = 'config',
  RESULTS = 'results'
}
