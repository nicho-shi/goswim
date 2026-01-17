
import React from 'react';

export type CourseType = 'SCM' | 'LCM';

interface CourseSelectorProps {
  selected: CourseType;
  onSelect: (course: CourseType) => void;
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex bg-slate-200 p-1 rounded-xl w-fit mx-auto">
      <button
        onClick={() => onSelect('SCM')}
        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
          selected === 'SCM' 
            ? 'bg-white text-indigo-600 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Short Course
      </button>
      <button
        onClick={() => onSelect('LCM')}
        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
          selected === 'LCM' 
            ? 'bg-white text-indigo-600 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Long Course
      </button>
    </div>
  );
};
