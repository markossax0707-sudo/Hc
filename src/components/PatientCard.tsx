import React, { useRef } from 'react';
import {
  FileText,
  Calendar,
  CreditCard,
  ChevronRight,
  Sparkles,
  AlertCircle,
  MoreVertical,
  Clock,
  CheckCircle2,
  Stethoscope,
} from 'lucide-react';
import { Patient } from '../types';

interface PatientCardProps {
  patient: Patient;
  onSelect: (patient: Patient) => void;
  onExportPdf: (patient: Patient) => void;
  onContextMenu: (patient: Patient, position: { x: number; y: number }) => void;
  onEdit: (patient: Patient) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onSelect,
  onExportPdf,
  onContextMenu,
  onEdit,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    isLongPressRef.current = false;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(50);
      }
      onContextMenu(patient, { x: clientX, y: clientY });
    }, 550);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPressRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onSelect(patient);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    onContextMenu(patient, { x: rect.right, y: rect.bottom });
  };

  const handlePdfClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExportPdf(patient);
  };

  // Format creation date nicely
  const formattedCreationDate = new Date(patient.fechaCreacion).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedCreationTime = new Date(patient.fechaCreacion).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      id={`patient-card-${patient.id}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onClick={handleClick}
      className="group relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border border-slate-200/80 active:scale-[0.99] transition-all cursor-pointer select-none overflow-hidden"
    >
      {/* Top accent banner */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Avatar / Initials */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
            {patient.nombre
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </div>

          {/* Name & CC */}
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-900 text-base leading-snug truncate group-hover:text-blue-700 transition-colors">
              {patient.nombre}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1 text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                <CreditCard className="w-3 h-3 text-blue-600" />
                CC: {patient.identificacion}
              </span>
              {patient.edad && <span>• {patient.edad}</span>}
            </div>
          </div>
        </div>

        {/* More Options / Context trigger */}
        <button
          id={`btn-card-menu-${patient.id}`}
          onClick={handleMoreClick}
          className="p-1.5 -mr-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
          title="Opciones del paciente (o mantén presionado)"
          aria-label="Opciones"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Motivo de Consulta summary */}
      <div className="mt-3 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1">
          <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
          <span>Motivo de consulta:</span>
        </div>
        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
          {patient.motivoConsulta || 'Sin motivo especificado.'}
        </p>
      </div>

      {/* CIE-10 and AI Badges */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {patient.iaProcesada ? (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            IA Procesada
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-medium px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Pendiente IA
          </span>
        )}

        {patient.iaDiagnosticosCIE10 && patient.iaDiagnosticosCIE10.length > 0 && (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3 text-blue-600" />
            CIE-10: {patient.iaDiagnosticosCIE10[0].codigo}
          </span>
        )}

        {patient.iaNivelUrgencia && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
              patient.iaNivelUrgencia === 'Alta' || patient.iaNivelUrgencia === 'Crítica'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : patient.iaNivelUrgencia === 'Moderada'
                ? 'bg-orange-50 text-orange-700 border-orange-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Urgencia: {patient.iaNivelUrgencia}
          </span>
        )}
      </div>

      {/* Bottom info bar: Creation Date & Quick PDF Action */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Creado: <strong className="text-slate-700">{formattedCreationDate}</strong> ({formattedCreationTime})
          </span>
        </div>

        {/* Quick Export to PDF Button */}
        <button
          id={`btn-card-export-pdf-${patient.id}`}
          onClick={handlePdfClick}
          className="inline-flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-blue-700 active:bg-sky-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border border-sky-200 shadow-2xs"
          title="Generar y descargar informe PDF"
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>Exportar PDF</span>
        </button>
      </div>
    </div>
  );
};
