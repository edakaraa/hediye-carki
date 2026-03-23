import type { FC } from 'react';

interface SuggestionPanelProps {
  spinResult: string | null;
  aiSuggestions: string[];
  resetWheel: () => void;
}

const SuggestionPanel: FC<SuggestionPanelProps> = ({ spinResult, aiSuggestions, resetWheel }) => {
  return (
    <div className="w-full space-y-6">
       <div className="text-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Çark Sonucu</span>
          <h2 className="text-3xl font-bold text-amber-400 mt-1">{spinResult}</h2>
       </div>
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-5">
          <h3 className="text-xl font-bold text-slate-100">Önerilen Hediyeler</h3>
          <ol className="list-decimal list-outside pl-5 space-y-4 text-slate-300 text-sm">
            {aiSuggestions.map((suggestion, index) => (
               <li key={index} className="whitespace-pre-wrap">{suggestion}</li>
            ))}
          </ol>
        </div>
        <button
          onClick={resetWheel}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold rounded-xl transition"
        >
          Yeniden Çevir
        </button>
    </div>
  );
};

export default SuggestionPanel;