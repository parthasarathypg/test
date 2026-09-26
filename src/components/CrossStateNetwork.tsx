import React, { useState } from 'react';
import {
  Share2,
  ArrowRight,
  Droplets,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Building2,
  PhoneCall,
  PlusCircle,
} from 'lucide-react';
import { AgroClimaticZone, CrossStateInnovation, LanguageCode } from '../types/farming';
import { CROSS_STATE_INNOVATIONS, UI_TRANSLATIONS, AGRO_CLIMATIC_ZONES } from '../data/mockAgroData';

interface CrossStateNetworkProps {
  currentZone: AgroClimaticZone;
  language: LanguageCode;
}

export const CrossStateNetwork: React.FC<CrossStateNetworkProps> = ({
  currentZone,
  language,
}) => {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;
  const [innovations, setInnovations] = useState<CrossStateInnovation[]>(CROSS_STATE_INNOVATIONS);
  const [selectedThreat, setSelectedThreat] = useState<string>('All');
  const [selectedInnovation, setSelectedInnovation] = useState<CrossStateInnovation>(CROSS_STATE_INNOVATIONS[0]);

  // AI Cross-State Matchmaker
  const [donorState, setDonorState] = useState<string>('Maharashtra (Vidarbha)');
  const [targetState, setTargetState] = useState<string>(currentZone.state);
  const [climateChallenge, setClimateChallenge] = useState<string>('Mid-Season Drought & Erratic Monsoon');
  const [cropSystem, setCropSystem] = useState<string>(currentZone.primaryCrops[0]);
  const [aiBlueprint, setAiBlueprint] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Filter list
  const filteredInnovations = innovations.filter((item) => {
    if (selectedThreat === 'All') return true;
    return item.climateThreat.toLowerCase().includes(selectedThreat.toLowerCase());
  });

  const handleGenerateBlueprint = async () => {
    setIsLoadingAi(true);
    setAiBlueprint(null);
    try {
      const response = await fetch('/api/gemini/cross-state-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceState: donorState,
          targetState: targetState,
          climateThreat: climateChallenge,
          cropCategory: cropSystem,
          agroClimaticDetails: `Soil: ${currentZone.soilType}. Target agro-climatic zone: ${currentZone.name}. Small farmer holding <2 hectares.`,
          language: language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : language === 'te' ? 'Telugu' : language === 'pa' ? 'Punjabi' : 'English',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAiBlueprint(data.blueprint);
      } else {
        setAiBlueprint('Failed to generate inter-state blueprint.');
      }
    } catch (err) {
      setAiBlueprint('Error connecting to ICAR-NICRA cross-state intelligence server.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <span>National Innovation on Climate Resilient Agriculture (NICRA)</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-emerald-700">Digital Knowledge & Seed Corridor</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 font-heading">
              {t.crossStateTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs text-emerald-900 font-medium">
            <Share2 className="w-4 h-4 text-emerald-700" />
            <span>5 Active State-to-State Corridors</span>
          </div>
        </div>

        <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed max-w-4xl">
          Climate stresses do not stop at state borders. When Vidarbha dryland farmers master drought-hardy intercropping, or Assam and Odisha cultivate submergence-tolerant rice (Swarna-Sub1), this shared digital infrastructure directly transfers verified field practices to farmers facing identical climate hazards in other states.
        </p>
      </div>

      {/* Threat Filter Segmented Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        <span className="font-bold text-stone-700 whitespace-nowrap flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-emerald-600" />
          Filter Hazard:
        </span>
        {['All', 'Drought', 'Groundwater', 'Flood', 'Aridity', 'Salinity'].map((threat) => (
          <button
            key={threat}
            onClick={() => setSelectedThreat(threat)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              selectedThreat === threat
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {threat === 'All' ? 'All Climate Hazards' : threat}
          </button>
        ))}
      </div>

      {/* Main Grid: Innovation Cards (5 cols) & Deep Blueprint (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Case Studies List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredInnovations.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedInnovation(item)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                selectedInnovation.id === item.id
                  ? 'border-emerald-500 bg-white shadow-md ring-1 ring-emerald-500'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs'
              }`}
            >
              {/* State transfer tags */}
              <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 mb-1.5">
                <div className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <span>{item.sourceState}</span>
                  <ArrowRight className="w-3 h-3 text-emerald-600" />
                  <span>{item.targetState}</span>
                </div>
                <span className="text-stone-400 font-mono-numbers">{item.cropCategory}</span>
              </div>

              <h4 className="text-sm font-bold text-stone-900 leading-snug">
                {item.title}
              </h4>

              <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              {/* Metrics strip */}
              <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs font-mono-numbers">
                {item.waterSavingsPercent > 0 && (
                  <div className="flex items-center gap-1 text-sky-700">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>-{item.waterSavingsPercent}% Water</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-emerald-700">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>-{item.inputCostReductionPercent}% Costs</span>
                </div>
                <span className="text-[10px] text-stone-500">ICAR Verified</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Selected Innovation Blueprint & Cross-State AI Generator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Detailed Selected Blueprint */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                <span>Verified Cross-State Transfer Blueprint</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-700 font-medium">{selectedInnovation.climateThreat}</span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-heading">
                {selectedInnovation.title}
              </h3>
            </div>

            {/* Champion Farmer & Institutional Backing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 space-y-1">
                <span className="text-stone-500 flex items-center gap-1.5 font-semibold text-[11px]">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Donor State Champion Farmer
                </span>
                <p className="font-bold text-stone-900">{selectedInnovation.championFarmer.name}</p>
                <p className="text-stone-600 text-[11px]">
                  {selectedInnovation.championFarmer.village} ({selectedInnovation.championFarmer.landholding})
                </p>
                <p className="text-stone-500 font-mono-numbers text-[10px]">
                  {selectedInnovation.championFarmer.phoneVerification}
                </p>
              </div>

              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 space-y-1">
                <span className="text-stone-500 flex items-center gap-1.5 font-semibold text-[11px]">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  KVK & University Institutional Partners
                </span>
                <p className="font-bold text-stone-900 leading-tight">{selectedInnovation.kvkPartner}</p>
                <p className="text-emerald-700 font-medium text-[11px]">
                  Yield Gain: {selectedInnovation.yieldResilienceGain}
                </p>
              </div>
            </div>

            {/* Steps to Replicate in Target State */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wide block">
                Standard Operating Protocol for Small Farmers in {selectedInnovation.targetState}
              </span>
              <div className="space-y-2">
                {selectedInnovation.stepsToReplicate.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 bg-stone-50/70 p-2.5 rounded-lg border border-stone-200/70">
                    <span className="font-bold text-emerald-700 font-mono-numbers shrink-0 mt-0.5">
                      0{idx + 1}.
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Inputs */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 text-xs space-y-1">
              <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                Recommended Certified Inputs & Seed Availability
              </span>
              <p className="text-stone-700">
                {selectedInnovation.recommendedInputs.join(' · ')}
              </p>
            </div>
          </div>

          {/* AI Cross-State Adaptation Engine */}
          <div className="bg-stone-900 text-stone-100 rounded-xl p-5 shadow-sm space-y-4 border border-stone-800">
            <div className="border-b border-stone-800 pb-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                Inter-State AI Matchmaker (Gemini 3.8 Flash)
              </div>
              <h4 className="text-base font-bold text-white mt-1">
                Custom State-to-State Resilience Adaptation Generator
              </h4>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Facing an unprecedented climate hazard in your state? Connect with practices perfected in another agro-climatic zone to formulate a personalized adaptation blueprint.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-stone-300 block mb-1 font-medium">Donor State (Best Practice):</label>
                <select
                  value={donorState}
                  onChange={(e) => setDonorState(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-2 text-stone-100 text-xs"
                >
                  <option value="Punjab & Haryana">Punjab (Direct Seeded Rice & Mechanization)</option>
                  <option value="Maharashtra (Vidarbha)">Maharashtra (Dryland Cotton-Pulses BBF)</option>
                  <option value="Odisha & Assam">Odisha (Submergence Rice Swarna-Sub1)</option>
                  <option value="Rajasthan (Thar)">Rajasthan (Low-Pressure Solar Gravity Drip)</option>
                  <option value="Tamil Nadu (Cauvery)">Tamil Nadu (SRI AWD Water Pipe)</option>
                  <option value="Telangana">Telangana (Millets & Redgram Diversification)</option>
                </select>
              </div>

              <div>
                <label className="text-stone-300 block mb-1 font-medium">Target State (Your Farm):</label>
                <select
                  value={targetState}
                  onChange={(e) => setTargetState(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-2 text-stone-100 text-xs"
                >
                  {AGRO_CLIMATIC_ZONES.map((z) => (
                    <option key={z.id} value={z.state}>
                      {z.state} ({z.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-stone-300 block mb-1 font-medium">Primary Climate Threat:</label>
                <input
                  type="text"
                  value={climateChallenge}
                  onChange={(e) => setClimateChallenge(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-2 text-stone-100 text-xs"
                  placeholder="e.g. 25-day dry spell during flowering"
                />
              </div>

              <div>
                <label className="text-stone-300 block mb-1 font-medium">Crop System:</label>
                <input
                  type="text"
                  value={cropSystem}
                  onChange={(e) => setCropSystem(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-2 text-stone-100 text-xs"
                  placeholder="e.g. Rainfed Soybean / Cotton"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateBlueprint}
              disabled={isLoadingAi}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-60"
            >
              {isLoadingAi ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Inter-State Adaptation Protocol...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Cross-State Adaptation Protocol</span>
                </>
              )}
            </button>

            {aiBlueprint && (
              <div className="bg-stone-800/90 border border-emerald-500/40 rounded-lg p-4 space-y-2 text-xs text-stone-200 max-h-80 overflow-y-auto leading-relaxed whitespace-pre-line">
                <div className="font-bold text-emerald-400 border-b border-stone-700 pb-1 flex items-center justify-between">
                  <span>Custom Transfer Protocol ({donorState} → {targetState})</span>
                  <span className="text-[10px] text-stone-400">NICRA Digital Corridor</span>
                </div>
                {aiBlueprint}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
