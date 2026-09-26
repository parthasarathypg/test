import React, { useState } from 'react';
import {
  Satellite,
  Layers,
  Thermometer,
  Droplets,
  Eye,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Info,
  Calendar,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { AgroClimaticZone, SatellitePlot, SatelliteMicroZone, LanguageCode } from '../types/farming';
import { SATELLITE_PLOTS, UI_TRANSLATIONS } from '../data/mockAgroData';

interface SatelliteFieldInspectorProps {
  zone: AgroClimaticZone;
  language: LanguageCode;
  onOpenDoctor: () => void;
}

export const SatelliteFieldInspector: React.FC<SatelliteFieldInspectorProps> = ({
  zone,
  language,
  onOpenDoctor,
}) => {
  const plot: SatellitePlot = SATELLITE_PLOTS[zone.id] || SATELLITE_PLOTS['zone-trans-gangetic'];
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  const [activeLayer, setActiveLayer] = useState<'ndvi' | 'ndwi' | 'thermal' | 'rgb'>('ndvi');
  const [selectedMicroZone, setSelectedMicroZone] = useState<SatelliteMicroZone>(plot.microZones[0]);
  const [aiAdvisory, setAiAdvisory] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Generate satellite advisory using server-side Gemini
  const handleGenerateSatelliteAdvisory = async () => {
    setIsLoadingAi(true);
    setAiAdvisory(null);
    try {
      const response = await fetch('/api/gemini/crop-advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: plot.crop,
          region: `${zone.state} - ${zone.name}`,
          soilType: zone.soilType,
          growthStage: 'Mid vegetative / Tillering',
          issueDescription: `Satellite observation shows overall plot NDVI of ${plot.overallNdvi}, soil moisture at ${plot.soilMoisturePercent}%. Zone ${selectedMicroZone.label} has NDVI of ${selectedMicroZone.ndvi} and thermal delta of ${selectedMicroZone.thermalDeltaC}°C (${selectedMicroZone.status}).`,
          weatherContext: `Rainfall deficit alert in taluk. Climate vulnerability: ${zone.climateVulnerability}`,
          language: language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : language === 'te' ? 'Telugu' : language === 'pa' ? 'Punjabi' : 'English',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAiAdvisory(data.advisory);
      } else {
        setAiAdvisory('Failed to generate advisory from satellite telemetry.');
      }
    } catch (err: any) {
      setAiAdvisory('Network error connecting to satellite intelligence server.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Color mapping based on layer
  const getZoneColor = (mz: SatelliteMicroZone, layer: typeof activeLayer) => {
    if (layer === 'ndvi') {
      if (mz.ndvi >= 0.7) return 'fill-emerald-600 stroke-emerald-800';
      if (mz.ndvi >= 0.55) return 'fill-emerald-400 stroke-emerald-600';
      if (mz.ndvi >= 0.45) return 'fill-amber-400 stroke-amber-600';
      return 'fill-rose-500 stroke-rose-700';
    }
    if (layer === 'ndwi') {
      if (mz.moistureIndex >= 0.45) return 'fill-sky-600 stroke-sky-800';
      if (mz.moistureIndex >= 0.3) return 'fill-sky-400 stroke-sky-600';
      if (mz.moistureIndex >= 0.2) return 'fill-amber-300 stroke-amber-500';
      return 'fill-orange-500 stroke-orange-700';
    }
    if (layer === 'thermal') {
      if (mz.thermalDeltaC <= 0) return 'fill-blue-500 stroke-blue-700';
      if (mz.thermalDeltaC <= 1.5) return 'fill-emerald-500 stroke-emerald-700';
      if (mz.thermalDeltaC <= 2.5) return 'fill-amber-500 stroke-amber-700';
      return 'fill-rose-600 stroke-rose-800';
    }
    // RGB optical
    return 'fill-lime-700 stroke-lime-900';
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <span>{plot.village}, {plot.district}</span>
              <span aria-hidden="true">·</span>
              <span>{plot.landAreaHectares} ha ({ (plot.landAreaHectares * 2.471).toFixed(1) } acres)</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-emerald-700">{plot.crop}</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 font-heading">
              {t.satelliteTitle}
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
            <div className="flex items-center gap-1.5">
              <Satellite className="w-4 h-4 text-emerald-600" />
              <span className="font-medium text-stone-800">{plot.satelliteConstellation}</span>
            </div>
            <span aria-hidden="true" className="text-stone-300">|</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>Pass: {new Date(plot.lastSatellitePass).toLocaleDateString()}</span>
            </div>
            <span aria-hidden="true" className="text-stone-300">|</span>
            <span className="text-emerald-700 font-medium">10m Ground Resolution</span>
          </div>
        </div>

        {/* Priority Satellite Alerts */}
        {plot.alerts.length > 0 && (
          <div className="mt-4 bg-amber-50/80 border border-amber-200/80 rounded-lg p-3.5">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-amber-900">
                <span className="font-semibold text-amber-950 block uppercase tracking-wide text-[10px]">
                  {t.urgentAlert}
                </span>
                {plot.alerts.map((alert, idx) => (
                  <p key={idx} className="leading-relaxed">{alert}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Interactive Parcel Map & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Satellite Parcel (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Digital Field Parcel GIS (Sentinel-2 Surface Reflectance)
            </h3>

            {/* Layer Filter Buttons */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveLayer('ndvi')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeLayer === 'ndvi'
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                NDVI Vigor
              </button>
              <button
                onClick={() => setActiveLayer('ndwi')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeLayer === 'ndwi'
                    ? 'bg-white text-sky-800 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Moisture Index
              </button>
              <button
                onClick={() => setActiveLayer('thermal')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeLayer === 'thermal'
                    ? 'bg-white text-rose-800 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Thermal Stress
              </button>
              <button
                onClick={() => setActiveLayer('rgb')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeLayer === 'rgb'
                    ? 'bg-white text-stone-800 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                True Color
              </button>
            </div>
          </div>

          {/* Interactive SVG Field Parcel */}
          <div className="relative border border-stone-300 rounded-lg overflow-hidden bg-stone-950 p-2">
            <div className="absolute top-3 left-3 z-10 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded border border-stone-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Layer: {activeLayer.toUpperCase()} Composite</span>
              <span className="text-stone-400">|</span>
              <span className="font-mono-numbers">Lat 29.83° N, Lon 75.98° E</span>
            </div>

            <svg
              viewBox="0 0 500 320"
              className="w-full h-64 sm:h-72 object-contain"
              role="img"
              aria-label="Interactive farm parcel showing 4 satellite micro-zones"
            >
              {/* Background Cadastral Farm Boundary */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
                </pattern>
                <linearGradient id="irrigChannel" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              <rect width="500" height="320" fill="#1c1917" />
              <rect width="500" height="320" fill="url(#grid)" />

              {/* Water Channel / Field Bund */}
              <path
                d="M 30,30 L 470,30 L 470,290 L 30,290 Z"
                fill="none"
                stroke="#78716c"
                strokeWidth="4"
                strokeDasharray="6 3"
              />
              <path
                d="M 30,160 L 470,160"
                fill="none"
                stroke="url(#irrigChannel)"
                strokeWidth="2.5"
                opacity="0.8"
              />
              <path
                d="M 250,30 L 250,290"
                fill="none"
                stroke="#57534e"
                strokeWidth="2"
              />

              {/* Zone A: Top-Left */}
              <g
                onClick={() => setSelectedMicroZone(plot.microZones[0])}
                className="cursor-pointer transition-all hover:opacity-90"
              >
                <polygon
                  points="35,35 245,35 245,155 35,155"
                  className={`${getZoneColor(plot.microZones[0], activeLayer)} ${
                    selectedMicroZone.id === plot.microZones[0].id ? 'stroke-white stroke-[3]' : 'stroke-1'
                  }`}
                  opacity="0.85"
                />
                <text x="50" y="65" fill="#ffffff" fontSize="12" fontWeight="bold">
                  {plot.microZones[0].label}
                </text>
                <text x="50" y="85" fill="#f5f5f4" fontSize="10" fontFamily="monospace">
                  NDVI: {plot.microZones[0].ndvi} · {plot.microZones[0].status}
                </text>
              </g>

              {/* Zone B: Top-Right */}
              <g
                onClick={() => setSelectedMicroZone(plot.microZones[1])}
                className="cursor-pointer transition-all hover:opacity-90"
              >
                <polygon
                  points="255,35 465,35 465,155 255,155"
                  className={`${getZoneColor(plot.microZones[1], activeLayer)} ${
                    selectedMicroZone.id === plot.microZones[1].id ? 'stroke-white stroke-[3]' : 'stroke-1'
                  }`}
                  opacity="0.85"
                />
                <text x="270" y="65" fill="#ffffff" fontSize="12" fontWeight="bold">
                  {plot.microZones[1].label}
                </text>
                <text x="270" y="85" fill="#f5f5f4" fontSize="10" fontFamily="monospace">
                  NDVI: {plot.microZones[1].ndvi} · {plot.microZones[1].status}
                </text>
              </g>

              {/* Zone C: Bottom-Left */}
              <g
                onClick={() => setSelectedMicroZone(plot.microZones[2])}
                className="cursor-pointer transition-all hover:opacity-90"
              >
                <polygon
                  points="35,165 245,165 245,285 35,285"
                  className={`${getZoneColor(plot.microZones[2], activeLayer)} ${
                    selectedMicroZone.id === plot.microZones[2].id ? 'stroke-white stroke-[3]' : 'stroke-1'
                  }`}
                  opacity="0.85"
                />
                <text x="50" y="195" fill="#ffffff" fontSize="12" fontWeight="bold">
                  {plot.microZones[2].label}
                </text>
                <text x="50" y="215" fill="#f5f5f4" fontSize="10" fontFamily="monospace">
                  NDVI: {plot.microZones[2].ndvi} · {plot.microZones[2].status}
                </text>
              </g>

              {/* Zone D: Bottom-Right */}
              <g
                onClick={() => setSelectedMicroZone(plot.microZones[3])}
                className="cursor-pointer transition-all hover:opacity-90"
              >
                <polygon
                  points="255,165 465,165 465,285 255,285"
                  className={`${getZoneColor(plot.microZones[3], activeLayer)} ${
                    selectedMicroZone.id === plot.microZones[3].id ? 'stroke-white stroke-[3]' : 'stroke-1'
                  }`}
                  opacity="0.85"
                />
                <text x="270" y="195" fill="#ffffff" fontSize="12" fontWeight="bold">
                  {plot.microZones[3].label}
                </text>
                <text x="270" y="215" fill="#f5f5f4" fontSize="10" fontFamily="monospace">
                  NDVI: {plot.microZones[3].ndvi} · {plot.microZones[3].status}
                </text>
              </g>
            </svg>

            {/* Scale Bar & Legend */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-300 pt-2 px-1">
              <div className="flex items-center gap-3">
                <span className="text-stone-400">Click any zone to inspect:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
                  <span>Optimal (&gt;0.65)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 inline-block" />
                  <span>Mild Stress (0.50-0.65)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
                  <span>High Stress (&lt;0.50)</span>
                </div>
              </div>
              <div className="text-stone-400 font-mono-numbers">
                Plot Cadastre ID: #P-884/2026
              </div>
            </div>
          </div>

          {/* Historical NDVI Anomaly vs Baseline Curve */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                Multi-Pass NDVI Progression vs 5-Year Taluka Baseline
              </span>
              <span className="text-[11px] text-stone-500">Early anomaly detection</span>
            </div>

            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
              <div className="flex items-end justify-between h-28 gap-2 pt-4 px-2">
                {plot.historicalNdvi.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center gap-1 h-20">
                      {/* 5-Year Baseline Bar */}
                      <div
                        style={{ height: `${item.baselineAvg * 100}%` }}
                        className="w-2.5 bg-stone-300 rounded-t-xs"
                        title={`Baseline Avg: ${item.baselineAvg}`}
                      />
                      {/* Current Season Plot Bar */}
                      <div
                        style={{ height: `${item.ndvi * 100}%` }}
                        className={`w-3.5 rounded-t-xs ${
                          item.ndvi >= item.baselineAvg ? 'bg-emerald-600' : 'bg-rose-500'
                        }`}
                        title={`Current Plot: ${item.ndvi}`}
                      />
                    </div>
                    <span className="text-[10px] text-stone-600 font-mono-numbers">{item.date}</span>
                    <span className="text-[9px] font-semibold font-mono-numbers text-stone-700">
                      {item.ndvi}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 text-[11px] text-stone-500 pt-2 border-t border-stone-200 mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2 bg-stone-300 rounded-xs" />
                  <span>5-Yr District Baseline</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2 bg-emerald-600 rounded-xs" />
                  <span>Current Plot Vigor</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Micro-Zone Diagnostics & AI Recommendation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold">
                  Field Micro-Zone Details
                </span>
                <h4 className="text-base font-bold text-stone-900">{selectedMicroZone.label}</h4>
              </div>

              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                  selectedMicroZone.status === 'Optimal'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : selectedMicroZone.status === 'Mild Stress'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {selectedMicroZone.status}
              </span>
            </div>

            {/* Numerical Telemetry Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                <span className="text-stone-500 block text-[11px] mb-1">Vegetation Vigor (NDVI)</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold font-mono-numbers text-stone-900">
                    {selectedMicroZone.ndvi}
                  </span>
                  <span className="text-[10px] text-stone-400">/ 1.00</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-medium">
                  {selectedMicroZone.chlorophyllVigor}
                </span>
              </div>

              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                <span className="text-stone-500 block text-[11px] mb-1">Root-Zone Moisture</span>
                <div className="flex items-baseline gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-sky-600" />
                  <span className="text-lg font-bold font-mono-numbers text-stone-900">
                    {(selectedMicroZone.moistureIndex * 100).toFixed(0)}%
                  </span>
                </div>
                <span className="text-[10px] text-stone-600">
                  {selectedMicroZone.soilMoistureLevel}
                </span>
              </div>

              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                <span className="text-stone-500 block text-[11px] mb-1">Canopy Thermal Delta</span>
                <div className="flex items-baseline gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-lg font-bold font-mono-numbers text-stone-900">
                    {selectedMicroZone.thermalDeltaC > 0 ? `+${selectedMicroZone.thermalDeltaC}` : selectedMicroZone.thermalDeltaC}°C
                  </span>
                </div>
                <span className="text-[10px] text-stone-500">vs Ambient Air Temp</span>
              </div>

              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                <span className="text-stone-500 block text-[11px] mb-1">Transpiration State</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-semibold text-stone-800">
                    {selectedMicroZone.thermalDeltaC > 2.0 ? 'Shutdown (Stress)' : 'Active Cooling'}
                  </span>
                </div>
                <span className="text-[10px] text-stone-500">Stomatal conductance</span>
              </div>
            </div>

            {/* Targeted Action */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 text-xs space-y-1">
              <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                Satellite-Targeted Field Action
              </span>
              <p className="text-stone-700 leading-relaxed">
                {selectedMicroZone.recommendedAction}
              </p>
            </div>

            {/* Actions: AI Agronomist Consultation */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleGenerateSatelliteAdvisory}
                disabled={isLoadingAi}
                className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs py-2.5 px-4 rounded-lg transition-colors shadow-xs disabled:opacity-60"
              >
                {isLoadingAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Satellite Spectral Signatures...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.askAiButton} (Gemini 3.8 Flash)</span>
                  </>
                )}
              </button>

              <button
                onClick={onOpenDoctor}
                className="w-full text-center text-xs text-emerald-700 hover:text-emerald-800 font-medium py-1.5"
              >
                Suspect leaf disease or pest? Open Crop Doctor →
              </button>
            </div>
          </div>

          {/* AI Advisory Response Box */}
          {aiAdvisory && (
            <div className="bg-white border border-emerald-300 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Satellite-Informed Agronomist Advisory
                </span>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider">ICAR-Grounded</span>
              </div>
              <div className="text-xs text-stone-800 leading-relaxed whitespace-pre-line space-y-2 max-h-72 overflow-y-auto pr-1">
                {aiAdvisory}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
