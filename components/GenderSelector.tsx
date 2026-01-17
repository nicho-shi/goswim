import React from 'react';

export type GenderType = 'Boys' | 'Girls';

interface GenderSelectorProps {
  selected: GenderType | null;
  onSelect: (gender: GenderType) => void;
}

export const GenderSelector: React.FC<GenderSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex bg-slate-200 p-1 rounded-xl w-fit mx-auto">
      <button
        onClick={() => onSelect('Boys')}
        className={`px-8 py-2 rounded-lg text-sm font-bold transition-all ${
          selected === 'Boys' 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Boys
      </button>
      <button
        onClick={() => onSelect('Girls')}
        className={`px-8 py-2 rounded-lg text-sm font-bold transition-all ${
          selected === 'Girls' 
            ? 'bg-white text-pink-600 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Girls
      </button>
    </div>
  );
};
