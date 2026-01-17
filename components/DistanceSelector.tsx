import React from 'react';

interface DistanceSelectorProps {
  options: string[];
  selected: string;
  onSelect: (distance: string) => void;
}

export const DistanceSelector: React.FC<DistanceSelectorProps> = ({ options, selected, onSelect }) => {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex gap-2 min-w-max px-1 justify-center md:justify-start">
        {options.map((dist) => (
          <button
            key={dist}
            onClick={() => onSelect(dist)}
            className={`
              min-w-[3rem] h-10 px-3 rounded-full text-sm font-bold transition-all duration-200 border flex items-center justify-center
              ${selected === dist
                ? 'bg-slate-800 text-white border-slate-800 shadow-md scale-105'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'
              }
            `}
          >
            {dist}
          </button>
        ))}
      </div>
    </div>
  );
};
