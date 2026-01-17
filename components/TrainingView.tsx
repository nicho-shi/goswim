
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, History, Trash2, BrainCircuit, Loader2, ClipboardCheck, Info, ChevronRight, Languages } from 'lucide-react';
import { StrokeSelector, StrokeType } from './StrokeSelector';
import { CourseSelector, CourseType } from './CourseSelector';
import { GoogleGenAI } from "@google/genai";

interface TrainingViewProps {
  userId: string;
}

interface SetEntry {
  id: string;
  stroke: StrokeType;
  distance: string;
  course: CourseType;
  times: string[];
  notes: string;
}

interface DaySession {
  date: string;
  entries: SetEntry[];
  analysis?: string;
  analysisZh?: string;
}

const TrainingCourseSelector: React.FC<{selected: CourseType, onSelect: (c: CourseType) => void}> = ({ selected, onSelect }) => {
  return (
    <div className="flex bg-slate-200 p-1 rounded-xl w-fit mx-auto">
      <button
        onClick={() => onSelect('SCM')}
        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
          selected === 'SCM' 
            ? 'bg-white text-indigo-600 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        33M
      </button>
      <button
        onClick={() => onSelect('LCM')}
        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
          selected === 'LCM' 
            ? 'bg-white text-indigo-600 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        66M
      </button>
    </div>
  );
};

