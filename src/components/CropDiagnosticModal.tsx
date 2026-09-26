import React, { useState } from 'react';
import {
  Stethoscope,
  Upload,
  Camera,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Bug,
  ShieldAlert,
  Leaf,
  X,
} from 'lucide-react';
import { CropDiagnosticSample, AgroClimaticZone, LanguageCode } from '../types/farming';
import { CROP_DIAGNOSTIC_SAMPLES, UI_TRANSLATIONS } from '../data/mockAgroData';

interface CropDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  zone: AgroClimaticZone;
  language: LanguageCode;
}

export const CropDiagnosticModal: React.FC<CropDiagnosticModalProps> = ({
  isOpen,
  onClose,
  zone,
  language,
}) => {
  if (!isOpen) return null;

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;
  const samples = CROP_DIAGNOSTIC_SAMPLES;
  const [selectedSample, setSelectedSample] = useState<CropDiagnosticSample>(samples[0]);
  const [customCrop, setCustomCrop] = useState<string>(zone.primaryCrops[0]);
  const [customSymptoms, setCustomSymptoms] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // File upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunDiagnosis = async () => {
    setIsLoading(true);
    setDiagnosisResult(null);
    try {
      const response = await fetch('/api/gemini/diagnose-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: customCrop || selectedSample.crop,
          symptoms: customSymptoms || selectedSample.symptoms.join('. '),
          location: `${zone.state} - ${zone.name}`,
          imageBase64: uploadedImage || undefined,
          language: language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : language === 'te' ? 'Telugu' : language === 'pa' ? 'Punjabi' : 'English',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setDiagnosisResult(data.diagnosis);
      } else {
        setDiagnosisResult('Diagnostic evaluation failed.');
      }
    } catch (err) {
      setDiagnosisResult('Network error communicating with AI Kisan Doctor server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-stone-900 text-stone-100 p-4 sm:p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-white">
                {t.doctorTitle}
              </h3>
              <p className="text-xs text-stone-400">
                ICAR Plant Pathology & Low-Cost IPM (Integrated Pest Management) Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Quick Preset Selector */}
          <div>
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
              Inspect Common Regional Crop Threats:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {samples.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSample(s);
                    setCustomCrop(s.crop);
                    setCustomSymptoms(s.symptoms.join('. '));
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedSample.id === s.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-600'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="block text-[11px] text-stone-500 font-normal">{s.crop}</span>
                  <span className="block truncate">{s.commonName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Diagnostic Work Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Specimen Pathology Visual & Upload (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-stone-900 rounded-xl p-4 text-center border border-stone-800 space-y-3">
                <span className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold block">
                  Pathological Specimen Analysis
                </span>

                {/* SVG Leaf Pathology Visualizer */}
                {uploadedImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-stone-700 h-48 bg-stone-950 flex items-center justify-center">
                    <img
                      src={uploadedImage}
                      alt="Uploaded crop leaf specimen"
                      className="w-full h-full object-contain"
                    />
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-48 rounded-lg bg-stone-950 border border-stone-800 p-2 flex items-center justify-center">
                    <svg viewBox="0 0 200 180" className="w-full h-full">
                      {/* Leaf Outline */}
                      <path
                        d="M 100,10 C 140,50 170,110 130,165 C 100,175 70,165 30,110 C 60,50 90,10 100,10 Z"
                        fill="#15803d"
                        stroke="#166534"
                        strokeWidth="3"
                      />
                      {/* Veins */}
                      <path d="M 100,20 L 100,165" stroke="#86efac" strokeWidth="2" />
                      <path d="M 100,60 L 135,45 M 100,90 L 145,75 M 100,120 L 135,115" stroke="#86efac" strokeWidth="1.2" />
                      <path d="M 100,60 L 65,45 M 100,90 L 55,75 M 100,120 L 65,115" stroke="#86efac" strokeWidth="1.2" />

                      {/* Lesions / Rust stripes depending on type */}
                      {selectedSample.svgVisualType === 'yellow_rust' && (
                        <>
                          <line x1="85" y1="50" x2="85" y2="130" stroke="#facc15" strokeWidth="4" strokeDasharray="3 3" />
                          <line x1="115" y1="60" x2="115" y2="140" stroke="#facc15" strokeWidth="4" strokeDasharray="3 3" />
                          <line x1="100" y1="80" x2="100" y2="150" stroke="#eab308" strokeWidth="3" strokeDasharray="2 2" />
                        </>
                      )}

                      {selectedSample.svgVisualType === 'leaf_blast' && (
                        <>
                          <ellipse cx="85" cy="80" rx="14" ry="7" fill="#78716c" stroke="#451a03" strokeWidth="2" />
                          <ellipse cx="115" cy="110" rx="18" ry="8" fill="#78716c" stroke="#451a03" strokeWidth="2" />
                          <ellipse cx="85" cy="80" rx="6" ry="3" fill="#e7e5e4" />
                          <ellipse cx="115" cy="110" rx="8" ry="4" fill="#e7e5e4" />
                        </>
                      )}

                      {selectedSample.svgVisualType === 'bollworm' && (
                        <>
                          <circle cx="100" cy="90" r="10" fill="#451a03" stroke="#f87171" strokeWidth="2" />
                          <path d="M 95,95 Q 105,80 115,95" stroke="#f43f5e" strokeWidth="3" fill="none" />
                        </>
                      )}

                      {selectedSample.svgVisualType === 'aphids' && (
                        <>
                          <circle cx="85" cy="70" r="3" fill="#22c55e" />
                          <circle cx="90" cy="75" r="3" fill="#22c55e" />
                          <circle cx="110" cy="95" r="3" fill="#22c55e" />
                          <circle cx="115" cy="100" r="3" fill="#22c55e" />
                          <circle cx="100" cy="110" r="3.5" fill="#15803d" />
                        </>
                      )}

                      {selectedSample.svgVisualType === 'early_blight' && (
                        <>
                          <circle cx="90" cy="85" r="14" fill="#3f3f46" stroke="#fbbf24" strokeWidth="1.5" />
                          <circle cx="90" cy="85" r="9" fill="none" stroke="#71717a" strokeWidth="1" />
                          <circle cx="90" cy="85" r="4" fill="none" stroke="#27272a" strokeWidth="1" />
                        </>
                      )}
                    </svg>
                  </div>
                )}

                {/* Upload or Camera Button */}
                <div className="pt-1">
                  <label className="flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold py-2 px-3 rounded-lg cursor-pointer border border-stone-700 transition-colors">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>Upload Field Leaf Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Symptoms & AI Prescription (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{selectedSample.commonName}</h4>
                    <span className="text-[11px] text-stone-500 font-medium">
                      {selectedSample.vernacularName} ({selectedSample.pathogenType})
                    </span>
                  </div>
                  <span className="font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[10px]">
                    Severity: {selectedSample.severity}
                  </span>
                </div>

                {/* Symptoms description */}
                <div>
                  <span className="font-bold text-stone-800 block mb-1">Key Field Symptoms:</span>
                  <ul className="space-y-1 text-stone-600 list-disc list-inside">
                    {selectedSample.symptoms.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Organic / Low cost remedy */}
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3 space-y-1">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                    Low-Cost Organic / Home Remedy (Under ₹50/acre):
                  </span>
                  <ul className="text-stone-700 space-y-0.5 list-disc list-inside">
                    {selectedSample.organicCure.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                {/* Chemical remedy */}
                <div className="bg-stone-100 p-2.5 rounded-lg border border-stone-200 text-stone-700">
                  <span className="font-bold text-stone-900 block mb-0.5">
                    Precise Chemical Spray (Exact 15L Knapsack Pump Dilution):
                  </span>
                  <p className="text-stone-700 font-medium">{selectedSample.chemicalCure}</p>
                </div>
              </div>

              {/* Run Full Gemini Diagnostic */}
              <button
                onClick={handleRunDiagnosis}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-3 px-4 rounded-xl transition-colors shadow-sm disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Pathological Markers with Gemini 3.8 Flash...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Multimodal Pathology Doctor (Gemini 3.8 Flash)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Diagnostic Report Result */}
          {diagnosisResult && (
            <div className="bg-white border border-emerald-300 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  ICAR AI Kisan Doctor Comprehensive Pathology Advisory
                </span>
                <span className="text-[10px] text-stone-400">Gemini 3.8 Flash Server Response</span>
              </div>
              <div className="text-xs text-stone-800 leading-relaxed whitespace-pre-line space-y-2 max-h-72 overflow-y-auto pr-1">
                {diagnosisResult}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
