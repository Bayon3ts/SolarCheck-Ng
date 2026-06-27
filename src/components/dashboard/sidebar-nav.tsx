import React from 'react';
import Link from 'next/link';

interface Installer {
  company_name: string;
  subscription_tier: string;
}

interface SidebarNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  newLeadsCount: number;
  installer: Installer;
  isLoggedIn: boolean;
  onSignOut: () => void;
}

export function SidebarNav({ activeTab, setActiveTab, newLeadsCount, installer, isLoggedIn, onSignOut }: SidebarNavProps) {
  const navItems = [
    { id: 'leads', label: 'Leads' },
    { id: 'profile', label: 'Profile' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <>
      {/* ══════════════ DESKTOP SIDEBAR ══════════════ */}
      <aside className="hidden md:flex w-64 flex-col bg-[#1A5E38] min-h-screen p-6 fixed h-full z-10 text-white">
        
        <Link href="/" className="text-2xl font-black text-white mb-10 block">
          Solar<span className="text-[#F5A623]">Check</span>
        </Link>

        {/* Installer Badge */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-white flex-shrink-0 uppercase">
            {installer.company_name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-white truncate">{installer.company_name}</p>
            <p className="text-xs text-white/60 capitalize mt-0.5">
              {isLoggedIn ? `${installer.subscription_tier} Plan` : 'Preview Mode'}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-between px-4 py-3 rounded-full text-sm font-bold transition-colors text-left ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                {tab.id === 'leads' && newLeadsCount > 0 && (
                  <span className="bg-[#F5A623] text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                    {newLeadsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto">
          {isLoggedIn ? (
            <button 
              onClick={onSignOut}
              className="text-sm font-bold text-white/50 hover:text-white/90 transition-colors w-full text-left px-4 py-2"
            >
              Sign Out
            </button>
          ) : (
            <div className="text-sm font-bold text-white/50 px-4 py-2">
              Preview Mode
            </div>
          )}
        </div>
      </aside>

      {/* ══════════════ MOBILE BOTTOM TAB BAR ══════════════ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E5E0] flex md:hidden z-40 pb-safe">
        {navItems.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-4 gap-1 relative transition-colors ${
                isActive ? 'text-[#1A5E38]' : 'text-[#6B6B6B]'
              }`}
            >
              <span className="text-xs font-bold">{tab.label}</span>
              {tab.id === 'leads' && newLeadsCount > 0 && (
                <span className="absolute top-2 right-1/4 w-1.5 h-1.5 bg-[#F5A623] rounded-full" />
              )}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#1A5E38] rounded-b-full" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
