import React, { useState, useEffect } from 'react';
import {
  Wifi,
  BatteryMedium,
  Signal,
  Plus,
  Maximize2,
  Minimize2,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { AppSettings } from '../types';

interface AndroidFrameProps {
  children: React.ReactNode;
  settings: AppSettings;
  onToggleViewMode: () => void;
  showFab?: boolean;
  onFabClick?: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  settings,
  onToggleViewMode,
  showFab = true,
  onFabClick,
}) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const isMobileView = settings.viewMode === 'mobile';

  if (!isMobileView) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col relative selection:bg-blue-200">
        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6">{children}</main>

        {/* Global Floating Action Button (Android FAB) */}
        {showFab && onFabClick && (
          <button
            id="btn-android-fab"
            onClick={onFabClick}
            className="fixed bottom-6 right-6 z-40 bg-[#1A56A0] hover:bg-blue-700 active:bg-blue-800 text-white w-14 h-14 rounded-2xl shadow-xl hover:shadow-2xl flex items-center justify-center transition-all active:scale-95 group focus:outline-none focus:ring-4 focus:ring-blue-300"
            title="Añadir nuevo paciente (+)"
            aria-label="Añadir nuevo paciente"
          >
            <Plus className="w-7 h-7 text-white transition-transform group-hover:rotate-90 duration-200" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900/90 py-4 px-2 sm:py-8 flex flex-col items-center justify-center">
      {/* Top Helper Banner */}
      <div className="mb-3 flex items-center gap-3 text-xs text-slate-300 font-medium">
        <span className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-sky-300">
          <Smartphone className="w-3.5 h-3.5" />
          Vista Simulada: Android Nativo (Jetpack Compose)
        </span>
        <button
          onClick={onToggleViewMode}
          className="text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-3 py-1 rounded-full border border-slate-700 transition-colors flex items-center gap-1"
        >
          <Maximize2 className="w-3 h-3" />
          <span>Pantalla Completa</span>
        </button>
      </div>

      {/* Android Device Mockup Shell */}
      <div className="relative w-full max-w-[420px] h-[850px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-[4px] border-slate-800 ring-1 ring-white/10 flex flex-col overflow-hidden">
        {/* Device camera punch hole */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-40 ring-2 ring-slate-800/50" />

        {/* Android Screen Surface */}
        <div className="w-full h-full bg-slate-50 rounded-[34px] flex flex-col overflow-hidden relative shadow-inner">
          {/* Android Status Bar */}
          <div className="bg-[#1A56A0] text-white px-6 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-semibold tracking-tight select-none shrink-0 z-30">
            <span>{currentTime || '09:41'}</span>
            <div className="flex items-center gap-1.5 text-white/90">
              <span className="text-[10px] font-bold tracking-wider">5G</span>
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <BatteryMedium className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Screen Scrollable View */}
          <div className="flex-1 overflow-y-auto relative scroll-smooth px-3 py-3">
            {children}
          </div>

          {/* FAB in Mobile Mode */}
          {showFab && onFabClick && (
            <button
              id="btn-android-fab-mobile"
              onClick={onFabClick}
              className="absolute bottom-6 right-5 z-40 bg-[#1A56A0] hover:bg-blue-700 active:bg-blue-800 text-white w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all active:scale-95 group focus:outline-none"
              title="Añadir nuevo paciente (+)"
              aria-label="Añadir nuevo paciente"
            >
              <Plus className="w-7 h-7 text-white transition-transform group-hover:rotate-90 duration-200" />
            </button>
          )}

          {/* Android Gesture Navigation Bar */}
          <div className="bg-slate-50 py-1.5 flex items-center justify-center shrink-0 z-30 select-none">
            <div className="w-32 h-1 bg-slate-400 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
