import React from 'react';
import {
  FileText,
  Eye,
  Edit,
  Trash2,
  X,
  CreditCard,
  Share2,
  Sparkles,
} from 'lucide-react';
import { Patient } from '../types';

interface ContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
  onExportPdf: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  onClose,
  patient,
  onSelectPatient,
  onEditPatient,
  onExportPdf,
  onDeletePatient,
}) => {
  if (!isOpen || !patient) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-slideUp sm:animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle for mobile */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3 sm:hidden" />

        {/* Patient Header preview */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-900 text-base truncate">{patient.nombre}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
              <span>CC: {patient.identificacion}</span>
              <span>•</span>
              <span>Atención: {patient.fechaAtencion}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions list */}
        <div className="p-2 space-y-1">
          {/* Export to PDF - highlighted */}
          <button
            id="btn-ctx-export-pdf"
            onClick={() => {
              onClose();
              onExportPdf(patient);
            }}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-blue-50/70 hover:bg-blue-100 text-blue-800 font-bold text-sm transition-all active:scale-[0.99] text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1A56A0] text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="block font-bold">Exportar a PDF</span>
              <span className="text-xs text-blue-600/80 font-normal">
                Generar informe médico oficial completo
              </span>
            </div>
          </button>

          {/* Ver Detalles */}
          <button
            id="btn-ctx-view-details"
            onClick={() => {
              onClose();
              onSelectPatient(patient);
            }}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-slate-100 text-slate-800 font-semibold text-sm transition-all active:scale-[0.99] text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="block">Ver Historia Clínica Completa</span>
              <span className="text-xs text-slate-500 font-normal">
                Consultar anamnesis, análisis y CIE-10
              </span>
            </div>
          </button>

          {/* Editar */}
          <button
            id="btn-ctx-edit"
            onClick={() => {
              onClose();
              onEditPatient(patient);
            }}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-slate-100 text-slate-800 font-semibold text-sm transition-all active:scale-[0.99] text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Edit className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="block">Editar Paciente o Reanalizar</span>
              <span className="text-xs text-slate-500 font-normal">
                Modificar datos y volver a ejecutar IA
              </span>
            </div>
          </button>

          {/* Eliminar */}
          <button
            id="btn-ctx-delete"
            onClick={() => {
              onClose();
              if (confirm(`¿Eliminar el registro de ${patient.nombre}?`)) {
                onDeletePatient(patient.id);
              }
            }}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-rose-50 text-rose-700 font-semibold text-sm transition-all active:scale-[0.99] text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="block text-rose-700">Eliminar Registro</span>
              <span className="text-xs text-rose-500/80 font-normal">
                Borrar de la base de datos local
              </span>
            </div>
          </button>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 py-1"
          >
            Cerrar Menú
          </button>
        </div>
      </div>
    </div>
  );
};
