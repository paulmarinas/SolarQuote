
import { RoofData, SolarConfig, EstimationResults } from '../types';
import { PANEL_SIZE_M2, ROOF_UTILIZATION_FACTOR } from '../constants';

export const calculateSolarEstimation = (
  roof: RoofData,
  config: SolarConfig
): EstimationResults => {
  // 1. Calculate how many panels fit
  const usableArea = roof.areaM2 * ROOF_UTILIZATION_FACTOR;
  const panelCount = Math.floor(usableArea / PANEL_SIZE_M2);

  // 2. System size in kW
  const systemSizeKw = (panelCount * config.panelWattage) / 1000;

  // 3. Annual Production (Rough estimate)
  // Production = System Size * Peak Sun Hours * Efficiency Correction (Shade/Inverter loss) * 365
  const efficiencyLoss = 0.85; // System losses
  const annualProductionKwh = systemSizeKw * config.avgSunHours * 365 * efficiencyLoss;

  // 4. Financials
  const totalCost = panelCount * config.costPerPanel;
  const monthlySavings = (annualProductionKwh / 12) * config.electricityRate;
  const annualSavings = annualProductionKwh * config.electricityRate;
  const roiYears = annualSavings > 0 ? totalCost / annualSavings : 0;

  return {
    systemSizeKw,
    panelCount,
    totalCost,
    annualProductionKwh,
    monthlySavings,
    roiYears: parseFloat(roiYears.toFixed(1))
  };
};
