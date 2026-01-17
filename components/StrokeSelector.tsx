import React from 'react';

export type StrokeType = 'Freestyle' | 'Backstroke' | 'Breaststroke' | 'Butterfly' | 'IM';

interface StrokeSelectorProps {
  selected: StrokeType;
  onSelect: (stroke: StrokeType) => void;
}

const STROKES: StrokeType[] = ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'IM'];

export const StrokeSelector: React.FC<StrokeSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex gap-2 min-w-max px-1">
        {STROKES.map((stroke) => (
          <button
            key={stroke}
            onClick={() => onSelect(stroke)}
            className={`
              px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border
              ${selected === stroke
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 scale-105'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }
            `}
          >
            {stroke}
          </button>
        ))}
      </div>
    </div>
  );
};
