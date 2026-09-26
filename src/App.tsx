import React, { useState } from 'react';
import { Header } from './components/Header';
import { SatelliteFieldInspector } from './components/SatelliteFieldInspector';
import { SoilHealthCardEngine } from './components/SoilHealthCardEngine';
import { ClimateForecastView } from './components/ClimateForecastView';
import { CrossStateNetwork } from './components/CrossStateNetwork';
import { CropDiagnosticModal } from './components/CropDiagnosticModal';
import { QuickAdvisoryWidget } from './components/QuickAdvisoryWidget';
import { AGRO_CLIMATIC_ZONES, UI_TRANSLATIONS } from './data/mockAgroData';
import { AgroClimaticZone, LanguageCode } from './types/farming';
import {
  Satellite,
  FlaskConical,
  CloudRain,
  Share2,
  Stethoscope,
  ShieldCheck,
  TrendingDown,
  Droplets,
  Sprout,
  Users,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'satellite' | 'soil' | 'climate' | 'cross-state' | 'diagnostic'>('satellite');
  const [selectedZone, setSelectedZone] = useState<AgroClimaticZone>(AGRO_CLIMATIC_ZONES[0]);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900 selection:bg-emerald-200 selection:text-emerald-950">
      {/* Header with Navigation and Language/Zone Selectors */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedZone={selectedZone}
        setSelectedZone={setSelectedZone}
        language={language}
        setLanguage={setLanguage}
        onOpenDiagnostic={() => setIsDoctorModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Core Metric Banner: Grounding Smallholder Reality in India */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-stone-500 block text-[11px]">Marginal Landholdings</span>
              <span className="font-bold text-stone-900 text-sm font-mono-numbers">86.2% of Indian Farms</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="text-stone-500 block text-[11px]">Water Saved (Cross-State)</span>
              <span className="font-bold text-sky-800 text-sm font-mono-numbers">32.4% avg reduction</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-stone-500 block text-[11px]">Fertilizer Input Savings</span>
              <span className="font-bold text-amber-800 text-sm font-mono-numbers">₹2,840/ha saved</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <span className="text-stone-500 block text-[11px]">Target Region Crop</span>
              <span className="font-bold text-stone-900 text-sm truncate max-w-[130px]">
                {selectedZone.primaryCrops[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Viewport Switching */}
        {activeTab === 'satellite' && (
          <SatelliteFieldInspector
            zone={selectedZone}
            language={language}
            onOpenDoctor={() => setIsDoctorModalOpen(true)}
          />
        )}

        {activeTab === 'soil' && (
          <SoilHealthCardEngine
            zone={selectedZone}
            language={language}
          />
        )}

        {activeTab === 'climate' && (
          <ClimateForecastView
            zone={selectedZone}
            language={language}
          />
        )}

        {activeTab === 'cross-state' && (
          <CrossStateNetwork
            currentZone={selectedZone}
            language={language}
          />
        )}

        {activeTab === 'diagnostic' && (
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-heading">
              AI Kisan Doctor & Crop Pathology Diagnostic Center
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
              Diagnose pest outbreaks, fungal blights, and leaf rusts using multimodal camera capture or curated regional disease templates. Get affordable organic recipes and precise sprayer dilutions.
            </p>
            <button
              onClick={() => setIsDoctorModalOpen(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 px-5 rounded-lg transition-colors shadow-sm"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Launch Disease Pathology Scanner</span>
            </button>
          </div>
        )}

        {/* Universal Floating or Bottom Vernacular AI Assistant */}
        <QuickAdvisoryWidget
          zone={selectedZone}
          language={language}
        />
      </main>

      {/* Multimodal Diagnostic Modal */}
      <CropDiagnosticModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        zone={selectedZone}
        language={language}
      />

      {/* Footer - Clean, Anti-Slop Editorial Design */}
      <footer className="border-t border-stone-200 bg-white py-6 text-xs text-stone-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-stone-800">KisanSetu Agricultural Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Empowering India's Small & Marginal Farmers</span>
          </div>

          <div className="flex items-center gap-4 text-stone-500">
            <span>Aligned with ICAR-NICRA</span>
            <span aria-hidden="true">·</span>
            <span>Soil Health Card Scheme</span>
            <span aria-hidden="true">·</span>
            <span>PM Fasal Bima Yojana</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
