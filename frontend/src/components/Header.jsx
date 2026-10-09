import React from 'react';

export function Header({ currentView, onViewChange }) {
  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Festival ticker strip */}
      <div
        style={{ background: '#FFC700' }}
        className="w-full py-1.5 flex items-center justify-center gap-3 text-black font-bold text-[11px] tracking-[0.2em] uppercase font-body"
      >
        <span className="opacity-60">•</span>
        ECHOES 2026 &nbsp;·&nbsp; IITRAM, AHMEDABAD &nbsp;·&nbsp; CRAVEYARD FOOD STALL
        <span className="opacity-60">•</span>
      </div>

      {/* Main nav bar */}
      <div
        style={{ background: 'rgba(10,11,15,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        className="w-full px-5 md:px-10 py-3 flex items-center justify-between"
      >
        {/* Logo */}
        <button
          onClick={() => onViewChange('menu')}
          className="flex items-center gap-2 group focus:outline-none"
        >
          <div className="text-left">
            <div className="font-brush leading-none tracking-wide" style={{ fontSize: '1.5rem', color: '#fff' }}>
              CRAVE<span style={{ color: '#FFC700' }}>YARD</span>
            </div>
            <div className="font-hand leading-none mt-0.5" style={{ fontSize: '0.95rem', color: 'rgba(255,199,0,0.8)' }}>
              Good Food × Great Vibes
            </div>
          </div>
        </button>

        {/* Right Actions */}
        {currentView === 'billing' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewChange('menu')}
              className="btn-ghost text-xs"
            >
              ← Back to Menu
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
