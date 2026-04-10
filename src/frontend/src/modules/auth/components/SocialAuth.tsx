import React from 'react';

export default function SocialAuth() {
  return (
    <>
      <div className="relative my-12">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-bold">
          <span className="px-6 bg-white dark:bg-slate-900">Social Authentication</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Button Google */}
        <button className="flex items-center justify-center gap-3 h-12 border border-slate-200 hover:bg-slate-50 transition-all rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/>
          </svg>
          <span>Google</span>
        </button>

        {/* Button Facebook */}
        <button className="flex items-center justify-center gap-3 h-12 border border-slate-200 hover:bg-slate-50 transition-all rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
          </svg>
          <span>Facebook</span>
        </button>
      </div>
    </>
  );
}