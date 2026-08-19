import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  ExternalLink,
  Edit,
  Trash2,
  CalendarDays,
  Search,
  Filter,
  BarChart3,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Patient, AppSettings } from '../types';

interface HistoryByDateViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
  onExportPdf: (patient: Patient) => void;
  onNewPatient: () => void;
  settings: AppSettings;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const HistoryByDateView: React.FC<HistoryByDateViewProps> = ({
  patients,
  onSelectPatient,
  onEditPatient,
  onDeletePatient,
  onExportPdf,
  onNewPatient,
  settings,
  searchQuery = '',
  onSearchChange,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});
  const [selectedUrgencyFilter, setSelectedUrgencyFilter] = useState<string>('todos');

  // Format date helper to friendly Spanish display
  const formatDateHeader = (dateStr: string) => {
    if (!dateStr) return 'Fecha no especificada';
    
    // Create Date from YYYY-MM-DD
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dateObj = new Date(year, month, day);

      const today = new Date();
      const isToday =
        dateObj.getDate() === today.getDate() &&
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getFullYear() === today.getFullYear();

      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const isYesterday =
        dateObj.getDate() === yesterday.getDate() &&
        dateObj.getMonth() === yesterday.getMonth() &&
        dateObj.getFullYear() === yesterday.getFullYear();

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const formatted = dateObj.toLocaleDateString('es-CO', options);
      const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);

      if (isToday) return `Hoy — ${capitalized}`;
      if (isYesterday) return `Ayer — ${capitalized}`;
      return capitalized;
    }
    return dateStr;
  };

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      // 1. Search Query
      const q = localSearch.toLowerCase().trim();
      if (q) {
        const matchName = p.nombre.toLowerCase().includes(q);
        const matchCC = p.identificacion.toLowerCase().includes(q);
        const matchMotivo = p.motivoConsulta.toLowerCase().includes(q);
        const matchEnf = p.enfermedadActual.toLowerCase().includes(q);
        const matchDiag = p.iaDiagnosticosCIE10?.some(
          (d) =>
            d.codigo.toLowerCase().includes(q) ||
            d.descripcion.toLowerCase().includes(q)
        );
        if (!matchName && !matchCC && !matchMotivo && !matchEnf && !matchDiag) {
          return false;
        }
      }

      // 2. Urgency Filter
      if (selectedUrgencyFilter !== 'todos') {
        if ((p.iaNivelUrgencia || 'Baja').toLowerCase() !== selectedUrgencyFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [patients, localSearch, selectedUrgencyFilter]);

  // Group patients by date of attention (fechaAtencion) in descending order
  const groupedByDate = useMemo(() => {
    const groups: { [date: string]: Patient[] } = {};

    filteredPatients.forEach((patient) => {
      const dateKey = patient.fechaAtencion || (patient.fechaCreacion ? patient.fechaCreacion.split('T')[0] : 'Sin fecha');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(patient);
    });

    // Sort dates descending (newest first)
    const sortedDateKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'Sin fecha') return 1;
      if (b === 'Sin fecha') return -1;
      return b.localeCompare(a);
    });

    // Sort patients inside each date by creation time descending
    return sortedDateKeys.map((dateKey) => {
      const sortedPatients = [...groups[dateKey]].sort((a, b) => {
        return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
      });
      return {
        date: dateKey,
        patients: sortedPatients,
      };
    });
  }, [filteredPatients]);

  // Quick Clinical Metrics
  const stats = useMemo(() => {
    const total = patients.length;
    const uniqueDates = new Set(patients.map((p) => p.fechaAtencion)).size;
    const withAi = patients.filter((p) => p.iaProcesada).length;
    const allCie10Count = patients.reduce(
      (acc, p) => acc + (p.iaDiagnosticosCIE10?.length || 0),
      0
    );

    return {
      total,
      uniqueDates,
      withAi,
      allCie10Count,
    };
  }, [patients]);

  const toggleDateCollapse = (date: string) => {
    setCollapsedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const collapseAll = () => {
    const all: Record<string, boolean> = {};
    groupedByDate.forEach((g) => {
      all[g.date] = true;
    });
    setCollapsedDates(all);
  };

  const expandAll = () => {
    setCollapsedDates({});
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Top Clinical Stats Bar */}
      <div className="bg-gradient-to-r from-[#1A56A0] via-blue-700 to-indigo-800 text-white rounded-3xl p-5 shadow-sm border border-blue-900/20">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-sky-200" />
              <h2 className="text-base sm:text-lg font-bold">Cronología de Historias Clínicas</h2>
            </div>
            <p className="text-xs text-sky-100/80 mt-0.5">
              Registro histórico consolidado de todos los pacientes atendidos agrupados por fecha
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="text-[11px] font-semibold bg-white/15 hover:bg-white/25 active:bg-white/30 text-white px-3 py-1.5 rounded-xl transition-all"
            >
              Expandir Todos
            </button>
            <button
              onClick={collapseAll}
              className="text-[11px] font-semibold bg-white/15 hover:bg-white/25 active:bg-white/30 text-white px-3 py-1.5 rounded-xl transition-all"
            >
              Colapsar Todos
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-sky-200 block font-medium">Historias Totales</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{stats.total}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-sky-200 block font-medium">Jornadas / Fechas</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{stats.uniqueDates}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-sky-200 block font-medium">Procesados con IA</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{stats.withAi}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-sky-200 block font-medium">Diagnósticos CIE-10</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{stats.allCie10Count}</span>
          </div>
        </div>
      </div>

      {/* Search & Urgency Filter Row */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              if (onSearchChange) onSearchChange(e.target.value);
            }}
            placeholder="Filtrar por paciente, CC, CIE-10 o motivo..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400 font-medium"
          />
        </div>

        {/* Urgency Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 mr-1 hidden md:inline">Urgencia:</span>
          {['todos', 'Baja', 'Moderada', 'Alta'].map((urg) => (
            <button
              key={urg}
              onClick={() => setSelectedUrgencyFilter(urg)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedUrgencyFilter.toLowerCase() === urg.toLowerCase()
                  ? 'bg-[#1A56A0] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {urg === 'todos' ? 'Todas' : urg}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological List of Groups */}
      {groupedByDate.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm my-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No hay historias que coincidan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            {localSearch || selectedUrgencyFilter !== 'todos'
              ? 'No se encontraron historias clínicas para el criterio de búsqueda seleccionado.'
              : 'Aún no se han registrado pacientes en el sistema.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {(localSearch || selectedUrgencyFilter !== 'todos') && (
              <button
                onClick={() => {
                  setLocalSearch('');
                  setSelectedUrgencyFilter('todos');
                }}
                className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors"
              >
                Limpiar Filtros
              </button>
            )}
            <button
              onClick={onNewPatient}
              className="text-xs font-bold text-white bg-[#1A56A0] hover:bg-blue-700 px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              Nuevo Paciente
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedByDate.map(({ date, patients: datePatients }) => {
            const isCollapsed = !!collapsedDates[date];
            const dateTitle = formatDateHeader(date);
            const totalCie10ForDate = datePatients.reduce(
              (acc, p) => acc + (p.iaDiagnosticosCIE10?.length || 0),
              0
            );

            return (
              <div
                key={date}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all"
              >
                {/* Date Group Header */}
                <div
                  onClick={() => toggleDateCollapse(date)}
                  className="px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between border-b border-slate-200/70 transition-colors select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs font-bold">
                      <Calendar className="w-5 h-5 text-blue-700" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {dateTitle}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                        <span className="font-semibold text-blue-700">
                          {datePatients.length} {datePatients.length === 1 ? 'paciente visto' : 'pacientes vistos'}
                        </span>
                        {totalCie10ForDate > 0 && (
                          <>
                            <span>•</span>
                            <span>{totalCie10ForDate} CIE-10 asignados</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                      {isCollapsed ? 'Mostrar' : 'Ocultar'}
                    </span>
                    <button
                      className="p-1.5 rounded-xl bg-white text-slate-600 border border-slate-200 shadow-2xs"
                      aria-label="Alternar grupo"
                    >
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Patient Records List inside this Date */}
                {!isCollapsed && (
                  <div className="p-4 sm:p-5 space-y-3.5 divide-y divide-slate-100">
                    {datePatients.map((patient, index) => {
                      const timeStr = patient.fechaCreacion
                        ? new Date(patient.fechaCreacion).toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })
                        : 'Hora no registrada';

                      return (
                        <div
                          key={patient.id}
                          className={`pt-3.5 first:pt-0 ${
                            index > 0 ? 'mt-3.5' : ''
                          } rounded-2xl p-3 sm:p-4 hover:bg-blue-50/30 transition-all border border-slate-100 hover:border-blue-200`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            {/* Patient Info */}
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  {timeStr}
                                </span>

                                <h4
                                  onClick={() => onSelectPatient(patient)}
                                  className="text-base font-bold text-slate-900 hover:text-blue-700 cursor-pointer transition-colors leading-tight"
                                >
                                  {patient.nombre}
                                </h4>

                                {patient.iaNivelUrgencia && (
                                  <span
                                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                      patient.iaNivelUrgencia === 'Alta' ||
                                      patient.iaNivelUrgencia === 'Crítica'
                                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                                        : patient.iaNivelUrgencia === 'Moderada'
                                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    }`}
                                  >
                                    Urgencia: {patient.iaNivelUrgencia}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span className="font-semibold text-slate-700">
                                  CC: {patient.identificacion}
                                </span>
                                {patient.edad && (
                                  <>
                                    <span>•</span>
                                    <span>{patient.edad} años</span>
                                  </>
                                )}
                                {patient.genero && (
                                  <>
                                    <span>•</span>
                                    <span>{patient.genero}</span>
                                  </>
                                )}
                              </div>

                              {/* Motivo de Consulta & Enfermedad Actual */}
                              <div className="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100/80 text-xs text-slate-700 space-y-1">
                                <div>
                                  <span className="font-bold text-slate-800">Motivo: </span>
                                  <span className="italic">{patient.motivoConsulta}</span>
                                </div>
                                <div className="line-clamp-2 text-slate-600">
                                  <span className="font-bold text-slate-800">Cuadro Clínico: </span>
                                  {patient.enfermedadActual}
                                </div>
                              </div>

                              {/* Diagnósticos CIE-10 Pills */}
                              {patient.iaDiagnosticosCIE10 &&
                                patient.iaDiagnosticosCIE10.length > 0 && (
                                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                                      <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                                      CIE-10:
                                    </span>
                                    {patient.iaDiagnosticosCIE10.map((d, i) => (
                                      <div
                                        key={i}
                                        className="inline-flex items-center gap-1 bg-white border border-blue-200 text-blue-900 text-xs px-2 py-0.5 rounded-lg shadow-2xs"
                                        title={`${d.tipo}: ${d.descripcion}`}
                                      >
                                        <span className="font-mono font-bold text-blue-700">
                                          {d.codigo}
                                        </span>
                                        <span className="text-[11px] text-slate-600 truncate max-w-[160px] sm:max-w-[240px]">
                                          {d.descripcion}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                            </div>

                            {/* Action Buttons for this Patient Record */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              <button
                                onClick={() => onExportPdf(patient)}
                                className="inline-flex items-center gap-1 bg-[#1A56A0] hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
                                title="Exportar informe oficial en PDF"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Exportar PDF</span>
                              </button>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => onSelectPatient(patient)}
                                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs font-semibold flex items-center gap-1"
                                  title="Ver historia clínica completa"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span className="text-[11px] hidden sm:inline">Ver</span>
                                </button>

                                <button
                                  onClick={() => onEditPatient(patient)}
                                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                  title="Editar registro"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => {
                                    if (
                                      confirm(
                                        `¿Estás seguro de eliminar el registro de ${patient.nombre}?`
                                      )
                                    ) {
                                      onDeletePatient(patient.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                                  title="Eliminar paciente"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
