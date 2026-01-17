import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Waves } from 'lucide-react';

export const ClerkAuthView: React.FC = () => {
  const [isSignIn, setIsSignIn] = React.useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header Section */}
        <div className="bg-indigo-600 p-8 text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4 shadow-inner">
            <Waves size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Lapflow</h1>
          <p className="text-indigo-100 font-medium text-sm mt-1">Performance Calculator</p>
        </div>

        {/* Clerk Auth Components */}
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setIsSignIn(true)}
              className={`px-4 py-2 text-sm font-bold transition-all ${
                isSignIn
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignIn(false)}
              className={`px-4 py-2 text-sm font-bold transition-all ${
                !isSignIn
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="flex justify-center">
            {isSignIn ? (
              <SignIn
                appearance={{
                  elements: {
                    rootBox: 'mx-auto',
                    card: 'shadow-none',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    socialButtonsBlockButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
                    formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700',
                    footerActionLink: 'text-indigo-600 hover:text-indigo-700',
                  },
                }}
              />
            ) : (
              <SignUp
                appearance={{
                  elements: {
                    rootBox: 'mx-auto',
                    card: 'shadow-none',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    socialButtonsBlockButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
                    formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700',
                    footerActionLink: 'text-indigo-600 hover:text-indigo-700',
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
