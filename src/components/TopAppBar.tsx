import React from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  SlidersHorizontal,
  Settings,
  X,
  Sparkles,
  Smartphone,
  Maximize2,
} from 'lucide-react';
import { AppSettings } from '../types';

interface TopAppBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSearching: boolean;
  onToggleSearch: () => void;
  activeFilterCount: number;
  onOpenFilter: () => void;
  onOpenSettings: () => void;
  settings: AppSettings;
  onToggleViewMode: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  showSearch = true,
  searchQuery,
  onSearchChange,
  isSearching,
  onToggleSearch,
  activeFilterCount,
  onOpenFilter,
  onOpenSettings,
  settings,
  onToggleViewMode,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#1A56A0] text-white shadow-md select-none transition-colors">
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        {/* Left: Back or App Icon */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showBack ? (
            <button
              id="btn-appbar-back"
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-white/15 active:bg-white/25 transition-colors focus:outline-none"
              title="Volver"
              aria-label="Volver atrás"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 text-sky-200" />
            </div>
          )}

          {isSearching ? (
            <div className="flex-1 flex items-center bg-white/20 rounded-full px-3 py-1.5 border border-white/30 backdrop-blur-sm">
              <Search className="w-4 h-4 text-sky-200 mr-2 shrink-0" />
              <input
                id="input-appbar-search"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por nombre o CC..."
                className="w-full bg-transparent text-white placeholder-sky-200 text-sm focus:outline-none"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-1 rounded-full hover:bg-white/20"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-white truncate leading-snug">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-sky-100/85 truncate font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0">
          {showSearch && (
            <button
              id="btn-toggle-search"
              onClick={onToggleSearch}
              className={`p-2 rounded-full transition-colors ${
                isSearching ? 'bg-white/25 text-white' : 'hover:bg-white/15 text-white/90'
              }`}
              title="Buscar"
              aria-label="Buscar pacientes"
            >
              {isSearching ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
          )}

          {!showBack && (
            <button
              id="btn-open-filter"
              onClick={onOpenFilter}
              className="p-2 rounded-full hover:bg-white/15 active:bg-white/25 transition-colors text-white/90 relative"
              title="Filtrar por rango de fechas"
              aria-label="Filtro de fechas"
            >
              <Filter className="w-5 h-5" />
              {activeFilterCount > 0 && (
                <span className="absolute 1.5 top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-900 font-bold text-[10px] flex items-center justify-center shadow">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          <button
            id="btn-toggle-device-view"
            onClick={onToggleViewMode}
            className="p-2 rounded-full hover:bg-white/15 active:bg-white/25 transition-colors text-white/90 hidden sm:flex items-center justify-center"
            title={settings.viewMode === 'mobile' ? 'Ver en Pantalla Completa' : 'Ver en Formato Android Móvil'}
            aria-label="Cambiar vista"
          >
            {settings.viewMode === 'mobile' ? (
              <Maximize2 className="w-5 h-5" />
            ) : (
              <Smartphone className="w-5 h-5" />
            )}
          </button>

          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            className="p-2 rounded-full hover:bg-white/15 active:bg-white/25 transition-colors text-white/90"
            title="Configuración y API Key"
            aria-label="Configuración"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
