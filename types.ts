export interface SwimStandard {
  id: string;
  name: string;
  time: string; // User input string e.g., "54.32" or "1:02.50"
  seconds: number;
}

export interface CalculationResult {
  standardName: string;
  standardTime: string;
  diffSeconds: number;
  formattedDiff: string;
  isCutMade: boolean;
}
