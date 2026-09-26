export type LanguageCode = 'en' | 'hi' | 'mr' | 'te' | 'pa' | 'ta' | 'bn' | 'kn';

export interface AgroClimaticZone {
  id: string;
  name: string;
  state: string;
  regionalTitle: string;
  soilType: string;
  annualRainfallMm: number;
  primaryCrops: string[];
  climateVulnerability: string;
  currentSeason: 'Kharif' | 'Rabi' | 'Zaid';
}

export interface SatelliteMicroZone {
  id: string;
  label: string;
  ndvi: number;
  moistureIndex: number;
  thermalDeltaC: number;
  status: 'Optimal' | 'Mild Stress' | 'High Stress' | 'Fallow/Dry';
  soilMoistureLevel: string;
  chlorophyllVigor: string;
  recommendedAction: string;
}

export interface SatellitePlot {
  id: string;
  farmerName: string;
  village: string;
  district: string;
  zoneId: string;
  landAreaHectares: number; // small/marginal e.g. 0.8 to 1.5 ha
  crop: string;
  sowingDate: string;
  lastSatellitePass: string;
  satelliteConstellation: 'Sentinel-2 Multispectral' | 'Landsat-9 OLI' | 'RISAT-1A SAR';
  overallNdvi: number;
  historicalNdvi: { date: string; ndvi: number; baselineAvg: number }[];
  soilMoisturePercent: number;
  canopyWaterStress: 'Low' | 'Moderate' | 'Severe';
  microZones: SatelliteMicroZone[];
  alerts: string[];
}

export interface SoilHealthCardData {
  sampleId: string;
  farmerName: string;
  district: string;
  state: string;
  soilType: string;
  ph: number;
  ec: number; // dS/m
  organicCarbon: number; // %
  nitrogen: number; // kg/ha
  phosphorus: number; // kg/ha
  potassium: number; // kg/ha
  sulphur: number; // ppm
  zinc: number; // ppm
  iron: number; // ppm
  boron: number; // ppm
  testedDate: string;
  statusRating: {
    nitrogen: 'Deficient' | 'Sufficient' | 'Surplus';
    phosphorus: 'Deficient' | 'Sufficient' | 'Surplus';
    potassium: 'Deficient' | 'Sufficient' | 'Surplus';
    organicCarbon: 'Very Low' | 'Low' | 'Medium' | 'High';
    phStatus: 'Acidic' | 'Normal' | 'Alkaline' | 'Saline';
  };
}

export interface DailyWeatherForecast {
  date: string;
  day: string;
  tempMax: number;
  tempMin: number;
  rainMm: number;
  rainProbability: number;
  humidity: number;
  windSpeedKmH: number;
  et0: number; // evapotranspiration mm/day
  condition: 'Sunny' | 'Partly Cloudy' | 'Showers' | 'Heavy Monsoon Rain' | 'Heatwave Warning' | 'Thunderstorm';
  spraySuitability: 'Ideal' | 'Caution: High Wind' | 'Unsuitable: Rain Imminent';
  irrigationGuidance: 'No irrigation needed' | 'Light furrow irrigation' | 'Deficit irrigation' | 'Drain field excess';
}

export interface CrossStateInnovation {
  id: string;
  title: string;
  sourceState: string;
  targetState: string;
  climateThreat: string;
  cropCategory: string;
  technology: string;
  waterSavingsPercent: number;
  inputCostReductionPercent: number;
  yieldResilienceGain: string;
  championFarmer: {
    name: string;
    village: string;
    phoneVerification: string;
    landholding: string;
  };
  kvkPartner: string;
  description: string;
  stepsToReplicate: string[];
  recommendedInputs: string[];
}

export interface CropDiagnosticSample {
  id: string;
  crop: string;
  commonName: string;
  vernacularName: string;
  pathogenType: 'Fungal' | 'Pest Infestation' | 'Viral' | 'Nutrient Deficiency';
  symptoms: string[];
  severity: 'Mild' | 'Moderate' | 'Severe';
  organicCure: string[];
  chemicalCure: string;
  svgVisualType: 'yellow_rust' | 'leaf_blast' | 'bollworm' | 'aphids' | 'early_blight';
}
