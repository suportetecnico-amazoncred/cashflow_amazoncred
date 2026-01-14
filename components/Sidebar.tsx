
import React, { useMemo } from 'react';
import { ViewState } from '../types.js';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onLogout?: () => void;
  activeClientName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout, activeClientName }) => {
  const LOGO_URL = "img/sitelogo.png";
  
  const navItems = useMemo(() => [
    { id: 'dashboard', label: 'Resumo', icon: '🏛️' },
    { id: 'operations', label: 'Operar', icon: '📝' },
    { id: 'loans', label: 'Empréstimo', icon: '🏦' },
    { id: 'clients', label: 'Extrato', icon: '👤' },
    { id: 'savings', label: 'Poupar', icon: '🐷' },
  ], []);

  const displayName = useMemo(() => 
    activeClientName ? activeClientName.split(' ')[0] : '', 
  [activeClientName]);

  return (
    <>
      <div className="hidden lg:flex w-64 bg-slate-900 h-screen fixed left-0 top-0 text-white flex-col z-50">
        <div className="p-6">
          <div className="w-12 h-12 bg-white/10 rounded-xl mb-4 flex items-center justify-center p-2">
            <img 
              src={LOGO_URL} 
              alt="Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const span = document.createElement('span');
                  span.textContent = '🌱';
                  parent.appendChild(span);
                }
              }}
            />
          </div>
          <h1 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Amazoncred
          </h1>
          {displayName && (
             <p className="text-emerald-400 text-[10px] mt-2 font-black uppercase tracking-widest overflow-hidden text-ellipsis whitespace-nowrap opacity-80">
               Olá, {displayName}
             </p>
          )}
        </div>
        
        <nav className="flex-1 mt-4 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                currentView === item.id 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                  : 'text-slate-500 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-xs font-black uppercase tracking-widest"
          >
            <span className="mr-3">🚪</span>
            Sair
          </button>
          <div className="mt-4 text-[9px] text-slate-600 text-center uppercase font-black opacity-50">
            v3.2 Optimized
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center px-2 py-3 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewState)}
            className={`flex flex-col items-center flex-1 py-1 transition-all ${
              currentView === item.id ? 'text-emerald-600 scale-110' : 'text-slate-400'
            }`}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
        <button
          onClick={onLogout}
          className="flex flex-col items-center flex-1 py-1 text-red-500 transition-all active:scale-90"
        >
          <span className="text-xl mb-1">🚪</span>
          <span className="text-[8px] font-black uppercase tracking-tighter">Sair</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;