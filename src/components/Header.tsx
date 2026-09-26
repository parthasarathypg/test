import React from 'react';
import {
  Sprout,
  Satellite,
  FlaskConical,
  CloudRain,
  Share2,
  Stethoscope,
  Globe2,
  MapPin,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { AgroClimaticZone, LanguageCode } from '../types/farming';
import { AGRO_CLIMATIC_ZONES, UI_TRANSLATIONS } from '../data/mockAgroData';

interface HeaderProps {
  activeTab: 'satellite' | 'soil' | 'climate' | 'cross-state' | 'diagnostic';
  setActiveTab: (tab: 'satellite' | 'soil' | 'climate' | 'cross-state' | 'diagnostic') => void;
  selectedZone: AgroClimaticZone;
  setSelectedZone: (zone: AgroClimaticZone) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  onOpenDiagnostic: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedZone,
  setSelectedZone,
  language,
  setLanguage,
  onOpenDiagnostic,
}) => {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  const languages: { code: LanguageCode; label: string; script: string }[] = [
    { code: 'en', label: 'English', script: 'EN' },
    { code: 'hi', label: 'हिन्दी', script: 'HI' },
    { code: 'mr', label: 'मराठी', script: 'MR' },
    { code: 'te', label: 'తెలుగు', script: 'TE' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ', script: 'PA' },
    { code: 'ta', label: 'தமிழ்', script: 'TA' },
    { code: 'bn', label: 'বাংলা', script: 'BN' },
    { code: 'kn', label: 'ಕನ್ನಡ', script: 'KN' },
  ];

  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-40 shadow-sm">
      {/* Top Banner: Regional Context & Priority Alert */}
      <div className="bg-emerald-950/80 border-b border-emerald-900/60 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-emerald-200">
          <span className="inline-flex items-center gap-1 font-medium bg-emerald-900/90 text-emerald-300 px-2 py-0.5 rounded text-[11px]">
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            {t.verifiedKvk}
          </span>
          <span className="hidden sm:inline text-stone-400">·</span>
          <span className="text-stone-300 truncate max-w-md sm:max-w-xl">
            {selectedZone.climateVulnerability}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-stone-300 font-mono-numbers text-[11px] bg-stone-800/80 px-2 py-0.5 rounded border border-stone-700">
            {t.landHoldingLabel}
          </span>
          <div className="flex items-center gap-1 text-amber-300 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-medium">IMD Monsoon Watch: Active</span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/20">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-heading">
                {t.appTitle}
              </h1>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                ICAR-NICRA Network
              </span>
            </div>
            <p className="text-xs text-stone-400 hidden sm:block max-w-md line-clamp-1">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Zone Selector & Language Selector */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Agro-Climatic Zone */}
          <div className="flex items-center gap-1.5 bg-stone-800/90 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <label htmlFor="zone-select" className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                {t.selectZone}
              </label>
              <select
                id="zone-select"
                value={selectedZone.id}
                onChange={(e) => {
                  const z = AGRO_CLIMATIC_ZONES.find((item) => item.id === e.target.value);
                  if (z) setSelectedZone(z);
                }}
                className="bg-transparent text-stone-100 font-medium text-xs focus:outline-none cursor-pointer pr-4"
              >
                {AGRO_CLIMATIC_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id} className="bg-stone-900 text-stone-100">
                    {zone.state} - {zone.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1.5 bg-stone-800/90 border border-stone-700 rounded-lg px-2 py-1 text-xs">
            <Globe2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="bg-transparent text-stone-100 text-xs focus:outline-none cursor-pointer"
              aria-label="Select Interface Language"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="bg-stone-900 text-stone-100">
                  {l.label} ({l.script})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Doctor Button */}
          <button
            onClick={onOpenDiagnostic}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Stethoscope className="w-4 h-4" />
            <span className="hidden sm:inline">{t.navDoctor}</span>
            <span className="sm:hidden">Diagnose</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs - Strict Non-Pill Style */}
      <div className="border-t border-stone-800 bg-stone-950/60 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveTab('satellite')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'satellite'
                ? 'border-emerald-500 text-emerald-400 bg-stone-900/60'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:border-stone-700'
            }`}
          >
            <Satellite className="w-4 h-4" />
            {t.navSatellite}
          </button>

          <button
            onClick={() => setActiveTab('soil')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'soil'
                ? 'border-emerald-500 text-emerald-400 bg-stone-900/60'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:border-stone-700'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            {t.navSoil}
          </button>

          <button
            onClick={() => setActiveTab('climate')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'climate'
                ? 'border-emerald-500 text-emerald-400 bg-stone-900/60'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:border-stone-700'
            }`}
          >
            <CloudRain className="w-4 h-4" />
            {t.navClimate}
          </button>

          <button
            onClick={() => setActiveTab('cross-state')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'cross-state'
                ? 'border-emerald-500 text-emerald-400 bg-stone-900/60'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:border-stone-700'
            }`}
          >
            <Share2 className="w-4 h-4" />
            {t.navCrossState}
            <span className="text-[10px] bg-emerald-950 text-emerald-300 font-semibold px-1.5 py-0.2 rounded border border-emerald-800">
              Inter-State
            </span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'diagnostic'
                ? 'border-emerald-500 text-emerald-400 bg-stone-900/60'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:border-stone-700'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            {t.navDoctor}
          </button>
        </div>
      </div>
    </header>
  );
};