export const TrainingView: React.FC<TrainingViewProps> = ({ userId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessions, setSessions] = useState<Record<string, DaySession>>({});
  const [showChinese, setShowChinese] = useState(false);
  
  const [selectedStroke, setSelectedStroke] = useState<StrokeType>('Freestyle');
  const [selectedCourse, setSelectedCourse] = useState<CourseType>('SCM');
  const [currentTimeInput, setCurrentTimeInput] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`lapflow_v2_training_${userId}`);
    if (saved) {
      try { setSessions(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, [userId]);

  const saveSessions = (newSessions: Record<string, DaySession>) => {
    localStorage.setItem(`lapflow_v2_training_${userId}`, JSON.stringify(newSessions));
    setSessions(newSessions);
  };

  const addSetToSession = () => {
    if (!currentTimeInput.trim()) return;
    const times = currentTimeInput.split(/[\s,]+/).filter(t => t.length > 0);
    const impliedDistance = selectedCourse === 'SCM' ? '33m' : '66m';

    const newEntry: SetEntry = {
      id: Math.random().toString(36).substr(2, 9),
      stroke: selectedStroke,
      distance: impliedDistance,
      course: selectedCourse,
      times,
      notes: '' 
    };

    const currentDay = sessions[selectedDate] || { date: selectedDate, entries: [] };
    const updatedDay = { ...currentDay, entries: [...currentDay.entries, newEntry] };
    saveSessions({ ...sessions, [selectedDate]: updatedDay });
    setCurrentTimeInput('');
  };

  const deleteEntry = (date: string, id: string) => {
    const session = sessions[date];
    if (!session) return;
    const updatedEntries = session.entries.filter(e => e.id !== id);
    const newSessions = { ...sessions };
    if (updatedEntries.length === 0) {
      delete newSessions[date];
    } else {
      newSessions[date] = { ...session, entries: updatedEntries };
    }
    saveSessions(newSessions);
  };

  const translateReport = async (date: string) => {
    const session = sessions[date];
    if (!session || !session.analysis || session.analysisZh) {
      setShowChinese(!showChinese);
      return;
    }

    setIsTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate the following swimming training analysis into Professional Chinese (Simplified). Keep the same structure and formatting:\n\n${session.analysis}`,
      });
      const updatedDay = { ...session, analysisZh: response.text };
      saveSessions({ ...sessions, [date]: updatedDay });
      setShowChinese(true);
    } catch (err) {
      console.error("Translation failed", err);
    } finally {
      setIsTranslating(false);
    }
  };

  const runCoachAnalysis = async (date: string) => {
    const session = sessions[date];
    if (!session || session.entries.length === 0) return;

    setIsAnalyzing(true);
    setShowChinese(false);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const historicalContext = Object.values(sessions)
        .filter((s: DaySession) => s.date < date)
        .sort((a: DaySession, b: DaySession) => b.date.localeCompare(a.date))
        .slice(0, 5)
        .map((s: DaySession) => `Date: ${s.date}, Data: ${s.entries.map(e => `${e.distance} ${e.stroke}: ${e.times.join(', ')}`).join('; ')}`)
        .join('\n');

      const currentData = session.entries.map(e => 
        `${e.distance} ${e.stroke} (${e.course === 'SCM' ? '33M' : '66M'}): ${e.times.join(', ')}`
      ).join('\n');

      const systemInstruction = `You are a world-class professional competitive swimming data analyst AI. Your audience includes athletes (8-16 years old), parents, and coaches.
Duties:
1. Compare current data with historical context.
2. Maintain a professional, objective, and encouraging tone.
3. Focus on: stability, speed variance, energy distribution, technical efficiency, and fatigue points.
4. Output MUST be in English.

Structure your output into these 4 sections:
I. Performance Overview (Fastest/Slowest/Average/Stability)
II. Historical Comparison (Improvement/Consistency/Fluctuation)
III. Physiological Insights (Power/Endurance/Aerobic-Anaerobic bias)
IV. Training Recommendations (1-2 specific technical focuses)`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this swimming data:\n\nCurrent (${date}):\n${currentData}\n\nHistorical Context:\n${historicalContext || 'None available'}`,
        config: { systemInstruction }
      });

      const updatedDay = { ...session, analysis: response.text, analysisZh: undefined };
      saveSessions({ ...sessions, [date]: updatedDay });
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-10">
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 tracking-tight">Daily Training Log</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Performance Tracking</p>
            </div>
          </div>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-6">
          <StrokeSelector selected={selectedStroke} onSelect={setSelectedStroke} />
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Pool Type</label>
            <TrainingCourseSelector selected={selectedCourse} onSelect={setSelectedCourse} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Set Times (SS.hh or MM:SS.hh)</label>
            <input 
              type="text"
              value={currentTimeInput}
              onChange={(e) => setCurrentTimeInput(e.target.value)}
              placeholder="Separate times with space e.g. 32.50 33.10"
              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl p-6 text-2xl font-mono font-bold text-center text-slate-800 transition-all outline-none"
            />
            <p className="text-[10px] text-slate-400 text-center font-medium">Auto-distance: {selectedCourse === 'SCM' ? '33m' : '66m'}</p>
          </div>
          <button 
            onClick={addSetToSession}
            disabled={!currentTimeInput}
            className="w-full bg-slate-800 text-white py-5 rounded-2xl font-black text-sm hover:bg-slate-900 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-slate-200"
          >
            Add Set to Session
          </button>
        </div>
      </section>

      {sessions[selectedDate] && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
            <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <ClipboardCheck size={18} />
                <span className="font-bold text-sm">Session Summary: {selectedDate}</span>
              </div>
              <button 
                onClick={() => runCoachAnalysis(selectedDate)}
                disabled={isAnalyzing}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-lg text-xs font-black transition-all disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <BrainCircuit size={14} />}
                AI Coach Report
              </button>
            </div>

            <div className="p-6 space-y-4">
              {sessions[selectedDate].entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-black uppercase tracking-tighter">
                        {entry.distance} {entry.stroke}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{entry.course === 'SCM' ? '33M Pool' : '66M Pool'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entry.times.map((t, i) => (
                        <span key={i} className="text-xl font-mono font-black text-slate-800">{t}{i < entry.times.length - 1 ? ',' : ''}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => deleteEntry(selectedDate, entry.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {sessions[selectedDate].analysis && (
                <div className="mt-6 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 space-y-4 animate-in zoom-in duration-300">
                  <div className="flex items-center justify-between gap-2 text-indigo-700 border-b border-indigo-100 pb-3">
                    <div className="flex items-center gap-2">
                      <BrainCircuit size={20} />
                      <h4 className="font-black text-sm uppercase tracking-widest">
                        {showChinese ? 'AI 教练报告' : 'Professional Analysis Report'}
                      </h4>
                    </div>
                    <button 
                      onClick={() => translateReport(selectedDate)}
                      disabled={isTranslating}
                      className="flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-200 rounded-lg text-[10px] font-bold text-indigo-600 hover:bg-indigo-100 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
                      {showChinese ? 'View English' : '中文翻译'}
                    </button>
                  </div>
                  <div className="prose prose-sm text-slate-700 whitespace-pre-wrap font-medium leading-relaxed pt-2">
                    {showChinese && sessions[selectedDate].analysisZh 
                      ? sessions[selectedDate].analysisZh 
                      : sessions[selectedDate].analysis}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 px-2">
          <History size={20} className="text-slate-400" />
          Recent Training History
        </h3>
        <div className="grid gap-4">
          {Object.values(sessions)
            .sort((a: DaySession, b: DaySession) => b.date.localeCompare(a.date))
            .filter((s: DaySession) => s.date !== selectedDate)
            .map((session: DaySession) => (
              <button 
                key={session.date}
                onClick={() => setSelectedDate(session.date)}
                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={14} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-800">{session.date}</span>
                    {session.analysis && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[8px] font-black uppercase">Report Available</span>}
                  </div>
                  <p className="text-xs text-slate-500">
                    {session.entries.length} sets logged • {session.entries[0]?.stroke || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase">Load</p>
                    <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </div>
              </button>
            ))}
            
          {Object.keys(sessions).length === 0 && (
            <div className="p-12 text-center bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200">
              <Info className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-sm font-bold text-slate-400">Your training database is currently empty.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
