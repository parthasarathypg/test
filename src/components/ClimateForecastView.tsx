import React, { useState } from 'react';
import {
  CloudRain,
  Sun,
  CloudLightning,
  Wind,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  RefreshCw,
  Umbrella,
  Compass,
} from 'lucide-react';
import { AgroClimaticZone, DailyWeatherForecast, LanguageCode } from '../types/farming';
import { MOCK_WEATHER_FORECASTS, UI_TRANSLATIONS } from '../data/mockAgroData';

interface ClimateForecastViewProps {
  zone: AgroClimaticZone;
  language: LanguageCode;
}

export const ClimateForecastView: React.FC<ClimateForecastViewProps> = ({
  zone,
  language,
}) => {
  const forecasts = MOCK_WEATHER_FORECASTS;
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;
  const [selectedDay, setSelectedDay] = useState<DailyWeatherForecast>(forecasts[0]);
  const [isLoadingAdvisory, setIsLoadingAdvisory] = useState(false);
  const [weatherAdvisory, setWeatherAdvisory] = useState<string | null>(null);

  // Total rainfall expected in next 7 days
  const totalRain7Days = forecasts.slice(0, 7).reduce((acc, curr) => acc + curr.rainMm, 0);

  const handleGetClimateAdvisory = async () => {
    setIsLoadingAdvisory(true);
    setWeatherAdvisory(null);
    try {
      const response = await fetch('/api/gemini/crop-advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: zone.primaryCrops[0],
          region: `${zone.state} - ${zone.name}`,
          soilType: zone.soilType,
          growthStage: 'Active vegetative to flowering',
          issueDescription: `14-day weather forecast shows a total of ${totalRain7Days}mm rain coming up. On ${selectedDay.date}, rain probability is ${selectedDay.rainProbability}% (${selectedDay.rainMm}mm), humidity ${selectedDay.humidity}%, max temp ${selectedDay.tempMax}°C, wind speed ${selectedDay.windSpeedKmH} km/h. Need irrigation, spraying, and disease prevention schedule for small farmer.`,
          weatherContext: `Monsoon trajectory in ${zone.state}. Challenge: ${zone.climateVulnerability}`,
          language: language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : language === 'te' ? 'Telugu' : language === 'pa' ? 'Punjabi' : 'English',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setWeatherAdvisory(data.advisory);
      } else {
        setWeatherAdvisory('Failed to generate climate-smart advisory.');
      }
    } catch (err) {
      setWeatherAdvisory('Network error connecting to IMD Agro-Met advisory server.');
    } finally {
      setIsLoadingAdvisory(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <span>Hyperlocal AWS Station: {zone.state} Central Agro-Met</span>
              <span aria-hidden="true">·</span>
              <span>Updated: Real-time Radar & IMD Satellite feed</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 font-heading">
              {t.climateTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200 text-xs">
            <Umbrella className="w-4 h-4 text-sky-600" />
            <span className="text-stone-700 font-medium">7-Day Cumulative Rain:</span>
            <span className="font-bold text-stone-900 font-mono-numbers">{totalRain7Days} mm</span>
          </div>
        </div>

        {/* Dynamic Critical Weather Alert */}
        <div className="mt-4 bg-sky-50/70 border border-sky-200 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-sky-950 block">
                Agro-Meteorological Advisory: 38-45 mm Deluge Forecast on Sep 29 - Sep 30
              </span>
              <span className="text-stone-600">
                Postpone foliar pesticide sprays and nitrogen top-dressing to prevent chemical wash-off. Open field drainage notches.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-semibold text-sky-900 bg-sky-100 px-2.5 py-1 rounded text-[11px] border border-sky-200">
              Drainage Clearance Priority
            </span>
          </div>
        </div>
      </div>

      {/* 14-Day Horizontal Scroll Strip */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            14-Day Micro-Climate Horizon & Spraying Window
          </h3>
          <span className="text-xs text-stone-500">Select any day for field schedule</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 overflow-x-auto pb-1">
          {forecasts.map((fc, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDay(fc)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedDay.date === fc.date
                  ? 'border-emerald-500 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-500'
                  : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700 mb-1">
                <span>{fc.day}</span>
                <span className="text-stone-400 font-mono-numbers">{fc.date}</span>
              </div>

              {/* Weather icon */}
              <div className="my-1.5 flex items-center justify-center">
                {fc.condition.includes('Rain') || fc.condition.includes('Showers') ? (
                  <CloudRain className="w-6 h-6 text-sky-600" />
                ) : fc.condition.includes('Thunderstorm') ? (
                  <CloudLightning className="w-6 h-6 text-amber-500" />
                ) : (
                  <Sun className="w-6 h-6 text-amber-500" />
                )}
              </div>

              {/* Temps */}
              <div className="flex items-baseline justify-between text-xs font-mono-numbers">
                <span className="font-bold text-stone-900">{fc.tempMax}°</span>
                <span className="text-stone-400">{fc.tempMin}°</span>
              </div>

              {/* Rain mm */}
              <div className="mt-1 flex items-center justify-between text-[10px] text-stone-600">
                <span className="text-sky-700 font-medium">{fc.rainProbability}%</span>
                <span className="font-mono-numbers">{fc.rainMm}mm</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Day In-Depth Field Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Meteorological Diagnostics (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <span className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold">
                Agro-Met Parameters for {selectedDay.day}, {selectedDay.date}
              </span>
              <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <span>Condition: {selectedDay.condition}</span>
              </h4>
            </div>

            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded border ${
                selectedDay.spraySuitability === 'Ideal'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : selectedDay.spraySuitability === 'Caution: High Wind'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              Spraying: {selectedDay.spraySuitability}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
              <span className="text-stone-500 block text-[11px] mb-1">Precipitation</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold font-mono-numbers text-sky-700">
                  {selectedDay.rainMm}
                </span>
                <span className="text-[11px] text-stone-400">mm ({selectedDay.rainProbability}%)</span>
              </div>
            </div>

            <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
              <span className="text-stone-500 block text-[11px] mb-1">Relative Humidity</span>
              <div className="flex items-baseline gap-1">
                <Droplets className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-lg font-bold font-mono-numbers text-stone-900">
                  {selectedDay.humidity}%
                </span>
              </div>
            </div>

            <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
              <span className="text-stone-500 block text-[11px] mb-1">Wind Speed</span>
              <div className="flex items-baseline gap-1">
                <Wind className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-lg font-bold font-mono-numbers text-stone-900">
                  {selectedDay.windSpeedKmH}
                </span>
                <span className="text-[10px] text-stone-400">km/h</span>
              </div>
            </div>

            <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
              <span className="text-stone-500 block text-[11px] mb-1">Evapotranspiration (ET₀)</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold font-mono-numbers text-stone-900">
                  {selectedDay.et0}
                </span>
                <span className="text-[10px] text-stone-400">mm/day</span>
              </div>
            </div>
          </div>

          {/* Action guidance */}
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-stone-900 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Recommended Farm Operations Schedule</span>
            </div>
            <ul className="space-y-1 text-stone-600 list-disc list-inside">
              <li>
                <strong className="text-stone-800">Irrigation Advice:</strong> {selectedDay.irrigationGuidance}
              </li>
              <li>
                <strong className="text-stone-800">Spraying Protocols:</strong> {selectedDay.spraySuitability} (Max wind threshold 12 km/h for knapsack sprays)
              </li>
              <li>
                <strong className="text-stone-800">Crop Health Precaution:</strong> High humidity ({selectedDay.humidity}%) creates micro-environment for fungal spores; inspect leaf underside.
              </li>
            </ul>
          </div>
        </div>

        {/* Right: AI Agro-Met Advisory (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="border-b border-stone-100 pb-2">
              <span className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold">
                Climate Adaptation Engine
              </span>
              <h4 className="text-base font-bold text-stone-900">
                Hyperlocal Climate AI Consultant
              </h4>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Synthesize 14-day rainfall trends, evapotranspiration rates, and regional climate risks into a customized irrigation and field protection schedule.
            </p>

            <button
              onClick={handleGetClimateAdvisory}
              disabled={isLoadingAdvisory}
              className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs py-2.5 px-4 rounded-lg transition-colors shadow-xs disabled:opacity-60"
            >
              {isLoadingAdvisory ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Agro-Meteorological Advisory...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Generate Climate-Smart Advisory (Gemini 3.8 Flash)</span>
                </>
              )}
            </button>
          </div>

          {weatherAdvisory && (
            <div className="bg-white border border-emerald-300 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  IMD-Grounded Weather Action Plan
                </span>
                <span className="text-[10px] text-stone-400">Gemini 3.8 Flash</span>
              </div>
              <div className="text-xs text-stone-800 leading-relaxed whitespace-pre-line space-y-2 max-h-72 overflow-y-auto pr-1">
                {weatherAdvisory}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
