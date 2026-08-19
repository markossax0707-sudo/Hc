import React from 'react';
import { Calendar, Filter, X, RotateCcw } from 'lucide-react';
import { PatientFilters } from '../types';

interface FilterBarProps {
  filters: PatientFilters;
  onFilterChange: (newFilters: PatientFilters) => void;
  onResetFilters: () => void;
  totalFiltered: number;
  totalAll: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalFiltered,
  totalAll,
}) => {
  const [localInicio, setLocalInicio] = React.useState(filters.fechaInicio);
  const [localFin, setLocalFin] = React.useState(filters.fechaFin);

  // Sync with prop changes
  React.useEffect(() => {
    setLocalInicio(filters.fechaInicio);
    setLocalFin(filters.fechaFin);
  }, [filters.fechaInicio, filters.fechaFin]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      ...filters,
      fechaInicio: localInicio,
      fechaFin: localFin,
    });
  };

  const handlePreset = (days: number) => {
    const end = new Date().toISOString().split('T')[0];
    let start = '';
    if (days === 0) {
      start = end; // Today
    } else if (days > 0) {
      const d = new Date();
      d.setDate(d.getDate() - days);
      start = d.toISOString().split('T')[0];
    }
    setLocalInicio(start);
    setLocalFin(end);
    onFilterChange({
      ...filters,
      fechaInicio: start,
      fechaFin: end,
    });
  };

  const isFiltering = Boolean(filters.fechaInicio || filters.fechaFin || filters.searchQuery);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-4 transition-all">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Filtrar por Rango de Fechas</span>
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Mostrando <span className="text-blue-700 font-bold">{totalFiltered}</span> de {totalAll} registros
        </div>
      </div>

      <form onSubmit={handleApply} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Fecha Inicio */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Fecha Inicio
            </label>
            <div className="relative">
              <input
                id="input-filter-fecha-inicio"
                type="date"
                value={localInicio}
                onChange={(e) => setLocalInicio(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Fecha Fin
            </label>
            <div className="relative">
              <input
                id="input-filter-fecha-fin"
                type="date"
                value={localFin}
                onChange={(e) => setLocalFin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Quick presets & action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500 mr-1">Rápido:</span>
            <button
              type="button"
              onClick={() => handlePreset(0)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium active:scale-95 transition-all"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => handlePreset(7)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium active:scale-95 transition-all"
            >
              Últimos 7 días
            </button>
            <button
              type="button"
              onClick={() => handlePreset(30)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium active:scale-95 transition-all"
            >
              30 días
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {isFiltering && (
              <button
                id="btn-filter-reset"
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
                title="Limpiar todos los filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            )}

            <button
              id="btn-filter-apply"
              type="submit"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1A56A0] hover:bg-blue-700 active:bg-blue-800 px-4 py-2 rounded-xl shadow-sm transition-all"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrar</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
