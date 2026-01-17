import React, { useState, useEffect } from 'react';
import { User, Building2, Save, CheckCircle2, Loader2 } from 'lucide-react';

interface UserProfileSettingsProps {
  initialFirstName?: string;
  initialLastName?: string;
  initialClub?: string;
  onSave: (firstName: string, lastName: string, club: string) => Promise<void>;
  onCancel?: () => void;
}

// Auckland Swimming Clubs List
const SWIMMING_CLUBS = [
  'North Shore Swimming Club (NSS)',
  'Phoenix Aquatics (PHO)',
  'United Swimming Club (UNIAK)',
  'Coast Swim Club (CSCAK)',
  'Howick Pakuranga Swim Club (HPK)',
  'Parnell Swim Club (PARAK)',
  'Mount Wellington Swimming Club (MTWAK)',
  'Roskill Swimming Club (ROSAK)',
  'Waitakere Swimming Club (WCSAK)',
  'Fulton Amateur Swimming Team (FST)',
  'Manurewa Swimming Club (MAN)',
  'Papakura Swimming Club (PPK)',
  'Pukekohe Swimming Club (PUK)',
  'Waterhole Swimming Club (WHL)',
  'SwimTastic (ST)',
  'Other Club',
];

export const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({
  initialFirstName = '',
  initialLastName = '',
  initialClub = '',
  onSave,
  onCancel,
}) => {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [selectedClub, setSelectedClub] = useState(initialClub);
  const [customClub, setCustomClub] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const showCustomClub = selectedClub === 'Other Club';

  useEffect(() => {
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setSelectedClub(initialClub || '');
  }, [initialFirstName, initialLastName, initialClub]);

  const handleSave = async () => {
    if (!firstName.trim()) {
      setError('Please enter first name');
      return;
    }

    if (!lastName.trim()) {
      setError('Please enter last name');
      return;
    }

    const club = showCustomClub ? customClub.trim() : selectedClub;
    if (!club) {
      setError('Please select or enter a club name');
      return;
    }

    setIsSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      await onSave(firstName.trim(), lastName.trim(), club);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        if (onCancel) onCancel();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
          <User size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Athlete Profile Settings</h2>
          <p className="text-xs text-slate-500">Saved data will be automatically loaded on next login</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Athlete Name - First and Last */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <User size={14} />
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setError('');
              }}
              className="w-full font-bold text-slate-800 bg-slate-50/50 rounded-lg px-4 py-3 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all outline-none placeholder-slate-300"
              placeholder="Enter first name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <User size={14} />
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setError('');
              }}
              className="w-full font-bold text-slate-800 bg-slate-50/50 rounded-lg px-4 py-3 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all outline-none placeholder-slate-300"
              placeholder="Enter last name"
            />
          </div>
        </div>

        {/* Club Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Building2 size={14} />
            Swimming Club
          </label>
          <select
            value={selectedClub}
            onChange={(e) => {
              setSelectedClub(e.target.value);
              setCustomClub('');
              setError('');
            }}
            className="w-full font-bold text-slate-800 bg-slate-50/50 rounded-lg px-4 py-3 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
          >
            <option value="">Select a club</option>
            {SWIMMING_CLUBS.map((club) => (
              <option key={club} value={club}>
                {club}
              </option>
            ))}
          </select>

          {showCustomClub && (
            <input
              type="text"
              value={customClub}
              onChange={(e) => {
                setCustomClub(e.target.value);
                setError('');
              }}
              className="w-full font-bold text-slate-800 bg-slate-50/50 rounded-lg px-4 py-3 mt-2 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all outline-none placeholder-slate-300"
              placeholder="Enter club name"
            />
          )}
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {saveSuccess && (
          <div className="text-emerald-600 text-sm bg-emerald-50 p-3 rounded-lg border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 size={16} />
            Saved successfully! Syncing performance data...
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button
          onClick={handleSave}
          disabled={isSaving || !firstName.trim() || !lastName.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Profile
            </>
          )}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
