import React, { useState } from 'react';
import {
  Sparkles,
  Save,
  ArrowLeft,
  Calendar,
  User,
  CreditCard,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  ShieldCheck,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Settings,
} from 'lucide-react';
import { Patient, DiagnosticoCIE10, AppSettings } from '../types';
import { GeminiService } from '../services/geminiService';

interface PatientFormScreenProps {
  initialPatient?: Patient | null;
  onSave: (patient: Patient) => void;
  onCancel: () => void;
  onOpenSettings: () => void;
  settings: AppSettings;
}

export const PatientFormScreen: React.FC<PatientFormScreenProps> = ({
  initialPatient,
  onSave,
  onCancel,
  onOpenSettings,
  settings,
}) => {
  // Form fields
  const [nombre, setNombre] = useState(initialPatient?.nombre || '');
  const [identificacion, setIdentificacion] = useState(initialPatient?.identificacion || '');
  const [motivoConsulta, setMotivoConsulta] = useState(initialPatient?.motivoConsulta || '');
  const [enfermedadActual, setEnfermedadActual] = useState(initialPatient?.enfermedadActual || '');
  const [fechaAtencion, setFechaAtencion] = useState(
    initialPatient?.fechaAtencion || new Date().toISOString().split('T')[0]
  );
  const [edad, setEdad] = useState(initialPatient?.edad || '');
  const [genero, setGenero] = useState(initialPatient?.genero || 'Masculino');
  const [antecedentes, setAntecedentes] = useState(initialPatient?.antecedentes || '');
  const [signosVitales, setSignosVitales] = useState(
    initialPatient?.signosVitales || 'TA: 120/80 mmHg | FC: 75 lpm | FR: 16 rpm | SatO2: 98% | Temp: 36.5 °C'
  );

  const [showOptionalFields, setShowOptionalFields] = useState(
    Boolean(initialPatient?.antecedentes || initialPatient?.edad)
  );

  // AI Output state
  const [iaProcesada, setIaProcesada] = useState(initialPatient?.iaProcesada || false);
  const [iaAnalisis, setIaAnalisis] = useState(initialPatient?.iaAnalisis || '');
  const [iaPlan, setIaPlan] = useState(initialPatient?.iaPlan || '');
  const [iaDiagnosticosCIE10, setIaDiagnosticosCIE10] = useState<DiagnosticoCIE10[]>(
    initialPatient?.iaDiagnosticosCIE10 || []
  );
  const [iaResumenEjecutivo, setIaResumenEjecutivo] = useState(initialPatient?.iaResumenEjecutivo || '');
  const [iaNivelUrgencia, setIaNivelUrgencia] = useState(initialPatient?.iaNivelUrgencia || '');
  const [iaRecomendaciones, setIaRecomendaciones] = useState<string[]>(
    initialPatient?.iaRecomendaciones || []
  );

  // AI Processing status
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiStep, setAiStep] = useState<string>('');

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!nombre.trim()) newErrors.nombre = 'El nombre completo es obligatorio';
    if (!identificacion.trim()) newErrors.identificacion = 'El documento / CC es obligatorio';
    if (!motivoConsulta.trim()) newErrors.motivoConsulta = 'El motivo de consulta es obligatorio';
    if (!enfermedadActual.trim()) newErrors.enfermedadActual = 'La enfermedad actual es obligatoria';
    if (!fechaAtencion) newErrors.fechaAtencion = 'La fecha de atención es obligatoria';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProcessWithAi = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessingAi(true);
    setAiError(null);
    setAiStep('Conectando con el motor clínico de Gemini...');

    try {
      setTimeout(() => setAiStep('Analizando correlación sintomática y antecedentes...'), 800);
      setTimeout(() => setAiStep('Codificando diagnósticos en catálogo CIE-10...'), 1800);
      setTimeout(() => setAiStep('Formulando plan terapéutico y pautas de alarma...'), 2800);

      const result = await GeminiService.analyzeCase({
        nombre,
        identificacion,
        motivoConsulta,
        enfermedadActual,
        fechaAtencion,
        edad: edad || undefined,
        genero,
        antecedentes: antecedentes || undefined,
        signosVitales: signosVitales || undefined,
      });

      setIaProcesada(true);
      setIaAnalisis(result.analisis || '');
      setIaPlan(result.plan || '');
      setIaDiagnosticosCIE10(result.diagnosticosCIE10 || []);
      setIaResumenEjecutivo(result.resumenEjecutivo || '');
      setIaNivelUrgencia(result.nivelUrgencia || 'Moderada');
      setIaRecomendaciones(result.recomendacionesAdicionales || []);
      setAiError(null);
    } catch (err: any) {
      console.error('Error al procesar con IA:', err);
      setAiError(
        err.message || 'Error al comunicarse con la API de Gemini. Verifica tu API Key o conexión.'
      );
    } finally {
      setIsProcessingAi(false);
      setAiStep('');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const patientToSave: Patient = {
      id: initialPatient?.id || `pat-${Date.now()}`,
      nombre: nombre.trim(),
      identificacion: identificacion.trim(),
      motivoConsulta: motivoConsulta.trim(),
      enfermedadActual: enfermedadActual.trim(),
      fechaAtencion,
      fechaCreacion: initialPatient?.fechaCreacion || new Date().toISOString(),
      edad: edad.trim() || undefined,
      genero,
      antecedentes: antecedentes.trim() || undefined,
      signosVitales: signosVitales.trim() || undefined,
      iaProcesada,
      iaAnalisis,
      iaPlan,
      iaDiagnosticosCIE10,
      iaResumenEjecutivo,
      iaNivelUrgencia,
      iaRecomendaciones,
      iaProcesadaEn: iaProcesada ? new Date().toISOString() : undefined,
    };

    onSave(patientToSave);
  };

  return (
    <div className="pb-16 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {initialPatient ? 'Editar Registro de Paciente' : 'Nueva Atención Médica'}
            </h2>
            <p className="text-xs text-slate-500">
              Formulario clínico con análisis automatizado por IA y codificación CIE-10
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Configurar API Key</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: DATOS DEL PACIENTE */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-base">1. Datos de Identificación y Consulta</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre Completo */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombre Completo del Paciente <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-patient-nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (errors.nombre) setErrors({ ...errors, nombre: '' });
                  }}
                  placeholder="Ej. Juan Carlos Ramírez Pérez"
                  className={`w-full bg-slate-50 border ${
                    errors.nombre ? 'border-rose-500 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500'
                  } text-slate-900 text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:bg-white outline-none transition-all font-medium`}
                />
              </div>
              {errors.nombre && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.nombre}</p>}
            </div>

            {/* CC / Documento */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cédula / CC / Identificación <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-patient-identificacion"
                  type="text"
                  value={identificacion}
                  onChange={(e) => {
                    setIdentificacion(e.target.value);
                    if (errors.identificacion) setErrors({ ...errors, identificacion: '' });
                  }}
                  placeholder="Ej. 1020304050"
                  className={`w-full bg-slate-50 border ${
                    errors.identificacion
                      ? 'border-rose-500 focus:ring-rose-400'
                      : 'border-slate-300 focus:ring-blue-500'
                  } text-slate-900 text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:bg-white outline-none transition-all font-medium`}
                />
              </div>
              {errors.identificacion && (
                <p className="text-xs text-rose-500 font-semibold mt-1">{errors.identificacion}</p>
              )}
            </div>

            {/* Fecha de Atención */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Fecha de Atención <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-patient-fecha-atencion"
                  type="date"
                  value={fechaAtencion}
                  onChange={(e) => setFechaAtencion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Motivo de Consulta */}
          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Motivo de Consulta <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="input-patient-motivo-consulta"
              rows={2}
              value={motivoConsulta}
              onChange={(e) => {
                setMotivoConsulta(e.target.value);
                if (errors.motivoConsulta) setErrors({ ...errors, motivoConsulta: '' });
              }}
              placeholder="Ej. 'Dolor de cabeza muy fuerte desde ayer y mareo constante'..."
              className={`w-full bg-slate-50 border ${
                errors.motivoConsulta ? 'border-rose-500' : 'border-slate-300'
              } text-slate-900 text-sm rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium leading-relaxed`}
            />
            {errors.motivoConsulta && (
              <p className="text-xs text-rose-500 font-semibold mt-1">{errors.motivoConsulta}</p>
            )}
          </div>

          {/* Enfermedad Actual */}
          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Enfermedad Actual <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="input-patient-enfermedad-actual"
              rows={4}
              value={enfermedadActual}
              onChange={(e) => {
                setEnfermedadActual(e.target.value);
                if (errors.enfermedadActual) setErrors({ ...errors, enfermedadActual: '' });
              }}
              placeholder="Detalla la cronología de síntomas, intensidad, factores agravantes o atenuantes, síntomas asociados..."
              className={`w-full bg-slate-50 border ${
                errors.enfermedadActual ? 'border-rose-500' : 'border-slate-300'
              } text-slate-900 text-sm rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium leading-relaxed`}
            />
            {errors.enfermedadActual && (
              <p className="text-xs text-rose-500 font-semibold mt-1">{errors.enfermedadActual}</p>
            )}
          </div>

          {/* Toggle optional medical fields */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors"
            >
              {showOptionalFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>
                {showOptionalFields
                  ? 'Ocultar campos complementarios (Edad, Signos Vitales, Antecedentes)'
                  : 'Mostrar campos complementarios (Edad, Signos Vitales, Antecedentes)'}
              </span>
            </button>

            {showOptionalFields && (
              <div className="mt-4 space-y-4 pt-3 border-t border-dashed border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Edad
                    </label>
                    <input
                      type="text"
                      value={edad}
                      onChange={(e) => setEdad(e.target.value)}
                      placeholder="Ej. 45 años"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Género
                    </label>
                    <select
                      value={genero}
                      onChange={(e) => setGenero(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro / No especificado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Signos Vitales y Examen Físico
                  </label>
                  <input
                    type="text"
                    value={signosVitales}
                    onChange={(e) => setSignosVitales(e.target.value)}
                    placeholder="TA: 120/80 mmHg | FC: 75 lpm | Temp: 36.5 °C..."
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Antecedentes Médicos Relevantes
                  </label>
                  <textarea
                    rows={2}
                    value={antecedentes}
                    onChange={(e) => setAntecedentes(e.target.value)}
                    placeholder="HTA, Diabetes, Alergias medicamentosas, Cirugías previas..."
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: PROCESAR CON IA GEMINI */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md border border-indigo-900/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                Motor Clínico Inteligente
              </div>
              <h3 className="text-lg font-bold text-white leading-tight">
                Análisis Diagnóstico y Codificación CIE-10
              </h3>
              <p className="text-xs text-indigo-200/80 mt-1 max-w-xl">
                Gemini procesará los datos del paciente para generar el análisis semiológico, conducta terapéutica y códigos CIE-10 oficiales.
              </p>
            </div>

            <button
              id="btn-process-gemini"
              type="button"
              onClick={handleProcessWithAi}
              disabled={isProcessingAi}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg hover:shadow-indigo-500/25 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
            >
              {isProcessingAi ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{iaProcesada ? 'Reprocesar con IA' : 'Procesar con IA'}</span>
                </>
              )}
            </button>
          </div>

          {/* Loading status bar */}
          {isProcessingAi && (
            <div className="mt-4 pt-4 border-t border-indigo-800/60 flex items-center gap-3 animate-fadeIn">
              <div className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-indigo-200">{aiStep || 'Generando informe médico...'}</p>
                <div className="w-full bg-indigo-950/80 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-400 to-indigo-400 h-full w-2/3 animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          )}

          {/* Error Message with retry */}
          {aiError && (
            <div className="mt-4 p-4 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs animate-shake">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-rose-200 text-sm">Error en la API de Gemini</h4>
                  <p className="mt-1 text-rose-300/90 leading-relaxed">{aiError}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleProcessWithAi}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reintentar
                    </button>
                    <button
                      type="button"
                      onClick={onOpenSettings}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-rose-200 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Revisar API Key
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: RESULTADOS DE LA IA (ANÁLISIS, PLAN, CIE-10) */}
        {iaProcesada && (
          <div className="space-y-4 animate-fadeIn">
            {/* Header / Summary */}
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-base">
                  Resultado del Procesamiento Clínico
                </h3>
              </div>
              {iaNivelUrgencia && (
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    iaNivelUrgencia === 'Alta' || iaNivelUrgencia === 'Crítica'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : iaNivelUrgencia === 'Moderada'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                >
                  Urgencia: {iaNivelUrgencia}
                </span>
              )}
            </div>

            {/* Resumen Ejecutivo */}
            {iaResumenEjecutivo && (
              <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200/80">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                  Resumen Clínico Rápido
                </h4>
                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  {iaResumenEjecutivo}
                </p>
              </div>
            )}

            {/* DIAGNÓSTICOS CIE-10 (CARDS) */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
              <div className="flex items-center gap-2 mb-3">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-slate-800 text-sm">
                  Diagnósticos Codificados CIE-10
                </h4>
              </div>

              <div className="space-y-2.5">
                {iaDiagnosticosCIE10.map((diag, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-sm font-black text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-300 shrink-0">
                        {diag.codigo}
                      </span>
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">{diag.descripcion}</h5>
                        {diag.justificacion && (
                          <p className="text-xs text-slate-600 mt-0.5">{diag.justificacion}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full self-start sm:self-center shrink-0 ${
                        diag.tipo === 'Principal'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {diag.tipo}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ANÁLISIS MÉDICO */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Análisis Clínico y Juicio Diagnóstico (Editable)
              </label>
              <textarea
                rows={5}
                value={iaAnalisis}
                onChange={(e) => setIaAnalisis(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium leading-relaxed"
              />
            </div>

            {/* PLAN DE MANEJO */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Plan Terapéutico, Medicación y Signos de Alarma (Editable)
              </label>
              <textarea
                rows={5}
                value={iaPlan}
                onChange={(e) => setIaPlan(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* BOTTOM ACTIONS BAR */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition-colors"
          >
            Cancelar
          </button>

          <button
            id="btn-save-patient"
            type="submit"
            className="inline-flex items-center gap-2 bg-[#1A56A0] hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md hover:shadow-blue-600/25 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar en Base de Datos (Room)</span>
          </button>
        </div>
      </form>
    </div>
  );
};
