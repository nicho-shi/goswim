import React from 'react';

interface AgeInputProps {
  age: number | '';
  onChange: (val: number | '') => void;
}

export const AgeInput: React.FC<AgeInputProps> = ({ age, onChange }) => {
  return (
    <div className="flex flex-col items-center bg-slate-200 p-2 rounded-xl">
      <label className="text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
      <input
        type="number"
        min="1"
        max="99"
        value={age}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === '' ? '' : parseInt(val, 10));
        }}
        placeholder="--"
        className="w-16 text-center text-xl font-bold bg-white rounded-lg py-1 border-none outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
      />
    </div>
  );
};
