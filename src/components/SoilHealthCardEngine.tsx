import React, { useState } from 'react';
import {
  FlaskConical,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Leaf,
  Scale,
  Download,
  Info,
  Sliders,
} from 'lucide-react';
import { AgroClimaticZone, SoilHealthCardData, LanguageCode } from '../types/farming';
import { MOCK_SOIL_HEALTH_CARDS, UI_TRANSLATIONS } from '../data/mockAgroData';

interface SoilHealthCardEngineProps {
  zone: AgroClimaticZone;
  language: LanguageCode;
}

export const SoilHealthCardEngine: React.FC<SoilHealthCardEngineProps> = ({
  zone,
  language,
}) => {
  const initialData: SoilHealthCardData =
    MOCK_SOIL_HEALTH_CARDS[zone.id] || MOCK_SOIL_HEALTH_CARDS['zone-trans-gangetic'];
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  const [card, setCard] = useState<SoilHealthCardData>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiPrescription, setAiPrescription] = useState<string | null>(null);

  // If zone changes, update card
  React.useEffect(() => {
    if (MOCK_SOIL_HEALTH_CARDS[zone.id]) {
      setCard(MOCK_SOIL_HEALTH_CARDS[zone.id]);
      setAiPrescription(null);
    }
  }, [zone.id]);

  // Fertilizer recommendations calculation based on NPK deficits
  // Standard target: N=280 kg/ha, P=30 kg/ha, K=180 kg/ha for 1 hectare marginal plot
  const nDeficit = Math.max(0, 280 - card.nitrogen);
  const pDeficit = Math.max(0, 35 - card.phosphorus);
  const kDeficit = Math.max(0, 180 - card.potassium);

  // Conversion to 50kg bags for 1 hectare:
  // DAP (18% N, 46% P2O5), Urea (46% N), MOP (60% K2O)
  const dapBags = +(pDeficit / (50 * 0.46)).toFixed(1);
  const nSuppliedByDap = dapBags * 50 * 0.18;
  const remainingN = Math.max(0, nDeficit - nSuppliedByDap);
  const ureaBags = +(remainingN / (50 * 0.46)).toFixed(1);
  const mopBags = +(kDeficit / (50 * 0.60)).toFixed(1);

  // Traditional farmer overdose scenario vs precision recommendation
  // Most Indian farmers apply 6-8 bags of Urea due to subsidy distortion
  const traditionalUreaBags = 6.0;
  const ureaSavedBags = Math.max(0, traditionalUreaBags - ureaBags);
  const costSavingsRupees = Math.round(ureaSavedBags * 270 + 850); // Direct input cash saved

  const handleGeneratePrescription = async () => {
    setIsLoadingAi(true);
    setAiPrescription(null);
    try {
      const response = await fetch('/api/gemini/soil-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: zone.primaryCrops[0],
          region: `${zone.state} (${zone.name})`,
          nitrogen: card.nitrogen,
          phosphorus: card.phosphorus,
          potassium: card.potassium,
          ph: card.ph,
          organicCarbon: card.organicCarbon,
          ec: card.ec,
          zinc: card.zinc,
          language: language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : language === 'te' ? 'Telugu' : language === 'pa' ? 'Punjabi' : 'English',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAiPrescription(data.prescription);
      } else {
        setAiPrescription('Failed to generate soil prescription.');
      }
    } catch (err) {
      setAiPrescription('Network error calling ICAR Soil intelligence server.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <span>Sample ID: {card.sampleId}</span>
              <span aria-hidden="true">·</span>
              <span>Lab Tested: {card.testedDate}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-stone-800">{card.soilType}</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 font-heading">
              {t.soilTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-stone-500" />
              <span>{isEditing ? 'Close Test Input' : 'Enter Custom Soil Test'}</span>
            </button>
            <button
              onClick={() => alert(`Soil Health Card exported for ${card.farmerName} (${card.sampleId})`)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export SHC PDF</span>
            </button>
          </div>
        </div>

        {/* Nitrogen Overuse Warning Banner */}
        <div className="mt-4 bg-stone-50 border border-stone-200 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <span className="font-semibold text-stone-900 block">
                Balanced Nutrition Metric: Current Organic Carbon is{' '}
                <span className={card.organicCarbon < 0.5 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                  {card.organicCarbon}%
                </span>{' '}
                (Healthy benchmark: &gt;0.75%)
              </span>
              <span className="text-stone-600">
                Excessive chemical Urea without organic carbon causes rapid soil acidification and secondary nutrient lockup.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-100/70 border border-emerald-300/80 px-3 py-1.5 rounded-lg text-emerald-950 font-medium shrink-0">
            <DollarSign className="w-4 h-4 text-emerald-700" />
            <span>Estimated Savings: ₹{costSavingsRupees}/ha</span>
          </div>
        </div>
      </div>

      {/* Interactive Custom Soil Sliders (when editing) */}
      {isEditing && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-700" />
              Adjust Soil Test Laboratory Parameters
            </h3>
            <span className="text-[11px] text-stone-600">Update values to recalculate dosage</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-stone-700 font-semibold block mb-1">
                Available Nitrogen (kg/ha): {card.nitrogen}
              </label>
              <input
                type="range"
                min="100"
                max="500"
                step="5"
                value={card.nitrogen}
                onChange={(e) => setCard({ ...card, nitrogen: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
              <span className="text-[10px] text-stone-500">Target: 280-560 kg/ha</span>
            </div>

            <div>
              <label className="text-stone-700 font-semibold block mb-1">
                Available Phosphorus (kg/ha): {card.phosphorus}
              </label>
              <input
                type="range"
                min="5"
                max="80"
                step="1"
                value={card.phosphorus}
                onChange={(e) => setCard({ ...card, phosphorus: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
              <span className="text-[10px] text-stone-500">Target: 23-56 kg/ha</span>
            </div>

            <div>
              <label className="text-stone-700 font-semibold block mb-1">
                Available Potassium (kg/ha): {card.potassium}
              </label>
              <input
                type="range"
                min="80"
                max="450"
                step="5"
                value={card.potassium}
                onChange={(e) => setCard({ ...card, potassium: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
              <span className="text-[10px] text-stone-500">Target: 145-337 kg/ha</span>
            </div>

            <div>
              <label className="text-stone-700 font-semibold block mb-1">
                Organic Carbon (%): {card.organicCarbon}
              </label>
              <input
                type="range"
                min="0.10"
                max="1.50"
                step="0.02"
                value={card.organicCarbon}
                onChange={(e) => setCard({ ...card, organicCarbon: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
              <span className="text-[10px] text-stone-500">Target: &gt;0.75%</span>
            </div>

            <div>
              <label className="text-stone-700 font-semibold block mb-1">
                Soil pH: {card.ph}
              </label>
              <input
                type="range"
                min="5.5"
                max="9.0"
                step="0.1"
                value={card.ph}
                onChange={(e) => setCard({ ...card, ph: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
              <span className="text-[10px] text-stone-500">Target: 6.5 - 7.5</span>
            </div>

            <div>
              <label className="text-stone-700 font-semibold block mb-1">
                Available Zinc (ppm): {card.zinc}
              </label>
              <input
                type="range"
                min="0.2"
                max="1.8"
                step="0.05"
                value={card.zinc}
                onChange={(e) => setCard({ ...card, zinc: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
              <span className="text-[10px] text-stone-500">Critical deficiency if &lt;0.6 ppm</span>
            </div>

            <div>
              <label className="text-stone-700 font-semibold block mb-1">
                Electrical Conductivity (dS/m): {card.ec}
              </label>
              <input
                type="range"
                min="0.1"
                max="2.5"
                step="0.05"
                value={card.ec}
                onChange={(e) => setCard({ ...card, ec: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
              <span className="text-[10px] text-stone-500">Normal: &lt;1.0 dS/m</span>
            </div>

            <div>
              <label className="text-stone-700 font-semibold block mb-1">
                Available Sulphur (ppm): {card.sulphur}
              </label>
              <input
                type="range"
                min="3"
                max="25"
                step="0.5"
                value={card.sulphur}
                onChange={(e) => setCard({ ...card, sulphur: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
              <span className="text-[10px] text-stone-500">Target: &gt;10.0 ppm</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid: 12-Nutrient Grid & Dosage Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Digital Soil Health Matrix (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-emerald-600" />
              Soil Health Laboratory Parameters (12-Parameter Test)
            </h3>
            <span className="text-xs text-stone-500 font-mono-numbers">{card.farmerName}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Nitrogen */}
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
              <span className="text-[11px] text-stone-500 block">Available Nitrogen (N)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold font-mono-numbers text-stone-900">{card.nitrogen}</span>
                <span className="text-[10px] text-stone-400">kg/ha</span>
              </div>
              <span className={`text-[10px] font-semibold ${card.nitrogen < 280 ? 'text-amber-600' : 'text-emerald-700'}`}>
                {card.nitrogen < 280 ? 'Deficient (<280)' : 'Sufficient'}
              </span>
            </div>

            {/* Phosphorus */}
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
              <span className="text-[11px] text-stone-500 block">Available Phosphorus (P₂O₅)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold font-mono-numbers text-stone-900">{card.phosphorus}</span>
                <span className="text-[10px] text-stone-400">kg/ha</span>
              </div>
              <span className={`text-[10px] font-semibold ${card.phosphorus < 23 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {card.phosphorus < 23 ? 'Deficient (<23)' : 'Sufficient'}
              </span>
            </div>

            {/* Potassium */}
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
              <span className="text-[11px] text-stone-500 block">Available Potassium (K₂O)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold font-mono-numbers text-stone-900">{card.potassium}</span>
                <span className="text-[10px] text-stone-400">kg/ha</span>
              </div>
              <span className={`text-[10px] font-semibold ${card.potassium < 145 ? 'text-amber-600' : 'text-emerald-700'}`}>
                {card.potassium < 145 ? 'Low' : 'Adequate'}
              </span>
            </div>

            {/* Organic Carbon */}
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
              <span className="text-[11px] text-stone-500 block">Organic Carbon (OC)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold font-mono-numbers text-stone-900">{card.organicCarbon}%</span>
              </div>
              <span className={`text-[10px] font-semibold ${card.organicCarbon < 0.5 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {card.organicCarbon < 0.5 ? 'Critical Deficit (<0.5%)' : 'Medium / High'}
              </span>
            </div>

            {/* pH */}
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
              <span className="text-[11px] text-stone-500 block">Soil Reaction (pH)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold font-mono-numbers text-stone-900">{card.ph}</span>
              </div>
              <span className={`text-[10px] font-semibold ${card.ph > 7.8 ? 'text-amber-600' : card.ph < 6.5 ? 'text-amber-600' : 'text-emerald-700'}`}>
                {card.ph > 8.0 ? 'Moderately Alkaline' : card.ph < 6.5 ? 'Slightly Acidic' : 'Optimal Neutral'}
              </span>
            </div>

            {/* Zinc */}
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
              <span className="text-[11px] text-stone-500 block">Available Zinc (Zn)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold font-mono-numbers text-stone-900">{card.zinc}</span>
                <span className="text-[10px] text-stone-400">ppm</span>
              </div>
              <span className={`text-[10px] font-semibold ${card.zinc < 0.6 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {card.zinc < 0.6 ? 'Deficient (<0.6 ppm)' : 'Sufficient'}
              </span>
            </div>
          </div>

          {/* Regenerative Soil Enhancement Blueprint */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 uppercase tracking-wide">
              <Leaf className="w-4 h-4 text-emerald-700" />
              Low-Cost Regenerative Soil Amendment Protocols
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700">
              <div className="bg-white p-3 rounded-md border border-emerald-100 shadow-2xs">
                <span className="font-semibold text-emerald-900 block mb-0.5">
                  1. Microbial Carbon Inoculation (Jeevamrut)
                </span>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Mix 10 kg desi cow dung + 10L cow urine + 2 kg jaggery + 2 kg besan. Ferment 48h. Apply 200L/ha with irrigation to multiply organic carbon digesting bacteria.
                </p>
              </div>

              <div className="bg-white p-3 rounded-md border border-emerald-100 shadow-2xs">
                <span className="font-semibold text-emerald-900 block mb-0.5">
                  2. In-situ Green Manuring (Dhaincha / Sunhemp)
                </span>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Broadcast Sesbania (25 kg/ha) during pre-monsoon showers. Incorporate into soil at 45 days flowering stage to fix 60-80 kg atmospheric Nitrogen naturally.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Precision Fertilizer Schedule vs Overdose (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <span className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold">
                Fertilizer Dosage Recommendation
              </span>
              <h4 className="text-base font-bold text-stone-900">
                1-Hectare Crop Nutrition Requirement
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              {/* Urea recommendation */}
              <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                <div>
                  <span className="font-bold text-stone-900 block">Neem-Coated Urea (46% N)</span>
                  <span className="text-[11px] text-stone-500">Split into 2 split top-dressings</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono-numbers text-emerald-700">
                    {ureaBags}
                  </span>
                  <span className="text-[11px] text-stone-500 ml-1">bags (50kg)</span>
                </div>
              </div>

              {/* DAP recommendation */}
              <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                <div>
                  <span className="font-bold text-stone-900 block">DAP (18:46:0)</span>
                  <span className="text-[11px] text-stone-500">Apply 100% as basal at sowing</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono-numbers text-stone-900">
                    {dapBags}
                  </span>
                  <span className="text-[11px] text-stone-500 ml-1">bags (50kg)</span>
                </div>
              </div>

              {/* MOP recommendation */}
              <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                <div>
                  <span className="font-bold text-stone-900 block">MOP / Muriate of Potash (60% K₂O)</span>
                  <span className="text-[11px] text-stone-500">Strengthens drought resilience</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono-numbers text-stone-900">
                    {mopBags}
                  </span>
                  <span className="text-[11px] text-stone-500 ml-1">bags (50kg)</span>
                </div>
              </div>

              {/* Zinc Sulphate */}
              <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                <div>
                  <span className="font-bold text-stone-900 block">Zinc Sulphate (21% Zn)</span>
                  <span className="text-[11px] text-stone-500">Critical for enzyme activation</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono-numbers text-amber-700">
                    25
                  </span>
                  <span className="text-[11px] text-stone-500 ml-1">kg/ha basal</span>
                </div>
              </div>
            </div>

            {/* AI Prescription Generator */}
            <div className="pt-2">
              <button
                onClick={handleGeneratePrescription}
                disabled={isLoadingAi}
                className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs py-2.5 px-4 rounded-lg transition-colors shadow-xs disabled:opacity-60"
              >
                {isLoadingAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Soil Chemistry with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Generate ICAR AI Soil Prescription</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Soil Prescription Output */}
          {aiPrescription && (
            <div className="bg-white border border-emerald-300 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Customized Soil Scientist Nutrition Plan
                </span>
                <span className="text-[10px] text-stone-400">Gemini 3.8 Flash</span>
              </div>
              <div className="text-xs text-stone-800 leading-relaxed whitespace-pre-line space-y-2 max-h-72 overflow-y-auto pr-1">
                {aiPrescription}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
