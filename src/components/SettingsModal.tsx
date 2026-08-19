import React, { useState } from 'react';
import {
  X,
  Key,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Stethoscope,
  Building,
  Save,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { AppSettings } from '../types';
import { GeminiService } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [customApiKey, setCustomApiKey] = useState(settings.customApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [medicoNombre, setMedicoNombre] = useState(settings.medicoNombre || '');
  const [medicoEspecialidad, setMedicoEspecialidad] = useState(settings.medicoEspecialidad || '');
  const [medicoRegistro, setMedicoRegistro] = useState(settings.medicoRegistro || '');
  const [institucionNombre, setInstitucionNombre] = useState(settings.institucionNombre || '');

  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    valid: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestingKey(true);
    setTestResult(null);

    const result = await GeminiService.validateApiKey(customApiKey.trim() || undefined);
    setTestingKey(false);
    setTestResult({
      tested: true,
      valid: result.valid,
      message: result.message,
      error: result.error,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      customApiKey: customApiKey.trim(),
      medicoNombre: medicoNombre.trim(),
      medicoEspecialidad: medicoEspecialidad.trim(),
      medicoRegistro: medicoRegistro.trim(),
      institucionNombre: institucionNombre.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#1A56A0] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
              <Key className="w-4 h-4 text-sky-200" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Configuración del Sistema</h3>
              <p className="text-xs text-sky-100/80">API Key de Gemini y Datos para Informes PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 active:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* SECTION: GEMINI API KEY */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-600" />
                API Key de Gemini
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Opcional / Personalizada</span>
            </div>

            <div className="relative">
              <input
                id="input-settings-apikey"
                type={showKey ? 'text' : 'password'}
                value={customApiKey}
                onChange={(e) => {
                  setCustomApiKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder="Ingresa tu API Key (AIzaSy...)"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl pl-3.5 pr-10 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Si se deja en blanco, se utilizará la clave del entorno del servidor.</span>
              </div>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingKey}
                className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50"
              >
                {testingKey ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Probando...</span>
                  </>
                ) : (
                  <span>Probar Conexión</span>
                )}
              </button>
            </div>

            {/* Test Result Message */}
            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  testResult.valid
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {testResult.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">
                    {testResult.valid ? '¡Conexión Exitosa!' : 'Error de Conexión'}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed">
                    {testResult.valid
                      ? 'La API Key está activa y lista para realizar diagnósticos con Gemini.'
                      : testResult.error || 'La clave proporcionada no es válida o expiró.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-200" />

          {/* SECTION: DOCTOR & CLINIC SETTINGS FOR PDF */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Datos del Profesional e Institución (Para el PDF)
              </h4>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del Médico Tratante
              </label>
              <input
                type="text"
                value={medicoNombre}
                onChange={(e) => setMedicoNombre(e.target.value)}
                placeholder="Dr. Nombre y Apellidos"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Especialidad
                </label>
                <input
                  type="text"
                  value={medicoEspecialidad}
                  onChange={(e) => setMedicoEspecialidad(e.target.value)}
                  placeholder="Medicina General / Urgencias"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registro Médico / Tarjeta Profesional
                </label>
                <input
                  type="text"
                  value={medicoRegistro}
                  onChange={(e) => setMedicoRegistro(e.target.value)}
                  placeholder="R.M. 123456"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de la Institución / Clínica
              </label>
              <input
                type="text"
                value={institucionNombre}
                onChange={(e) => setInstitucionNombre(e.target.value)}
                placeholder="Centro Médico o Clínica"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          {/* Footer Save */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-save-settings"
              type="submit"
              className="inline-flex items-center gap-1.5 bg-[#1A56A0] hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
