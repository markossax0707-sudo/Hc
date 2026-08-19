import React from 'react';
import {
  ArrowLeft,
  FileText,
  Edit,
  Trash2,
  Calendar,
  CreditCard,
  User,
  Sparkles,
  Stethoscope,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Download,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { Patient, AppSettings } from '../types';

interface PatientDetailViewProps {
  patient: Patient;
  onBack: () => void;
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onExportPdf: (patient: Patient) => void;
  settings: AppSettings;
}

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  patient,
  onBack,
  onEdit,
  onDelete,
  onExportPdf,
  settings,
}) => {
  const formattedCreationDate = new Date(patient.fechaCreacion).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="pb-16 max-w-4xl mx-auto space-y-5 animate-fadeIn">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all"
            title="Volver a la lista"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">{patient.nombre}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>CC: {patient.identificacion}</span>
              <span>•</span>
              <span>Atención: {patient.fechaAtencion}</span>
            </div>
          </div>
        </div>

        {/* Header action buttons */}
        <div className="flex items-center gap-2">
          <button
            id="btn-detail-export-pdf"
            onClick={() => onExportPdf(patient)}
            className="inline-flex items-center gap-1.5 bg-[#1A56A0] hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
            title="Generar y descargar informe en PDF"
          >
            <FileText className="w-4 h-4" />
            <span>Exportar a PDF</span>
          </button>

          <button
            id="btn-detail-edit"
            onClick={() => onEdit(patient)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all"
            title="Editar historia clínica"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            id="btn-detail-delete"
            onClick={() => {
              if (confirm(`¿Estás seguro de eliminar el registro de ${patient.nombre}?`)) {
                onDelete(patient.id);
              }
            }}
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 active:scale-95 transition-all"
            title="Eliminar registro"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Patient demographics card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-800 text-base">Información del Paciente</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-medium block">Documento (CC)</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{patient.identificacion}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-medium block">Fecha de Atención</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{patient.fechaAtencion}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-medium block">Edad / Género</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              {patient.edad || 'N/A'} / {patient.genero || 'N/A'}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-medium block">Fecha de Creación</span>
            <span className="font-bold text-slate-900 text-xs mt-0.5 block">{formattedCreationDate}</span>
          </div>
        </div>

        {patient.signosVitales && (
          <div className="mt-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-xs">
            <span className="font-bold text-blue-900 block mb-0.5">Signos Vitales y Examen Físico:</span>
            <span className="font-mono text-slate-700">{patient.signosVitales}</span>
          </div>
        )}

        {patient.antecedentes && (
          <div className="mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
            <span className="font-bold text-slate-700 block mb-0.5">Antecedentes Médicos:</span>
            <span className="text-slate-600 leading-relaxed">{patient.antecedentes}</span>
          </div>
        )}
      </div>

      {/* Motivo y Enfermedad Actual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold text-sm">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span>Motivo de Consulta</span>
          </div>
          <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed font-medium">
            {patient.motivoConsulta}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold text-sm">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Enfermedad Actual</span>
          </div>
          <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
            {patient.enfermedadActual}
          </p>
        </div>
      </div>

      {/* RESULTADO DE IA Y DIAGNÓSTICO */}
      {patient.iaProcesada ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Análisis Clínico & Diagnósticos CIE-10 (Gemini)
              </h3>
            </div>
            {patient.iaNivelUrgencia && (
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  patient.iaNivelUrgencia === 'Alta' || patient.iaNivelUrgencia === 'Crítica'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : patient.iaNivelUrgencia === 'Moderada'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                Nivel de Urgencia: {patient.iaNivelUrgencia}
              </span>
            )}
          </div>

          {/* Diagnósticos CIE-10 */}
          {patient.iaDiagnosticosCIE10 && patient.iaDiagnosticosCIE10.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Codificación Diagnóstica Internacional (CIE-10)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {patient.iaDiagnosticosCIE10.map((d, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 flex items-start gap-3"
                  >
                    <span className="font-mono text-sm font-black text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs shrink-0">
                      {d.codigo}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold text-blue-800">{d.tipo}</span>
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs mt-0.5 leading-snug">{d.descripcion}</h5>
                      {d.justificacion && (
                        <p className="text-[11px] text-slate-600 mt-1">{d.justificacion}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Análisis y Plan */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Análisis Clínico y Semiología
            </h4>
            <div className="bg-slate-50 p-4 rounded-xl text-slate-800 text-sm leading-relaxed whitespace-pre-line border border-slate-100 font-medium">
              {patient.iaAnalisis}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Plan de Manejo y Conducta Terapéutica
            </h4>
            <div className="bg-slate-50 p-4 rounded-xl text-slate-800 text-sm leading-relaxed whitespace-pre-line border border-slate-100">
              {patient.iaPlan}
            </div>
          </div>

          {/* Quick PDF Action Banner */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-base">¿Listo para exportar el informe médico?</h4>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Genera un PDF oficial con membrete médico, resumen clínico, CIE-10 y firma profesional.
              </p>
            </div>
            <button
              onClick={() => onExportPdf(patient)}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-blue-800 font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all active:scale-95 shrink-0"
            >
              <FileText className="w-4 h-4 text-blue-700" />
              <span>Generar Informe PDF</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <h4 className="font-bold text-slate-900 text-sm">Este paciente aún no ha sido procesado con IA</h4>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
            Puedes editar el registro y hacer clic en "Procesar con IA" para generar el análisis semiológico y los diagnósticos CIE-10.
          </p>
          <button
            onClick={() => onEdit(patient)}
            className="mt-3 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Editar y Procesar con IA</span>
          </button>
        </div>
      )}
    </div>
  );
};
