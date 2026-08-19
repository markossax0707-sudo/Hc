import React from 'react';
import { X, Download, ExternalLink, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { Patient } from '../types';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  blobUrl: string | null;
  filename: string;
  patient: Patient | null;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  blobUrl,
  filename,
  patient,
}) => {
  if (!isOpen || !blobUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenNewTab = () => {
    window.open(blobUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white w-full max-w-4xl h-[92vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#1A56A0] text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-sky-200" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-white truncate leading-tight">
                Informe de Atención Médica PDF
              </h3>
              <p className="text-xs text-sky-100/80 truncate">
                {patient ? `${patient.nombre} (CC: ${patient.identificacion})` : filename}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="btn-pdf-download-modal"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 bg-white text-blue-800 hover:bg-sky-50 active:bg-sky-100 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-colors"
              title="Descargar PDF al dispositivo"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Descargar</span>
            </button>

            <button
              id="btn-pdf-open-tab"
              onClick={handleOpenNewTab}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
              title="Abrir en pestaña nueva"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
              title="Cerrar visor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded PDF iframe / viewer */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden">
          <iframe
            src={`${blobUrl}#toolbar=1&navpanes=0`}
            className="w-full h-full border-0"
            title="Vista Previa de Informe Médico PDF"
          />
        </div>

        {/* Bottom footer status */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Documento generado con codificación CIE-10 y análisis clínico IA</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-700 hover:text-slate-900"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
