import React from 'react';
import { Home, Compass, Plus, Wallet, User } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUploadClick: () => void;
}

export default function Navbar({ activeTab, setActiveTab, onUploadClick }: NavbarProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Feed' },
    { id: 'explore', icon: Compass, label: 'Explorar' },
    { id: 'create', icon: Plus, label: 'Criar' },
    { id: 'wallet', icon: Wallet, label: 'Carteira' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-ango-black/90 backdrop-blur-xl border-t border-white/5 px-2 py-3 flex items-center justify-around z-50 max-w-md mx-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        if (tab.id === 'create') {
          return (
            <button
              key={tab.id}
              onClick={onUploadClick}
              className="relative group -mt-8"
            >
              <div className="w-14 h-14 bg-ango-amber rounded-2xl flex items-center justify-center shadow-lg shadow-ango-amber/20 transition-transform group-active:scale-90 rotate-45 border-4 border-ango-black">
                <Icon className="w-8 h-8 text-ango-black -rotate-45 stroke-[3]" />
              </div>
              {/* Geometric Pattern Accent */}
              <div className="absolute -inset-1 border border-ango-gold/20 rounded-2xl -z-10 rotate-45" />
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive ? 'text-ango-gold scale-110' : 'text-ango-cream/40 hover:text-ango-cream/60'
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-0'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
