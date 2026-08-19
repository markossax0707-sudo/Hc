export interface DiagnosticoCIE10 {
  codigo: string;
  descripcion: string;
  tipo: 'Principal' | 'Diferencial' | 'Secundario' | string;
  justificacion?: string;
}

export interface Patient {
  id: string;
  nombre: string;
  identificacion: string; // CC / Cédula
  motivoConsulta: string;
  enfermedadActual: string;
  fechaAtencion: string; // YYYY-MM-DD
  fechaCreacion: string; // ISO 8601 string
  edad?: string;
  genero?: 'Masculino' | 'Femenino' | 'Otro' | string;
  antecedentes?: string;
  signosVitales?: string;
  
  // AI Clinical Output
  iaProcesada: boolean;
  iaAnalisis?: string;
  iaPlan?: string;
  iaDiagnosticosCIE10?: DiagnosticoCIE10[];
  iaResumenEjecutivo?: string;
  iaNivelUrgencia?: 'Baja' | 'Moderada' | 'Alta' | 'Crítica' | string;
  iaRecomendaciones?: string[];
  iaProcesadaEn?: string;
}

export interface PatientFilters {
  fechaInicio: string;
  fechaFin: string;
  searchQuery: string;
}

export interface AppSettings {
  customApiKey: string;
  medicoNombre: string;
  medicoEspecialidad: string;
  medicoRegistro: string;
  institucionNombre: string;
  viewMode: 'mobile' | 'responsive';
}

export interface AnalysisResponse {
  resumenEjecutivo: string;
  analisis: string;
  plan: string;
  diagnosticosCIE10: DiagnosticoCIE10[];
  recomendacionesAdicionales?: string[];
  nivelUrgencia?: string;
}
