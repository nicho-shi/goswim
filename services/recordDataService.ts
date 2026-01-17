
import { StrokeType } from '../components/StrokeSelector';
import { CourseType } from '../components/CourseSelector';

export interface RecordEntry {
  time: string;
  holder: string;
  date: string;
}

// Helper to normalize stroke names for PDF data matching
const normalizeStroke = (stroke: StrokeType): string => {
  if (stroke === 'Freestyle') return 'Free';
  if (stroke === 'Backstroke') return 'Back';
  if (stroke === 'Breaststroke') return 'Breast';
  if (stroke === 'Butterfly') return 'Fly';
  return 'IM';
};

// Data extracted from provided Auckland S/C Records PDF screenshots
const AUCKLAND_SC_RECORDS: any = {
  Female: {
    "9": {
      "50m Free": { time: "32.23", holder: "Liliya Wu", date: "6-Apr-25" },
      "100m Free": { time: "1:10.49", holder: "Scarlett Robb", date: "18-Feb-18" },
      "200m Free": { time: "2:31.87", holder: "Scarlett Robb", date: "17-Feb-18" },
      "400m Free": { time: "5:12.33", holder: "Scarlett Robb", date: "28-Jul-18" },
      "800m Free": { time: "10:45.29", holder: "Jessica Parr", date: "31-Dec-93" },
      "1500m Free": { time: "21:21.70", holder: "Jessica Parr", date: "31-Dec-93" },
      "50m Back": { time: "36.33", holder: "Angelina See", date: "5-Jul-24" },
      "100m Back": { time: "1:18.06", holder: "Scarlett Robb", date: "17-Feb-18" },
      "200m Back": { time: "2:41.34", holder: "Scarlett Robb", date: "16-Feb-18" },
      "50m Breast": { time: "41.27", holder: "Amy Tian", date: "21-Oct-22" },
      "100m Breast": { time: "1:30.54", holder: "Amy Tian", date: "22-Oct-22" },
      "200m Breast": { time: "3:07.76", holder: "Amy Tian", date: "22-Oct-22" },
      "50m Fly": { time: "34.15", holder: "Liliya Wu", date: "5-Apr-25" },
      "100m Fly": { time: "1:20.86", holder: "Liliya Wu", date: "8-Mar-25" },
      "200m Fly": { time: "2:58.14", holder: "Jessica Parr", date: "31-Dec-93" },
      "100m IM": { time: "1:20.47", holder: "Monica Wang", date: "17-Mar-24" },
      "200m IM": { time: "2:53.73", holder: "Hope Wang", date: "7-Feb-21" },
      "400m IM": { time: "5:53.45", holder: "Scarlett Robb", date: "28-Jul-18" }
    },
    "10": {
      "50m Free": { time: "29.50", holder: "Gabrielle Fa'amausili", date: "22-Jul-10" },
      "100m Free": { time: "1:05.32", holder: "Gina Galloway", date: "11-Sept-12" },
      "200m Free": { time: "2:20.46", holder: "Evelyn Loh", date: "6-Jul-23" },
      "400m Free": { time: "5:03.38", holder: "Scarlett Robb", date: "28-Jul-19" },
      "800m Free": { time: "10:25.19", holder: "Brooke Jackson", date: "31-Dec-98" },
      "1500m Free": { time: "20:20.69", holder: "Jessica Parr", date: "31-Dec-94" },
      "50m Back": { time: "32.46", holder: "Gina Galloway", date: "11-Sept-12" },
      "100m Back": { time: "1:08.77", holder: "Gina Galloway", date: "11-Sept-12" },
      "200m Back": { time: "2:33.55", holder: "Gina Galloway", date: "10-Sept-12" },
      "50m Breast": { time: "37.88", holder: "Amy Tian", date: "9-Sept-23" },
      "100m Breast": { time: "1:22.76", holder: "Amy Tian", date: "24-Sept-23" },
      "200m Breast": { time: "2:57.52", holder: "Amy Tian", date: "23-Sept-23" },
      "50m Fly": { time: "31.58", holder: "Anna Li", date: "6-Jul-23" },
      "100m Fly": { time: "1:12.03", holder: "Anna Li", date: "6-Jul-23" },
      "200m Fly": { time: "2:50.70", holder: "Brooke Jackson", date: "31-Dec-98" },
      "100m IM": { time: "1:12.78", holder: "Gina Galloway", date: "11-Sept-12" },
      "200m IM": { time: "2:37.48", holder: "Evelyn Loh", date: "6-Jul-23" },
      "400m IM": { time: "5:48.91", holder: "Katerina Kovalenko", date: "21-Jun-09" }
    },
    "11": {
      "50m Free": { time: "27.37", holder: "Gabrielle Fa'amausili", date: "16-Jul-11" },
      "100m Free": { time: "1:01.67", holder: "K Anderson", date: "31-Dec-84" },
      "200m Free": { time: "2:17.93", holder: "Brooke Jackson", date: "3-Jul-99" },
      "400m Free": { time: "4:48.36", holder: "Rachel Smith", date: "23-Aug-08" },
      "800m Free": { time: "9:53.85", holder: "Brooke Jackson", date: "21-Aug-99" },
      "1500m Free": { time: "18:16.92", holder: "Jessica Parr", date: "31-Dec-95" },
      "50m Back": { time: "30.58", holder: "Gabrielle Fa'amausili", date: "15-Jul-11" },
      "100m Back": { time: "1:09.00", holder: "Gabrielle Fa'amausili", date: "21-Jul-12" },
      "200m Back": { time: "2:29.15", holder: "Amelia Duff", date: "13-Mar-20" },
      "50m Breast": { time: "35.85", holder: "April Lin", date: "15-Feb-25" },
      "100m Breast": { time: "1:17.14", holder: "April Lin", date: "8-Mar-25" },
      "200m Breast": { time: "2:45.70", holder: "April Lin", date: "8-Mar-25" },
      "50m Fly": { time: "30.62", holder: "Gabrielle Fa'amausili", date: "15-Jul-11" },
      "100m Fly": { time: "1:10.53", holder: "Anna Li", date: "4-Nov-23" },
      "200m Fly": { time: "2:38.69", holder: "Brooke Jackson", date: "20-Jun-99" },
      "100m IM": { time: "1:11.25", holder: "April Lin", date: "8-Mar-25" },
      "200m IM": { time: "2:32.87", holder: "Brooke Jackson", date: "21-Aug-99" },
      "400m IM": { time: "5:17.37", holder: "Brooke Jackson", date: "21-Aug-99" }
    },
    "12": {
      "50m Free": { time: "25.97", holder: "Gabrielle Fa'amausili", date: "31-Aug-12" },
      "100m Free": { time: "57.77", holder: "Gabrielle Fa'amausili", date: "1-Sept-12" },
      "200m Free": { time: "2:10.87", holder: "Zoe Crawford", date: "17-Feb-18" },
      "400m Free": { time: "4:31.97", holder: "Roxanne Adams", date: "22-Aug-09" },
      "800m Free": { time: "9:19.91", holder: "Rachel Smith", date: "23-Aug-09" },
      "100m Back": { time: "1:03.74", holder: "Gabrielle Fa'amausili", date: "2-Sept-12" },
      "100m Breast": { time: "1:13.02", holder: "April Lin", date: "30-Aug-25" },
      "200m Breast": { time: "2:36.54", holder: "April Lin", date: "1-Sept-25" }
    }
  },
  Male: {
    "9": {
      "50m Free": { time: "31.53", holder: "T Nancarrow", date: "31-Dec-94" },
      "100m Free": { time: "1:08.01", holder: "Sky Yu", date: "25-Oct-25" }
    },
    "10": {
      "50m Free": { time: "28.83", holder: "Grayson Coulter", date: "5-Nov-22" },
      "100m Free": { time: "1:04.77", holder: "Grayson Coulter", date: "20-Aug-22" }
    },
    "11": {
      "50m Free": { time: "26.09", holder: "Grayson Coulter", date: "4-Nov-23" },
      "100m Free": { time: "56.29", holder: "Grayson Coulter", date: "4-Nov-23" }
    }
  }
};

export const getAucklandRecord = (
  gender: 'Male' | 'Female',
  age: string,
  distance: string,
  stroke: StrokeType,
  course: CourseType
): RecordEntry | null => {
  if (course !== 'SCM') return null;
  const fullEventKey = `${distance} ${normalizeStroke(stroke)}`;
  
  // Try exact age, or 9 & U for younger ages
  let ageKey = age;
  if (parseInt(age) <= 9) ageKey = "9";
  
  return AUCKLAND_SC_RECORDS[gender]?.[ageKey]?.[fullEventKey] || null;
};

export const getNationalRecord = (
  gender: 'Male' | 'Female',
  ageGroup: string,
  distance: string,
  stroke: StrokeType,
  course: CourseType
): RecordEntry | null => {
  // Logic for national records (remains same or can be updated similarly)
  return null; 
};
