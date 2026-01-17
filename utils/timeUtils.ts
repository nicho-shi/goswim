/**
 * Parses a swim time string into total seconds.
 * Supports formats: "SS.hh", "MM:SS.hh", "M:SS.hh"
 * Examples: "23.50", "1:04.20", "58.9"
 */
export const parseSwimTime = (timeStr: string): number | null => {
  if (!timeStr) return null;
  const cleanStr = timeStr.trim().replace(/[^0-9.:]/g, '');
  
  // Check for MM:SS.hh format
  if (cleanStr.includes(':')) {
    const parts = cleanStr.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseFloat(parts[1]);
      if (isNaN(minutes) || isNaN(seconds)) return null;
      return minutes * 60 + seconds;
    }
  }
  
  // Assume SS.hh format
  const seconds = parseFloat(cleanStr);
  if (isNaN(seconds)) return null;
  return seconds;
};

/**
 * Formats total seconds back into a standard swim time string.
 * Format: MM:SS.hh or SS.hh
 */
export const formatSwimTime = (totalSeconds: number): string => {
  if (totalSeconds < 0) return "0.00";
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  const formattedSeconds = seconds.toFixed(2).padStart(5, '0'); // Ensures 05.20 format if < 10
  
  if (minutes > 0) {
    // For minutes, we want '1:05.20'
    const s = seconds.toFixed(2).padStart(5, '0');
    return `${minutes}:${s}`;
  } else {
    return seconds.toFixed(2);
  }
};

/**
 * Formats the difference between two times.
 * Returns string like "-1.23" or "+0.45"
 */
export const formatDifference = (diff: number): string => {
  const sign = diff <= 0 ? '' : '+'; // Negative means faster (good), usually displayed as just -1.23. 
  // In swimming, often a "minus" is good (dropped time/under cut).
  // A "plus" is bad (add time/over cut).
  return `${sign}${diff.toFixed(2)}`;
};
