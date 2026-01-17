
import React, { useState, useEffect } from 'react';
import { Timer, Flag, Award, Waves, User as UserIcon, History, LogOut, Settings } from 'lucide-react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { TimeInputCard, ResultCard } from './components/TimeCard';
import { StrokeSelector, StrokeType } from './components/StrokeSelector';
import { DistanceSelector } from './components/DistanceSelector';
import { CourseSelector, CourseType } from './components/CourseSelector';
import { GenderSelector, GenderType } from './components/GenderSelector';
import { AgeInput } from './components/AgeInput';
import { TrainingView } from './components/TrainingView';
import { ClerkAuthView } from './components/ClerkAuthView';
import { UserProfileSettings } from './components/UserProfileSettings';
import { getAsaStandard } from './data/asaStandards';
import { userProfileService } from './services/supabaseService';

type AppTab = 'race' | 'training';

function App() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<AppTab>('race');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [athleteClub, setAthleteClub] = useState<string>('');
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  
  const [selectedStroke, setSelectedStroke] = useState<StrokeType>('Freestyle');
  const [selectedDistance, setSelectedDistance] = useState('100m');
  const [selectedCourse, setSelectedCourse] = useState<CourseType>('SCM');
  const [selectedGender, setSelectedGender] = useState<GenderType | null>(null);
  const [selectedAge, setSelectedAge] = useState<number | ''>('');
  
  const [userTime, setUserTime] = useState('');
  const [level1Time, setLevel1Time] = useState('');
  const [level2Time, setLevel2Time] = useState('');

  // 当选择改变时，自动计算Level1和Level2标准
  useEffect(() => {
    if (selectedGender && selectedAge !== '' && typeof selectedAge === 'number') {
      const l1 = getAsaStandard(selectedGender, 'Level 1', selectedCourse, selectedStroke, selectedDistance, selectedAge);
      const l2 = getAsaStandard(selectedGender, 'Level 2', selectedCourse, selectedStroke, selectedDistance, selectedAge);
      setLevel1Time(l1 || '');
      setLevel2Time(l2 || '');
    } else {
      // 如果没有性别或年龄信息，清空标准
      setLevel1Time('');
      setLevel2Time('');
    }
  }, [selectedStroke, selectedDistance, selectedCourse, selectedGender, selectedAge]);

  // 加载用户资料
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return;

    const loadUserProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const profile = await userProfileService.getUserProfile(user.id);
        if (profile) {
          setFirstName(profile.first_name || '');
          setLastName(profile.last_name || '');
          setAthleteClub(profile.club || '');
          setHasProfile(true);
        } else {
          setHasProfile(false);
          setShowProfileSettings(true);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        setHasProfile(false);
        setShowProfileSettings(true);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [isLoaded, isSignedIn, user?.id]);

  // 保存用户资料
  const handleSaveProfile = async (firstName: string, lastName: string, club: string) => {
    if (!user?.id) throw new Error('User not logged in');

    await userProfileService.saveUserProfile(user.id, {
      first_name: firstName,
      last_name: lastName,
      club: club,
    });

    setFirstName(firstName);
    setLastName(lastName);
    setAthleteClub(club);
    setHasProfile(true);
    setShowProfileSettings(false);
  };


  const handleStrokeChange = (stroke: StrokeType) => {
    setSelectedStroke(stroke);
    const validDistances = stroke === 'Freestyle' ? ['50m', '100m', '200m', '400m', '800m', '1500m'] :
                           stroke === 'IM' ? ['100m', '200m', '400m'] : ['50m', '100m', '200m'];
    if (!validDistances.includes(selectedDistance)) {
      setSelectedDistance(validDistances.includes('100m') ? '100m' : validDistances[0]);
    }
  };

  const renderContent = () => {
    if (activeTab === 'training') return <TrainingView userId="public_user" />;
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <section className="text-center space-y-4 mb-8">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Race Analysis</h2>
          <div className="space-y-4">
            <div className="flex justify-center gap-4 items-center">
              <GenderSelector selected={selectedGender} onSelect={setSelectedGender} />
              <AgeInput age={selectedAge} onChange={setSelectedAge} />
            </div>
            <div className="flex justify-center">
              <StrokeSelector selected={selectedStroke} onSelect={handleStrokeChange} />
            </div>
            <div className="flex flex-col items-center gap-4">
               <DistanceSelector 
                options={selectedStroke === 'Freestyle' ? ['50m', '100m', '200m', '400m', '800m', '1500m'] : 
                         selectedStroke === 'IM' ? ['100m', '200m', '400m'] : ['50m', '100m', '200m']} 
                selected={selectedDistance} 
                onSelect={setSelectedDistance} 
               />
               <CourseSelector selected={selectedCourse} onSelect={setSelectedCourse} />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <TimeInputCard
              label={`My Best ${selectedDistance} ${selectedStroke}`}
              value={userTime}
              onChange={setUserTime}
              colorClass="bg-white ring-2 shadow-xl transition-all duration-300 ring-indigo-500/10"
              icon={<Timer size={18} className="text-indigo-600" />}
            />
          </div>

          <div><TimeInputCard label="ASA Level 1" value={level1Time} onChange={setLevel1Time} icon={<Flag size={18} className="text-rose-500" />} /></div>
          <div><TimeInputCard label="ASA Level 2" value={level2Time} onChange={setLevel2Time} icon={<Award size={18} className="text-amber-500" />} /></div>
        </section>

        {(userTime && (level1Time || level2Time)) && (
          <section className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Analysis Results</h3>
            <div className="grid gap-4">
              {level1Time && <ResultCard standardName="Level 1" standardTimeStr={level1Time} userTimeStr={userTime} />}
              {level2Time && <ResultCard standardName="Level 2" standardTimeStr={level2Time} userTimeStr={userTime} />}
            </div>
          </section>
        )}
      </div>
    );
  };

  // 如果 Clerk 还在加载，显示加载状态
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // 如果用户未登录，显示登录界面
  if (!isSignedIn) {
    return <ClerkAuthView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200"><Waves size={24} /></div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">Lapflow</h1>
              <p className="text-xs text-slate-500 font-medium">Performance Calculator</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{user.firstName || user.emailAddresses[0]?.emailAddress}</p>
                  <p className="text-xs text-slate-500">Signed in</p>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="登出"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {isLoadingProfile ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading profile...</p>
            </div>
          </div>
        ) : showProfileSettings ? (
          <UserProfileSettings
            initialFirstName={firstName}
            initialLastName={lastName}
            initialClub={athleteClub}
            onSave={handleSaveProfile}
            onCancel={() => {
              if (hasProfile) {
                setShowProfileSettings(false);
              }
            }}
          />
        ) : (
          <>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-indigo-50 p-3 rounded-full text-indigo-600"><UserIcon size={20} /></div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Athlete Name</label>
                    <div className="flex gap-2 mt-1">
                      <input 
                        type="text" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="flex-1 font-bold text-slate-800 bg-slate-50/50 rounded-lg px-3 py-2 border border-slate-100 focus:border-indigo-200 focus:bg-white transition-all outline-none placeholder-slate-300"
                        placeholder="First Name"
                      />
                      <input 
                        type="text" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="flex-1 font-bold text-slate-800 bg-slate-50/50 rounded-lg px-3 py-2 border border-slate-100 focus:border-indigo-200 focus:bg-white transition-all outline-none placeholder-slate-300"
                        placeholder="Last Name"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileSettings(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Edit Profile"
                >
                  <Settings size={18} />
                </button>
              </div>
          
              {athleteClub && (
                <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Club:</span>
                    <span className="text-lg font-black text-indigo-700">{athleteClub}</span>
                  </div>
                </div>
              )}
            </div>

            <nav className="flex p-1 bg-slate-200 rounded-xl overflow-hidden">
              <button onClick={() => setActiveTab('race')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'race' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}><Timer size={16} /> Race Analysis</button>
              <button onClick={() => setActiveTab('training')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'training' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}><History size={16} /> Training Log</button>
            </nav>

            {renderContent()}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
