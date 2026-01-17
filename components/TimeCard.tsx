
import React, { useState, useEffect } from 'react';
import { Timer, Trophy, TrendingUp } from 'lucide-react';
import { parseSwimTime, formatDifference } from '../utils/timeUtils';

interface TimeCardProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  colorClass?: string;
  icon?: React.ReactNode;
}

// Helper function to format input value intelligently
// Allows user to input pure numbers like "83.45" and auto-converts to "1:23.45" format
const formatTimeInput = (input: string): string => {
  // Remove all non-numeric characters except decimal point
  const cleaned = input.replace(/[^0-9.]/g, '');
  
  // If empty, return empty
  if (!cleaned) return '';
  
  // Split by decimal point
  const parts = cleaned.split('.');
  const wholePart = parts[0] || '';
  const decimalPart = parts[1]?.substring(0, 2) || ''; // Max 2 decimal places
  
  // If no whole part, just return decimal part with dot
  if (!wholePart) {
    return '.' + decimalPart;
  }
  
  // If only whole part (no decimal), check if >= 60
  if (!decimalPart && wholePart) {
    const wholeNum = parseInt(wholePart, 10);
    if (wholeNum >= 60) {
      const minutes = Math.floor(wholeNum / 60);
      const seconds = (wholeNum % 60).toString().padStart(2, '0');
      return `${minutes}:${seconds}`;
    }
    return wholePart;
  }
  
  // Has both whole and decimal parts
  const wholeNum = parseInt(wholePart, 10);
  if (wholeNum >= 60) {
    // Convert to MM:SS.hh format
    const minutes = Math.floor(wholeNum / 60);
    const seconds = (wholeNum % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}.${decimalPart}`;
  } else {
    // Return as SS.hh format
    return `${wholePart}.${decimalPart}`;
  }
};

export const TimeInputCard: React.FC<TimeCardProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder = "00.00",
  colorClass = "bg-white",
  icon
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Sync display value with prop value when not focused
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value);
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDisplayValue(input);
    // Allow raw input while typing, format on blur
    onChange(input);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format the value when losing focus
    const formatted = formatTimeInput(displayValue);
    setDisplayValue(formatted);
    onChange(formatted);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <div className={`${colorClass} p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2 relative overflow-hidden transition-all focus-within:ring-2 focus-within:ring-blue-400`}>
      <div className="flex items-center justify-between text-slate-500 mb-1">
        <span className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
          {icon} {label}
        </span>
      </div>
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className="text-4xl font-bold bg-transparent border-none outline-none text-slate-800 placeholder-slate-200 w-full"
      />
      <div className="text-xs text-slate-400 mt-1">
        Enter numbers only (e.g., 83.45 or 123.45 will auto-format to 1:23.45)
      </div>
    </div>
  );
};

interface ResultCardProps {
  standardName: string;
  standardTimeStr: string;
  userTimeStr: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ standardName, standardTimeStr, userTimeStr }) => {
  const userSec = parseSwimTime(userTimeStr);
  const stdSec = parseSwimTime(standardTimeStr);
  
  if (userSec === null || stdSec === null) return null;
  
  const diff = userSec - stdSec;
  const isCutMade = diff <= 0;
  
  return (
    <div className={`relative p-6 rounded-2xl border-l-8 shadow-sm ${isCutMade ? 'bg-emerald-50 border-emerald-500' : 'bg-rose-50 border-rose-500'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">To {standardName}</h3>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-black ${isCutMade ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatDifference(diff)}
            </span>
            <span className="text-sm text-slate-500 font-medium">sec</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Standard: <span className="font-mono font-bold">{standardTimeStr}</span>
          </p>
        </div>
        <div className={`p-3 rounded-full ${isCutMade ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          {isCutMade ? <Trophy size={24} /> : <TrendingUp size={24} />}
        </div>
      </div>
      
      <div className="mt-4 w-full bg-white/50 h-2 rounded-full overflow-hidden">
         <div 
          className={`h-full ${isCutMade ? 'bg-emerald-500' : 'bg-rose-500'}`} 
          style={{ width: '100%' }}
        />
      </div>
      
      <div className="mt-2 text-right">
        <span className={`text-sm font-bold ${isCutMade ? 'text-emerald-700' : 'text-rose-700'}`}>
          {isCutMade ? "Cut Achieved!" : "Keep Pushing!"}
        </span>
      </div>
    </div>
  );
};
