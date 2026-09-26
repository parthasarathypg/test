import React, { useState } from 'react';
import { Sparkles, Send, RefreshCw, HelpCircle, CheckCircle2 } from 'lucide-react';
import { AgroClimaticZone, LanguageCode } from '../types/farming';

interface QuickAdvisoryWidgetProps {
  zone: AgroClimaticZone;
  language: LanguageCode;
}

export const QuickAdvisoryWidget: React.FC<QuickAdvisoryWidgetProps> = ({
  zone,
  language,
}) => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sampleQuestions = [
    'How do I control pink bollworm in cotton with low budget?',
    'What is the best irrigation timing before upcoming heatwave?',
    'How to prepare Jeevamrut for 1 acre soil carbon revival?',
    'Direct Seeded Rice (DSR) weed management without standing water?',
  ];

  const handleAsk = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim()) return;

    setIsLoading(true);
    setResponse(null);
    try {
      const res = await fetch('/api/gemini/crop-advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: zone.primaryCrops[0],
          region: `${zone.state} - ${zone.name}`,
          soilType: zone.soilType,
          growthStage: 'Active vegetative',
          issueDescription: q,
          weatherContext: `Monsoon status: ${zone.climateVulnerability}`,
          language: language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : language === 'te' ? 'Telugu' : language === 'pa' ? 'Punjabi' : 'English',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResponse(data.advisory);
      } else {
        setResponse('Unable to answer query at this moment.');
      }
    } catch (err) {
      setResponse('Connection error with KisanSetu AI agronomist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-stone-900">
            KisanSetu Voice & Vernacular Agronomist (Gemini 3.8 Flash)
          </h3>
        </div>
        <span className="text-[11px] text-stone-500 font-medium">
          Context: {zone.name}
        </span>
      </div>

      {/* Suggested prompts */}
      <div className="flex flex-wrap gap-1.5">
        {sampleQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => {
              setQuestion(sq);
              handleAsk(sq);
            }}
            className="text-[11px] bg-stone-50 hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 px-2.5 py-1 rounded-md border border-stone-200 hover:border-emerald-300 transition-colors text-left"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder={`Ask anything about ${zone.primaryCrops[0]}, weather, or fertilizers in ${zone.state}...`}
          className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <button
          onClick={() => handleAsk()}
          disabled={isLoading || !question.trim()}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors shadow-xs disabled:opacity-60"
        >
          {isLoading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </>
          )}
        </button>
      </div>

      {/* Response Box */}
      {response && (
        <div className="bg-stone-50 border border-emerald-200 rounded-xl p-4 text-xs text-stone-800 leading-relaxed whitespace-pre-line space-y-2 max-h-72 overflow-y-auto">
          <div className="font-bold text-emerald-950 flex items-center justify-between border-b border-stone-200 pb-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Expert Agricultural Guidance
            </span>
            <span className="text-[10px] text-stone-400">Gemini 3.8 Flash</span>
          </div>
          {response}
        </div>
      )}
    </div>
  );
};
