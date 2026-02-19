
import { GoogleGenAI } from "@google/genai";
import { RoofData, SolarConfig, EstimationResults } from '../types';

export const getExpertSolarAnalysis = async (
  roof: RoofData,
  config: SolarConfig,
  results: EstimationResults
): Promise<string> => {
  // Always create a new instance of GoogleGenAI before making an API call to ensure latest config/key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a professional solar energy consultant. Based on the following data for a residential property, provide a concise, encouraging 3-paragraph summary of the project's potential.
    
    Property Details:
    - Roof Area: ${roof.areaM2.toFixed(1)} m²
    - Suggested System Size: ${results.systemSizeKw.toFixed(1)} kW
    - Panel Count: ${results.panelCount}
    - Orientation: ${roof.orientation}
    
    Financial Outlook:
    - Estimated ROI: ${results.roiYears} years
    - Monthly Savings: $${results.monthlySavings.toFixed(2)}
    - Local Electricity Rate: $${config.electricityRate}/kWh
    
    In your response:
    1. Comment on the system size appropriateness for the roof area.
    2. Give advice on best placement (e.g., if South-facing is better, etc).
    3. Provide a concluding thought on the long-term environmental impact.
    
    Keep it professional and readable. Use markdown.
  `;

  try {
    // Using gemini-3-pro-preview for complex reasoning and professional consultation tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    // Access response.text property directly as per Gemini API guidelines
    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "The expert analysis is currently unavailable.";
  }
};
